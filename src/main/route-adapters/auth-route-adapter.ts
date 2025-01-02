import { HttpRequest, HttpResponse } from '../../presentation/protocols'
import { NextFunction, Response } from 'express'
import { badRequest, ok, serverError } from '../../presentation/helpers/http-helper'
import { SchemaProtocol } from '../../data/protocols/schema'
import { JwtProtocol } from '../../data/protocols/jwt'
import { exceptionCounter, securityEventCounter } from '../config/registry-metrics'

export const adaptAuthRoute = (jwt: JwtProtocol, role?: 'USER' | 'ADMIN') => {
  return async (req: any, res: Response, next: NextFunction) => {

    // get bearer token
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      securityEventCounter.inc({ event_type: 'missing_token', route: req.originalUrl })
      res.status(401).json({
        error: 'Unauthorized'
      })
      return
    }

    // validate token
    const decoded = jwt.validate(token)

    if(decoded === null) {
      securityEventCounter.inc({ event_type: 'invalid_token', route: req.originalUrl })
      res.status(401).json({
        error: 'Unauthorized'
      })
      return
    }

    if (role && decoded.role !== role) {
      securityEventCounter.inc({ event_type: 'wrong_token', route: req.originalUrl })
      res.status(403).json({
        error: 'Forbidden'
      })
      return
    }

    req.auth = {
      user: decoded
    }
    
    next()
  }
}
