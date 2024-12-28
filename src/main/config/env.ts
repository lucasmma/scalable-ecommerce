import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config()


const env = {
  JWT_SECRET: process.env.JWT_SECRET ?? '',
  SECONDARY_JWT_SECRET: process.env.SECONDARY_JWT_SECRET ?? '',
  NODEMAILER_HOST: process.env.NODEMAILER_HOST ?? '',
  NODEMAILER_PORT: parseInt(process.env.NODEMAILER_PORT as string, 10),
  NODEMAILER_USER: process.env.NODEMAILER_USER ?? '',
  NODEMAILER_PASS: process.env.NODEMAILER_PASS ?? '',
  REDIS_URL: process.env.REDIS_URL ?? '',
}

export default env