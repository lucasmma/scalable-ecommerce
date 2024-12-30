import { Router } from 'express'
import { createUserSchema } from '../schemas/user/create-user-schema'
import { adaptRoute } from '../route-adapters/controller-route-adapter'
import { UserController } from '../../presentation/controllers/user-controller'
import { SchemaAdapter } from '../../infra/schema/schema-adapter'
import { makeUserController } from '../factories/user-factory'
import { oauthTokenSchema } from '../schemas/user/oauth-token-schema'
import { adaptAuthRoute } from '../route-adapters/auth-route-adapter'
import { editUserSchema } from '../schemas/user/edit-user-schema'

/**
 * @openapi
 * components:
 *   securitySchemes:
 *    BearerAuth:
 *      type: http
 *      scheme: bearer
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "cl1j9c9f0g2b0a0h6jj0"
 *         email:
 *           type: string
 *           example: "user@example.com"
 *         name:
 *           type: string
 *           example: "John Doe"
 *         password:
 *           type: string
 *           example: "password123"
 *         documentNumber:
 *           type: string
 *           example: "123456789"
 *         role:
 *           type: string
 *           enum: [ADMIN, USER]
 *           example: "USER"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2024-12-30T00:00:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2024-12-30T00:00:00Z"
 *       required:
 *         - id
 *         - email
 *         - name
 *         - password
 *         - documentNumber
 *         - role
 *         - createdAt
 *         - updatedAt
 *       additionalProperties: false
 *       description: |
 *         User schema representing a user in the system.
 *         - `id`: Unique identifier for the user.
 *         - `email`: The email address of the user, which must be unique.
 *         - `name`: The name of the user.
 *         - `password`: The password of the user.
 *         - `documentNumber`: The document number of the user.
 *         - `role`: The role of the user, either `ADMIN` or `USER`.
 *         - `createdAt`: Timestamp of user creation.
 *         - `updatedAt`: Timestamp of the last update to the user.
 *       example:
 *         id: "cl1j9c9f0g2b0a0h6jj0"
 *         email: "user@example.com"
 *         name: "John Doe"
 *         password: "password123"
 *         documentNumber: "123456789"
 *         role: "USER"
 *         createdAt: "2024-12-30T00:00:00Z"
 *         updatedAt: "2024-12-30T00:00:00Z"
 * 
 * /user:
 *   post:
 *     summary: Create a new user
 *     description: Create a new user in the system.
 *     security:
 *       - BearerAuth: [] 
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUser'
 *     responses:
 *       200:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *   put:
 *     summary: Update a user
 *     description: Update an existing user's details.
 *     tags:
 *       - Users
 *     security:
 *       - BearerAuth: [] 
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EditUser'
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 * /oauth:
 *   post:
 *     summary: Get OAuth token
 *     description: Authenticate a user and get an OAuth token.
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OauthToken'
 *     responses:
 *       200:
 *         description: OAuth token issued
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   example: "access_token_example"
 *                 refreshToken:
 *                   type: string
 *                   example: "refresh_token_example"
 */

export default (router: Router): void => {
  const baseRoute = '/user'
  const controller = makeUserController()

  router.post(baseRoute, adaptRoute(controller, controller.createUser, { body: createUserSchema }))
  router.post('/oauth', adaptRoute(controller, controller.oauthToken, { body: oauthTokenSchema }))
  router.put(baseRoute, adaptAuthRoute(controller.jwtAdapter) , adaptRoute(controller, controller.editUser, { body: editUserSchema }))
}
