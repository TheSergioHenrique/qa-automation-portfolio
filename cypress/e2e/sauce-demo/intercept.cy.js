describe('Sauce Demo - Intercept', () =>{
    beforeEach(() => {
        cy.visit('https://www.saucedemo.com/');
    });

    context('Intercepting static assets', () =>{
        it('should pick page values', () => {
            cy.login('standard_user','secret_sauce')
            cy.intercept('GET', 'https://www.saucedemo.com/static/media/bike-light-1200x1500.37c843b09a7d77409d63.jpg')
        })
    })
})
