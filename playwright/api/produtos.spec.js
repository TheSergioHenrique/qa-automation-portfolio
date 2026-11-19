const { test, expect } = require('./fixtures');
const { randomUUID } = require('node:crypto');

const validProduct = (patch = {}) => ({
  nome: `Produto PW ${randomUUID()}`,
  preco: 10,
  descricao: 'Criado pelo Playwright',
  quantidade: 5,
  ...patch,
});

test.describe('ServeRest API - Produtos validation', () => {
  const invalid = [
    { name: 'negative price', patch: { preco: -1 }, field: 'preco', error: 'preco deve ser um número positivo' },
    { name: 'zero price', patch: { preco: 0 }, field: 'preco', error: 'preco deve ser um número positivo' },
    { name: 'decimal price', patch: { preco: 9.99 }, field: 'preco', error: 'preco deve ser um inteiro' },
    { name: 'negative quantity', patch: { quantidade: -1 }, field: 'quantidade', error: 'quantidade deve ser maior ou igual a 0' },
  ];

  for (const { name, patch, field, error } of invalid) {
    test(`rejects ${name}`, async ({ request, adminUser }) => {
      const response = await request.post('/produtos', {
        headers: { Authorization: adminUser.token },
        data: validProduct(patch),
      });

      expect(response.status()).toBe(400);
      expect(await response.json()).toEqual({ [field]: error });
    });
  }

  test('accepts zero quantity (lower boundary)', async ({ request, adminUser }) => {
    const response = await request.post('/produtos', {
      headers: { Authorization: adminUser.token },
      data: validProduct({ quantidade: 0 }),
    });

    expect(response.status()).toBe(201);
    await request.delete(`/produtos/${(await response.json())._id}`, { headers: { Authorization: adminUser.token } });
  });

  test('rejects a duplicated product name', async ({ request, adminUser }) => {
    const headers = { Authorization: adminUser.token };
    const product = validProduct();

    const first = await request.post('/produtos', { headers, data: product });
    const second = await request.post('/produtos', { headers, data: product });

    expect(second.status()).toBe(400);
    expect((await second.json()).message).toBe('Já existe produto com esse nome');
    await request.delete(`/produtos/${(await first.json())._id}`, { headers });
  });

  // KNOWN ISSUE (ServeRest): a numeric string ("10") is silently converted and accepted.
  test('rejects a price sent as text', async ({ request, adminUser }) => {
    test.fail(true, 'Known issue: preco "10" (string) is accepted with 201');
    const headers = { Authorization: adminUser.token };

    const response = await request.post('/produtos', { headers, data: validProduct({ preco: '10' }) });
    if (response.status() === 201) {
      await request.delete(`/produtos/${(await response.json())._id}`, { headers });
    }
    expect(response.status()).toBe(400);
  });
});

test.describe('ServeRest API - Produtos permissions', () => {
  const message401 = 'Token de acesso ausente, inválido, expirado ou usuário do token não existe mais';

  test('requires a token', async ({ request }) => {
    const response = await request.post('/produtos', { data: validProduct() });

    expect(response.status()).toBe(401);
    expect((await response.json()).message).toBe(message401);
  });

  test('rejects an invalid token', async ({ request }) => {
    const response = await request.post('/produtos', {
      headers: { Authorization: 'Bearer invalid.token.value' },
      data: validProduct(),
    });

    expect(response.status()).toBe(401);
    expect((await response.json()).message).toBe(message401);
  });

  test('forbids non-admin users', async ({ request, regularUser }) => {
    const response = await request.post('/produtos', {
      headers: { Authorization: regularUser.token },
      data: validProduct(),
    });

    expect(response.status()).toBe(403);
    expect((await response.json()).message).toBe('Rota exclusiva para administradores');
  });

  test('allows admin users', async ({ request, adminUser }) => {
    const headers = { Authorization: adminUser.token };
    const response = await request.post('/produtos', { headers, data: validProduct() });

    expect(response.status()).toBe(201);
    await request.delete(`/produtos/${(await response.json())._id}`, { headers });
  });
});
