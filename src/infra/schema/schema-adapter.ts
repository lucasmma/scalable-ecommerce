import { SchemaProtocol } from '../../data/protocols/schema'
import { z } from 'zod'

export class SchemaAdapter implements SchemaProtocol {
  private readonly schema: z.AnyZodObject | z.ZodEffects<any, any>

  constructor (newSchema: z.AnyZodObject | z.ZodEffects<any, any>) {
    this.schema = newSchema
  }

  validate(value: object | string): { sucess: boolean, error?: Error } {
    try {
      if (typeof value === 'string') {
        value = JSON.parse(value);
      }
      const res = this.schema.safeParse(value);
      return {
        sucess: res.success,
        error: res.error ? new Error(res.error.message) : undefined
      };
    } catch (error) {
      return {
        sucess: false,
        error: new Error('Invalid JSON string')
      };
    }
  }
}
