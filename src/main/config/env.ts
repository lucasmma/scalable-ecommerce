import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config()


const env = {
  JWT_SECRET: process.env.JWT_SECRET ?? '',
  SECONDARY_JWT_SECRET: process.env.SECONDARY_JWT_SECRET ?? '',
}

export default env