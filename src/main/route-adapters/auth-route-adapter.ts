import { HttpRequest, HttpResponse } from '../../presentation/protocols'
import { NextFunction, Response } from 'express'
import { badRequest, ok, serverError } from '../../presentation/helpers/http-helper'
import { SchemaProtocol } from '../../data/protocols/schema'
import { JwtProtocol } from '../../data/protocols/jwt'

export const adaptAuthRoute = (jwt: JwtProtocol, role?: 'USER' | 'ADMIN') => {
  return async (req: any, res: Response, next: NextFunction) => {

    // get bearer token
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      res.status(401).json({
        error: 'Unauthorized'
      })
      return
    }

    // validate token
    try {
      const decoded = jwt.validate(token)

      if (role && decoded.role !== role) {
        res.status(403).json({
          error: 'Forbidden'
        })
        return
      }

      req.auth = {
        user: decoded
      }
    } catch (error) {
      res.status(401).json({
        error: 'Unauthorized'
      })
      return
    }
    
    next()
  }
}
