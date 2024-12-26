import { ProductController } from '../../presentation/controllers/product-controller'



export function makeProductController(): ProductController {
  return new ProductController()
}