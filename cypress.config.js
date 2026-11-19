const { defineConfig } = require("cypress");

module.exports = defineConfig({
  reporter: "cypress-mochawesome-reporter",
  reporterOptions: {
    reportDir: "mochawesome-report",
    reportPageTitle: "QA Automation Portfolio - Cypress E2E",
    charts: true,
    embeddedScreenshots: true,
    inlineAssets: true,
  },
  env: {
    // ServeRest, used by the API specs in cypress/api (npm run api:server)
    apiUrl: "http://localhost:3000",
  },
  e2e: {
    setupNodeEvents(on, config) {
      require("cypress-mochawesome-reporter/plugin")(on);
    },
  },
});
