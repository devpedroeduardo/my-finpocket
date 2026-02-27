# 💼 MyFinPocket

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)

O **MyFinPocket** é um assistente financeiro inteligente e moderno, focado em dar ao usuário controle total sobre suas finanças. Mais do que um simples rastreador de despesas, ele conta com inteligência artificial para análises, sistema de cofres para metas e limites de gastos, tudo isso empacotado como um **Progressive Web App (PWA)** instalável.

## ✨ Funcionalidades Principais

* 🤖 **AI Advisor:** Análise inteligente do mês gerada por Inteligência Artificial, oferecendo insights sobre onde economizar e como estão seus hábitos de consumo.
* 📱 **PWA Nativo:** Instalação direta no celular (iOS/Android) com ícone próprio e experiência de tela cheia, sem barra de navegador.
* 🐷 **Cofres (Saving Goals):** Sistema de caixinhas para guardar dinheiro para objetivos específicos. O saldo guardado é protegido e subtraído do saldo principal disponível.
* 🚧 **Limites de Gastos (Budgets):** Definição de tetos de gastos por categoria, com barras de progresso que alertam sobre orçamentos estourados.
* 📊 **Dashboard Avançado:** Visão geral do mês com gráficos dinâmicos (Fluxo de Caixa em barras e Despesas em pizza) utilizando a biblioteca Tremor.
* 🌓 **Modo Escuro / Claro:** Interface premium que se adapta perfeitamente à preferência do usuário.

## 🛠️ Tecnologias Utilizadas

* **Frontend:** Next.js (App Router), React, TypeScript.
* **Estilização:** Tailwind CSS, shadcn/ui, Tremor (Gráficos), Lucide React (Ícones).
* **Backend/BaaS:** Supabase (Autenticação e Banco de Dados PostgreSQL).
* **PWA:** `@ducanh2912/next-pwa`.
* **Inteligência Artificial:** Integração com LLM (Google Gemini) para geração de relatórios.

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
# Supabase
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase

# Inteligência Artificial (Gemini API)
GOOGLE_GEMINI_API_KEY=sua_chave_de_api_aqui
```

### 5. Executando a aplicação
Para rodar em modo de desenvolvimento:
```bash
npm run dev
```
Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.

*Nota: Para testar a funcionalidade PWA (instalação do app), é necessário gerar a build de produção rodando `npm run build` e depois `npm run start`.*

## 🗄️ Estrutura do Banco de Dados (Supabase)

O projeto utiliza um banco PostgreSQL estruturado com as seguintes tabelas principais:
- `transactions` (Receitas e Despesas)
- `goals` (Cofres / Objetivos financeiros)
- `budgets` (Limites de gastos por categoria)
- `wallets` (Contas bancárias do usuário)

---

Desenvolvido com dedicação por Pedro Eduardo.