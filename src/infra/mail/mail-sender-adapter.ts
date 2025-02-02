import nodemailer from 'nodemailer'
import { MailData } from '../../domain/models/maildata'

export class MailSenderAdapter  {
  constructor (private readonly transporter: nodemailer.Transporter) {
    this.transporter = transporter
  }


  async send (mailData: MailData): Promise<boolean> {
    try {
      const results = await this.transporter.sendMail({
        ...mailData,
        from: 'r2takehomeproject@gmail.com'
      })
      return results.accepted.includes(mailData.to)
    } catch (error) {
      throw new Error('Failed to send email')
    }
  }
}
