# 💼 MyFinPocket

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)

O **MyFinPocket** é um assistente financeiro inteligente e moderno, focado em dar ao usuário controle total sobre suas finanças. Construído com uma arquitetura de Software como Serviço (SaaS), ele vai muito além de um simples rastreador de despesas: conta com inteligência artificial para análises, automação de conciliação de faturas em PDF, sistema avançado de pagamentos em lote, segurança de nível corporativo e tudo isso empacotado como um **Progressive Web App (PWA)** instalável.

## ✨ Funcionalidades Principais

* 📄 **Leitura e Conciliação de Faturas (PDF):** Sistema inteligente de upload e leitura de extratos/faturas em PDF, automatizando a entrada de dados e facilitando a conciliação bancária do usuário.
* 💳 **Pagamento em Lote via PIX:** Selecione múltiplas despesas pendentes, gere um QR Code dinâmico (Copia e Cola) via API própria e dê baixa automática em todas as contas simultaneamente.
* 📈 **Dashboard Dinâmico e Interativo:** Gráficos avançados criados com Tremor, incluindo um **Gráfico de Evolução de Saldo Diário** inteligente que altera a sua cor (Verde/Vermelho) automaticamente com base na saúde do fluxo de caixa.
* 🔍 **Filtros Avançados via URL:** Sistema de busca e filtragem de transações (por tipo, status e mês) persistidos na URL via `searchParams`, permitindo navegação fluida sem recarregar a página (com `router.refresh()`).
* 🔒 **Segurança e Autenticação SSR:** Proteção total de rotas com Next.js Middleware. Acesso gerenciado via Cookies pelo Supabase Auth, bloqueio nativo contra senhas vazadas e isolamento de dados por usuário usando **Row Level Security (RLS)** diretamente no banco PostgreSQL.
* 🤖 **AI Advisor:** Análise inteligente do mês gerada por Inteligência Artificial (Google Gemini), oferecendo insights sobre onde economizar e como estão seus hábitos de consumo.
* 📱 **PWA Nativo:** Instalação direta no celular (iOS/Android) com ícone próprio e experiência de tela cheia, sem barra de navegador.
* 🐷 **Cofres (Saving Goals) & 🚧 Limites (Budgets):** Sistema de caixinhas para proteger dinheiro de objetivos específicos e definição de tetos de gastos por categoria com barras de progresso.

## 🛠️ Tecnologias Utilizadas

* **Frontend:** Next.js (App Router), React, TypeScript.
* **Estilização & UI:** Tailwind CSS, shadcn/ui, Tremor (Gráficos), Lucide React (Ícones).
* **Backend & BaaS:** Supabase, `@supabase/ssr` (Gerenciamento de Sessão Seguro), Route Handlers (API do Next.js).
* **Automação & Processamento:** Leitura de PDF e estruturação de dados.
* **Ferramentas Adicionais:** `react-qr-code` (Geração de PIX), `@ducanh2912/next-pwa`.
* **Inteligência Artificial:** Integração com LLM (Google Gemini).

## 🚀 Como rodar o projeto localmente

### 1. Pré-requisitos
Certifique-se de ter o [Node.js](https://nodejs.org/) instalado em sua máquina e uma conta no [Supabase](https://supabase.com/).

### 2. Clonando o repositório
```bash
git clone [https://github.com/SEU_USUARIO/myfinpocket.git](https://github.com/SEU_USUARIO/myfinpocket.git)
cd myfinpocket
```

### 3. Instalando as dependências
```bash
npm install
```

### 4. Configurando as Variáveis de Ambiente
Crie um arquivo `.env.local` na raiz do projeto e preencha com as suas credenciais:

```env
# Supabase (Banco de Dados e Autenticação)
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase

# Inteligência Artificial (Gemini API)
GOOGLE_GEMINI_API_KEY=sua_chave_de_api_aqui
```

### 5. Configuração do Banco de Dados (Supabase)
O projeto utiliza um banco PostgreSQL estruturado com RLS ativado para garantir o isolamento dos dados de cada usuário. As tabelas principais são:
- `transactions` (Receitas e Despesas vinculadas ao `user_id`)
- `goals` (Cofres / Objetivos financeiros vinculados ao `user_id`)
- `budgets` (Limites de gastos por categoria vinculados ao `user_id`)
- `wallets` (Contas bancárias do usuário)

*Certifique-se de configurar as Políticas (Policies) de Row Level Security (RLS) no Supabase para permitir acesso apenas aos dados do próprio `auth.uid()`.*

### 6. Executando a aplicação
Para rodar em modo de desenvolvimento:
```bash
npm run dev
```
Acesse [http://localhost:3000](http://localhost:3000) no seu navegador. O sistema exigirá a criação de uma conta na tela de login para acessar o Dashboard.

*Nota: Para testar a funcionalidade PWA (instalação do app), é necessário gerar a build de produção rodando `npm run build` e depois `npm run start`.*

## 🛣️ Próximos Passos (Roadmap)
- [ ] Integração final da conciliação bancária de extratos com fluxos via Webhooks no n8n.

---

Desenvolvido com dedicação por Pedro Eduardo.
