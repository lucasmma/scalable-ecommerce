
import swaggerJsdoc from 'swagger-jsdoc';

const swaggerOptions: swaggerJsdoc.Options = {
  swaggerDefinition: {
    openapi: '3.0.0',
    servers: [
      {
        url: '/api/v1',
      },
    ],
    schemes: ['http', 'https'],
    info: {
      title: 'R2 E-commerce API',
      version: '1.0.0',
      description: 'Api documentation for R2 e-commerce platform',
    },
    consumes: ['application/json'],
    produces: ['application/json'],
  },
  apis: ['src/main/routes/*.ts', 'src/main/schemas/*.ts', 'src/main/schemas/*/*.ts'],
};



export const swaggerDocs = swaggerJsdoc(swaggerOptions);