import { PaymentGatewayProtocol, PaymentMethod } from '../../data/protocols/payment-gateway'
import { transactionErrorCounter } from '../../main/config/registry-metrics'

export class MockPaymentGateway implements PaymentGatewayProtocol {
  private payments: Map<string, { amount: number; currency: string; captured: boolean; refunded: boolean }> = new Map();

  async initializePayment(orderId: string, amount: number, currency: string, creditCard: PaymentMethod ): Promise<void> {
    // validate expiration date
    // expirationDate is DD/MM
    const [expirationMonth, expirationYear] = creditCard.expirationDate.split('/');
    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;

    if(parseInt(expirationYear) < currentYear || (parseInt(expirationYear) === currentYear && parseInt(expirationMonth) < currentMonth)) {
      transactionErrorCounter.inc({ error_type: 'invalid_expiration_date', method: 'initializePayment'});
      throw new Error('Invalid credit card expiration date');
    }
    
    if(creditCard.cardNumber !== '4242424242424242') {
      transactionErrorCounter.inc({ error_type: 'invalid_credit_card_number', method: 'initializePayment'});
      throw new Error('Invalid credit card number');
    }
    
    if(this.payments.has(orderId)) {
      transactionErrorCounter.inc({ error_type: 'payment_already_exist', method: 'initializePayment'});
      throw new Error('Payment already exists');
    }


    this.payments.set(orderId, { amount, currency, captured: false, refunded: false });
  }

  async capturePayment(paymentId: string): Promise<void> {
    const payment = this.payments.get(paymentId);
    if(!payment) {
      transactionErrorCounter.inc({ error_type: 'payment_not_found', method: 'capturePayment'});
      throw new Error('Payment not found');
    }

    if (payment.captured) {
      transactionErrorCounter.inc({ error_type: 'payment_already_captured', method: 'capturePayment'});
      throw new Error('Payment already captured');
    }
    payment.captured = true;
    this.payments.set(paymentId, payment);
  }

  async refundPayment(paymentId: string): Promise<void> {
    const payment = this.payments.get(paymentId);
    if(!payment) {
      transactionErrorCounter.inc({ error_type: 'payment_not_found', method: 'refundPayment'});
      throw new Error('Payment not found');
    }

    if (payment.captured) {
      transactionErrorCounter.inc({ error_type: 'payment_already_captured', method: 'refundPayment'});
      throw new Error('Payment already captured');
    }

    if (payment.refunded) {
      transactionErrorCounter.inc({ error_type: 'payment_already_refunded', method: 'refundPayment'});
      throw new Error('Payment already refunded');
    }
    payment.refunded = true;
    this.payments.set(paymentId, payment);
  }
}