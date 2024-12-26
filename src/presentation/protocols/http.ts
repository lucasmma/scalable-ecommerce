import { User } from '@prisma/client'

export interface HttpResponse {
  statusCode: number
  body: any
}

export interface HttpRequest<T = any> {
  body?: T
  headers?: any
  params?: {
    [key: string]: string
  }
  auth?: {
    user: Omit<User, 'password'>
  }
}