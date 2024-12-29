export interface SchemaProtocol {
  validate: (value: object | string) => { sucess: boolean, error?: Error}
}
