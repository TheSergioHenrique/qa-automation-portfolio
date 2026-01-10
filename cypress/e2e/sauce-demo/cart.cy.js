describe('Sauce Demo - Cart(navigation)', () => {
    beforeEach(() => {
        cy.login('standard_user','secret_sauce')
    })

    context('Add products to cart', () => {
        it('add a product to cart.',() => {
            cy.addToCart('sauce-labs-backpack')
            cy.get('.shopping_cart_badge').should('have.text','1')
        })

        it('add various product to cart.',() => {
            cy.addToCart('sauce-labs-backpack')
            cy.addToCart('sauce-labs-bike-light')
            cy.addToCart('sauce-labs-bolt-t-shirt')
            cy.addToCart('sauce-labs-fleece-jacket')
            cy.addToCart('sauce-labs-onesie')
            cy.addToCart('test.allthethings()-t-shirt-(red)')

            cy.get('.shopping_cart_badge').should('have.text','6')
        })

        it('Remove products from cart',() => {
            cy.addToCart('sauce-labs-bike-light')
            cy.addToCart('sauce-labs-bolt-t-shirt')

            cy.RemoveFromCart('sauce-labs-bolt-t-shirt')
            cy.get('.shopping_cart_badge').should('have.text','1')
        })

        it('Remove only product from cart',() => {
            cy.addToCart('sauce-labs-bolt-t-shirt')
            cy.RemoveFromCart('sauce-labs-bolt-t-shirt')
            cy.get('.shopping_cart_badge').should('not.exist')
        })
    })
})

describe('Sauce Demo - Cart Page', () => {
    beforeEach(() => {
       cy.login('standard_user','secret_sauce')
       cy.get('[data-test="add-to-cart-sauce-labs-backpack"]').click()
       cy.get('[data-test="add-to-cart-sauce-labs-bike-light"]').click()
       cy.get('[data-test="add-to-cart-sauce-labs-bolt-t-shirt"]').click()
       cy.get('.shopping_cart_link').click()
   })

        context('Adding cart page validation', () => {
            it('remove product from cart page', () => {
                cy.RemoveFromCart('sauce-labs-backpack')
                cy.get('.cart_item').should('have.length', 2)
            })

            it('should display products on screen.', () => {
                cy.get('.cart_item').should('have.length',3)
                cy.get('.cart_item').each(() => {
                    cy.get('.inventory_item_name').should('be.visible')
                })
            })

            it('should return the store screen.', () => {
                cy.get('[data-test="continue-shopping"]').click();
                cy.url().should('contain', '/inventory.html')
            })

            //BUG: SYSTEM ALLOWS FOR CHECKOUT WITH EMPTY CART.
            it('should not allow checkout with empty cart', () =>{
                cy.RemoveFromCart('sauce-labs-backpack')
                cy.RemoveFromCart('sauce-labs-bike-light')
                cy.RemoveFromCart('sauce-labs-bolt-t-shirt')

                cy.get('[data-test="checkout"]').click()
                cy.url().should('contain', '/cart.html')

            })

        })
})
