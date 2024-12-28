export interface RateLimiterProtocol {
  isAllowed: (key: string) => Promise<boolean>
  reset:(key: string) => Promise<void>
}
