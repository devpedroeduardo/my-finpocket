import { test, expect } from '@playwright/test';

// TESTE 1: Apenas visualiza se tudo carregou (O que já tínhamos)
test('A página de login deve carregar perfeitamente', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await expect(page.locator('h1', { hasText: 'MyFinPocket' })).toBeVisible();
  await expect(page.locator('text=Acessar Conta')).toBeVisible();
  await expect(page.locator('input[name="email"]')).toBeVisible();
  await expect(page.locator('input[name="password"]')).toBeVisible();
  await expect(page.locator('button:has-text("Entrar")')).toBeVisible();
});

// TESTE 2: Ação completa (O Robô ataca! 🥷)
test('Deve exibir alerta de erro ao tentar logar com credenciais inválidas', async ({ page }) => {
  // 1. O robô acessa a página
  await page.goto('http://localhost:3000/login');

  // 2. O robô "digita" um e-mail falso e uma senha qualquer
  await page.fill('input[name="email"]', 'robo_hacker@teste.com');
  await page.fill('input[name="password"]', 'senha_errada_123');

  // 3. O robô clica no botão Entrar
  await page.click('button:has-text("Entrar")');

  // 4. MÁGICA: Lembra que fizemos o botão mudar para "Entrando..." com aquele ícone girando?
  // O robô é tão rápido que consegue verificar se o estado de "loading" funcionou!
  await expect(page.locator('button:has-text("Entrando...")')).toBeVisible();

  // 5. O robô espera a resposta do backend (Supabase) e verifica se a caixa de Erro apareceu.
  // Como usamos o componente <AlertTitle>Erro</AlertTitle>, buscamos pela palavra "Erro".
  await expect(page.locator('text=Erro').first()).toBeVisible();
});