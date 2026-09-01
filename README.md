# ⚡ CSTracker

Plataforma pessoal de análise de partidas de **CS2** com biblioteca de granadas para consulta rápida durante o aquecimento.

> Construído com Next.js, Supabase, Python/AWPy e GitHub Actions. 100% gratuito no free tier.

---

## 📋 Tecnologias

| Componente | Tecnologia | Free Tier |
|---|---|---|
| Frontend | Next.js 14 + TypeScript + Tailwind | Vercel Free |
| Banco de dados | Supabase (PostgreSQL) | 500 MB, 2 projetos |
| Processamento | Python 3.11 + AWPy 2.x | — |
| CI/CD | GitHub Actions | 2.000 min/mês |
| Hosting | Vercel | 100 GB bandwidth |

> **Limites importantes do Supabase Free:**  
> 500 MB de banco, 5 GB de transferência/mês, projeto pausado após 1 semana de inatividade.  
> Confirme limites atuais em: https://supabase.com/pricing

> **Limites do GitHub Actions Free:**  
> 2.000 minutos/mês para repositórios públicos (ilimitado).  
> Repositórios privados: 2.000 min/mês.

---

## 🚀 Instalação Completa

### Pré-requisitos

- Node.js >= 18
- Python >= 3.11
- Conta GitHub
- Conta Supabase (gratuita)
- Conta Vercel (gratuita)

---

### 1. Criar Projeto Supabase

1. Acesse [supabase.com](https://supabase.com) e faça login
2. Clique em **"New Project"**
3. Escolha um nome (ex: `cstracker`) e uma senha forte
4. Aguarde o projeto ser criado (~2 minutos)
5. Vá em **Settings → API** e copie:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ **nunca exponha esta chave**)

---

### 2. Criar as Tabelas

1. No Supabase, vá em **SQL Editor**
2. Clique em **"New Query"**
3. Cole o conteúdo de `supabase/migrations/001_initial_schema.sql`
4. Clique em **Run**
5. Confirme que as tabelas `matches` e `grenades` foram criadas em **Table Editor**

---

### 3. Inserir Dados de Exemplo (Granadas)

1. No **SQL Editor**, crie uma nova query
2. Cole o conteúdo de `supabase/seed.sql`
3. Clique em **Run**
4. Verifique em **Table Editor → grenades** que os dados foram inseridos

---

### 4. Configurar RLS (já incluso no migration)

As políticas RLS já estão no arquivo de migration. Para verificar:

1. Vá em **Authentication → Policies**
2. Confirme que `matches` e `grenades` têm a política `*_read_public` (SELECT para todos)
3. Confirme que **não há** políticas de INSERT/UPDATE/DELETE para a anon key

---

### 5. Obter Seu Steam ID

Você precisará do seu **Steam ID 64-bit** para identificar seus dados na demo.

**Como encontrar:**
1. Acesse [steamid.io](https://steamid.io/)
2. Cole a URL do seu perfil Steam
3. Copie o valor **steamID64** (começa com `7656...`)

**Exemplo:** `76561198xxxxxxxxx`

---

### 6. Configurar o Projeto Next.js

```bash
# Clone o repositório
git clone https://github.com/SEU_USUARIO/cstracker.git
cd cstracker

# Instalar dependências
npm install

# Criar arquivo de configuração local
cp .env.example .env.local
```

Edite `.env.local` com suas credenciais (obrigatório):

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJ...
```

```bash
# Rodar em desenvolvimento
npm run dev
```

Acesse `http://localhost:3000`

---

### 7. Instalar Dependências Python

```bash
cd python

# Criar ambiente virtual (recomendado)
python -m venv venv

# Ativar (Windows PowerShell)
.\venv\Scripts\Activate.ps1

# Ativar (Linux/macOS)
source venv/bin/activate

# Instalar dependências
pip install -r requirements.txt
```

---

### 8. Testar o Script Python Localmente

Crie um `.env` na pasta `python/` (ou exporte as variáveis):

```env
SUPABASE_URL=https://xxxxxxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJ...
PLAYER_STEAM_ID=76561198xxxxxxxxx
```

```bash
# Modo dry-run (não envia para Supabase)
python analyze_demo.py --demo /caminho/para/partida.dem --dry-run

# Processamento completo
python analyze_demo.py --demo /caminho/para/partida.dem
```

---

### 9. Configurar GitHub Secrets

No repositório GitHub, vá em **Settings → Secrets and variables → Actions**.

Adicione os seguintes secrets:

| Secret | Valor |
|---|---|
| `SUPABASE_URL` | URL do projeto Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (⚠️ secreta) |
| `PLAYER_STEAM_ID` | Seu Steam ID 64-bit |

---

### 10. Processar uma Demo via GitHub Actions

1. Faça upload da sua demo `.dem` para um local acessível publicamente:
   - Google Drive (link direto de download)
   - Cloudflare R2 (gratuito, recomendado para uso frequente)
   - Qualquer URL HTTPS de download direto
2. No repositório GitHub, vá em **Actions → Process CS2 Demo**
3. Clique em **"Run workflow"**
4. Preencha os campos:
   - **demo_url**: URL pública da demo
   - **demo_name**: nome descritivo (opcional)
   - **dry_run**: marque para testar sem enviar ao Supabase
5. Clique em **"Run workflow"**
6. Acompanhe o progresso na aba Actions
7. O JSON com estatísticas ficará disponível como artifact por 30 dias

> **Onde obter demos CS2:**  
> No CS2, as demos de partidas ranqueadas ficam em:  
> `C:\Program Files (x86)\Steam\userdata\[SteamID]\730\local\cfg\`  
> ou podem ser baixadas diretamente pelo menu "Suas partidas" no CS2.

---

### 11. Verificar o Processamento

Após o GitHub Actions concluir:

1. Vá no Supabase → **Table Editor → matches**
2. Confirme que o registro foi inserido
3. Acesse o site e verifique o Dashboard

Se algo der errado:
- Verifique os logs do GitHub Actions (aba Actions)
- Baixe o artifact `analysis-result-[run_id].json` para ver o JSON gerado
- Verifique se o Steam ID está correto
- Confirme as variáveis de ambiente / secrets

---

### 12. Deploy na Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login com GitHub
2. Clique em **"Add New Project"**
3. Selecione o repositório `cstracker`
4. Na tela de configuração:
   - Framework: **Next.js** (detectado automaticamente)
   - Root Directory: `./` (padrão)
5. Em **Environment Variables**, adicione:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Clique em **Deploy**

O site estará disponível em `https://cstracker-[hash].vercel.app`

> **Domínio gratuito:** A Vercel fornece um subdomínio gratuito.  
> Para um domínio personalizado, configure em **Project → Domains**.

---

### 13. Adicionar Granadas ao Banco

**Opção 1: Via SQL Editor no Supabase**

```sql
INSERT INTO public.grenades (map_name, name, type, side, throw_location, destination, description, video_url, image_url)
VALUES (
  'mirage',
  'Smoke CT A Site',
  'smoke',
  't',
  'T Spawn',
  'CT A Site',
  'Descrição de como fazer o alinhamento.',
  'https://youtube.com/watch?v=...',
  'https://i.imgur.com/exemplo.gif'
);
```

**Opção 2: Via Table Editor**  
Supabase → Table Editor → grenades → Insert row

---

### 14. Configurar Pix (Opcional)

No `.env.local` e nas variáveis da Vercel:

```env
NEXT_PUBLIC_PIX_ENABLED=true
NEXT_PUBLIC_PIX_KEY=sua-chave-pix@email.com
# Opcional:
NEXT_PUBLIC_PIX_QR_URL=https://...
NEXT_PUBLIC_PIX_PAYMENT_URL=https://...
```

O botão "Apoie o Projeto" aparecerá automaticamente no rodapé.

---

### 15. Configurar AdSense (Opcional — após aprovação)

1. Crie conta em [adsense.google.com](https://adsense.google.com)
2. Adicione o site e aguarde aprovação (pode levar dias/semanas)
3. Após aprovação, obtenha seu Publisher ID (`ca-pub-XXXXXXXXXXXXXXXX`)
4. Crie ad units e obtenha os Slot IDs
5. Configure nas variáveis de ambiente:

```env
NEXT_PUBLIC_ADS_ENABLED=true
NEXT_PUBLIC_ADSENSE_PUBLISHER_ID=ca-pub-XXXXXXXXXXXXXXXX
NEXT_PUBLIC_ADSENSE_SLOT_DASHBOARD=0000000000
NEXT_PUBLIC_ADSENSE_SLOT_GRENADES=0000000001
```

6. Adicione o script do AdSense no `app/layout.tsx`:

```tsx
<Script
  async
  src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID}`}
  crossOrigin="anonymous"
  strategy="afterInteractive"
/>
```

> ⚠️ **Nunca ative anúncios antes da aprovação do AdSense.**  
> Isso pode resultar em banimento da conta.

---

## 🗺️ Roadmap

### V1 (MVP atual)
- ✅ Processamento de demos CS2
- ✅ Estatísticas básicas (K/D, ADR, HS%, TTD)
- ✅ Dashboard de estatísticas
- ✅ Biblioteca de granadas com filtros
- ✅ GitHub Actions com `workflow_dispatch`
- ✅ Estrutura para Pix e AdSense

### V2 (próximas melhorias)
- [ ] Gráficos de evolução (K/D, ADR ao longo do tempo)
- [ ] Estatísticas por mapa
- [ ] Estatísticas por lado (CT/T)
- [ ] Busca de granadas
- [ ] Favoritar granadas
- [ ] KAST e Rating

### V3 (futuro)
- [ ] Autenticação de usuários
- [ ] Múltiplos jogadores
- [ ] Análise avançada com IA
- [ ] Planos premium
- [ ] API pública

---

## 🔒 Segurança

- `SUPABASE_SERVICE_ROLE_KEY` é usada **apenas** no GitHub Actions
- O frontend usa apenas `SUPABASE_ANON_KEY` (somente leitura via RLS)
- Arquivos `.dem` **nunca** são commitados no repositório
- Todas as variáveis sensíveis ficam em GitHub Secrets

---

## 📊 Definição das Métricas

| Métrica | Fórmula | Limitação |
|---|---|---|
| **K/D** | `kills / max(deaths, 1)` | Sem contexto de clutches/rounds |
| **ADR** | `damage / rounds_played` | Requer contagem correta de rounds |
| **HS%** | `hs_kills / max(kills,1) × 100` | Apenas kills com headshot, não hits |
| **TTD** | Média de `(tick_death - tick_last_dmg) / 64` | `null` se dados de tick indisponíveis |

---

## ⚠️ Limitações Conhecidas

1. **AWPy 2.x** pode ter comportamento diferente em versões menores — o script detecta colunas em runtime
2. **TTD** retorna `null` se a demo não tiver dados de tick suficientes
3. **Supabase Free** pausa projetos após 1 semana sem requisições — reative no painel
4. Demos **acima de 100 MB** devem ser comprimidas ou hospedadas externamente antes do upload

---

## 🤝 Contribuindo

Projeto pessoal. Sugestões bem-vindas via Issues.

---

*Não afiliado à Valve Corporation. CS2 é marca registrada da Valve.*
