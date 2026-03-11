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

test('Deve exibir alerta de erro ao tentar logar com credenciais inválidas', async ({ page }) => {
  // 1. O robô acessa a página
  await page.goto('http://localhost:3000/login');

  // 2. O robô "digita" um e-mail falso e uma senha qualquer
  await page.fill('input[name="email"]', 'robo_hacker@teste.com');
  await page.fill('input[name="password"]', 'senha_errada_123');

  // 3. O robô clica no botão Entrar
  await page.click('button:has-text("Entrar")');

  await expect(page.locator('button:has-text("Entrando...")')).toBeVisible();

  // 4. O robô espera o resultado e verifica se o alerta de erro aparece
  await expect(page.locator('text=Erro').first()).toBeVisible();
});