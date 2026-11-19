const { test, expect, uniqueEmail } = require('./fixtures');

const validUser = () => ({ nome: 'QA', email: uniqueEmail('val'), password: 'Senha@123', administrador: 'true' });

test.describe('ServeRest API - Usuarios validation', () => {
  const invalidPayloads = [
    { name: 'invalid email format', patch: { email: 'not-an-email' }, field: 'email', error: 'email deve ser um email válido' },
    { name: 'blank name', patch: { nome: '' }, field: 'nome', error: 'nome não pode ficar em branco' },
    { name: 'administrador as "sim"', patch: { administrador: 'sim' }, field: 'administrador', error: "administrador deve ser 'true' ou 'false'" },
    { name: 'administrador as boolean', patch: { administrador: true }, field: 'administrador', error: "administrador deve ser 'true' ou 'false'" },
    { name: 'unknown field', patch: { role: 'admin' }, field: 'role', error: 'role não é permitido' },
  ];

  for (const { name, patch, field, error } of invalidPayloads) {
    test(`rejects ${name}`, async ({ request }) => {
      const response = await request.post('/usuarios', { data: { ...validUser(), ...patch } });

      expect(response.status()).toBe(400);
      expect(await response.json()).toEqual({ [field]: error });
    });
  }

  test('lists every required field for an empty body', async ({ request }) => {
    const response = await request.post('/usuarios', { data: {} });

    expect(response.status()).toBe(400);
    expect(Object.keys(await response.json()).sort()).toEqual(['administrador', 'email', 'nome', 'password']);
  });

  test('rejects an email already in use', async ({ request, adminUser }) => {
    const response = await request.post('/usuarios', { data: { ...validUser(), email: adminUser.email } });

    expect(response.status()).toBe(400);
    expect((await response.json()).message).toBe('Este email já está sendo usado');
  });

  test('validates the id format', async ({ request }) => {
    const response = await request.get('/usuarios/abc');

    expect(response.status()).toBe(400);
    expect((await response.json()).id).toBe('id deve ter exatamente 16 caracteres alfanuméricos');
  });

  test('filters the user list by email', async ({ request, adminUser }) => {
    const response = await request.get('/usuarios', { params: { email: adminUser.email } });
    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body.quantidade).toBe(1);
    expect(body.usuarios[0]).toMatchObject({ _id: adminUser.id, email: adminUser.email, administrador: 'true' });
  });

  // KNOWN ISSUE (ServeRest): GET /usuarios returns every user's password in plain text.
  // test.fail() passes while the issue exists and turns red once it is fixed.
  test('does not expose passwords in the user list', async ({ request, adminUser }) => {
    test.fail(true, 'Known issue: passwords are returned in plain text');

    const response = await request.get('/usuarios', { params: { email: adminUser.email } });
    expect((await response.json()).usuarios[0]).not.toHaveProperty('password');
  });
});

test.describe('ServeRest API - Login validation', () => {
  const cases = [
    { name: 'empty body', data: {}, status: 400, body: { email: 'email é obrigatório', password: 'password é obrigatório' } },
    { name: 'invalid email format', data: { email: 'x', password: 'y' }, status: 400, body: { email: 'email deve ser um email válido' } },
    { name: 'unknown user', data: { email: 'nobody@qa.dev', password: 'y' }, status: 401, body: { message: 'Email e/ou senha inválidos' } },
  ];

  for (const { name, data, status, body } of cases) {
    test(`rejects login with ${name}`, async ({ request }) => {
      const response = await request.post('/login', { data });

      expect(response.status()).toBe(status);
      expect(await response.json()).toEqual(body);
    });
  }
});
