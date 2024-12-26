import { z } from 'zod'

export interface SchemaProtocol {
  validate: (value: string) => Promise<boolean>
  parse: <T extends z.AnyZodObject>(value: string) => Promise<T | Error>
}
