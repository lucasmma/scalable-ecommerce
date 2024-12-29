import { NextFunction, Request, Response, json } from 'express'

export const bodyParser = (req: Request, res: Response, next: NextFunction): void => {
  json()(req, res, (err) => {
    if (err) {
      res.status(400).json({ error: 'Invalid JSON payload' });
      return;
    }
    next();
  });
};
