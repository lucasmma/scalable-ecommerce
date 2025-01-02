import { OrderController } from './order-controller';
import { HttpRequest, HttpResponse } from '../protocols';
import { badRequest, ok } from '../helpers/http-helper';
import { StockMethods } from '../../domain/usecases/stock-methods';
import { MailSenderAdapter } from '../../infra/mail/mail-sender-adapter';
import { CacheProtocol } from '../../data/protocols/cache';
import { MockPaymentGateway } from '../../infra/payment-gateway/mock-payment-gateway';
import { DbStockMethods } from '../../data/usecases/db-stock-methods'
import { mailer } from '../../main/config/mailer'
import { CacheAdapter } from '../../infra/cache/cache-adapter'
import { redis } from '../../main/config/redis'
import prisma from '../../main/config/prisma';


const mockUser = {
  id: 'user1',
  email: 'testemail',
  name: 'Test User',
  role: 'USER',
  documentNumber: '12345678900',
  createdAt: new Date(),
  updatedAt: new Date(),
}

// Mock the PrismaClient class
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    product: {
      findMany: jest.fn(),
    },
    order: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    stock: {
      upsert: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
  };
});






jest.mock('../../infra/mail/mail-sender-adapter');
jest.mock('../../infra/cache/cache-adapter');
jest.mock('../../domain/usecases/stock-methods');
jest.mock('../../infra/payment-gateway/mock-payment-gateway');



describe('OrderController', () => {
  let orderController: OrderController;
  let stockMethods: jest.Mocked<StockMethods>;
  let mailSenderAdapter: jest.Mocked<MailSenderAdapter>;
  let cartCacheAdapter: jest.Mocked<CacheProtocol>;
  let paymentGatewayAdapter: jest.Mocked<MockPaymentGateway>;
  let productFindMany= prisma.product.findMany as jest.Mock;
  let orderCreate = prisma.order.create as jest.Mock;
  let orderFindFirst = prisma.order.findFirst as jest.Mock;
  let orderUpdate = prisma.order.update as jest.Mock;
  let orderFindUnique = prisma.order.findUnique as jest.Mock;
  let stockUpsert = prisma.stock.upsert as jest.Mock;
  let stockFindUnique = prisma.stock.findUnique as jest.Mock;
  let stockFindMany = prisma.stock.findMany as jest.Mock;
  let transaction = prisma.$transaction as jest.Mock;

  beforeEach(() => {
    stockMethods = new DbStockMethods() as jest.Mocked<StockMethods>;
    mailSenderAdapter = new MailSenderAdapter(mailer) as jest.Mocked<MailSenderAdapter>;
    cartCacheAdapter = new CacheAdapter(redis, 'cart') as jest.Mocked<CacheAdapter>;
    paymentGatewayAdapter = new MockPaymentGateway() as jest.Mocked<MockPaymentGateway>;
    orderController = new OrderController(stockMethods, mailSenderAdapter, cartCacheAdapter, paymentGatewayAdapter);
    jest.clearAllMocks()
  });

  afterAll(async () => {
    await redis.quit();
  })
  

  describe('updateCartItems', () => {  
    it('Should create a new cart if none exists', async () => {
      const request = {
        auth: { user: { id: 'user1' } },
        body: { addProducts: [{ productId: 'prod1', quantity: 2 }] },
      } as HttpRequest;
  
      jest.spyOn(cartCacheAdapter, 'get').mockResolvedValue(null);  // No cart found in cache
      orderFindFirst.mockResolvedValue(null);  // No order found in DB
  
      // Mock the products to be added to the cart
      productFindMany.mockResolvedValue([
        { id: 'prod1', price: 100, name: 'Product 1', description: 'Test product', deleted: false, createdAt: new Date(), updatedAt: new Date(), categoryId: null },
      ]);
  
      orderCreate.mockResolvedValue({
        userId: request.auth?.user.id!,
        id: 'order1',
        address: null,
        total: 200,
        status: 'CART',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      transaction.mockResolvedValue(ok({
        id: 'order1',
        total: 200,
        status: 'CART',
        userId: 'user1',
        address: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })); 
  
      const response = await orderController.updateCartItems(request);
  
      // Ensure the cart is created and the response is as expected
      expect(response).toEqual(ok(expect.objectContaining({ total: 200 })));
    });
  
    it('Should update the cart if it exists', async () => {
      const request = {
        auth: { user: { id: 'user1' } },
        body: { addProducts: [{ productId: 'prod1', quantity: 2 }] },
      } as HttpRequest;
  
      jest.spyOn(cartCacheAdapter, 'get').mockResolvedValue({
        id: 'order1',
        total: 0,
        status: 'CART',
        userId: 'user1',
        address: null,
        items: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
  
      productFindMany.mockResolvedValue([
        { id: 'prod1', price: 100, name: 'Product 1', description: 'Test product', deleted: false, createdAt: new Date(), updatedAt: new Date(), categoryId: null },
      ]);
  
      orderUpdate.mockResolvedValue({
        id: 'order1',
        total: 200,
        status: 'CART',
        userId: 'user1',
        address: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
  
      const response = await orderController.updateCartItems(request);
  
      // Check that the cart is updated correctly
      expect(response).toEqual(ok(expect.objectContaining({ total: 200 })));
    });
  });

  describe('payCart', () => {
    it('Should return bad request if cart is empty', async () => {
      const request = {
        auth: { user: mockUser },
        body: { address: '123 Test St', card: { number: '4111111111111111' } },
        params: { id: 'order1' },
      } as HttpRequest;
      

      jest.spyOn(cartCacheAdapter, 'get').mockResolvedValue({
        id: 'order1',
        total: 0,
        items: [],
        userId: 'user1',
        status: 'CART',
      });

      const response = await orderController.payCart(request);

      expect(response).toEqual(badRequest(new Error('Cart is empty')));
    });

    it('Should process payment if cart is valid', async () => {
      const request = {
        auth: { user: mockUser },
        body: { address: '123 Test St', card: { number: '4242424242424242', cardHolder: 'Lucas Mendonca', cvv: '123', expirationDate: '12/25' } },
        params: { id: 'order1' },
      } as HttpRequest;

      jest.spyOn(cartCacheAdapter, 'get').mockResolvedValue({
        id: 'order1',
        total: 200,
        items: [{ productId: 'prod1', quantity: 2 }],
        userId: 'user1',
        status: 'CART',
      });
      jest.spyOn(stockMethods, 'consumeStock').mockResolvedValue(true);
      jest.spyOn(mailSenderAdapter, 'send').mockResolvedValue(true);
      jest.spyOn(prisma.order, 'update').mockResolvedValue({
        id: 'order1',
        total: 200,
        status: 'CONFIRMED',
        userId: 'user1',
        address: '123 Test St',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const response = await orderController.payCart(request);

      expect(response).toEqual(ok(expect.objectContaining({ status: 'CONFIRMED' })));
    });
  });

  describe('cancelOrder', () => {
    it('Should return bad request if order is not found', async () => {
      const request = {
        auth: { user: mockUser },
        params: { id: 'order1' },
      } as HttpRequest;
  
      jest.spyOn(cartCacheAdapter, 'get').mockResolvedValue(null);
      orderFindFirst.mockResolvedValue(null); // No order found
  
      const response = await orderController.cancelOrder(request);
  
      expect(response).toEqual(badRequest(new Error('Order not found')));
    });
  
    it('Should return bad request if order is not in "CART" status', async () => {
      const request = {
        auth: { user: mockUser },
        params: { id: 'order1' },
      } as HttpRequest;
  
      jest.spyOn(cartCacheAdapter, 'get').mockResolvedValue(null);
      orderFindUnique.mockResolvedValue({
        id: 'order1',
        userId: 'user1',
        status: 'DELIVERED', // The order is not in "CART" status
        total: 100,
        items: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
  
      const response = await orderController.cancelOrder(request);
  
      expect(response).toEqual(badRequest(new Error('Order cannot be canceled')));
    });
  
    it('Should update order status to "CANCELLED"', async () => {
      const request = {
        auth: { user: mockUser },
        params: { id: 'order1' },
      } as HttpRequest;
  
      const mockOrder = {
        id: 'order1',
        userId: 'user1',
        status: 'CONFIRMED',
        total: 100,
        items: [{ productId: 'prod1', quantity: 1 }],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
  
      orderFindUnique.mockResolvedValue(mockOrder);
      orderUpdate.mockResolvedValue({
        ...mockOrder,
        status: 'CANCELLED',
        updatedAt: new Date(),
      });
      jest.spyOn(stockMethods, 'add').mockResolvedValue({
        id: 'stock1',
        productId: 'prod1',
        quantity: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
  
      const response = await orderController.cancelOrder(request);
  
      expect(response.body.status).toBe('CANCELLED');
      expect(response.statusCode).toBe(200);
    });
  
    it('Should return error if order does not exist', async () => {
      const request = {
        auth: { user: mockUser },
        params: { id: 'order1' },
      } as HttpRequest;
  
      jest.spyOn(cartCacheAdapter, 'get').mockResolvedValue(null);
      orderFindUnique.mockResolvedValueOnce(null); // Unexpected error
  
      const response = await orderController.cancelOrder(request);
  
      expect(response).toEqual({
        statusCode: 400,
        body: new Error('Order not found'),
      });
    });

    it('Should return error if order cant be cancelled', async () => {
      const request = {
        auth: { user: mockUser },
        params: { id: 'order1' },
      } as HttpRequest;
  
      jest.spyOn(cartCacheAdapter, 'get').mockResolvedValue(null);
      orderFindUnique.mockResolvedValueOnce({
        id: 'order1',
        userId: 'user1',
        status: 'DELIVERED', // The order is not in "CART" status
        total: 100,
        items: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }); // Unexpected error
  
      const response = await orderController.cancelOrder(request);
  
      expect(response).toEqual({
        statusCode: 400,
        body: new Error('Order cannot be canceled'),
      });
    });
  });
});
