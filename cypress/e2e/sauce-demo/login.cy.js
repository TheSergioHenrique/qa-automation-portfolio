describe('Sauce Demo - Login', () => {
    beforeEach(() => {
        cy.visit('https://www.saucedemo.com/');
    });

    context('Successful login', () => {
        it('Login successfully with standard user', () => {
            cy.fixture('users').then((users) => {
                cy.get('[data-test="username"]').type(users.standardUser.username);
                cy.get('[data-test="password"]').type(users.standardUser.password);
                cy.get('[data-test="login-button"]').click();

                cy.url().should('include', '/inventory.html');
                cy.get('.title').should('have.text', 'Products');
            });
        });
    });

    context('Failed login', () => {
        it('should show error for locked out user', () => {
            cy.fixture('users').then((users) => {
                cy.get('[data-test="username"]').type(users.lockedUser.username);
                cy.get('[data-test="password"]').type(users.lockedUser.password);
                cy.get('[data-test="login-button"]').click();

                cy.get('[data-test="error"]')
                .should('be.visible')
                .and('contain', 'Sorry, this user has been locked out');
            });
        });

        it('should show error for invalid credentials', () => {
            cy.fixture('users').then((users) => {
                cy.get('[data-test="username"]').type(users.invalidUser.username);
                cy.get('[data-test="password"]').type(users.invalidUser.password);
                cy.get('[data-test="login-button"]').click();

                cy.get('[data-test="error"]')
                .should('be.visible')
                .and('contain', 'Username and password do not match');
            });
        });
    });

    context('Field validation', () => {
        it('should show error when username is empty', () => {
            cy.get('[data-test="password"]').type('secret_sauce');
            cy.get('[data-test="login-button"]').click();

            cy.get('[data-test="error"]')
            .should('be.visible')
            .and('contain', 'Username is required');
        });

        it('should show error when password is empty', () => {
            cy.get('[data-test="username"]').type('standard_user');
            cy.get('[data-test="login-button"]').click();

            cy.get('[data-test="error"]')
            .should('be.visible')
            .and('contain', 'Password is required');
        });

        it('should show error when both fields are empty', () => {
            cy.get('[data-test="login-button"]').click();

            cy.get('[data-test="error"]')
            .should('be.visible')
            .and('contain', 'Username is required');
        });
    });
});
