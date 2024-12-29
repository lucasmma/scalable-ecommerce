import express from 'express'
import request from 'supertest'
import { contentType } from './content-type'

const app = express()
app.use(contentType)

describe('Content Type Middleware', () => {
  test('Should return default content type as json', async () => {
    app.get('/test_content_type', (req, res) => {
      res.send('')
    })
    await request(app)
      .get('/test_content_type')
      .expect('content-type', /json/)
  })
})
