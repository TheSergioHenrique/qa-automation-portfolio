describe('Sauce Demo - Navigation', () => {
    beforeEach(() => {
        cy.visit('https://www.saucedemo.com/')
        //Login
        cy.fixture('users').then((users) => {
            cy.get('[data-test="username"]').type(users.standardUser.username)
            cy.get('[data-test="password"]').type(users.standardUser.password)
            cy.get('[data-test="login-button"]').click()
        })
    })

    context('Product listing', () => {
        it('should display all products.', () => {
            cy.get('.inventory_item').should('have.length',6)
        })

        it('should display name, price, description and image.', () => {
            cy.get('.inventory_item').first().within(() =>{
                cy.get('.inventory_item_name').should('be.visible')
                cy.get('.inventory_item_desc').should('be.visible')
                cy.get('.inventory_item_price').should('be.visible')
                cy.get('.inventory_item_img').should('be.visible')
                })
            })

        it('should display price in the correct format.',() => {
            cy.get('.inventory_item_price').each(($price) =>{
                expect($price.text()).to.match(/^\$\d+.\d\d$/);
            })
        })

        it('should display ONLY positive prices.',() => {
            cy.get('.inventory_item_price').each(($price) =>{
                var priceValue = parseFloat($price.text().replace('$', ''))
                expect(priceValue).to.be.greaterThan(0)
            })
        })
    })

    context('Product sorting', () => {
        it('should sort products by A to Z',() => {
            cy.get('[data-test="product-sort-container"]').select('az')
            cy.get('.inventory_item_name').first().should('have.text','Sauce Labs Backpack')
        })

        it('should sort products by Z to A',() => {
            cy.get('[data-test="product-sort-container"]').select('za')
            cy.get('.inventory_item_name').first().should('have.text','Test.allTheThings() T-Shirt (Red)')
        })

        it('should sort products by lowest to highest price',() => {
            cy.get('[data-test="product-sort-container"]').select('lohi')
            cy.get('.inventory_item_name').first().should('have.text','Sauce Labs Onesie')
        })

        it('should sort products by highest to lowest price',() => {
            cy.get('[data-test="product-sort-container"]').select('hilo')
            cy.get('.inventory_item_name').first().should('have.text','Sauce Labs Fleece Jacket')
        })
    })

    context('Add to cart button', () => {
        it('add to cart becomes remove when clicked.',() => {
            cy.get('[data-test="add-to-cart-sauce-labs-backpack"]').should('have.text','Add to cart').click()
            cy.get('[data-test="remove-sauce-labs-backpack"]').should('have.text','Remove').click()
        })

        it('remove becomes add to cart when clicked.',() => {
            cy.get('[data-test="add-to-cart-sauce-labs-backpack"]').should('have.text','Add to cart').click()
            cy.get('[data-test="remove-sauce-labs-backpack"]').should('have.text','Remove').click()
            cy.get('[data-test="add-to-cart-sauce-labs-backpack"]').should('have.text','Add to cart').click()
        })

        it('update cart badge adding a product', () => {
            cy.get('.shopping_cart_badge').should('not.exist')
            cy.get('[data-test="add-to-cart-sauce-labs-backpack"]').should('have.text','Add to cart').click()
            cy.get('.shopping_cart_badge').should('have.text','1')
        })
    })




})
