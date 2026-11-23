// Testes automatizados de acessibilidade (Playwright + axe-core)
// Rodar: npx playwright test
const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;
const path = require('path');

const URL = 'file://' + path.resolve(__dirname, '..', 'index.html');
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];

async function analisar(page) {
  const r = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  if (r.violations.length) console.log(JSON.stringify(r.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) })), null, 2));
  return r;
}

test.beforeEach(async ({ page }) => {
  await page.goto(URL);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('página inicial sem violações WCAG 2.2 AA', async ({ page }) => {
  const r = await analisar(page);
  expect(r.violations).toEqual([]);
});

test('modo alto contraste sem violações', async ({ page }) => {
  await page.getByRole('button', { name: 'Alto contraste' }).click();
  await expect(page.locator('html')).toHaveClass(/alto-contraste/);
  expect((await analisar(page)).violations).toEqual([]);
});

test('tema escuro sem violações', async ({ page }) => {
  await page.getByRole('button', { name: 'Tema escuro' }).click();
  expect((await analisar(page)).violations).toEqual([]);
});

test('texto ampliado a 200% e espaçamento amplo sem violações', async ({ page }) => {
  for (let i = 0; i < 10; i++) await page.getByRole('button', { name: /Aumentar texto/ }).click().catch(() => {});
  await page.getByRole('button', { name: 'Espaçamento amplo' }).click();
  await expect(page.locator('#tamanho-valor')).toHaveText('200%');
  expect((await analisar(page)).violations).toEqual([]);
});

test('erro de validação: foco no resumo, aria-invalid e sem violações', async ({ page }) => {
  await page.getByRole('button', { name: 'Adicionar tarefa' }).click();
  await expect(page.locator('#resumo-erros')).toBeFocused();
  await expect(page.getByLabel(/Título da tarefa/)).toHaveAttribute('aria-invalid', 'true');
  await expect(page.locator('#alerta')).toContainText('Informe o título');
  expect((await analisar(page)).violations).toEqual([]);
});

test('fluxo completo só com teclado', async ({ page }) => {
  // Link de salto é o primeiro item focável
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Ir para o conteúdo principal' })).toBeFocused();

  // Adiciona tarefa
  await page.getByLabel(/Título da tarefa/).focus();
  await page.keyboard.type('Entregar projeto final');
  await page.keyboard.press('Enter');
  await expect(page.locator('#aviso')).toContainText('adicionada');
  await expect(page.getByRole('checkbox', { name: 'Entregar projeto final' })).toBeVisible();

  // Conclui com Espaço
  await page.getByRole('checkbox', { name: 'Entregar projeto final' }).focus();
  await page.keyboard.press('Space');
  await expect(page.locator('#aviso')).toContainText('concluída');
  await expect(page.getByRole('checkbox', { name: 'Entregar projeto final' })).toBeFocused();

  // Exclui: diálogo abre com foco em Cancelar; Esc devolve o foco
  const btnExcluir = page.getByRole('button', { name: 'Excluir tarefa: Entregar projeto final' });
  await btnExcluir.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Cancelar' })).toBeFocused();
  expect((await analisar(page)).violations).toEqual([]);
  await page.keyboard.press('Escape');
  await expect(btnExcluir).toBeFocused();

  // Confirma exclusão
  await page.keyboard.press('Enter');
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Enter');
  await expect(page.locator('#aviso')).toContainText('excluída');
  await expect(page.getByRole('checkbox', { name: 'Entregar projeto final' })).toHaveCount(0);
});

test('filtros por setas do teclado', async ({ page }) => {
  await page.getByRole('radio', { name: 'Todas' }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('radio', { name: 'Pendentes' })).toBeChecked();
  await expect(page.locator('#aviso')).toContainText('Mostrando pendentes');
});

test('preferências persistem após recarregar', async ({ page }) => {
  await page.getByRole('button', { name: 'Alto contraste' }).click();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Alto contraste' })).toHaveAttribute('aria-pressed', 'true');
});

test('layout funciona em 320px sem rolagem horizontal (reflow 1.4.10)', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  const rola = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(rola).toBe(false);
});
