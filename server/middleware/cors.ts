import cors from 'cors';
import { config } from '../lib/env';

const corsOptions = {
  origin: process.env.NODE_ENV === 'production' ? config.app.url : true,
  credentials: true,
};

export const corsMiddleware = cors(corsOptions);
