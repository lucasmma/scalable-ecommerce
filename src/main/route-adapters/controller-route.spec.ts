import request from 'supertest'
import express from 'express'
import { z } from 'zod'
import { adaptRoute } from './controller-route-adapter'
import { SchemaMap } from '../../domain/models/schema-map'
import { bodyParser } from '../middlewares'
import { HttpRequest } from '../../presentation/protocols'

// Mocking the controller
const mockController = {
  handle: jest.fn(async (httpRequest: HttpRequest) => {
    return { statusCode: 200, body: {} }
  })
}

// Mocking SchemaAdapter
jest.mock('../../infra/schema/schema-adapter', () => ({
  SchemaAdapter: jest.fn().mockImplementation((schema: z.AnyZodObject) => ({
    validate: jest.fn().mockImplementation((data: any) => {
      var result = schema.safeParse(data)
      if (!result.success) {
        return 'Validation failed'
      }
      return result
    })
  }))
}))

const validSchema: SchemaMap = {
  param: z.object({
    id: z.string()
  }),
  body: z.object({
    name: z.string().min(3)
  }).strict(),
  query: z.object({
    page: z.string()
  }).strict()
}

describe('AdaptRoute Middleware', () => {
  let app: express.Application

  beforeEach(() => {
    jest.clearAllMocks()
    app = express()
    
    app.use(bodyParser)
  })

  const createRequest = (data: any, id?: string) => {
    var url = '/test-route/'
    if (id) {
      url += id
    }
    return request(app)
      .post(url)
      .set('Content-Type', 'application/json')
      .send(data)
  }

  const setupRoute = (schemaMap?: SchemaMap) => {
    app.post('/test-route', adaptRoute(mockController, mockController.handle, schemaMap))
    app.post('/test-route/:id', adaptRoute(mockController, mockController.handle, schemaMap))
  }

  describe('Schema Validation', () => {
    test('Should return 400 if validation fails for body', async () => {
      setupRoute({
        body: validSchema.body
      })

      const response = await createRequest({ name: 'Jo' }) // Invalid name (too short)

      expect(response.status).toBe(400)
      expect(response.body.error).toBe('Invalid body params')
      expect(mockController.handle).not.toHaveBeenCalled()
    })

    test('Should return 400 if validation fails for query', async () => {
      setupRoute({
        query: validSchema.query
      })

      const response = await createRequest({ name: 'John' })

      expect(response.status).toBe(400)
      expect(response.body.error).toBe('Invalid query params')
      expect(mockController.handle).not.toHaveBeenCalled()
    })

    test('Should return 400 if validation fails for param', async () => {
      setupRoute({
        param: validSchema.param
      })

      const response = await createRequest({ name: 'John' }).query({ page: 1 }) // Invalid param

      expect(response.status).toBe(400)
      expect(response.body.error).toBe('Invalid param')
      expect(mockController.handle).not.toHaveBeenCalled()
    })

    test('Should proceed with valid data', async () => {
      setupRoute(validSchema)

      const response = await createRequest({ name: 'John' }, '1231312').query({ page: '1' })

      expect(response.status).toBe(200)
      expect(mockController.handle).toHaveBeenCalledTimes(1)
    })
  })

  describe('Controller Handling', () => {
    test('Should return 400 if an known exception occurs in controller', async () => {
      var errorMessage = 'Something went wrong'
      mockController.handle.mockImplementationOnce(() => {
        throw new Error('Something went wrong')
      })

      setupRoute()

      const response = await createRequest({ name: 'John' })

      expect(response.status).toBe(400)
      expect(response.body.error).toBe(errorMessage)
    })

    test('Should return 500 if an unkown exception occurs in controller', async () => {
      mockController.handle.mockImplementationOnce(() => {
        throw new Error()
      })

      setupRoute()

      const response = await createRequest({ name: 'John' })

      expect(response.status).toBe(500)
      expect(response.body.error).toBe('Internal server error')
    })

    test('Should return 200 if controller handles request successfully', async () => {
      mockController.handle.mockResolvedValue({ statusCode: 200, body: { message: 'Success' } })

      setupRoute()

      const response = await createRequest({ name: 'John' })

      expect(response.status).toBe(200)
      expect(response.body.message).toBe('Success')
    })
  })
})
