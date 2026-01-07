# QA Automation Portfolio

![Cypress](https://img.shields.io/badge/Cypress-17202C?style=for-the-badge&logo=cypress&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)

QA automation portfolio featuring Cypress E2E tests, API testing, and Bruno collections. Includes CI/CD with GitHub Actions and Mochawesome reports.

## Work in Progress

This project is under active development. Check back soon for:

- [ ] E2E tests for [Sauce Demo](https://www.saucedemo.com/)
- [ ] API tests with Cypress
- [ ] Custom commands and utilities
- [ ] Mobile/responsive viewport testing
- [ ] Request interception and mocking
- [ ] Mochawesome HTML reports
- [ ] CI/CD pipeline with GitHub Actions
- [ ] Bruno API collections

## 🛠️ Tech Stack

| Tool | Purpose |
|------|---------|
| [Cypress](https://www.cypress.io/) | E2E and API testing |
| [Mochawesome](https://github.com/adamgruber/mochawesome) | Test reports |
| [Bruno](https://www.usebruno.com/) | API collections |
| [GitHub Actions](https://github.com/features/actions) | CI/CD |

## 📁 Project Structure

```
qa-automation-portfolio/
├── .github/workflows/     # CI/CD configuration
├── bruno-collections/     # Bruno API collections
├── cypress/
│   ├── e2e/
│   │   ├── sauce-demo/    # E2E tests
│   │   └── api/           # API tests
│   ├── fixtures/          # Test data
│   └── support/           # Custom commands
├── cypress.config.js      # Cypress configuration
└── package.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/TheSergioHenrique/qa-automation-portfolio.git

# Navigate to project folder
cd qa-automation-portfolio

# Install dependencies
npm install
```

### Running Tests

```bash
# Open Cypress Test Runner (interactive mode)
npx cypress open

# Run tests in headless mode
npx cypress run
```
