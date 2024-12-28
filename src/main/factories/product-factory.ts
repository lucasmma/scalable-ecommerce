import { CacheAdapter } from '../../infra/cache/cache-adapter'
import { ProductController } from '../../presentation/controllers/product-controller'
import { redis } from '../config/redis'



export function makeProductController(): ProductController {
  const cacheAdapter = new CacheAdapter(redis, 'products')
  return new ProductController(cacheAdapter)
}