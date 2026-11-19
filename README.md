# QA Automation Portfolio

[![QA Pipeline](https://github.com/TheSergioHenrique/qa-automation-portfolio/actions/workflows/cypress.yml/badge.svg)](https://github.com/TheSergioHenrique/qa-automation-portfolio/actions/workflows/cypress.yml)
![Cypress](https://img.shields.io/badge/Cypress-17202C?style=for-the-badge&logo=cypress&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-2EAD33?style=for-the-badge&logo=playwright&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Bruno](https://img.shields.io/badge/Bruno-F4AA41?style=for-the-badge&logo=bruno&logoColor=black)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)

Test automation portfolio covering two apps:

- **E2E** for [Sauce Demo](https://www.saucedemo.com/) with **Cypress** and with **Playwright** (Page Objects and fixtures)
- **API** for [ServeRest](https://github.com/ServeRest/ServeRest) with **Bruno**, **Cypress** (`cy.request`) and **Playwright** (`request` fixture), each one covering a different area of the API

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

### 🔌 API tests

The three API suites run against a local ServeRest and are split by area, so they don't repeat each other:

| Suite | Focus |
|-------|-------|
| **Bruno** | Happy-path flow: users, login and products CRUD, chained in order |
| **Cypress** | Cart business rules: stock, cancel/conclude purchase, limits, referential integrity |
| **Playwright** | Field validation, boundaries and permissions, data-driven |

#### Bruno

The collection in [`bruno-collections/serverest`](bruno-collections/serverest) runs **14 requests / 31 tests** in order, passing data between requests (user id, email, token, product id):

| Folder | Requests |
|--------|----------|
| `01-usuarios` | Create admin user (unique email per run), duplicate email (400), empty body with required-field errors (400), get by id with schema check |
| `02-login` | Valid login storing the Bearer token, wrong password (401, no token returned) |
| `03-produtos` | Full CRUD: create, create without token (401), get, update, check the update persisted, delete, get deleted (400) |
| `04-cleanup` | Deletes the user created at the start, so the run leaves no data behind |

Environments: `local` (`http://localhost:3000`, used in CI) and `serverest-dev` (public `https://serverest.dev`).

#### Cypress (`cypress/api/carrinhos.cy.js`)

10 tests + 1 known bug. Each test creates its own admin user and product through custom commands (`cy.apiCreateAdmin()`, `cy.apiCreateProduct()`, `cy.apiCreateCart()`) and `cy.apiCleanup()` removes them afterwards.

| Context | Tests |
|---------|-------|
| Creating a cart | Stock is reserved and totals are calculated, only 1 cart per user, quantity above stock, unknown product, same product twice, token required |
| Finishing a cart | Cancel restores the stock, conclude keeps it reduced and removes the cart |
| Referential integrity | A product in a cart can't be deleted, a user with a cart can't be deleted |

The API specs live outside `cypress/e2e`, so `npm test` keeps running only the Sauce Demo suite. They run with `npm run cy:api`.

#### Playwright (`playwright/api/`)

24 tests in their own `api` project (no browser), running in parallel with the E2E projects and split across the same shards. `webServer` in `playwright.config.js` starts ServeRest automatically. Fixtures (`adminUser`, `regularUser`) create a fresh user with a token for each test and delete it at the end, so parallel tests never share data.

| Spec | Tests |
|------|-------|
| `usuarios.spec.js` | Invalid email, blank name, invalid `administrador`, unknown field, empty body, duplicate email, id format, filter by email, login validation (empty body, invalid email, unknown user) |
| `produtos.spec.js` | Negative/zero/decimal price, negative quantity, zero quantity as lower boundary, duplicate name, permissions (no token, invalid token, non-admin 403, admin 201) |

### 🐛 Known bugs found

| Bug | Where | Status |
|-----|-------|--------|
| **Sauce Demo:** checkout is allowed with an empty cart: the user goes to `/checkout-step-one.html` instead of staying on `/cart.html` | `cart.cy.js`, `cart.spec.js` | **Cypress:** kept as `it.skip`, remove `.skip` to reproduce. **Playwright:** marked with `test.fail()`, so the test passes while the bug exists and turns red once it gets fixed |
| **ServeRest:** concluding a purchase without a cart returns `200 OK` ("Não foi encontrado carrinho para esse usuário") instead of a 4xx | `carrinhos.cy.js` | `it.skip` |
| **ServeRest:** `GET /usuarios` returns every user's password in plain text | `usuarios.spec.js` | `test.fail()` |
| **ServeRest:** a price sent as text (`"preco": "10"`) is silently converted and accepted with `201` | `produtos.spec.js` | `test.fail()` |

## 🔁 CI/CD

The workflow [`.github/workflows/cypress.yml`](.github/workflows/cypress.yml) runs on every push and pull request to `main`, and can also be triggered manually. Jobs run in parallel:

| Job | Steps |
|-----|-------|
| **E2E tests (Cypress)** | Runs the Cypress suite headless in Chrome, uploads the **Mochawesome report** on every run and **screenshots** when a test fails |
| **E2E tests (Playwright) - shard 1/3, 2/3, 3/3** | Matrix of 3 jobs inside the official Playwright Docker image (`mcr.microsoft.com/playwright`, Chromium and system deps preinstalled): each runs its shard on desktop and mobile with 4 workers (1 retry on CI, trace on retry), then uploads a blob report |
| **Merge Playwright reports** | Waits for the 3 shards, merges their blob reports and uploads a single **Playwright HTML report** |
| **API tests (Bruno)** | Starts a local ServeRest instance, runs the Bruno collection and uploads the **Bruno HTML report** on every run |
| **API tests (Cypress)** | `cypress-io/github-action` starts ServeRest, waits for it and runs the Cypress API specs, uploading a separate **Mochawesome API report** |

To see the reports, open a run in the [Actions tab](https://github.com/TheSergioHenrique/qa-automation-portfolio/actions), download `mochawesome-report`, `mochawesome-report-api`, `playwright-report` or `bruno-report` and open `index.html`. The Playwright API tests are part of `playwright-report`.

### 🗄️ Caching

The pipeline uses three cache layers:

| Layer | What is cached | Where |
|-------|----------------|-------|
| npm download cache | `~/.npm` (downloaded packages) | `actions/setup-node` with `cache: npm`, all jobs |
| `node_modules` | The installed dependency tree. On a cache hit, `npm ci` is skipped | Reusable composite action [`.github/actions/install-deps`](.github/actions/install-deps/action.yml), used by Playwright, merge and API jobs |
| Cypress binary | `~/.cache/Cypress` | Built into `cypress-io/github-action` |

The `node_modules` cache key is `OS + arch + Node version + environment + hash of package-lock.json`. Any dependency change creates a new key, and the `environment` part (`host` or `playwright-container`) keeps a tree built inside the Playwright Docker image from being restored on the plain runner.

Measured on GitHub Actions, same commit, first run (cache miss) vs. re-run (cache hit):

| Job | Install (miss → hit) | Whole job (miss → hit) |
|-----|:--------------------:|:----------------------:|
| API tests (Bruno) | 24s → 4s | 41s → 14s |
| Playwright shard 1/3 | 18s → 5s | 65s → 52s |
| Playwright shard 2/3 | 15s → 6s | 61s → 53s |
| Playwright shard 3/3 | 21s → 8s | 60s → 46s |

Restoring the 79 MB `node_modules` takes 4–8s instead of 15–24s for `npm ci`. On the Playwright shards, most of the remaining time is starting the Docker container (~20s). The merge job already gets a hit on the first run, because it starts after the API job has saved the `host` cache.

## 🛠️ Tech Stack

| Tool | Purpose |
|------|---------|
| [Cypress](https://www.cypress.io/) | E2E and API testing |
| [Playwright](https://playwright.dev/) | E2E and API testing with Page Objects, fixtures and multiple projects |
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
- [x] API tests with Cypress and Playwright
- [x] Bruno API collections (ServeRest)
- [x] Playwright version of the suite

## 📁 Project Structure

```
qa-automation-portfolio/
├── .github/
│   ├── workflows/
│   │   └── cypress.yml    # CI pipeline (Cypress, Playwright and API jobs)
│   └── actions/
│       └── install-deps/  # Composite action: Node + node_modules cache + npm ci
├── bruno-collections/
│   └── serverest/         # Bruno collection + environments
├── cypress/
│   ├── api/               # API specs (ServeRest)
│   ├── e2e/sauce-demo/    # E2E specs
│   ├── fixtures/          # Test data
│   └── support/           # Custom commands (UI + API) + reporter registration
├── playwright/
│   ├── api/               # API specs + user fixtures (ServeRest)
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
| `npm run pw:test` | Runs the Playwright suite (desktop + mobile + API, starting ServeRest by itself) and generates `playwright-report/` |
| `npm run pw:ui` | Opens Playwright UI mode |
| `npm run pw:report` | Opens the last Playwright HTML report |
| `npm run api:server` | Starts ServeRest on `http://localhost:3000` |
| `npm run api:test` | Runs the Bruno collection (needs `api:server` running) and generates `bruno-report/index.html` |
| `npm run cy:api` | Runs the Cypress API specs (needs `api:server` running) and generates `mochawesome-report-api/index.html` |

You can also open `bruno-collections/serverest` in the Bruno app to run the requests one by one.
