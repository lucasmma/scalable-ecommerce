import request from 'supertest'
import express from 'express'
import { JwtProtocol } from '../../data/protocols/jwt'
import { $Enums } from '@prisma/client'
import { adaptAuthRoute } from './auth-route-adapter'

class MockJwt implements JwtProtocol {
  decode(token: string): Omit<{ name: string; id: string; email: string; password: string; documentNumber: string; role: $Enums.Role; createdAt: Date; updatedAt: Date }, 'password'> {
    return {
      name: 'John Doe',
      id: '1',
      email: '',
      documentNumber: '',
      role: 'USER',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  }
  validate(token: string): any {
    if (token === 'valid-token-admin') {
      return { role: 'ADMIN', userId: '1' } // Return a valid payload for admin role
    } else if (token === 'valid-token-user') {
      return { role: 'USER', userId: '2' } // Return a valid payload for user role
    } else {
      return null // For any other token, throw error
    }
  }

  encode(payload: any, expiresIn: string): string {
    return 'valid-token' // Return a valid token
  }

}
const jwt = new MockJwt() // Mock the JwtProtocol
const app = express()

app.get('/test_admin', adaptAuthRoute(jwt, 'ADMIN'), (req, res) => {
  res.status(200).send('Admin Route Accessed')
})
app.get('/test_user', adaptAuthRoute(jwt, 'USER'), (req, res) => {
  res.status(200).send('User Route Accessed')
})


describe('AdaptAuthRoute Middleware', () => {

  const validTokenAdmin = 'Bearer valid-token-admin'
  const validTokenUser = 'Bearer valid-token-user'

  test('Should allow access to the admin route with a valid admin token', async () => {
    await request(app)
      .get('/test_admin')
      .set('Authorization', validTokenAdmin)
      .expect(200)
      .expect('Admin Route Accessed')
  })

  test('Should reject access to the admin route with a valid user token', async () => {
    await request(app)
      .get('/test_admin')
      .set('Authorization', validTokenUser)
      .expect(403)
      .expect({ error: 'Forbidden' })
  })

  test('Should allow access to the user route with a valid user token', async () => {
    await request(app)
      .get('/test_user')
      .set('Authorization', validTokenUser)
      .expect(200)
      .expect('User Route Accessed')
  })

  test('Should reject access to the user route with a valid admin token', async () => {
    await request(app)
      .get('/test_user')
      .set('Authorization', validTokenAdmin)
      .expect(403)
      .expect({ error: 'Forbidden' })
  })

  test('Should return 401 if no token is provided', async () => {
    await request(app)
      .get('/test_user')
      .expect(401)
      .expect({ error: 'Unauthorized' })
  })

  test('Should return 401 if an invalid token is provided', async () => {
    await request(app)
      .get('/test_user')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401)
      .expect({ error: 'Unauthorized' })
  })
})
