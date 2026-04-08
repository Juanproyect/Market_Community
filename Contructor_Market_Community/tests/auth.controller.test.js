const { registrar } = require('../src/controllers/auth.controller');
const { Usuario } = require('../src/models');

// Mock the Usuario model
jest.mock('../src/models', () => ({
  Usuario: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  genSalt: jest.fn(),
  hash: jest.fn(),
}));

// Mock jwt
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
}));

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

describe('Auth Controller - registrar', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        nombre: 'Test User',
        correo: 'test@example.com',
        contraseña: 'password123',
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it('should register a new user successfully', async () => {
    // Mock Usuario.findOne to return null (no existing user)
    Usuario.findOne.mockResolvedValue(null);

    // Mock bcrypt
    bcrypt.genSalt.mockResolvedValue('salt');
    bcrypt.hash.mockResolvedValue('hashedPassword');

    // Mock Usuario.create
    const mockUser = {
      id_usuario: 1,
      nombre: 'Test User',
      correo: 'test@example.com',
      contraseña: 'hashedPassword',
      rol: 'comprador',
      estado_cuenta: 'activo',
      toJSON: jest.fn().mockReturnValue({
        id_usuario: 1,
        nombre: 'Test User',
        correo: 'test@example.com',
        rol: 'comprador',
        estado_cuenta: 'activo',
      }),
    };
    Usuario.create.mockResolvedValue(mockUser);

    await registrar(req, res);

    expect(Usuario.findOne).toHaveBeenCalledWith({ where: { correo: 'test@example.com' } });
    expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
    expect(bcrypt.hash).toHaveBeenCalledWith('password123', 'salt');
    expect(Usuario.create).toHaveBeenCalledWith({
      nombre: 'Test User',
      correo: 'test@example.com',
      contraseña: 'hashedPassword',
      rol: 'comprador',
      estado_cuenta: 'activo',
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      mensaje: 'Usuario creado exitosamente',
      usuario: {
        id_usuario: 1,
        nombre: 'Test User',
        correo: 'test@example.com',
        rol: 'comprador',
        estado_cuenta: 'activo',
      },
    });
  });

  it('should return error if email already exists', async () => {
    Usuario.findOne.mockResolvedValue({ id: 1, correo: 'test@example.com' });

    await registrar(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'El correo ya está registrado' });
  });

  it('should return error if fields are missing', async () => {
    req.body = { nombre: 'Test' }; // Missing correo and contraseña

    await registrar(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Todos los campos son obligatorios' });
  });
});