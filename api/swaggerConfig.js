// swaggerConfig.js
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'HomeGraph API',
      version: '1.0.0',
      description: 'API documentation for the HomeGraph API application',
    },
  },
  apis: ['./routers/**/*.js'], // Point to the location of your route files
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;