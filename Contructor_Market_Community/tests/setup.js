process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'testsecret';

const { sequelize } = require('../src/config/database');

beforeAll(async () => {
  await sequelize.sync({ force: true }); // Create tables
});

afterAll(async () => {
  await sequelize.close();
});