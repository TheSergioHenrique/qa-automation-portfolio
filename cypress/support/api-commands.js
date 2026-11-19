// API helpers for the ServeRest specs (cypress/api). Base URL comes from env.apiUrl.

const api = (path) => `${Cypress.env('apiUrl')}${path}`;
const unique = () => `${Date.now()}-${Cypress._.random(1e6)}`;

// Creates an admin user, logs in and yields { id, email, password, token }
Cypress.Commands.add('apiCreateAdmin', () => {
    const user = {
        nome: 'QA Cypress',
        email: `cypress.${unique()}@qa.dev`,
        password: 'Senha@123',
        administrador: 'true',
    };

    return cy.request('POST', api('/usuarios'), user).then(({ body: created }) =>
        cy.request('POST', api('/login'), { email: user.email, password: user.password })
            .then(({ body }) => ({ id: created._id, email: user.email, password: user.password, token: body.authorization }))
    );
});

// Creates a product and yields its id
Cypress.Commands.add('apiCreateProduct', (token, overrides = {}) => {
    const product = { nome: `Produto Cypress ${unique()}`, preco: 10, descricao: 'Criado pelo Cypress', quantidade: 5, ...overrides };

    return cy.request({ method: 'POST', url: api('/produtos'), headers: { Authorization: token }, body: product })
        .its('body._id');
});

Cypress.Commands.add('apiCreateCart', (token, produtos, options = {}) =>
    cy.request({ method: 'POST', url: api('/carrinhos'), headers: { Authorization: token }, body: { produtos }, ...options })
);

Cypress.Commands.add('apiGetProduct', (id) => cy.request(api(`/produtos/${id}`)).its('body'));

// Best-effort cleanup: ignores errors so a failed test still cleans what it can
Cypress.Commands.add('apiCleanup', ({ token, userId, productId }) => {
    const opts = { failOnStatusCode: false, headers: { Authorization: token } };
    cy.request({ ...opts, method: 'DELETE', url: api('/carrinhos/cancelar-compra') });
    if (productId) cy.request({ ...opts, method: 'DELETE', url: api(`/produtos/${productId}`) });
    if (userId) cy.request({ ...opts, method: 'DELETE', url: api(`/usuarios/${userId}`) });
});
