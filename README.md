# QA Automation Portfolio

[![Cypress E2E](https://github.com/TheSergioHenrique/qa-automation-portfolio/actions/workflows/cypress.yml/badge.svg)](https://github.com/TheSergioHenrique/qa-automation-portfolio/actions/workflows/cypress.yml)
![Cypress](https://img.shields.io/badge/Cypress-17202C?style=for-the-badge&logo=cypress&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)

End-to-end test automation for [Sauce Demo](https://www.saucedemo.com/) with Cypress, running on every push through a GitHub Actions pipeline that publishes a Mochawesome HTML report.

## ✅ What's covered

| Spec | Tests | Scope |
|------|:-----:|-------|
| `login.cy.js` | 6 | Valid login, locked-out user, invalid credentials, empty username/password/both |
| `navigation.cy.js` | 11 | Product listing (name, price, description, image), price format and validation, sorting A–Z / Z–A / price, add/remove button state, cart badge |
| `cart.cy.js` | 7 + 1 skipped | Add/remove products, cart badge, cart page, continue shopping |
| `responsive.cy.js` | 4 × 4 devices | Products page, hamburger menu and full purchase flow on iPhone X, Galaxy S10, iPhone 4 and MacBook 15 |
| `intercept.cy.js` | 1 | Base for request interception (in progress) |

**Custom commands** (`cypress/support/commands.js`): `cy.login()`, `cy.addToCart()`, `cy.RemoveFromCart()`.
**Test data** lives in fixtures (`cypress/fixtures/users.json`).

### 🐛 Known bugs found

| Bug | Where | Status |
|-----|-------|--------|
| Checkout is allowed with an empty cart: the user goes to `/checkout-step-one.html` instead of staying on `/cart.html` | `cart.cy.js` | Test kept as `it.skip` so the pipeline stays green. Remove `.skip` to reproduce |

## 🔁 CI/CD

The workflow [`.github/workflows/cypress.yml`](.github/workflows/cypress.yml) runs on every push and pull request to `main`, and can also be triggered manually:

1. Installs dependencies (with npm cache)
2. Runs the whole suite headless in Chrome
3. Uploads the **Mochawesome HTML report** as an artifact on every run
4. Uploads **screenshots** when a test fails

To see the report, open a run in the [Actions tab](https://github.com/TheSergioHenrique/qa-automation-portfolio/actions), download `mochawesome-report` and open `index.html`.

## 🛠️ Tech Stack

| Tool | Purpose |
|------|---------|
| [Cypress](https://www.cypress.io/) | E2E testing |
| [cypress-mochawesome-reporter](https://github.com/LironEr/cypress-mochawesome-reporter) | HTML reports with embedded screenshots |
| [GitHub Actions](https://github.com/features/actions) | CI/CD |

## 🗺️ Roadmap

- [x] E2E tests for Sauce Demo (login, navigation, cart)
- [x] Custom commands and fixtures
- [x] Responsive viewport testing
- [x] CI/CD pipeline with GitHub Actions
- [x] Mochawesome HTML reports
- [ ] Request interception and mocking (base in place)
- [ ] API tests with Cypress
- [ ] Bruno API collections
- [ ] Playwright version of the suite

## 📁 Project Structure

```
qa-automation-portfolio/
├── .github/workflows/
│   └── cypress.yml        # CI pipeline
├── cypress/
│   ├── e2e/sauce-demo/    # E2E specs
│   ├── fixtures/          # Test data
│   └── support/           # Custom commands + reporter registration
├── cypress.config.js      # Cypress + reporter configuration
└── package.json
```

## 🚀 Getting Started

**Prerequisites:** Node.js 18+

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
