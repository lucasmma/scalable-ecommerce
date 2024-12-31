import { PaymentMethod } from '../../data/protocols/payment-gateway';
import { MockPaymentGateway } from './mock-payment-gateway';

const makeSut = (): MockPaymentGateway => {
  return new MockPaymentGateway();
};

describe('MockPaymentGateway', () => {
  let sut: MockPaymentGateway;

  beforeAll(() => {
    sut = makeSut();
  });

  afterAll(() => {
    jest.clearAllMocks(); // Clear all mock data after all tests
  });

  const validPaymentMethod: PaymentMethod = {
    cardNumber: '4242424242424242',
    cardHolder: 'John Doe',
    expirationDate: '12/30',
    cvv: '123',
  };
  const orderId = 'order_123';
  const amount = 100;
  const currency = 'USD';

  describe('initializePayment', () => {
    test('Should throw if the expiration date is invalid', async () => {
      const invalidPaymentMethod = { ...validPaymentMethod, expirationDate: '12/20' };

      await expect(
        sut.initializePayment(orderId, amount, currency, invalidPaymentMethod)
      ).rejects.toThrow('Invalid credit card expiration date');
    });

    test('Should throw if the card number is invalid', async () => {
      const invalidPaymentMethod = { ...validPaymentMethod, cardNumber: '1111111111111111' };

      await expect(
        sut.initializePayment(orderId, amount, currency, invalidPaymentMethod)
      ).rejects.toThrow('Invalid credit card number');
    });

    test('Should throw if the payment already exists', async () => {
      await sut.initializePayment(orderId, amount, currency, validPaymentMethod);

      await expect(
        sut.initializePayment(orderId, amount, currency, validPaymentMethod)
      ).rejects.toThrow('Payment already exists');
    });

    test('Should successfully initialize a payment', async () => {
      const newOrderId = 'order_456';

      await expect(
        sut.initializePayment(newOrderId, amount, currency, validPaymentMethod)
      ).resolves.not.toThrow();
    });
  });

  describe('capturePayment', () => {
    test('Should throw if the payment is not found', async () => {
      await expect(sut.capturePayment('nonexistent_payment')).rejects.toThrow('Payment not found');
    });

    test('Should throw if the payment is already captured', async () => {
      const captureOrderId = 'order_capture';
      await sut.initializePayment(captureOrderId, amount, currency, validPaymentMethod);
      await sut.capturePayment(captureOrderId);

      await expect(sut.capturePayment(captureOrderId)).rejects.toThrow('Payment already captured');
    });

    test('Should successfully capture a payment', async () => {
      const captureOrderId = 'order_capture_success';
      await sut.initializePayment(captureOrderId, amount, currency, validPaymentMethod);

      await expect(sut.capturePayment(captureOrderId)).resolves.not.toThrow();
    });
  });

  describe('refundPayment', () => {
    test('Should throw if the payment is not found', async () => {
      await expect(sut.refundPayment('nonexistent_payment')).rejects.toThrow('Payment not found');
    });

    test('Should throw if the payment is already refunded', async () => {
      const refundOrderId = 'order_refund';
      await sut.initializePayment(refundOrderId, amount, currency, validPaymentMethod);
      await sut.refundPayment(refundOrderId);

      await expect(sut.refundPayment(refundOrderId)).rejects.toThrow('Payment already refunded');
    });

    test('Should successfully refund after intialize payment', async () => {
      const refundOrderId = 'order_refund_success';
      await sut.initializePayment(refundOrderId, amount, currency, validPaymentMethod);

      await expect(sut.refundPayment(refundOrderId)).resolves.not.toThrow();
    });
  });
});
