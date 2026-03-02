import { test, expect } from '@playwright/test';

test('Segurança: Deve bloquear acesso ao Dashboard e redirecionar para Login', async ({ page }) => {
  // 1. O robô tenta ser "hacker" e acessar a raiz do app direto, sem fazer login
  await page.goto('http://localhost:3000/');

  // 2. O seu sistema de proteção (Middleware) deve chutar ele para a tela de login na mesma hora
  await expect(page).toHaveURL(/.*\/login/);

  // 3. Garante que ele está vendo a tela de login e não o Dashboard
  await expect(page.locator('h1', { hasText: 'MyFinPocket' })).toBeVisible();
});