import { HttpRequest, HttpResponse } from '../../presentation/protocols'
import { Response } from 'express'
import { badRequest, ok, serverError } from '../../presentation/helpers/http-helper'
import { z } from 'zod'
import { SchemaAdapter } from '../../infra/schema/schema-adapter'
import { SchemaMap } from '../../domain/models/schema-map'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { exceptionCounter } from '../config/registry-metrics'

export const adaptRoute = (controller: object, handle: (httpRequest: HttpRequest) => Promise<HttpResponse>, schemaMap?: SchemaMap) => {
  return async (req: any, res: Response) => {
    const httpRequest: HttpRequest = {
      body: req.body,
      auth: req.auth,
      query: req.query,
      params: req.params,
      headers: req.headers
    }
    let httpResponse: HttpResponse = ok({})

    if (schemaMap) {
      const validateSchema = (data: any, errorMessage: string, schema?: z.AnyZodObject | z.ZodEffects<any, any>, ) => {
        if (schema) {
          const schemaAdapter = new SchemaAdapter(schema);
          const result = schemaAdapter.validate(data);
          if (!result.success) {
            const httpResponse = badRequest(result.error ?? new Error(errorMessage));
            try {
              res.status(httpResponse.statusCode).json({
                error: JSON.parse(httpResponse.body.message)
              });
            } catch (error) {
              res.status(httpResponse.statusCode).json({
                error: httpResponse.body.message
              });
            }
            return false; // Indicate validation failure
          }
        }
        return true; // Indicate validation success
      };
    
      if (!validateSchema(req.params, 'Invalid param', schemaMap.param) ||
          !validateSchema(req.body, 'Invalid body params', schemaMap.body) ||
          !validateSchema(req.query, 'Invalid query params', schemaMap.query)) {
        return; // Exit if any validation fails
      }
    }

    try {
      httpResponse = await handle.call(controller, httpRequest);
    } catch (error: any) {
      // Check if the error is an instance of Error
      var message: string | undefined | null = error.message;

      if (error instanceof PrismaClientKnownRequestError) {
        message =  error.meta?.cause as string | undefined | null;
      }

      if(message) {
        httpResponse = badRequest({
          message: message
        } as Error);
      } else {
        httpResponse = serverError({
          message: 'Internal server error'
        } as Error);
        exceptionCounter.inc({ method: req.method, route: req.originalUrl, status_code: message ? 400 : 500, error: message ?? 'internal-error' });
      }
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
