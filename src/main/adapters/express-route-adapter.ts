import { HttpRequest, HttpResponse } from '../../presentation/protocols'
import { Response } from 'express'
import { badRequest, ok, serverError } from '../../presentation/helpers/http-helper'
import { SchemaProtocol } from '../../data/protocols/schema'

export const adaptRoute = (controller: object, handle: (httpRequest: HttpRequest) => Promise<HttpResponse>, schema?: SchemaProtocol) => {
  return async (req: any, res: Response) => {
    const httpRequest: HttpRequest = {
      body: req.body,
      auth: req.auth,
      headers: req.headers
    }
    let httpResponse: HttpResponse = ok({})

    if(schema) {
      var schemaValidation = await schema.validate(httpRequest.body)
      if(!schemaValidation.sucess){
        httpResponse = badRequest(schemaValidation.error!)
        res.status(httpResponse.statusCode).json({
          error: httpResponse.body.message
        })
        return
      }
    }

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
