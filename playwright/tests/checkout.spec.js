const { test, expect } = require('../fixtures');

const CUSTOMER = { firstName: 'Sergio', lastName: 'QA', postalCode: '50000-000' };

test.describe('Checkout', () => {
  test.beforeEach(async ({ inventoryPage, cartPage }) => {
    await inventoryPage.goto();
    await inventoryPage.addToCart('sauce-labs-backpack');
    await inventoryPage.addToCart('sauce-labs-bike-light');
    await inventoryPage.openCart();
    await cartPage.checkout();
  });

  test('completes a purchase end to end', async ({ page, checkoutPage, inventoryPage }) => {
    await checkoutPage.fillInformation(CUSTOMER);
    await expect(page).toHaveURL(/checkout-step-two\.html/);

    await checkoutPage.finish();
    await expect(page).toHaveURL(/checkout-complete\.html/);
    await expect(checkoutPage.completeHeader).toHaveText('Thank you for your order!');
    await expect(inventoryPage.cartBadge).toBeHidden();
  });

  test('shows the item total as the sum of product prices', async ({ checkoutPage }) => {
    await checkoutPage.fillInformation(CUSTOMER);

    await expect(checkoutPage.itemTotal).toHaveText('Item total: $39.98');
  });

  const missing = [
    { field: 'first name', data: { ...CUSTOMER, firstName: '' }, error: 'First Name is required' },
    { field: 'last name', data: { ...CUSTOMER, lastName: '' }, error: 'Last Name is required' },
    { field: 'postal code', data: { ...CUSTOMER, postalCode: '' }, error: 'Postal Code is required' },
  ];

  for (const { field, data, error } of missing) {
    test(`requires the ${field}`, async ({ page, checkoutPage }) => {
      await checkoutPage.fillInformation(data);

      await expect(checkoutPage.error).toContainText(error);
      await expect(page).toHaveURL(/checkout-step-one\.html/);
    });
  }
});
