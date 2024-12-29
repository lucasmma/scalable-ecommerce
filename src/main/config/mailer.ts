import nodemailer from 'nodemailer'
import env from '../../main/config/env'

export const mailer = nodemailer.createTransport({
  host: env.NODEMAILER_HOST,
  port: env.NODEMAILER_PORT,
  auth: {
    user: env.NODEMAILER_USER,
    pass: env.NODEMAILER_PASS
  }
})
