import { Request, Response, NextFunction } from 'express'

export const contentType = (req: Request, res: Response, next: NextFunction): void => {
  req.headers['content-type'] = 'application/json'
  res.type('json')
  next()
}
