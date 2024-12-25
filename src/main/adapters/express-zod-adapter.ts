import { HttpRequest, HttpResponse } from '../../presentation/protocols'
import { NextFunction, Request, Response } from 'express'
import { badRequest, ok, serverError } from '../../presentation/helpers/http-helper'
import { z } from 'zod'

export const adaptZod = (schema: z.AnyZodObject) => {
  return async (req: any, res: Response, next: NextFunction) => {
    const httpRequest: HttpRequest = {
      body: req.body,
      auth: req.auth,
      headers: req.headers
    }

    let httpResponse: HttpResponse = ok({})

    try {
      var result = schema.safeParse(httpRequest.body)
      if(!result.success) {
        httpResponse = badRequest(result.error)
      }
    } catch (error) {
      console.log(error)
      httpResponse = serverError({
        message: 'Internal server error'
      } as Error)
    }
    if (httpResponse.statusCode === 200) {
      res.status(httpResponse.statusCode).json(httpResponse.body)
    } else {
      res.status(httpResponse.statusCode).json({
        error: httpResponse.body.message
      })
    }
  }
}
