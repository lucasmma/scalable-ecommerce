import { SchemaProtocol } from '../../data/protocols/schema'
import { z } from 'zod'

export class SchemaAdapter implements SchemaProtocol {
  private readonly schema: z.AnyZodObject

  constructor (newSchema: z.AnyZodObject) {
    this.schema = newSchema
  }

  async validate (value: string): Promise<boolean> {
    return this.schema.safeParse(value).success
  }

  async parse <T extends z.AnyZodObject>(value: string): Promise<T | Error> {
    try {
      var result = (this.schema as T).parse(value)
      return result as T
    } catch (error) {
      throw error
    }
  }
}
