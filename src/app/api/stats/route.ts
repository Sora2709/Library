import { getDashboardStats } from "@/lib/data";
import { isMongoConfigured } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getDashboardStats();
  return Response.json({
    ok: true,
    data,
    source: isMongoConfigured() ? "mongodb" : "mock",
  });
}
