const { test, expect } = require('../fixtures');

test.describe('Inventory', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
  });

  test('lists 6 products with name, price and image', async ({ inventoryPage }) => {
    await expect(inventoryPage.items).toHaveCount(6);

    for (const item of await inventoryPage.items.all()) {
      await expect(item.getByTestId('inventory-item-name')).not.toBeEmpty();
      await expect(item.getByTestId('inventory-item-price')).toHaveText(/^\$\d+\.\d{2}$/);
      await expect(item.getByRole('img')).toBeVisible();
    }
  });

  test('sorts products by name A to Z', async ({ inventoryPage }) => {
    await inventoryPage.sortBy('az');
    const names = await inventoryPage.getNames();
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  });

  test('sorts products by name Z to A', async ({ inventoryPage }) => {
    await inventoryPage.sortBy('za');
    const names = await inventoryPage.getNames();
    expect(names).toEqual([...names].sort((a, b) => b.localeCompare(a)));
  });

  test('sorts products by price low to high', async ({ inventoryPage }) => {
    await inventoryPage.sortBy('lohi');
    const prices = await inventoryPage.getPrices();
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  test('sorts products by price high to low', async ({ inventoryPage }) => {
    await inventoryPage.sortBy('hilo');
    const prices = await inventoryPage.getPrices();
    expect(prices).toEqual([...prices].sort((a, b) => b - a));
  });

  test('toggles the add/remove button and the cart badge', async ({ page, inventoryPage }) => {
    await inventoryPage.addToCart('sauce-labs-backpack');
    await expect(page.getByTestId('remove-sauce-labs-backpack')).toBeVisible();
    await expect(inventoryPage.cartBadge).toHaveText('1');

    await inventoryPage.removeFromCart('sauce-labs-backpack');
    await expect(page.getByTestId('add-to-cart-sauce-labs-backpack')).toBeVisible();
    await expect(inventoryPage.cartBadge).toBeHidden();
  });
});
