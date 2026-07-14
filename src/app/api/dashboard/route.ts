import { connectMongo, isMongoConfigured } from "@/lib/mongodb";
import { BorrowRecord, Book, Member, Category } from "@/models";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isMongoConfigured()) {
    return Response.json({
      ok: true,
      data: { activities: [], chartData: [], notifications: [], categoryDistribution: [] },
      source: "empty",
    });
  }

  try {
    await connectMongo();

    // --- Recent Activities (last 20 borrow/return records) ---
    const recentRecords = await BorrowRecord.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
    const activities = recentRecords.map((r) => ({
      id: String(r._id),
      type: r.status === "returned" ? "return" : r.status === "overdue" ? "overdue" : "borrow",
      book: r.bookTitle,
      member: r.memberName,
      memberId: r.memberCode,
      time: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
      status: r.status,

    }));

    // --- Monthly Chart Data (last 12 months) ---
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    const monthlyRecords = await BorrowRecord.find({
      createdAt: { $gte: twelveMonthsAgo },
    }).lean();

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const chartMap: Record<string, { borrows: number; returns: number }> = {};
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = monthNames[d.getMonth()];
      chartMap[key] = { borrows: 0, returns: 0 };
    }
    for (const r of monthlyRecords) {
      const d = new Date(r.createdAt ?? r.borrowDate);
      const key = monthNames[d.getMonth()];
      if (chartMap[key]) {
        if (r.status === "returned") chartMap[key].returns++;
        else chartMap[key].borrows++;
      }
    }
    const chartData = Object.entries(chartMap).map(([name, v]) => ({ name, ...v }));

    // --- Notifications (recent events) ---
    const notifications = recentRecords.slice(0, 5).map((r) => ({
      id: String(r._id),
      title: r.status === "returned" ? "Book returned" : r.status === "overdue" ? "Overdue book" : "Book borrowed",
      message: `${r.memberName} — "${r.bookTitle}"`,
      time: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
      read: false,
      type: r.status === "returned" ? "return" : r.status === "overdue" ? "overdue" : "borrow",
    }));

    // --- Category Distribution (count books per category) ---
    const colorMap: Record<string, string> = {
      primary: "#4f46e5", cyan: "#06b6d4", emerald: "#10b981",
      amber: "#f59e0b", rose: "#ef4444", violet: "#8b5cf6",
    };
    const catAgg = await Book.aggregate([
      { $group: { _id: "$categoryName", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    const categoryDistribution = catAgg.map((c) => ({
      name: c._id || "Uncategorized",
      value: c.count,
      color: "#6366f1",
    }));

    return Response.json({
      ok: true,
      data: { activities, chartData, notifications, categoryDistribution },
      source: "mongodb",
    });
  } catch (err) {
    return Response.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }
}
