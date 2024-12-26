import { HttpRequest, HttpResponse } from '../../presentation/protocols'
import { Response } from 'express'
import { badRequest, ok, serverError } from '../../presentation/helpers/http-helper'
import { z } from 'zod'
import { SchemaAdapter } from '../../infra/schema/schema-adapter'

type SchemaMap = {
  param?: z.AnyZodObject | z.ZodEffects<any, any>
  body?: z.AnyZodObject | z.ZodEffects<any, any>
  query?: z.AnyZodObject | z.ZodEffects<any, any>
}

export const adaptRoute = (controller: object, handle: (httpRequest: HttpRequest) => Promise<HttpResponse>, schemaMap?: SchemaMap) => {
  return async (req: any, res: Response) => {
    const httpRequest: HttpRequest = {
      body: req.body,
      auth: req.auth,
      params: req.params,
      headers: req.headers
    }
    let httpResponse: HttpResponse = ok({})

    if(schemaMap) {
      if(schemaMap.param) {
        var schemaAdapter = new SchemaAdapter(schemaMap.param)
        var result = schemaAdapter.validate(req.params)
        if(!result.sucess) {
          httpResponse = badRequest(result.error ?? new Error('Invalid param'))
          res.status(httpResponse.statusCode).json({
            error: httpResponse.body.message
          })
          return
        }
      } 
      if (schemaMap.body) {
        var schemaAdapter = new SchemaAdapter(schemaMap.body)
        var result = schemaAdapter.validate(req.body)
        if(!result.sucess) {
          httpResponse = badRequest(result.error ?? new Error('Invalid body params'))
          res.status(httpResponse.statusCode).json({
            error: httpResponse.body.message
          })
          return
        }
      } 
      if (schemaMap.query) {
        var schemaAdapter = new SchemaAdapter(schemaMap.query)
        var result = schemaAdapter.validate(req.query)
        if(!result.sucess) {
          httpResponse = badRequest(result.error ?? new Error('Invalid query params'))
          res.status(httpResponse.statusCode).json({
            error: httpResponse.body.message
          })
          return
        }

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
