import request from 'supertest'
import express from 'express'
import { RateLimiterProtocol } from '../../data/protocols/rate-limiter'
import { adaptRateLimiterRoute } from './rate-limiter-route-adapter'

// Mock the RateLimiterProtocol
class MockRateLimiter implements RateLimiterProtocol {
  async reset(key: string): Promise<void> {
  }

  private ipRateLimits: { [key: string]: number } = {}

  async isAllowed(ip: string): Promise<boolean> {
    if (!this.ipRateLimits[ip]) {
      this.ipRateLimits[ip] = 0
    }

    if (this.ipRateLimits[ip] >= 3) {
      return false // Deny if the IP has exceeded the limit
    }

    this.ipRateLimits[ip] += 1
    return true
  }
}

describe('AdaptRateLimiterRoute Middleware', () => {
  let app: express.Application
  let rateLimiter: MockRateLimiter

  beforeAll(() => {
    rateLimiter = new MockRateLimiter()

    app = express()

    // Apply the rate limiter middleware to the routes
    app.use('/test_rate_limiter', adaptRateLimiterRoute(rateLimiter))

    app.get('/test_rate_limiter', (req, res) => {
      res.status(200).send('Request Allowed')
    })
  })

  const ip1 = '192.168.0.1'
  const ip2 = '192.168.0.2'

  test('Should allow the first 3 requests from the same IP', async () => {
    await request(app)
      .get('/test_rate_limiter')
      .set('X-Forwarded-For', ip1) // Set IP header
      .expect(200)
      .expect('Request Allowed')

    await request(app)
      .get('/test_rate_limiter')
      .set('X-Forwarded-For', ip1)
      .expect(200)
      .expect('Request Allowed')

    await request(app)
      .get('/test_rate_limiter')
      .set('X-Forwarded-For', ip1)
      .expect(200)
      .expect('Request Allowed')
  })

  test('Should return 429 when the rate limit is exceeded for the same IP', async () => {
    // Send the fourth request from the same IP
    await request(app)
      .get('/test_rate_limiter')
      .set('X-Forwarded-For', ip1)
      .expect(429)
      .expect({ error: 'Too many requests' })
  })

  test('Should allow the same IP to make requests after the limit is reset', async () => {
    // Simulate rate limit reset by clearing the rateLimiter state
    rateLimiter['ipRateLimits'] = {}

    await request(app)
      .get('/test_rate_limiter')
      .set('X-Forwarded-For', ip1)
      .expect(200)
      .expect('Request Allowed')
  })

  test('Should allow different IPs regardless of rate limit', async () => {
    await request(app)
      .get('/test_rate_limiter')
      .set('X-Forwarded-For', ip1) // A different IP
      .expect(200)
      .expect('Request Allowed')

    await request(app)
      .get('/test_rate_limiter')
      .set('X-Forwarded-For', ip2) // Another different IP
      .expect(200)
      .expect('Request Allowed')
  })
})
