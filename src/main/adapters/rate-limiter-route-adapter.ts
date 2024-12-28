import { NextFunction, Request, Response } from 'express'
import { RateLimiterProtocol } from '../../data/protocols/rate-limiter'

export function adaptRateLimiterRoute (rateLimiter: RateLimiterProtocol) {
  return async (req: any, res: Response, next: NextFunction) => {
    const { ip } = req
    const isAllowed = await rateLimiter.isAllowed(ip)
    if (!isAllowed) {
      res.status(429).json({ error: 'Too many requests' })
      return
    }
    next()
  }
}
