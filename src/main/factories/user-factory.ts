import { JwtAdapter } from '../../infra/auth/jwt-adapter'
import { BcryptAdapter } from '../../infra/criptography/bcrypt-adapter'
import { UserController } from '../../presentation/controllers/user-controller'
import env from '../config/env'



export function makeUserController(): UserController {
  var bcryptAdapter = new BcryptAdapter(10)
  var jwtAdapter = new JwtAdapter(env.JWT_SECRET)
  var secondaryJwtAdapter = new JwtAdapter(env.JWT_SECRET)
  return new UserController(bcryptAdapter, jwtAdapter, secondaryJwtAdapter)
}