import { z } from 'zod'

export type SchemaMap = {
  param?: z.AnyZodObject | z.ZodEffects<any, any>
  body?: z.AnyZodObject | z.ZodEffects<any, any>
  query?: z.AnyZodObject | z.ZodEffects<any, any>
}