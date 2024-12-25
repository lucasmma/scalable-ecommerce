import { HttpRequest, HttpResponse } from '../../presentation/protocols'
import { Response } from 'express'
import { ok, serverError } from '../../presentation/helpers/http-helper'

export const adaptRoute = (controller: object, handle: (httpRequest: HttpRequest) => Promise<HttpResponse>) => {
  return async (req: any, res: Response) => {
    const httpRequest: HttpRequest = {
      body: req.body,
      auth: req.auth,
      headers: req.headers
    }
    let httpResponse: HttpResponse = ok({})
    try {
      httpResponse = await handle.call(controller, httpRequest)
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
