export interface EncrypterProtocol {
  encrypt: (value: string) => Promise<string>
}
