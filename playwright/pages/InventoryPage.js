const { expect } = require('@playwright/test');

class InventoryPage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    this.title = page.getByTestId('title');
    this.items = page.getByTestId('inventory-item');
    this.itemNames = page.getByTestId('inventory-item-name');
    this.itemPrices = page.getByTestId('inventory-item-price');
    this.sortSelect = page.getByTestId('product-sort-container');
    this.cartBadge = page.getByTestId('shopping-cart-badge');
    this.cartLink = page.getByTestId('shopping-cart-link');
  }

  async goto() {
    await this.page.goto('/inventory.html');
    await expect(this.title).toHaveText('Products');
  }

  async addToCart(productId) {
    await this.page.getByTestId(`add-to-cart-${productId}`).click();
  }

  async removeFromCart(productId) {
    await this.page.getByTestId(`remove-${productId}`).click();
  }

  /** @param {'az' | 'za' | 'lohi' | 'hilo'} option */
  async sortBy(option) {
    await this.sortSelect.selectOption(option);
  }

  async getNames() {
    return this.itemNames.allTextContents();
  }

  async getPrices() {
    const prices = await this.itemPrices.allTextContents();
    return prices.map((p) => Number(p.replace('$', '')));
  }

  async openCart() {
    await this.cartLink.click();
  }
}

module.exports = { InventoryPage };
