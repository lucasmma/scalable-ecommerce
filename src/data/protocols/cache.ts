export interface CacheProtocol {
  set: <T>(key: string, value: T, duration?: number) => Promise<void>
  get: <T>(key: string) => Promise<T | null>
  delete: (key: string) => Promise<void>
  getMany: <T>() => Promise<(T[] | null)>
}
