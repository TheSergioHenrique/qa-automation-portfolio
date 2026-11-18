const { test, expect } = require('../fixtures');
const { users } = require('../constants');

// Login tests start logged out, ignoring the saved session
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Login', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('logs in with the standard user', async ({ page, loginPage }) => {
    await loginPage.login(users.standardUser.username, users.standardUser.password);

    await expect(page).toHaveURL(/inventory\.html/);
    await expect(page.getByTestId('title')).toHaveText('Products');
  });

  const failures = [
    { name: 'locked out user', user: users.lockedUser, error: 'Sorry, this user has been locked out' },
    { name: 'invalid credentials', user: users.invalidUser, error: 'Username and password do not match' },
    { name: 'empty username', user: { username: '', password: 'secret_sauce' }, error: 'Username is required' },
    { name: 'empty password', user: { username: 'standard_user', password: '' }, error: 'Password is required' },
    { name: 'empty credentials', user: users.emptyCredentials, error: 'Username is required' },
  ];

  for (const { name, user, error } of failures) {
    test(`shows an error for ${name}`, async ({ page, loginPage }) => {
      await loginPage.login(user.username, user.password);

      await loginPage.expectError(error);
      await expect(page).not.toHaveURL(/inventory\.html/);
    });
  }

  test('blocks direct access to the inventory without a session', async ({ page, loginPage }) => {
    await page.goto('/inventory.html');

    await expect(page).toHaveURL('/');
    await loginPage.expectError("You can only access '/inventory.html' when you are logged in");
  });
});
