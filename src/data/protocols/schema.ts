export interface SchemaProtocol {
  validate: (value: object | string) => { success: boolean, error?: Error}
}
