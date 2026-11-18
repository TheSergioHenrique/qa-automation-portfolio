const PRODUCT_IMAGES = '**/assets/*-1200x1500-*.jpg'
const TELEMETRY = 'https://events.backtrace.io/api/**'

const MOCK_WIDTH = 120

const disableBrowserCache = () => {
    cy.wrap(Cypress.automation('remote:debugger:protocol', { command: 'Network.enable', params: {} }), { log: false })
    cy.wrap(Cypress.automation('remote:debugger:protocol', {
        command: 'Network.setCacheDisabled',
        params: { cacheDisabled: true },
    }), { log: false })
}

describe('Sauce Demo - Intercept', { browser: '!firefox' }, () => {
    beforeEach(() => {
        disableBrowserCache()
    })

    context('Product images', () => {
        it('should load every product image from the server', () => {
            cy.intercept('GET', PRODUCT_IMAGES).as('productImage')
            cy.login('standard_user', 'secret_sauce')

            cy.wait('@productImage').its('response.statusCode').should('be.oneOf', [200, 304])
            cy.get('.inventory_item_img img')
                .should('have.length', 6)
                .each(($img) => {
                    cy.wrap($img).should(($el) => {
                        expect($el[0].naturalWidth, 'image rendered').to.be.greaterThan(0)
                    })
                })
        })

        it('should render mocked images returned by the intercept', () => {
            cy.intercept('GET', PRODUCT_IMAGES, { fixture: 'mock-product.png' }).as('mockedImage')
            cy.login('standard_user', 'secret_sauce')

            cy.wait('@mockedImage')
            cy.get('.inventory_item_img img').each(($img) => {
                cy.wrap($img).should(($el) => {
                    expect($el[0].naturalWidth, 'mocked image width').to.eq(MOCK_WIDTH)
                })
            })
        })

        it('should keep the catalog usable when images fail to load', () => {
            cy.intercept('GET', PRODUCT_IMAGES, { forceNetworkError: true }).as('brokenImage')
            cy.login('standard_user', 'secret_sauce')

            cy.wait('@brokenImage')
            cy.get('.inventory_item').should('have.length', 6)
            cy.get('.inventory_item_name').first().should('be.visible')
            cy.get('.inventory_item_price').first().should('contain', '$')

            cy.addToCart('sauce-labs-backpack')
            cy.get('.shopping_cart_badge').should('have.text', '1')
        })

        it('should show product info before slow images arrive', () => {
            cy.intercept('GET', PRODUCT_IMAGES, (req) => {
                req.on('response', (res) => res.setDelay(3000))
            }).as('slowImage')
            cy.login('standard_user', 'secret_sauce')

            cy.get('.inventory_item_name', { timeout: 2000 }).should('have.length', 6)
            cy.wait('@slowImage')
        })
    })

    context('Third-party telemetry', () => {
        it('should send telemetry events to Backtrace', () => {
            cy.intercept('POST', TELEMETRY, { statusCode: 200, body: {} }).as('telemetry')
            cy.login('standard_user', 'secret_sauce')

            cy.wait('@telemetry').its('request.method').should('eq', 'POST')
        })

        it('should keep working when telemetry is down', () => {
            cy.intercept('POST', TELEMETRY, { statusCode: 503, body: 'Service Unavailable' }).as('telemetryDown')
            cy.login('standard_user', 'secret_sauce')

            cy.wait('@telemetryDown')
            cy.addToCart('sauce-labs-backpack')
            cy.get('.shopping_cart_link').click()
            cy.get('.cart_item').should('have.length', 1)
            cy.get('[data-test="checkout"]').click()
            cy.url().should('include', '/checkout-step-one.html')
        })
    })
})
