import request from 'supertest';
import express from 'express';
import { bodyParser } from './body-parser';

const app = express();

// Use the custom body parser middleware
app.use(bodyParser);
app.post('/test_body_parser', (req, res) => {
  res.send(req.body); // Echo the parsed body
});

describe('Body Parser Middleware', () => {
  test('Should parse body as json', async () => {
    await request(app)
      .post('/test_body_parser')
      .send({ name: 'Lucas' }) // Send a valid JSON payload
      .expect('Content-Type', /json/) // Expect the response content-type to be JSON
      .expect(200) // Expect status code 200 (OK)
      .expect({ name: 'Lucas' }); // Expect the response body to match the sent payload
  });

  test('Should return 400 for invalid JSON payload', async () => {
    await request(app)
      .post('/test_body_parser')
      .set('content-type', 'application/json') // Set the content-type header to JSON
      .send('Invalid JSON') // Send an invalid payload (not proper JSON)
      .expect('Content-Type', /json/) // Expect the response content-type to be JSON
      .expect(400) // Expect status code 400 for bad request
      .expect({
        error: 'Invalid JSON payload' // Expect the custom error message
      });
  });
});
