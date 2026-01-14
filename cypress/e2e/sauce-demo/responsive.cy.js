describe('Sauce Demo - Responsive', () =>{

    const devices = [
    { name: 'iPhone X', viewport: 'iphone-x'},
    { name: 'samsung S10', viewport: 'samsung-s10'},
    { name: 'Macbook 15', viewport: 'macbook-15'},
    { name: 'iPhone 4', viewport: 'iphone-4'},
    ]

    beforeEach(() => {
        cy.visit('https://www.saucedemo.com/');
        cy.login('standard_user','secret_sauce')
    })

    devices.forEach((device) =>{

        context(`Device - ${device.name}`, () => {
            beforeEach(() => {
                cy.viewport(device.viewport)
            })

            it('should display the products page', () => {
                cy.get('.inventory_item').should('have.length', 6)
            })

            it('should open hamburger menu.', () => {
                cy.get('#react-burger-menu-btn').should('be.visible').click()
            })

            it('should close hamburger menu.', () => {
                cy.get('#react-burger-menu-btn').should('be.visible').click()
                cy.get('#react-burger-cross-btn').should('be.visible').click()
            })

            it('should complete purchase flow.', () => {
                cy.addToCart('sauce-labs-backpack')
                cy.addToCart('sauce-labs-bike-light')
                cy.addToCart('sauce-labs-bolt-t-shirt')
                cy.get('.shopping_cart_link').click()
                cy.get('[data-test="checkout"]').click()

                cy.get('[data-test="firstName"]').type('miau')
                cy.get('[data-test="lastName"]').type('miau')
                cy.get('[data-test="postalCode"]').type('miau')

                cy.get('[data-test="continue"]').click()
                cy.get('[data-test="finish"]').click()
            })
        })
    })
})



