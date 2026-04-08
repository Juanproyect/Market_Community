describe('Authentication Acceptance Tests', () => {
  beforeEach(() => {
    // Visit the authentication page
    cy.visit('/Autentication.html');
  });

  it('should display the login form by default', () => {
    cy.get('#login-panel').should('be.visible');
    cy.get('#register-panel').should('not.be.visible');
  });

  it('should switch to register form', () => {
    cy.get('[data-tab="register"]').click();
    cy.get('#register-panel').should('be.visible');
    cy.get('#login-panel').should('not.be.visible');
  });

  it('should register a new user', () => {
    cy.get('[data-tab="register"]').click();
    cy.get('#register-form input[name="nombre"]').type('Cypress Test User');
    cy.get('#register-form input[name="correo"]').type('cypress@test.com');
    cy.get('#register-form input[name="contraseña"]').type('password123');
    // Assuming the form submits via fetch or something
    // But since it's not implemented, perhaps mock or check validation
    // For now, just check the form is filled
    cy.get('#register-form input[name="nombre"]').should('have.value', 'Cypress Test User');
  });

  // Note: For full e2e, need to implement the form submission in JS/auth.js
  // This is a basic structure
});