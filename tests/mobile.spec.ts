import { test, expect, devices } from '@playwright/test';

test.use({ ...devices['iPhone 13 Pro'] });

test('Responsividade: A tela de login deve se adaptar perfeitamente ao formato Mobile', async ({ page }) => {
  await page.goto('http://localhost:3000/login');

  // 2. Pega a "caixa" do formulário na tela
  const formBox = await page.locator('form').boundingBox();
  
  // 3. Garante que o formulário não é maior que a tela do celular 
  expect(formBox?.width).toBeLessThan(400); 
  
  // 4. Garante que os botões estão grandes o suficiente para o dedo clicar
  const buttonBox = await page.locator('button:has-text("Entrar")').boundingBox();
  expect(buttonBox?.height).toBeGreaterThanOrEqual(36);
});