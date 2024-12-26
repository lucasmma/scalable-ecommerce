import { User } from '@prisma/client'

export interface HttpResponse {
  statusCode: number
  body: any
}

export interface HttpRequest<T = any, Q = any> {
  body?: T
  headers?: any
  params?: {
    [key: string]: string
  }
  query?: Q
  auth?: {
    user: Omit<User, 'password'>
  }
}