#!/usr/bin/env python3
"""
CSTracker — Analisador de Demos CS2
Versão: 1.0.0
Compatibilidade: awpy >= 2.0.0, Python >= 3.11

Uso:
    python analyze_demo.py --demo /caminho/para/arquivo.dem

Variáveis de ambiente obrigatórias:
    SUPABASE_URL             — URL do projeto Supabase
    SUPABASE_SERVICE_ROLE_KEY — Service role key (NUNCA exposta no frontend)
    PLAYER_STEAM_ID          — Steam ID 64-bit do jogador (ex: 76561198xxxxxxxxx)

Notas sobre a API do AWPy 2.x:
    - Demo(path) lê o arquivo .dem e retorna um objeto com DataFrames
    - demo.kills, demo.damages, demo.rounds são os DataFrames principais
    - Colunas verificadas em runtime — versões diferentes podem ter nomes distintos
    - Se uma coluna não existir, a métrica correspondente é marcada como None/null
"""

import argparse
import hashlib
import json
import os
import sys
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

# Carrega .env se existir (desenvolvimento local)
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass  # Em GitHub Actions as variáveis vêm direto do ambiente

# ============================================================
# Configuração de logging
# ============================================================
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
log = logging.getLogger("cstracker")


# ============================================================
# Erros customizados
# ============================================================
class DemoError(Exception):
    """Erro relacionado ao processamento da demo."""
    pass


class ConfigError(Exception):
    """Erro de configuração (variáveis de ambiente ausentes)."""
    pass


class PlayerNotFoundError(DemoError):
    """Jogador com o Steam ID configurado não foi encontrado na demo."""
    pass


# ============================================================
# Validação de configuração
# ============================================================
def load_config() -> dict:
    """
    Carrega e valida as variáveis de ambiente obrigatórias.
    Lança ConfigError se alguma estiver ausente.
    """
    required = {
        "SUPABASE_URL": "URL do projeto Supabase",
        "SUPABASE_SERVICE_ROLE_KEY": "Service role key do Supabase",
        "PLAYER_STEAM_ID": "Steam ID 64-bit do jogador",
    }

    config = {}
    missing = []

    for key, description in required.items():
        value = os.environ.get(key, "").strip()
        if not value:
            missing.append(f"  {key}: {description}")
        else:
            config[key] = value

    if missing:
        raise ConfigError(
            "Variáveis de ambiente obrigatórias não configuradas:\n"
            + "\n".join(missing)
            + "\n\nConsulte o .env.example para instruções."
        )

    # Validação básica do Steam ID (deve ser numérico e começar com 7656)
    steam_id = config["PLAYER_STEAM_ID"]
    if not steam_id.isdigit() or not steam_id.startswith("7656"):
        log.warning(
            f"Steam ID '{steam_id}' pode estar incorreto. "
            "Um Steam ID 64-bit válido começa com '7656' e tem 17 dígitos."
        )

    return config


# ============================================================
# Utilitários
# ============================================================
def demo_match_id(demo_path: Path) -> str:
    """
    Gera um identificador único para a demo baseado no nome do arquivo
    e nos primeiros bytes (evita duplicatas com nomes iguais).
    """
    stem = demo_path.stem  # nome sem extensão
    # Hash MD5 dos primeiros 64KB para identificação rápida
    hasher = hashlib.md5()
    with open(demo_path, "rb") as f:
        chunk = f.read(65536)
        hasher.update(chunk)
    return f"{stem}_{hasher.hexdigest()[:8]}"


def safe_divide(numerator: float, denominator: float, default: float = 0.0) -> float:
    """Divisão segura evitando ZeroDivisionError."""
    if denominator == 0:
        return default
    return numerator / denominator


# ============================================================
# Processamento da demo
# ============================================================
def parse_demo(demo_path: Path) -> dict:
    """
    Lê a demo usando AWPy 2.x e retorna o objeto demo.

    A API do AWPy 2.x usa awpy.demo.Demo (não awpy.data.DemoParser como na v1).
    Documentação: https://awpy.readthedocs.io/

    Raises:
        ImportError: Se o awpy não estiver instalado.
        DemoError: Se o arquivo não puder ser lido.
    """
    try:
        from awpy import Demo
    except ImportError as e:
        raise ImportError(
            "awpy não encontrado. Instale com: pip install awpy==2.0.0"
        ) from e

    log.info(f"Lendo demo: {demo_path.name} ({demo_path.stat().st_size / 1_000_000:.1f} MB)")

    try:
        demo = Demo(path=str(demo_path))
    except Exception as e:
        raise DemoError(
            f"Não foi possível ler o arquivo .dem: {e}\n"
            "Possíveis causas:\n"
            "  - Arquivo corrompido ou incompleto\n"
            "  - Demo de versão incompatível (este script suporta CS2)\n"
            "  - Demo truncada (partida interrompida)"
        ) from e

    return demo


def find_player(demo, steam_id: str) -> Optional[str]:
    """
    Localiza o nome/identificação do jogador na demo pelo Steam ID.

    AWPy 2.x expõe um DataFrame demo.players (ou similar) com informações
    dos jogadores. Verificamos os DataFrames disponíveis em runtime para
    compatibilidade com diferentes builds do awpy.

    Returns:
        Nome do jogador se encontrado, None caso contrário.
    """
    # AWPy 2.x: demo.player_stats ou dados de kills têm o steam_id
    # Tentamos múltiplas abordagens para robustez entre versões menores

    steam_id_int = int(steam_id)

    # Abordagem 1: Verificar kills DataFrame (mais confiável)
    if hasattr(demo, 'kills') and demo.kills is not None and len(demo.kills) > 0:
        kills_df = demo.kills

        # Detectar o nome da coluna do Steam ID do atacante
        attacker_col = None
        for candidate in ['attacker_steamid', 'attackerSteamId', 'attacker_steam_id']:
            if candidate in kills_df.columns:
                attacker_col = candidate
                break

        name_col = None
        for candidate in ['attacker_name', 'attackerName', 'attacker']:
            if candidate in kills_df.columns:
                name_col = candidate
                break

        if attacker_col and name_col:
            player_rows = kills_df[kills_df[attacker_col] == steam_id_int]
            if not player_rows.empty:
                return str(player_rows.iloc[0][name_col])

    # Abordagem 2: Verificar damages DataFrame
    if hasattr(demo, 'damages') and demo.damages is not None and len(demo.damages) > 0:
        dmg_df = demo.damages

        attacker_col = None
        for candidate in ['attacker_steamid', 'attackerSteamId', 'attacker_steam_id']:
            if candidate in dmg_df.columns:
                attacker_col = candidate
                break

        name_col = None
        for candidate in ['attacker_name', 'attackerName', 'attacker']:
            if candidate in dmg_df.columns:
                name_col = candidate
                break

        if attacker_col and name_col:
            player_rows = dmg_df[dmg_df[attacker_col] == steam_id_int]
            if not player_rows.empty:
                return str(player_rows.iloc[0][name_col])

    return None


def extract_map_name(demo) -> str:
    """Extrai o nome do mapa da demo."""
    # AWPy 2.x: demo.header é um dict ou objeto com metadados
    try:
        if hasattr(demo, 'header') and demo.header:
            header = demo.header
            if isinstance(header, dict):
                for key in ['map_name', 'mapName', 'map']:
                    if key in header and header[key]:
                        return str(header[key])
            elif hasattr(header, 'map_name'):
                return str(header.map_name)
    except Exception:
        pass

    # Fallback: tentar extrair de rounds ou kills
    try:
        if hasattr(demo, 'rounds') and demo.rounds is not None and len(demo.rounds) > 0:
            for col in ['map_name', 'mapName']:
                if col in demo.rounds.columns:
                    return str(demo.rounds.iloc[0][col])
    except Exception:
        pass

    return "unknown"


def extract_played_at(demo) -> datetime:
    """Extrai data/hora da partida. Usa tempo atual como fallback."""
    try:
        if hasattr(demo, 'header') and demo.header:
            header = demo.header
            if isinstance(header, dict):
                for key in ['playback_time', 'server_name', 'timestamp']:
                    if key in header and header[key]:
                        # Se for timestamp Unix
                        try:
                            ts = float(header[key])
                            return datetime.fromtimestamp(ts, tz=timezone.utc)
                        except (ValueError, TypeError):
                            pass
    except Exception:
        pass

    log.warning("Data/hora da partida não encontrada na demo. Usando data/hora atual.")
    return datetime.now(tz=timezone.utc)


def count_rounds(demo) -> int:
    """Conta o número de rounds jogados."""
    try:
        if hasattr(demo, 'rounds') and demo.rounds is not None:
            return len(demo.rounds)
    except Exception:
        pass
    return 0


def extract_kills_stats(demo, steam_id: str) -> dict:
    """
    Extrai kills, deaths, assists e headshots do DataFrame de kills.

    Retorna dict com: kills, deaths, assists, headshots
    """
    result = {"kills": 0, "deaths": 0, "assists": 0, "headshots": 0}

    if not hasattr(demo, 'kills') or demo.kills is None or len(demo.kills) == 0:
        log.warning("DataFrame de kills não disponível ou vazio.")
        return result

    kills_df = demo.kills
    steam_id_int = int(steam_id)

    log.info(f"Colunas do DataFrame kills: {list(kills_df.columns)}")

    # Detectar colunas de Steam ID
    attacker_col = None
    for c in ['attacker_steamid', 'attackerSteamId', 'attacker_steam_id']:
        if c in kills_df.columns:
            attacker_col = c
            break

    victim_col = None
    for c in ['victim_steamid', 'victimSteamId', 'victim_steam_id']:
        if c in kills_df.columns:
            victim_col = c
            break

    assister_col = None
    for c in ['assister_steamid', 'assisterSteamId', 'assister_steam_id']:
        if c in kills_df.columns:
            assister_col = c
            break

    hs_col = None
    for c in ['headshot', 'is_headshot', 'isHeadshot']:
        if c in kills_df.columns:
            hs_col = c
            break

    if attacker_col:
        player_kills = kills_df[kills_df[attacker_col] == steam_id_int]
        result["kills"] = len(player_kills)

        if hs_col:
            result["headshots"] = int(player_kills[hs_col].sum())
        else:
            log.warning("Coluna de headshot não encontrada. Headshots definido como 0.")

    if victim_col:
        result["deaths"] = len(kills_df[kills_df[victim_col] == steam_id_int])

    if assister_col:
        result["assists"] = len(kills_df[
            kills_df[assister_col] == steam_id_int
        ])

    return result


def extract_damage(demo, steam_id: str) -> int:
    """
    Extrai dano total causado pelo jogador.

    No CS2, dano em teammates pode estar incluído — tentamos filtrar.
    """
    if not hasattr(demo, 'damages') or demo.damages is None or len(demo.damages) == 0:
        log.warning("DataFrame de danos não disponível ou vazio. Dano definido como 0.")
        return 0

    dmg_df = demo.damages
    steam_id_int = int(steam_id)

    log.info(f"Colunas do DataFrame damages: {list(dmg_df.columns)}")

    attacker_col = None
    for c in ['attacker_steamid', 'attackerSteamId', 'attacker_steam_id']:
        if c in dmg_df.columns:
            attacker_col = c
            break

    damage_col = None
    for c in ['dmg_health', 'damage', 'health_damage', 'hp_damage']:
        if c in dmg_df.columns:
            damage_col = c
            break

    # Coluna para distinguir dano em aliados
    team_col = None
    for c in ['is_friendly_fire', 'friendlyFire', 'team_damage']:
        if c in dmg_df.columns:
            team_col = c
            break

    if not attacker_col or not damage_col:
        log.warning(
            f"Colunas de dano não encontradas (procurado: attacker_col={attacker_col}, "
            f"damage_col={damage_col}). Dano definido como 0."
        )
        return 0

    player_dmg = dmg_df[dmg_df[attacker_col] == steam_id_int]

    # Filtrar friendly fire se possível
    if team_col and team_col in player_dmg.columns:
        player_dmg = player_dmg[player_dmg[team_col] == False]

    return int(player_dmg[damage_col].sum())


def calculate_avg_ttd(demo, steam_id: str) -> Optional[float]:
    """
    Calcula o TTD (Time to Death) médio em segundos.

    TTD = tempo entre o último dano recebido e a morte efetiva.
    Requer que os DataFrames de kills e damages tenham informação de tick/tempo.

    Retorna None se os dados necessários não estiverem disponíveis.

    NOTA: Esta métrica é melhor esforço. Se os dados de tick não estiverem
    disponíveis no AWPy 2.x para esta demo específica, retornamos None.
    """
    if not hasattr(demo, 'kills') or demo.kills is None:
        return None
    if not hasattr(demo, 'damages') or demo.damages is None:
        return None

    kills_df = demo.kills
    dmg_df = demo.damages
    steam_id_int = int(steam_id)

    # Verificar se temos colunas de tick/tempo
    tick_col_kills = None
    for c in ['tick', 'game_tick', 'round_tick']:
        if c in kills_df.columns:
            tick_col_kills = c
            break

    tick_col_dmg = None
    for c in ['tick', 'game_tick', 'round_tick']:
        if c in dmg_df.columns:
            tick_col_dmg = c
            break

    if not tick_col_kills or not tick_col_dmg:
        log.info("Colunas de tick não disponíveis. TTD não calculado (retornando null).")
        return None

    # Deaths do jogador
    victim_col = None
    for c in ['victim_steamid', 'victimSteamId', 'victim_steam_id']:
        if c in kills_df.columns:
            victim_col = c
            break

    if not victim_col:
        return None

    # Coluna Steam ID no DataFrame de danos (como vítima)
    dmg_victim_col = None
    for c in ['victim_steamid', 'victimSteamId', 'victim_steam_id']:
        if c in dmg_df.columns:
            dmg_victim_col = c
            break

    if not dmg_victim_col:
        return None

    player_deaths = kills_df[kills_df[victim_col] == steam_id_int]
    if player_deaths.empty:
        return None

    ttd_values = []

    for _, death_row in player_deaths.iterrows():
        death_tick = death_row[tick_col_kills]

        # Encontrar o último dano recebido ANTES desta morte (mesmo round, se disponível)
        # Filtra danos recebidos pelo jogador com tick <= death_tick
        prior_damage = dmg_df[
            (dmg_df[dmg_victim_col] == steam_id_int) &
            (dmg_df[tick_col_dmg] <= death_tick)
        ]

        if prior_damage.empty:
            continue

        last_damage_tick = prior_damage[tick_col_dmg].max()
        tick_diff = death_tick - last_damage_tick

        # CS2 roda a ~64 ticks/segundo; tick diff em segundos:
        tick_rate = 64.0
        ttd_sec = tick_diff / tick_rate

        # Sanity check: TTD > 10s é improvável (descarta outliers)
        if 0 <= ttd_sec <= 10.0:
            ttd_values.append(ttd_sec)

    if not ttd_values:
        return None

    return round(sum(ttd_values) / len(ttd_values), 4)


# ============================================================
# Montagem do resultado
# ============================================================
def build_result(
    demo_path: Path,
    demo,
    steam_id: str,
    player_name: Optional[str],
) -> dict:
    """
    Monta o objeto JSON final com todas as estatísticas calculadas.
    """
    match_id = demo_match_id(demo_path)
    map_name = extract_map_name(demo)
    played_at = extract_played_at(demo)
    rounds_played = count_rounds(demo)
    kills_stats = extract_kills_stats(demo, steam_id)
    damage = extract_damage(demo, steam_id)
    avg_ttd = calculate_avg_ttd(demo, steam_id)

    kills = kills_stats["kills"]
    deaths = kills_stats["deaths"]
    assists = kills_stats["assists"]
    headshots = kills_stats["headshots"]

    kd_ratio = round(safe_divide(kills, deaths), 3)
    adr = round(safe_divide(damage, rounds_played), 3) if rounds_played > 0 else None
    hs_percentage = round(safe_divide(headshots, kills) * 100, 2) if kills > 0 else 0.0

    # raw_data para futuras métricas sem precisar reprocessar a demo
    raw_data = {
        "player_name": player_name,
        "steam_id": steam_id,
        "demo_file": demo_path.name,
        "processed_at": datetime.now(tz=timezone.utc).isoformat(),
        "awpy_version": _get_awpy_version(),
    }

    result = {
        "match_id": match_id,
        "map_name": map_name,
        "played_at": played_at.isoformat(),
        "rounds_played": rounds_played,
        "kills": kills,
        "deaths": deaths,
        "assists": assists,
        "damage": damage,
        "headshots": headshots,
        "kd_ratio": kd_ratio,
        "adr": adr,
        "hs_percentage": hs_percentage,
        "avg_ttd_sec": avg_ttd,
        # Campos V2 — None por ora
        "kast": None,
        "rating": None,
        "first_kills": None,
        "first_deaths": None,
        "utility_damage": None,
        "flashes_thrown": None,
        "raw_data": raw_data,
    }

    return result


def _get_awpy_version() -> str:
    """Retorna a versão do awpy instalado."""
    try:
        import awpy
        return getattr(awpy, '__version__', 'unknown')
    except Exception:
        return 'unknown'


def validate_result(result: dict) -> list[str]:
    """
    Valida o resultado antes de enviar ao Supabase.
    Retorna lista de avisos (warnings), não erros fatais.
    """
    warnings = []

    if result["rounds_played"] == 0:
        warnings.append("rounds_played = 0: a demo pode estar corrompida ou truncada.")

    if result["kills"] == 0 and result["deaths"] == 0:
        warnings.append(
            "Kills e deaths = 0: jogador não encontrado nos dados de kills. "
            "Verifique o PLAYER_STEAM_ID."
        )

    if result["map_name"] == "unknown":
        warnings.append("Mapa não identificado na demo.")

    if result["adr"] is None:
        warnings.append("ADR não calculado (rounds_played = 0).")

    if result["avg_ttd_sec"] is None:
        warnings.append("TTD não calculado (dados de tick insuficientes).")

    if result["kd_ratio"] > 20:
        warnings.append(f"K/D ratio suspeito: {result['kd_ratio']}. Verifique os dados.")

    return warnings


# ============================================================
# Envio para Supabase
# ============================================================
def send_to_supabase(config: dict, result: dict) -> None:
    """
    Envia os resultados para a tabela matches do Supabase.
    Usa upsert para evitar duplicatas (baseado em match_id).

    Raises:
        Exception: Se o envio falhar.
    """
    try:
        from supabase import create_client, Client
    except ImportError as e:
        raise ImportError(
            "supabase-py não encontrado. Instale com: pip install supabase==2.9.0"
        ) from e

    log.info("Conectando ao Supabase...")

    client: Client = create_client(
        config["SUPABASE_URL"],
        config["SUPABASE_SERVICE_ROLE_KEY"],
    )

    # Preparar dados para inserção (converter None → None, mantém JSON válido)
    payload = {k: v for k, v in result.items()}

    log.info(f"Enviando match_id={payload['match_id']} para Supabase...")

    response = (
        client.table("matches")
        .upsert(payload, on_conflict="match_id")
        .execute()
    )

    if hasattr(response, 'data') and response.data:
        log.info(f"✅ Dados inseridos/atualizados com sucesso: {len(response.data)} registro(s).")
    else:
        log.warning(f"Resposta do Supabase inesperada: {response}")


# ============================================================
# CLI principal
# ============================================================
def main():
    parser = argparse.ArgumentParser(
        description="CSTracker — Analisador de demos CS2",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Exemplos:
  python analyze_demo.py --demo ./demos/minha_partida.dem
  python analyze_demo.py --demo /path/to/file.dem --dry-run

Variáveis de ambiente necessárias:
  SUPABASE_URL
  SUPABASE_SERVICE_ROLE_KEY
  PLAYER_STEAM_ID
        """,
    )
    parser.add_argument(
        "--demo",
        required=True,
        help="Caminho para o arquivo .dem a ser processado",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Processa a demo mas NÃO envia para o Supabase (útil para testes)",
    )
    parser.add_argument(
        "--output-json",
        help="Caminho para salvar o JSON gerado (opcional)",
    )

    args = parser.parse_args()

    # ── Validação do arquivo ────────────────────────────────
    demo_path = Path(args.demo).resolve()

    if not demo_path.exists():
        log.error(f"Arquivo não encontrado: {demo_path}")
        sys.exit(1)

    if not demo_path.suffix.lower() == ".dem":
        log.error(f"O arquivo não tem extensão .dem: {demo_path.name}")
        sys.exit(1)

    file_size_mb = demo_path.stat().st_size / 1_000_000
    log.info(f"Arquivo: {demo_path.name} ({file_size_mb:.1f} MB)")

    if file_size_mb > 200:
        log.warning(
            f"Demo muito grande ({file_size_mb:.1f} MB). "
            "O processamento pode ser lento ou falhar por falta de memória."
        )

    # ── Configuração ────────────────────────────────────────
    try:
        config = load_config()
    except ConfigError as e:
        log.error(f"Erro de configuração:\n{e}")
        sys.exit(1)

    steam_id = config["PLAYER_STEAM_ID"]
    log.info(f"Steam ID configurado: {steam_id}")

    # ── Processamento ────────────────────────────────────────
    try:
        demo = parse_demo(demo_path)
    except ImportError as e:
        log.error(str(e))
        sys.exit(1)
    except DemoError as e:
        log.error(str(e))
        sys.exit(1)

    # ── Identificação do jogador ─────────────────────────────
    player_name = find_player(demo, steam_id)
    if player_name:
        log.info(f"Jogador identificado: {player_name} (SteamID: {steam_id})")
    else:
        log.warning(
            f"Jogador com Steam ID {steam_id} não encontrado nas kills/danos da demo. "
            "As estatísticas de kills/deaths/assists serão 0. "
            "Verifique se o PLAYER_STEAM_ID está correto."
        )

    # ── Cálculo das estatísticas ─────────────────────────────
    log.info("Calculando estatísticas...")

    try:
        result = build_result(demo_path, demo, steam_id, player_name)
    except Exception as e:
        log.error(f"Erro ao calcular estatísticas: {e}")
        sys.exit(1)

    # ── Validação ────────────────────────────────────────────
    warnings = validate_result(result)
    for w in warnings:
        log.warning(f"⚠️  {w}")

    # ── Saída JSON ───────────────────────────────────────────
    result_json = json.dumps(result, indent=2, default=str)
    log.info("Resultado calculado:")
    print(result_json)

    if args.output_json:
        output_path = Path(args.output_json)
        output_path.write_text(result_json, encoding="utf-8")
        log.info(f"JSON salvo em: {output_path}")

    # ── Envio para Supabase ──────────────────────────────────
    if args.dry_run:
        log.info("⚠️  Modo dry-run ativo. Dados NÃO enviados ao Supabase.")
        sys.exit(0)

    try:
        send_to_supabase(config, result)
    except Exception as e:
        log.error(f"Erro ao enviar dados para o Supabase: {e}")
        sys.exit(1)

    log.info("✅ Processamento concluído com sucesso.")
    sys.exit(0)


if __name__ == "__main__":
    main()
