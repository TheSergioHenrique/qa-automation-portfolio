# QA Automation Portfolio

[![QA Pipeline](https://github.com/TheSergioHenrique/qa-automation-portfolio/actions/workflows/cypress.yml/badge.svg)](https://github.com/TheSergioHenrique/qa-automation-portfolio/actions/workflows/cypress.yml)
![Cypress](https://img.shields.io/badge/Cypress-17202C?style=for-the-badge&logo=cypress&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-2EAD33?style=for-the-badge&logo=playwright&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Bruno](https://img.shields.io/badge/Bruno-F4AA41?style=for-the-badge&logo=bruno&logoColor=black)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)

Test automation portfolio with three suites:

- **E2E** for [Sauce Demo](https://www.saucedemo.com/) with **Cypress**
- **E2E** for the same app with **Playwright**, using Page Objects and fixtures
- **API** for [ServeRest](https://github.com/ServeRest/ServeRest) with a **Bruno** collection

All of them run on every push through a GitHub Actions pipeline that publishes HTML reports.

## ✅ What's covered

### 🌲 E2E with Cypress

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

### 🎭 E2E with Playwright

The suite in [`playwright/`](playwright) covers Sauce Demo with a different structure from the Cypress one, to show the idiomatic Playwright approach:

- **Page Object Model** (`playwright/pages/`) injected into tests through **custom fixtures** (`playwright/fixtures.js`)
- **Login once**: a `setup` project logs in and saves the session with `storageState`; the other tests start already authenticated
- **Two projects**: Desktop Chrome and mobile (Pixel 7), every test runs on both
- **Data-driven tests**: login errors and required checkout fields are generated from tables
- **Same test data** as the Cypress suite (`cypress/fixtures/users.json`)

| Spec | Tests | Scope |
|------|:-----:|-------|
| `login.spec.js` | 7 | Valid login, locked-out user, invalid and empty credentials, direct access to `/inventory.html` without a session |
| `inventory.spec.js` | 6 | 6 products with name, price format and image, sorting A–Z / Z–A / price low–high / high–low, add/remove button and cart badge |
| `cart.spec.js` | 4 | Products in the cart, remove from cart page, continue shopping, known bug (`test.fail()`) |
| `checkout.spec.js` | 5 | Full purchase, item total calculation, first name / last name / postal code required |

#### ⚡ Parallelism

Playwright runs every test in parallel (`fullyParallel: true`), each worker with its own browser. `workers` is set to all cores on CI and half of them locally. Local wall-clock times (16-thread machine, full suite, cold start included):

| Run | Workers | Time |
|-----|:-------:|-----:|
| Cypress (runs specs one after another) | 1 | 73.7s |
| Playwright | 1 | 46.4s |
| Playwright | 2 | 25.3s |
| Playwright | 4 | 15.1s |
| Playwright | 8 (default here) | 10.8s |
| Playwright | 16 | 12.1s |

Going from 8 to 16 workers got slower: past that point, the browsers compete for CPU and memory. The suites don't cover exactly the same tests, so read the Cypress line as a reference, not a strict benchmark. Cypress can only run in parallel through Cypress Cloud or by splitting specs across CI machines.

#### 🧩 Sharding

On CI the suite is also split across **3 machines** (`--shard=1/3`, `2/3`, `3/3`), each one running its share with 4 workers. Every shard runs its own login `setup`, so they don't depend on each other. Each shard uploads a blob report, and a final job merges them into a single HTML report:

```
             ┌─ shard 1/3 ─┐
push ──────► ├─ shard 2/3 ─┼──► merge-reports ──► playwright-report
             └─ shard 3/3 ─┘
```

Locally, one shard with 4 workers takes about 7–8s (≈15 tests each). You can try it with `npx playwright test --shard=1/3`.

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
| Checkout is allowed with an empty cart: the user goes to `/checkout-step-one.html` instead of staying on `/cart.html` | `cart.cy.js`, `cart.spec.js` | **Cypress:** kept as `it.skip`, remove `.skip` to reproduce. **Playwright:** marked with `test.fail()`, so the test passes while the bug exists and turns red once it gets fixed |

## 🔁 CI/CD

The workflow [`.github/workflows/cypress.yml`](.github/workflows/cypress.yml) runs on every push and pull request to `main`, and can also be triggered manually. Jobs run in parallel:

| Job | Steps |
|-----|-------|
| **E2E tests (Cypress)** | Runs the Cypress suite headless in Chrome, uploads the **Mochawesome report** on every run and **screenshots** when a test fails |
| **E2E tests (Playwright) - shard 1/3, 2/3, 3/3** | Matrix of 3 jobs inside the official Playwright Docker image (`mcr.microsoft.com/playwright`, Chromium and system deps preinstalled): each runs its shard on desktop and mobile with 4 workers (1 retry on CI, trace on retry), then uploads a blob report |
| **Merge Playwright reports** | Waits for the 3 shards, merges their blob reports and uploads a single **Playwright HTML report** |
| **API tests (Bruno + ServeRest)** | Starts a local ServeRest instance, runs the Bruno collection and uploads the **Bruno HTML report** on every run |

To see the reports, open a run in the [Actions tab](https://github.com/TheSergioHenrique/qa-automation-portfolio/actions), download `mochawesome-report`, `playwright-report` or `bruno-report` and open `index.html`.

## 🛠️ Tech Stack

| Tool | Purpose |
|------|---------|
| [Cypress](https://www.cypress.io/) | E2E testing |
| [Playwright](https://playwright.dev/) | E2E testing with Page Objects, fixtures and multiple projects |
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
- [x] Playwright version of the suite

## 📁 Project Structure

```
qa-automation-portfolio/
├── .github/workflows/
│   └── cypress.yml        # CI pipeline (Cypress, Playwright and API jobs)
├── bruno-collections/
│   └── serverest/         # Bruno collection + environments
├── cypress/
│   ├── e2e/sauce-demo/    # E2E specs
│   ├── fixtures/          # Test data
│   └── support/           # Custom commands + reporter registration
├── playwright/
│   ├── pages/             # Page Objects
│   ├── tests/             # Specs + auth setup
│   ├── fixtures.js        # Custom fixtures
│   └── constants.js       # Session file + shared test data
├── cypress.config.js      # Cypress + reporter configuration
├── playwright.config.js   # Playwright projects and reporters
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
| `npm test` | Runs the Cypress suite headless and generates `mochawesome-report/index.html` |
| `npm run cy:run:chrome` | Same, in Chrome |
| `npm run cy:open` | Opens the Cypress interactive runner |
| `npx playwright install chromium` | Downloads the browser used by Playwright (first time only) |
| `npm run pw:test` | Runs the Playwright suite (desktop + mobile) and generates `playwright-report/` |
| `npm run pw:ui` | Opens Playwright UI mode |
| `npm run pw:report` | Opens the last Playwright HTML report |
| `npm run api:server` | Starts ServeRest on `http://localhost:3000` |
| `npm run api:test` | Runs the Bruno collection (needs `api:server` running) and generates `bruno-report/index.html` |

You can also open `bruno-collections/serverest` in the Bruno app to run the requests one by one.
