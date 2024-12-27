import { HttpResponse } from '../protocols/http'

export const badRequest = (error: Error): HttpResponse => ({
  statusCode: 400,
  body: error
})

export const serverError = (error: Error): HttpResponse => ({
  statusCode: 500,
  body: error
})

export const ok = (data: any): HttpResponse => ({
  statusCode: 200,
  body: data
})

export const unauthorized = (): HttpResponse => ({
  statusCode: 401,
  body: {
    error: 'Unauthorized'
  }
})

export const forbidden = (): HttpResponse => ({
  statusCode: 403,
  body: {
    error: 'Forbidden'
  }
})

export const toManyRequests = (): HttpResponse => ({
  statusCode: 429,
  body: {
    error: 'To many requests'
  }
})
