/* eslint-disable no-param-reassign */
// https://docs.cypress.io/api/introduction/api.html

const homeUrl = '#/';
const homePageTitle = 'Epsilon';

describe('Home page', () => {
    it('landing page exists', () => {
        cy.visit(homeUrl);
        cy.contains('h1', homePageTitle);
    });
});
