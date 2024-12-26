export interface EncrypterProtocol {
  encrypt: (value: string) => Promise<string>
  compare: (value: string, hash: string) => Promise<boolean>
}
