import nodemailer from 'nodemailer'
import { MailData } from '../../domain/models/maildata'
import env from '../../main/config/env'

const transporter = nodemailer.createTransport({
  host: env.NODEMAILER_HOST,
  port: env.NODEMAILER_PORT,
  auth: {
    user: env.NODEMAILER_USER,
    pass: env.NODEMAILER_PASS
  }
})

export class MailSenderAdapter {
  async send (mailData: MailData): Promise<boolean> {
    const results = await transporter.sendMail({
      ...mailData,
      from: 'r2takehomeproject@gmail.com'
    })

    return results.accepted.includes(mailData.to)
  }
}
