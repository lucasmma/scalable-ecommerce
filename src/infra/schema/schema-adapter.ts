import { SchemaProtocol } from '../../data/protocols/schema'
import { z } from 'zod'

export class SchemaAdapter implements SchemaProtocol {
  private readonly schema: z.AnyZodObject | z.ZodEffects<any, any>

  constructor (newSchema: z.AnyZodObject | z.ZodEffects<any, any>) {
    this.schema = newSchema
  }

  validate (value: string): { sucess: boolean, error?: Error} {
    var res = this.schema.safeParse(value)
    return {
      sucess: res.success,
      error: res.error
    }
  }
}
