const { test, expect } = require('../fixtures');

const PRODUCTS = ['sauce-labs-backpack', 'sauce-labs-bike-light', 'sauce-labs-bolt-t-shirt'];

test.describe('Cart', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
    for (const product of PRODUCTS) {
      await inventoryPage.addToCart(product);
    }
    await inventoryPage.openCart();
  });

  test('shows every product added', async ({ page, cartPage }) => {
    await expect(page).toHaveURL(/cart\.html/);
    await expect(cartPage.items).toHaveCount(PRODUCTS.length);
  });

  test('removes a product from the cart page', async ({ cartPage, inventoryPage }) => {
    await cartPage.remove('sauce-labs-backpack');

    await expect(cartPage.items).toHaveCount(2);
    await expect(inventoryPage.cartBadge).toHaveText('2');
  });

  test('goes back to the store with "Continue Shopping"', async ({ page, cartPage }) => {
    await cartPage.continueShoppingButton.click();
    await expect(page).toHaveURL(/inventory\.html/);
  });

  // KNOWN BUG (Sauce Demo): checkout is allowed with an empty cart.
  test('does not allow checkout with an empty cart', async ({ page, cartPage }) => {
    test.fail(true, 'Known bug: checkout is allowed with an empty cart');

    for (const product of PRODUCTS) {
      await cartPage.remove(product);
    }
    await expect(cartPage.items).toHaveCount(0);

    await cartPage.checkout();
    await expect(page).toHaveURL(/cart\.html/, { timeout: 2000 });
  });
});
