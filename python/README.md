"""
CSTracker Python — README

# Processamento de Demos CS2

## Versões compatíveis
- Python >= 3.11
- AWPy >= 2.0.0 (compatível com CS2)
- supabase-py >= 2.9.0

## Instalação

```bash
# Criar ambiente virtual
python -m venv venv

# Ativar (Windows PowerShell)
.\\venv\\Scripts\\Activate.ps1

# Ativar (Linux/macOS)
source venv/bin/activate

# Instalar dependências
pip install -r requirements.txt
```

## Variáveis de Ambiente

Crie um arquivo `.env` nesta pasta ou exporte as variáveis:

```
SUPABASE_URL=https://xxxxxxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJ...
PLAYER_STEAM_ID=76561198xxxxxxxxx
```

## Uso

```bash
# Testar sem enviar ao Supabase
python analyze_demo.py --demo /caminho/para/partida.dem --dry-run

# Processamento completo (envia ao Supabase)
python analyze_demo.py --demo /caminho/para/partida.dem

# Salvar JSON localmente
python analyze_demo.py --demo /caminho/para/partida.dem --output-json resultado.json
```

## Notas sobre o AWPy 2.x

O AWPy 2.x mudou significativamente em relação à versão 1.x:
- Usa `from awpy import Demo` (não mais DemoParser)
- Retorna DataFrames pandas diretamente
- Compatível com CS2 e CS:GO (formatos diferentes)

Se você estiver usando demos do CS:GO legado (antes de 2023), pode ser
necessário instalar awpy 1.x — consulte a documentação oficial:
https://awpy.readthedocs.io/

## Verificação de Compatibilidade

```python
import awpy
print(awpy.__version__)  # deve ser >= 2.0.0

from awpy import Demo
demo = Demo(path="teste.dem")
print(demo.kills.columns.tolist())  # ver colunas disponíveis
```

## Troubleshooting

**Jogador não encontrado:**
- Verifique se o PLAYER_STEAM_ID está correto (17 dígitos, começa com 7656)
- Tente processar com --dry-run e observe os logs

**Erro "cannot read demo":**
- A demo pode estar corrompida ou ser de versão incompatível
- Demos do CS:GO legado precisam do awpy 1.x

**TTD sempre null:**
- Dados de tick não estão disponíveis nesta demo específica
- Isso é normal — o campo fica null no banco

**Supabase 401 Unauthorized:**
- Verifique se está usando a SERVICE_ROLE_KEY (não a anon key)
- Confirme que a URL está correta (sem barra no final)
"""
