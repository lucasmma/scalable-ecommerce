export interface SchemaProtocol {
  validate: (value: string) => { sucess: boolean, error?: Error}
}
