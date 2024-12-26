import { Request, Response, NextFunction } from 'express'

export const logRequestInfo = (req: Request, res: Response, next: NextFunction): void => {
  const startTime: Date = new Date()
  res.on('finish', () => {
    const totalTime = new Date().getTime() - startTime.getTime()
    console.log(`\x1b[1m[${new Date().toLocaleString()}] ${req.method} -> ${req.originalUrl}: \x1b[${res.statusCode >= 200 && res.statusCode < 300 ? 32 : 31}m${res.statusCode}\x1b[0m \x1b[1m(in ${totalTime}ms)\x1b[0m`)
  })
  next()
}
