# Velô Sprint - Configurador de Veículo Elétrico

Aplicação web em React para configuração e compra do veículo elétrico **Velô Sprint**.

## Sobre o Projeto

Uma SPA (Single Page Application) que permite:
- Personalizar cores, rodas e opcionais do veículo
- Calcular preços em tempo real
- Realizar pedidos com análise de crédito
- Consultar status de pedidos

**Especificações do Velô Sprint:** 450 km de autonomia | 0-100 km/h em 3.2s | 500 cv

---

## Stack Tecnológica

| Categoria | Tecnologias |
|-----------|-------------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| **Estado** | Zustand (global), React Hook Form (formulários) |
| **Validação** | Zod |
| **Data Fetching** | TanStack Query |
| **Backend** | Supabase (PostgreSQL + Edge Functions) |

---

## Instalação

```bash
# Instalar dependências
yarn install

# Rodar em desenvolvimento
yarn run dev
```

Acesse: `http://localhost:5173`

---

## Configuração do Supabase

### 1. Criar Projeto

1. Acesse [supabase.com](https://supabase.com) e crie uma conta
2. Clique em **New Project**
3. Escolha um nome e senha para o banco
4. Aguarde a criação (~2 minutos)

### 2. Variáveis de Ambiente

Crie o arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_PROJECT_ID="seu_project_id"
VITE_SUPABASE_PUBLISHABLE_KEY="sua_chave_anon_publica"
VITE_SUPABASE_URL="https://seu_project_id.supabase.co"
```

> Encontre essas informações em: **Project Settings → API**

### 3. Ambientes: Preview e Production

O projeto usa dois projetos Supabase independentes:

| Ambiente | Projeto Supabase | Quem usa |
|---|---|---|
| Production | `awfboglgxrbepqxkzyim` (velô) | site publicado em produção |
| Preview | `zyeydgzpinrxuzrozfvc` (velo-preview) | deploys de preview, testes E2E e desenvolvimento local |

As migrações em `supabase/migrations` são a fonte de verdade dos dois bancos.

### 4. Deploy (banco + functions)

Confira sempre qual projeto está vinculado antes de aplicar qualquer mudança (`supabase/.temp/project-ref`).
Na versão 3 do CLI, o `db push` precisa de `--remote` para atuar no projeto vinculado.

```bash
# Instalar CLI
yarn add supabase -D

# Login e vincular o projeto desejado (Preview no exemplo)
yarn supabase login
yarn supabase link --project-ref zyeydgzpinrxuzrozfvc

# Simular e aplicar migrações (cria tabelas e RLS)
yarn supabase db push --remote --dry-run
yarn supabase db push --remote

# Deploy das Edge Functions
yarn supabase functions deploy credit-analysis --remote=zyeydgzpinrxuzrozfvc --use-api
```

### 5. Pipeline (`.github/workflows/cd.yml`)

As variáveis `VITE_SUPABASE_*` são gravadas no JavaScript durante o build. Por isso cada ambiente tem o seu build:

1. **Unit Tests**: testes unitários com Vitest.
2. **Build & Deploy Vercel Preview**: build com as variáveis do ambiente Preview da Vercel (Supabase Preview) e deploy de preview.
3. **Run E2E Tests**: Playwright contra a URL de preview e o banco Preview (`DATABASE_URL_PREVIEW`).
4. **Build & Deploy Vercel Production**: só depois dos E2E, um build novo com as variáveis do ambiente Production da Vercel (Supabase Production) e deploy em produção.

#### Decisão: build de produção em vez de `vercel promote`

O pipeline antigo promovia para produção o mesmo deploy gerado como preview. Isso não serve com dois bancos:

- As variáveis `VITE_*` viram strings literais no JavaScript durante o `vercel build`. O deploy de preview carrega o Supabase Preview e não muda de banco só por receber o domínio de produção.
- Pela documentação da Vercel, promover um deploy de preview gera um novo deploy de produção. Como o deploy é feito com `--prebuilt` (só o resultado do build é enviado), não há garantia de qual conjunto de variáveis o artefato final usaria.

Caminhos avaliados:

1. **Promover a preview**: produção ficaria com o Supabase Preview ou com um artefato diferente do testado. Descartado.
2. **Build e deploy próprios de produção depois dos E2E** (escolhido): `vercel pull --environment=production`, `vercel build --prod` e `vercel deploy --prebuilt --prod`, a partir do mesmo commit e do mesmo `yarn.lock` testados. Muda só a configuração do ambiente, e a conferência do build garante que produção aponta para o Supabase de produção.

Travas automáticas:

- `scripts/check-supabase-target.mjs` confere, depois de cada build, se o JavaScript gerado aponta para o Supabase certo e falha o pipeline se encontrar o outro.
- `playwright/support/guards/environmentGuard.ts` interrompe os testes E2E se `DATABASE_URL` ou `BASE_URL` apontarem para produção.

Configuração necessária:

- **Vercel → Settings → Environment Variables**: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PROJECT_ID` e `VITE_SUPABASE_PUBLISHABLE_KEY` com os valores de produção em **Production** e os do Preview em **Preview**.
- **GitHub → Settings → Secrets and variables → Actions**:
  - Secrets: `VERCEL_TOKEN`, `VERCEL_PROJECT_ID`, `VERCEL_ORG_ID`, `DATABASE_URL_PREVIEW`, `TD_TOKEN`.
  - Variables: `SUPABASE_PREVIEW_PROJECT_ID`, `SUPABASE_PROD_PROJECT_ID` e, opcionalmente, `PRODUCTION_URL`.

---

## Estrutura Principal

```
src/
├── pages/           # Páginas da aplicação
├── components/      # Componentes React
│   ├── configurator/   # Configurador do carro
│   ├── landing/        # Landing page
│   └── ui/             # Componentes shadcn/ui
├── store/           # Estado global (Zustand)
├── hooks/           # Hooks customizados
└── integrations/    # Cliente Supabase
```

---

## Rotas

| Rota | Descrição |
|------|-----------|
| `/` | Landing page |
| `/configure` | Configurador do veículo |
| `/order` | Checkout/Pedido |
| `/success` | Confirmação do pedido |
| `/lookup` | Consulta de pedidos |

---

## Modelo de Preços

- **Preço base:** R$ 40.000
- **Rodas Sport:** +R$ 2.000
- **Precision Park:** +R$ 5.500
- **Flux Capacitor:** +R$ 5.000
- **Financiamento:** 12x com juros de 2% a.m.

---

## Banco de Dados

**Tabela `orders`** — campos principais:
- `order_number` — Formato: VLO-XXXXXX
- `color`, `wheel_type`, `optionals` — Configuração
- `customer_name`, `customer_email`, `customer_cpf` — Cliente
- `payment_method`, `total_price` — Pagamento
- `status` — pending, approved, rejected, analysis

---

## Análise de Crédito

| Score | Resultado |
|-------|-----------|
| > 700 | Aprovado |
| 501-700 | Em análise |
| ≤ 500 | Reprovado |

*Se entrada ≥ 50% do total, aprova mesmo com score < 700*

---

## Fluxo Principal

```
Landing → Configurador → Checkout → Análise de Crédito → Confirmação
```

---

## Scripts

```bash
npm run dev      # Desenvolvimento
npm run build    # Build de produção
npm run lint     # Verificar código
```