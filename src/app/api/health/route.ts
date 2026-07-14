import { connectMongo, isMongoConfigured } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET() {
  const status: Record<string, unknown> = { 
    ok: true,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  };

  // Check MongoDB
  const mongoConfigured = isMongoConfigured();
  status.mongodbConfigured = mongoConfigured;
  status.mongodbUri = mongoConfigured ? 'configured' : 'not configured';

  if (mongoConfigured) {
    try {
      const conn = await connectMongo();
      
      if (conn && conn.connection && conn.connection.readyState === 1) {
        status.mongodb = "ok";
        status.mongodbState = "connected";
        status.mongodbDatabase = conn.connection.name || 'library';
        status.mongodbHost = conn.connection.host || 'unknown';
      } else {
        status.mongodb = "error";
        status.mongodbState = conn?.connection?.readyState || 'unknown';
        status.ok = false;
      }
    } catch (err) {
      status.mongodb = "error";
      status.mongoError = (err as Error).message;
      status.ok = false;
    }
  } else {
    status.mongodb = "not_configured";
    status.mongodbReason = "MONGODB_URI is missing or invalid";
    // In development, don't fail the health check
    if (process.env.NODE_ENV === 'production') {
      status.ok = false;
    }
  }

  // Return 200 in development even if MongoDB is not configured
  const httpStatus = (status.ok || process.env.NODE_ENV === 'development') ? 200 : 500;
  return Response.json(status, { status: httpStatus });
}