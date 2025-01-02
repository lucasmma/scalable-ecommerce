import { DbStockMethods } from './db-stock-methods'
import prisma from '../../main/config/prisma'
import { Stock } from '@prisma/client'

// Mocking Prisma Client
jest.mock('../../main/config/prisma', () => ({
  product: {
    findUnique: jest.fn(),
  },
  stock: {
    upsert: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
  }
}))

describe('DbStockMethods', () => {
  let dbStockMethods: DbStockMethods
  let upsert = prisma.stock.upsert as jest.Mock
  let productFindUnique = prisma.product.findUnique as jest.Mock
  let findUnique = prisma.stock.findUnique as jest.Mock
  let findMany = prisma.stock.findMany as jest.Mock
  let update = prisma.stock.update as jest.Mock
  const mockStock: Stock = {
    productId: '123',
    quantity: 100,
    id: '1',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockProduct = {
    id: '123',
    name: 'Product',
    description: 'Description',
    price: 10,
    categoryId: '123',
  }

  beforeEach(() => {
    dbStockMethods = new DbStockMethods()
  })

  describe('add method', () => {
    test('Should create or increment new stock when no stock exists for product', async () => {
      // Arrange
      const productId = '123'
      const quantity = 10
      productFindUnique.mockResolvedValue(mockProduct)
      upsert.mockResolvedValue(mockStock)

      // Act
      const result = await dbStockMethods.add(productId, quantity)

      // Assert
      expect(prisma.stock.upsert).toHaveBeenCalledWith({
        where: { productId },
        update: { quantity: { increment: quantity } },
        create: { productId, quantity },
      })
      expect(result).toEqual(mockStock)
    })
  })

  describe('remove method', () => {
    test('Should throw error if stock does not exist', async () => {
      // Arrange
      const productId = '123'
      const quantity = 10
      findUnique.mockResolvedValue(null)

      // Act & Assert
      await expect(dbStockMethods.remove(productId, quantity)).rejects.toThrow('Stock not found')
    })

    test('Should throw error if stock is insufficient', async () => {
      // Arrange
      const productId = '123'
      const quantity = 200
      findUnique.mockResolvedValue(mockStock)

      // Act & Assert
      await expect(dbStockMethods.remove(productId, quantity)).rejects.toThrow('Insufficient stock')
    })

    test('Should decrement stock if stock is sufficient', async () => {
      // Arrange
      const productId = '123'
      const quantity = 10
      productFindUnique.mockResolvedValue(mockStock)
      update.mockResolvedValue(mockStock)

      // Act
      const result = await dbStockMethods.remove(productId, quantity)

      // Assert
      expect(update).toHaveBeenCalledWith({
        where: { productId },
        data: { quantity: { decrement: quantity } },
      })
      expect(result).toEqual(mockStock)
    })
  })

  describe('consumeStock method', () => {
    test('Should return false if any product does not have enough stock', async () => {
      // Arrange
      const productsUsed = [{ productId: '123', quantity: 200 }]
      findMany.mockResolvedValue([mockStock])

      // Act
      const result = await dbStockMethods.consumeStock(productsUsed)

      // Assert
      expect(result).toBe(false)
    })

    test('Should return true if all products have enough stock and decrement stock', async () => {
      // Arrange
      const productsUsed = [{ productId: '123', quantity: 10 }]
      findMany.mockResolvedValue([mockStock])
      update.mockResolvedValue(mockStock)

      // Act
      const result = await dbStockMethods.consumeStock(productsUsed)

      // Assert
      expect(update).toHaveBeenCalledWith({
        where: { productId: '123' },
        data: { quantity: { decrement: 10 } },
      })
      expect(result).toBe(true)
    })
  })
})
