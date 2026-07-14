import { connectMongo, isMongoConfigured } from "@/lib/mongodb";
import { Book, BorrowRecord, Member } from "@/models";

export const dynamic = "force-dynamic";

type Period = "12m" | "6m" | "30d" | "year";

function getStartDate(period: Period) {
  const now = new Date();
  const start = new Date(now);

  if (period === "30d") {
    start.setDate(start.getDate() - 29);
    start.setHours(0, 0, 0, 0);
  } else if (period === "6m") {
    start.setMonth(start.getMonth() - 5, 1);
    start.setHours(0, 0, 0, 0);
  } else if (period === "year") {
    start.setMonth(0, 1);
    start.setHours(0, 0, 0, 0);
  } else {
    start.setMonth(start.getMonth() - 11, 1);
    start.setHours(0, 0, 0, 0);
  }

  return start;
}

function chartSlots(period: Period, start: Date) {
  const slots: Array<{ key: string; name: string }> = [];
  const now = new Date();

  if (period === "30d") {
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const key = date.toISOString().slice(0, 10);
      const name = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date);
      slots.push({ key, name });
    }
  } else {
    const months = period === "6m" ? 6 : period === "year" ? now.getMonth() + 1 : 12;
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const name = new Intl.DateTimeFormat("en-US", { month: "short" }).format(date);
      slots.push({ key, name });
    }
  }

  return slots;
}

function bucketKey(value: Date, period: Period) {
  if (period === "30d") return value.toISOString().slice(0, 10);
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}`;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const inputPeriod = url.searchParams.get("period");
  const period: Period = ["12m", "6m", "30d", "year"].includes(inputPeriod ?? "")
    ? (inputPeriod as Period)
    : "12m";

  const start = getStartDate(period);
  const slots = chartSlots(period, start);
  const emptyChart = slots.map((slot) => ({ ...slot, borrows: 0, returns: 0, newMembers: 0 }));

  if (!isMongoConfigured()) {
    return Response.json({
      ok: true,
      source: "empty",
      data: {
        period,
        kpis: { totalBorrows: 0, totalReturns: 0, activeMembers: 0, totalBooks: 0 },
        chartData: emptyChart,
        topBooks: [],
        summary: { activeLoans: 0, overdueBooks: 0, returnRate: 0, newMembers: 0, peakPeriod: "—" },
      },
    });
  }

  try {
    await connectMongo();

    const [records, members, totalBooks, activeMembers, activeLoans, overdueBooks] = await Promise.all([
      BorrowRecord.find({ borrowDate: { $gte: start } }).lean(),
      Member.find({ joinedAt: { $gte: start } }).lean(),
      Book.countDocuments(),
      Member.countDocuments({ status: "active" }),
      BorrowRecord.countDocuments({ status: "borrowed" }),
      BorrowRecord.countDocuments({ status: "overdue" }),
    ]);

    const returnRecords = await BorrowRecord.find({
      status: "returned",
      returnDate: { $gte: start },
    }).lean();

    const chartMap = new Map(emptyChart.map((slot) => [slot.key, { ...slot }]));

    for (const record of records) {
      const date = new Date(record.borrowDate);
      const key = bucketKey(date, period);
      const item = chartMap.get(key);
      if (item) item.borrows += 1;
    }

    for (const record of returnRecords) {
      if (!record.returnDate) continue;
      const date = new Date(record.returnDate);
      const key = bucketKey(date, period);
      const item = chartMap.get(key);
      if (item) item.returns += 1;
    }

    for (const member of members) {
      if (!member.joinedAt) continue;
      const date = new Date(member.joinedAt);
      const key = bucketKey(date, period);
      const item = chartMap.get(key);
      if (item) item.newMembers += 1;
    }

    const topMap = new Map<string, number>();
    for (const record of records) {
      const title = record.bookTitle || "Untitled book";
      topMap.set(title, (topMap.get(title) ?? 0) + 1);
    }
    const topBooks = [...topMap.entries()]
      .map(([title, borrows]) => ({ title, borrows }))
      .sort((a, b) => b.borrows - a.borrows || a.title.localeCompare(b.title))
      .slice(0, 5);

    const chartData = slots.map((slot) => chartMap.get(slot.key) ?? { ...slot, borrows: 0, returns: 0, newMembers: 0 });
    const totalBorrows = records.length;
    const totalReturns = returnRecords.length;
    // Return rate is calculated only from loans that began in the selected
    // period, so it is always a meaningful 0–100% completion percentage.
    const completedLoans = records.filter((record) => record.status === "returned").length;
    const returnRate = totalBorrows > 0 ? Number(((completedLoans / totalBorrows) * 100).toFixed(1)) : 0;
    const peak = chartData.reduce(
      (current, item) => (item.borrows > current.borrows ? item : current),
      chartData[0] ?? { name: "—", borrows: 0 }
    );

    return Response.json({
      ok: true,
      source: "mongodb",
      data: {
        period,
        kpis: { totalBorrows, totalReturns, activeMembers, totalBooks },
        chartData,
        topBooks,
        summary: {
          activeLoans,
          overdueBooks,
          returnRate,
          newMembers: members.length,
          peakPeriod: peak.borrows > 0 ? peak.name : "—",
        },
      },
    });
  } catch (error) {
    return Response.json(
      { ok: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
