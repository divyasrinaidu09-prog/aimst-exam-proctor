/**
 * Database Connection Manager for MongoDB Atlas via Mongoose
 *
 * In serverless environments like Vercel, functions are stateless and can be spawned
 * concurrently. Creating a new Mongoose connection on every request risks exhausting
 * MongoDB Atlas connection pool limits.
 *
 * We cache the active mongoose connection in the NodeJS global scope so it persists
 * across warm serverless function invocations.
 */

import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/aimst_proctor';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export function isMongoDisabled(): boolean {
  return (
    process.env.DISABLE_MONGODB === 'true' ||
    !process.env.MONGODB_URI ||
    process.env.MONGODB_URI === 'memory' ||
    process.env.MONGODB_URI === 'none'
  );
}

export async function connectToDatabase(): Promise<typeof mongoose | null> {
  if (isMongoDisabled()) {
    return null;
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((m) => {
      console.log('[Database] Successfully connected to MongoDB Atlas / Local MongoDB');
      return m;
    }).catch((err) => {
      console.warn('[Database] Direct MongoDB connection warning:', err.message);
      // Let the promise resolve or throw so caller handles gracefully
      throw err;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}
