// @ts-check
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'relatorio-testes' }]],
  use: {
    browserName: 'chromium',
    locale: 'pt-BR',
    ...(process.env.CHROME_PATH ? { launchOptions: { executablePath: process.env.CHROME_PATH } } : {})
  }
});
