const env = {
  JWT_SECRET: process.env.JWT_SECRET ?? '',
  SECONDARY_JWT_SECRET: process.env.SECONDARY_JWT_SECRET ?? '',
}

export default env