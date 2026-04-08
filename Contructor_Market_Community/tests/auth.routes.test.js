const request = require('supertest');
const app = require('../src/app');

describe('Auth Routes - Integration', () => {
  it('should register a new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        nombre: 'Integration Test User',
        correo: 'integration@test.com',
        contraseña: 'password123'
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('mensaje', 'Usuario creado exitosamente');
    expect(response.body.usuario).toHaveProperty('correo', 'integration@test.com');
    expect(response.body.usuario).not.toHaveProperty('contraseña');
  });

  it('should not register with existing email', async () => {
    // First register
    await request(app)
      .post('/api/auth/register')
      .send({
        nombre: 'Test User',
        correo: 'duplicate@test.com',
        contraseña: 'password123'
      });

    // Try again
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        nombre: 'Test User 2',
        correo: 'duplicate@test.com',
        contraseña: 'password123'
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'El correo ya está registrado');
  });

  it('should login successfully', async () => {
    // Register first
    await request(app)
      .post('/api/auth/register')
      .send({
        nombre: 'Login Test',
        correo: 'login@test.com',
        contraseña: 'password123'
      });

    // Login
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        correo: 'login@test.com',
        contraseña: 'password123'
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('mensaje', 'Inicio de sesión exitoso');
    expect(response.body).toHaveProperty('token');
    expect(response.body.usuario).toHaveProperty('correo', 'login@test.com');
  });
});