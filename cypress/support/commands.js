Cypress.Commands.add('login',(username, password) => {
    cy.visit('https://www.saucedemo.com/')
    cy.get('[data-test="username"]').type(username)
    cy.get('[data-test="password"]').type(password)
    cy.get('[data-test="login-button"]').click()
    cy.url().should('include', '/inventory.html')
})

Cypress.Commands.add('addToCart', (productID) =>{
    cy.get(`[data-test="add-to-cart-${productID}"]`).click()
})

Cypress.Commands.add('RemoveFromCart', (productID) =>{
    cy.get(`[data-test="remove-${productID}"]`).click()
})
