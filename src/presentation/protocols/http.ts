import { Prisma } from '@prisma/client'

export interface HttpResponse {
  statusCode: number
  body: any
}

export interface HttpRequest {
  body?: any
  headers?: any
  auth?: {
    user: Prisma.UserFieldRefs
  }
}