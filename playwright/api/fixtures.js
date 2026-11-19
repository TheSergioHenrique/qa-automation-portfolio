// API fixtures: each test gets fresh ServeRest users (created through the API
// and deleted afterwards), so tests can run in parallel without sharing data.
const base = require('@playwright/test');
const { randomUUID } = require('node:crypto');

const uniqueEmail = (prefix) => `${prefix}.${randomUUID()}@qa.dev`;

async function createUser(request, { administrador }) {
  const user = { nome: 'QA Playwright', email: uniqueEmail('pw'), password: 'Senha@123', administrador };

  const created = await request.post('/usuarios', { data: user });
  base.expect(created.status()).toBe(201);

  const login = await request.post('/login', { data: { email: user.email, password: user.password } });
  base.expect(login.status()).toBe(200);

  return { ...user, id: (await created.json())._id, token: (await login.json()).authorization };
}

const test = base.test.extend({
  adminUser: async ({ request }, use) => {
    const user = await createUser(request, { administrador: 'true' });
    await use(user);
    await request.delete(`/usuarios/${user.id}`);
  },

  regularUser: async ({ request }, use) => {
    const user = await createUser(request, { administrador: 'false' });
    await use(user);
    await request.delete(`/usuarios/${user.id}`);
  },
});

module.exports = { test, expect: base.expect, uniqueEmail };
