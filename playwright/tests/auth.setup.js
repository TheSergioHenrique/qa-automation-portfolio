const { test: setup, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');
const { AUTH_FILE, users } = require('../constants');

setup('authenticate as standard user', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(users.standardUser.username, users.standardUser.password);
  await expect(page).toHaveURL(/inventory\.html/);

  await page.context().storageState({ path: AUTH_FILE });
});
