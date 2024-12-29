import nodemailer from 'nodemailer';
import { MailSenderAdapter } from './mail-sender-adapter';
import { MailData } from '../../domain/models/maildata';
import { mailer } from '../../main/config/mailer'

// Mock nodemailer to mock sendMail function
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn()
  }),
}));

describe('MailSenderAdapter', () => {
  let mailSender: MailSenderAdapter;
  let sendMailMock: jest.Mock;

  const mailData: MailData = {
    to: 'recipient@example.com',
    subject: 'Test Subject',
    html: 'Test email body',
  };

  beforeAll(() => {
    mailSender = new MailSenderAdapter(mailer);
    sendMailMock = nodemailer.createTransport().sendMail as jest.Mock;
  });

  afterAll(() => {
    jest.clearAllMocks(); // Clear mocks after tests
  });

  describe('send', () => {
    test('should call sendMail with correct parameters', async () => {
      // Mock a successful sendMail response with the correct structure
      sendMailMock.mockResolvedValueOnce({
        accepted: [mailData.to],
      });

      await mailSender.send(mailData);

      // Verify that sendMail was called with the correct parameters
      expect(sendMailMock).toHaveBeenCalledWith({
        ...mailData,
        from: 'r2takehomeproject@gmail.com',
      });
    });

    test('should return true when email is successfully sent', async () => {
      // Mock a successful sendMail response with the correct structure
      sendMailMock.mockResolvedValueOnce({
        accepted: [mailData.to],
      });

      const result = await mailSender.send(mailData);

      // Verify that the method returns true if the email is successfully sent
      expect(result).toBe(true);
    });

    test('should return false if email is not accepted', async () => {
      // Mock sendMail response with no accepted emails
      sendMailMock.mockResolvedValueOnce({
        accepted: [],
      });

      const result = await mailSender.send(mailData);

      // Verify that the method returns false if the email is not accepted
      expect(result).toBe(false);
    });

    test('should throw an error if sendMail fails', async () => {
      // Mock sendMail rejection (failure)
      sendMailMock.mockRejectedValueOnce(new Error('Failed to send email'));

      // Verify that the method throws an error if sendMail fails
      await expect(mailSender.send(mailData)).rejects.toThrow('Failed to send email');
    });
  });
});
