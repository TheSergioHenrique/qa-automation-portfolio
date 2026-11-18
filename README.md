# QA Automation Portfolio

[![QA Pipeline](https://github.com/TheSergioHenrique/qa-automation-portfolio/actions/workflows/cypress.yml/badge.svg)](https://github.com/TheSergioHenrique/qa-automation-portfolio/actions/workflows/cypress.yml)
![Cypress](https://img.shields.io/badge/Cypress-17202C?style=for-the-badge&logo=cypress&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Bruno](https://img.shields.io/badge/Bruno-F4AA41?style=for-the-badge&logo=bruno&logoColor=black)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)

Test automation portfolio with two suites:

- **E2E** for [Sauce Demo](https://www.saucedemo.com/) with Cypress
- **API** for [ServeRest](https://github.com/ServeRest/ServeRest) with a Bruno collection

Both run on every push through a GitHub Actions pipeline that publishes HTML reports.

## ✅ What's covered

| Spec | Tests | Scope |
|------|:-----:|-------|
| `login.cy.js` | 6 | Valid login, locked-out user, invalid credentials, empty username/password/both |
| `navigation.cy.js` | 11 | Product listing (name, price, description, image), price format and validation, sorting A–Z / Z–A / price, add/remove button state, cart badge |
| `cart.cy.js` | 7 + 1 skipped | Add/remove products, cart badge, cart page, continue shopping |
| `responsive.cy.js` | 4 × 4 devices | Products page, hamburger menu and full purchase flow on iPhone X, Galaxy S10, iPhone 4 and MacBook 15 |
| `intercept.cy.js` | 6 | Network mocking with `cy.intercept()`: product images served from a fixture, failing (network error) and slow (3s delay) images, third-party telemetry (Backtrace) stubbed and returning 503. Checks the UI stays usable in every case |

**Custom commands** (`cypress/support/commands.js`): `cy.login()`, `cy.addToCart()`, `cy.RemoveFromCart()`.
**Test data** lives in fixtures (`cypress/fixtures/users.json`, `mock-product.png`).

> **Note on mocking:** Sauce Demo has no product API (the catalog is bundled in the front-end), so the intercept specs target the requests of product images and telemetry. The browser cache is disabled through the Chrome DevTools Protocol in that spec so every image request hits `cy.intercept()`.

### 🔌 API tests (Bruno)

The collection in [`bruno-collections/serverest`](bruno-collections/serverest) runs **14 requests / 31 tests** in order, passing data between requests (user id, email, token, product id):

| Folder | Requests |
|--------|----------|
| `01-usuarios` | Create admin user (unique email per run), duplicate email (400), empty body with required-field errors (400), get by id with schema check |
| `02-login` | Valid login storing the Bearer token, wrong password (401, no token returned) |
| `03-produtos` | Full CRUD: create, create without token (401), get, update, check the update persisted, delete, get deleted (400) |
| `04-cleanup` | Deletes the user created at the start, so the run leaves no data behind |

Environments: `local` (`http://localhost:3000`, used in CI) and `serverest-dev` (public `https://serverest.dev`).

### 🐛 Known bugs found

| Bug | Where | Status |
|-----|-------|--------|
| Checkout is allowed with an empty cart: the user goes to `/checkout-step-one.html` instead of staying on `/cart.html` | `cart.cy.js` | Test kept as `it.skip` so the pipeline stays green. Remove `.skip` to reproduce |

## 🔁 CI/CD

The workflow [`.github/workflows/cypress.yml`](.github/workflows/cypress.yml) runs on every push and pull request to `main`, and can also be triggered manually. It has two jobs running in parallel:

| Job | Steps |
|-----|-------|
| **E2E tests (Chrome)** | Runs the Cypress suite headless in Chrome, uploads the **Mochawesome report** on every run and **screenshots** when a test fails |
| **API tests (Bruno + ServeRest)** | Starts a local ServeRest instance, runs the Bruno collection and uploads the **Bruno HTML report** on every run |

To see the reports, open a run in the [Actions tab](https://github.com/TheSergioHenrique/qa-automation-portfolio/actions), download `mochawesome-report` or `bruno-report` and open `index.html`.

## 🛠️ Tech Stack

| Tool | Purpose |
|------|---------|
| [Cypress](https://www.cypress.io/) | E2E testing |
| [cypress-mochawesome-reporter](https://github.com/LironEr/cypress-mochawesome-reporter) | HTML reports with embedded screenshots |
| [Bruno](https://www.usebruno.com/) + [Bruno CLI](https://docs.usebruno.com/bru-cli/overview) | API collections and tests |
| [ServeRest](https://github.com/ServeRest/ServeRest) | REST API under test, run locally |
| [GitHub Actions](https://github.com/features/actions) | CI/CD |

## 🗺️ Roadmap

- [x] E2E tests for Sauce Demo (login, navigation, cart)
- [x] Custom commands and fixtures
- [x] Responsive viewport testing
- [x] CI/CD pipeline with GitHub Actions
- [x] Mochawesome HTML reports
- [x] Request interception and mocking
- [ ] API tests with Cypress
- [x] Bruno API collections (ServeRest)
- [ ] Playwright version of the suite

## 📁 Project Structure

```
qa-automation-portfolio/
├── .github/workflows/
│   └── cypress.yml        # CI pipeline (E2E + API jobs)
├── bruno-collections/
│   └── serverest/         # Bruno collection + environments
├── cypress/
│   ├── e2e/sauce-demo/    # E2E specs
│   ├── fixtures/          # Test data
│   └── support/           # Custom commands + reporter registration
├── cypress.config.js      # Cypress + reporter configuration
└── package.json
```

## 🚀 Getting Started

**Prerequisites:** Node.js 22+ (required by ServeRest)

```bash
git clone https://github.com/TheSergioHenrique/qa-automation-portfolio.git
cd qa-automation-portfolio
npm ci
```

| Command | What it does |
|---------|--------------|
| `npm test` | Runs the suite headless and generates `mochawesome-report/index.html` |
| `npm run cy:run:chrome` | Same, in Chrome |
| `npm run cy:open` | Opens the Cypress interactive runner |
| `npm run api:server` | Starts ServeRest on `http://localhost:3000` |
| `npm run api:test` | Runs the Bruno collection (needs `api:server` running) and generates `bruno-report/index.html` |

You can also open `bruno-collections/serverest` in the Bruno app to run the requests one by one.
