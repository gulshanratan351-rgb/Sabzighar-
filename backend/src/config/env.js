import dotenv from 'dotenv';

dotenv.config();

const env = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sabzighar',
  jwtSecret: process.env.JWT_SECRET || 'sabzighar_dev_secret_change_me',
  jwtExpire: process.env.JWT_EXPIRE || '30d',
  ownerEmail: (process.env.OWNER_EMAIL || 'youradmin@gmail.com').toLowerCase(),
  ownerPassword: process.env.OWNER_PASSWORD || 'Admin@12345',
  ownerName: process.env.OWNER_NAME || 'SabziGhar Owner',
  clientUrls: (process.env.CLIENT_URLS || 'http://localhost:5173,http://localhost:5174,http://localhost:5175')
    .split(',')
    .map((u) => u.trim())
    .filter(Boolean),
  serverUrl: process.env.SERVER_URL || 'http://localhost:5000',
  deliveryCharge: Number(process.env.DELIVERY_CHARGE || 25),
  freeDeliveryAbove: Number(process.env.FREE_DELIVERY_ABOVE || 299),
};

export default env;
