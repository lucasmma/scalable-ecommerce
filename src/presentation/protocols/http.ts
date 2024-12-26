import { User } from '@prisma/client'

export interface HttpResponse {
  statusCode: number
  body: any
}

export interface HttpRequest<T = any> {
  body?: T
  headers?: any
  auth?: {
    user: User
  }
}