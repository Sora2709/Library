import mongoose, { type Mongoose } from "mongoose";

// Hardcode for development - REMOVE THIS IN PRODUCTION
const MONGODB_URI = "mongodb+srv://sambathsora_db_user:Bath2709@sora.ofemqen.mongodb.net/library?retryWrites=true&w=majority&appName=sora";
const MONGODB_DB_NAME = "library";

/**
 * Global cache for mongoose connection
 */
type MongooseCache = {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
};

const globalForMongoose = globalThis as typeof globalThis & {
  __libraria_mongoose?: MongooseCache;
};

const cache: MongooseCache =
  globalForMongoose.__libraria_mongoose ?? { conn: null, promise: null };

if (!globalForMongoose.__libraria_mongoose) {
  globalForMongoose.__libraria_mongoose = cache;
}

export function isMongoConfigured(): boolean {
  return Boolean(
    MONGODB_URI && 
    MONGODB_URI.length > 20 &&
    !MONGODB_URI.includes("<db_password>") &&
    (MONGODB_URI.includes("mongodb://") || MONGODB_URI.includes("mongodb+srv://"))
  );
}

export async function connectMongo(): Promise<Mongoose | null> {
  if (!isMongoConfigured()) {
    return null;
  }

  if (cache.conn) {
    return cache.conn;
  }

  if (!cache.promise) {
    cache.promise = mongoose.connect(MONGODB_URI, {
      dbName: MONGODB_DB_NAME,
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
    });
  }

  try {
    cache.conn = await cache.promise;
    return cache.conn;
  } catch (err) {
    cache.promise = null;
    throw err;
  }
}

export function getMaskedUri(): string {
  if (!MONGODB_URI) return 'not configured';
  return MONGODB_URI.replace(/:[^:]*@/, ':****@');
}