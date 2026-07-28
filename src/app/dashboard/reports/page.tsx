// src/app/dashboard/reports/page.tsx
"use client";
import { useState } from "react";
import {
  Download,
  Calendar,
  TrendingUp,
  BookOpen,
  Users,
  ArrowLeftRight,
  Printer,
  BarChart3,
  TrendingDown,
  RefreshCw,
  FileBarChart,
  Library,
  UserPlus,
  AlertTriangle,
  Sparkles,
  ChevronDown,
  Award,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { Loading, ErrorState, EmptyState } from "@/components/ui/states";
import { useApi } from "@/hooks/useApi";
import { exportToExcel } from "@/lib/xlsx-export";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  Area,
  AreaChart,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils"; // Add this import

type Period = "12m" | "6m" | "30d" | "year";

type ChartPoint = {
  key: string;
  name: string;
  borrows: number;
  returns: number;
  newMembers: number;
};

type ReportData = {
  period: Period;
  kpis: {
    totalBorrows: number;
    totalReturns: number;
    activeMembers: number;
    totalBooks: number;
  };
  chartData: ChartPoint[];
  topBooks: { title: string; borrows: number }[];
  summary: {
    activeLoans: number;
    overdueBooks: number;
    returnRate: number;
    newMembers: number;
    peakPeriod: string;
  };
};

const reportTypes = [
  {
    title: "Circulation Report",
    description: "Actual borrows and returns for the selected period.",
    icon: ArrowLeftRight,
    color: "primary",
  },
  {
    title: "Member Activity Report",
    description: "Actual member registrations for the selected period.",
    icon: Users,
    color: "violet",
  },
  {
    title: "Book Inventory Report",
    description: "Live collection and availability data from the catalog.",
    icon: BookOpen,
    color: "emerald",
  },
  {
    title: "Borrow Records Report",
    description: "Complete live borrow and return history.",
    icon: FileBarChart,
    color: "amber",
  },
];

const colorMap: Record<string, { bg: string; text: string; ring: string }> = {
  primary: { bg: "bg-blue-50", text: "text-blue-600", ring: "ring-blue-200" },
  violet: { bg: "bg-violet-50", text: "text-violet-600", ring: "ring-violet-200" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-600", ring: "ring-emerald-200" },
  amber: { bg: "bg-amber-50", text: "text-amber-600", ring: "ring-amber-200" },
};

const periodLabels: Record<Period, string> = {
  "12m": "Last 12 Months",
  "6m": "Last 6 Months",
  "30d": "Last 30 Days",
  year: "This Year",
};

const safeText = (value: unknown): string | number | boolean | null => {
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return value;
  return value == null ? null : String(value);
};

export default function ReportsPage() {
  const { toast } = useToast();
  const [period, setPeriod] = useState<Period>("12m");
  const { data, loading, error, reload } = useApi<ReportData>(`/api/reports?period=${period}`);

  const reportData = data;
  const chartData = reportData?.chartData ?? [];
  const hasActivity = (reportData?.kpis.totalBorrows ?? 0) > 0 || (reportData?.summary.newMembers ?? 0) > 0;

  const exportReport = async (report: (typeof reportTypes)[number]) => {
    if (!reportData) {
      toast("Report data is still loading", "info");
      return;
    }

    try {
      if (report.title === "Circulation Report") {
        exportToExcel(
          [{
            name: "Circulation",
            headers: ["Period", "Borrows", "Returns"],
            rows: chartData.map((m) => [m.name, m.borrows, m.returns]),
          }],
          "circulation-report"
        );
      } else if (report.title === "Member Activity Report") {
        exportToExcel(
          [{
            name: "Member Activity",
            headers: ["Period", "New Members"],
            rows: chartData.map((m) => [m.name, m.newMembers]),
          }],
          "member-activity-report"
        );
      } else if (report.title === "Book Inventory Report") {
        const res = await fetch("/api/books");
        const json = await res.json();
        const books = Array.isArray(json.data) ? json.data : [];
        exportToExcel(
          [{
            name: "Book Inventory",
            headers: ["Title", "Author", "ISBN", "Category", "Available", "Total", "Status"],
            rows: books.map((book: Record<string, unknown>) => [
              safeText(book.title), safeText(book.author), safeText(book.isbn), safeText(book.category),
              safeText(book.availableCopies), safeText(book.totalCopies), safeText(book.status),
            ]),
          }],
          "book-inventory-report"
        );
      } else {
        const res = await fetch("/api/borrow");
        const json = await res.json();
        const records = Array.isArray(json.data) ? json.data : [];
        exportToExcel(
          [{
            name: "Borrow Records",
            headers: ["Book", "Member", "Member ID", "Borrow Date", "Due Date", "Return Date", "Status"],
            rows: records.map((record: Record<string, unknown>) => [
              safeText(record.bookTitle), safeText(record.memberName), safeText(record.memberId),
              safeText(record.borrowDate), safeText(record.dueDate), safeText(record.returnDate), safeText(record.status),
            ]),
          }],
          "borrow-records-report"
        );
      }
      toast(`${report.title} exported as Excel`, "success");
    } catch {
      toast("Failed to export the report", "error");
    }
  };

  const exportAll = async () => {
    if (!reportData) {
      toast("Report data is still loading", "info");
      return;
    }

    try {
      const [booksRes, membersRes, recordsRes] = await Promise.all([
        fetch("/api/books"),
        fetch("/api/members"),
        fetch("/api/borrow"),
      ]);
      const books = (await booksRes.json()).data ?? [];
      const members = (await membersRes.json()).data ?? [];
      const records = (await recordsRes.json()).data ?? [];

      exportToExcel(
        [
          {
            name: "Analytics",
            headers: ["Period", "Borrows", "Returns", "New Members"],
            rows: chartData.map((point) => [point.name, point.borrows, point.returns, point.newMembers]),
          },
          {
            name: "Books",
            headers: ["Title", "Author", "ISBN", "Category", "Available", "Total", "Status"],
            rows: books.map((book: Record<string, unknown>) => [
              safeText(book.title), safeText(book.author), safeText(book.isbn), safeText(book.category),
              safeText(book.availableCopies), safeText(book.totalCopies), safeText(book.status),
            ]),
          },
          {
            name: "Members",
            headers: ["Member ID", "First Name", "Last Name", "Email", "Type", "Department", "Status"],
            rows: members.map((member: Record<string, unknown>) => [
              safeText(member.memberId), safeText(member.firstName), safeText(member.lastName), safeText(member.email),
              safeText(member.type), safeText(member.department), safeText(member.status),
            ]),
          },
          {
            name: "Borrow Records",
            headers: ["Book", "Member", "Borrow Date", "Due Date", "Return Date", "Status"],
            rows: records.map((record: Record<string, unknown>) => [
              safeText(record.bookTitle), safeText(record.memberName), safeText(record.borrowDate),
              safeText(record.dueDate), safeText(record.returnDate), safeText(record.status),
            ]),
          },
        ],
        "library-full-report"
      );
      toast("Full library report exported as Excel", "success");
    } catch {
      toast("Failed to export the full report", "error");
    }
  };

  const kpis = reportData
    ? [
        { label: "Total Borrows", value: reportData.kpis.totalBorrows.toLocaleString(), icon: BookOpen, color: "primary" },
        { label: "Total Returns", value: reportData.kpis.totalReturns.toLocaleString(), icon: ArrowLeftRight, color: "emerald" },
        { label: "Active Members", value: reportData.kpis.activeMembers.toLocaleString(), icon: Users, color: "violet" },
        { label: "Books in Catalog", value: reportData.kpis.totalBooks.toLocaleString(), icon: Library, color: "amber" },
      ]
    : [];

  // Animation variants
  const pageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 25,
        staggerChildren: 0.05,
        delayChildren: 0.1,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 25,
      }
    }
  };

  const kpiVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        delay: i * 0.05,
        type: "spring" as const,
        stiffness: 300,
        damping: 25,
      }
    }),
    hover: {
      y: -4,
      scale: 1.02,
      boxShadow: "0 10px 40px -5px rgba(0,0,0,0.1)",
      transition: {
        type: "spring" as const,
        stiffness: 400,
        damping: 15,
      }
    }
  };

  const summaryItemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        type: "spring" as const,
        stiffness: 300,
        damping: 25,
      }
    }),
    hover: {
      scale: 1.03,
      backgroundColor: "rgba(241, 245, 249, 0.8)",
      transition: {
        type: "spring" as const,
        stiffness: 400,
        damping: 15,
      }
    }
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="space-y-5"
    >
      <PageHeader
        title="Reports & Analytics"
        description="Live library statistics and exportable reports from your database."
        actions={
          <>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} variants={itemVariants}>
              <Button variant="outline" size="md" onClick={() => window.print()} className="border-slate-200/60 hover:border-slate-300 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-all duration-200">
                <Printer className="h-4 w-4" />
                Print
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} variants={itemVariants}>
              <Button size="md" onClick={exportAll} disabled={loading || !reportData} className="relative bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 transition-all duration-300 text-white overflow-hidden group">
                <span className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-white/10 to-blue-400/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <Download className="h-4 w-4 relative z-10" />
                <span className="relative z-10">Export All</span>
              </Button>
            </motion.div>
          </>
        }
      />

      <motion.div variants={itemVariants} className="flex items-center gap-3 flex-wrap">
        <span className="text-sm text-slate-500 font-medium">Period:</span>
        <Select value={period} onChange={(e) => setPeriod(e.target.value as Period)} className="w-44 h-11 rounded-xl border-slate-200/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200">
          <option value="12m">Last 12 Months</option>
          <option value="6m">Last 6 Months</option>
          <option value="30d">Last 30 Days</option>
          <option value="year">This Year</option>
        </Select>
        <motion.button
          whileHover={{ scale: 1.05, rotate: 90 }}
          whileTap={{ scale: 0.95 }}
          onClick={reload}
          className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
        >
          <RefreshCw className="h-4 w-4" />
        </motion.button>
      </motion.div>

      {error ? (
        <Card className="border border-slate-200/60 shadow-sm"><ErrorState message={error} onRetry={reload} /></Card>
      ) : loading ? (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <motion.div 
                key={index} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="h-32 rounded-xl border border-slate-200/60 bg-white animate-pulse" 
              />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="h-[380px] rounded-xl border border-slate-200/60 bg-white animate-pulse" 
            />
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="h-[380px] rounded-xl border border-slate-200/60 bg-white animate-pulse" 
            />
          </div>
        </div>
      ) : reportData ? (
        <>
          {/* KPI Cards */}
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.05,
                  delayChildren: 0.1,
                }
              }
            }}
          >
            {kpis.map((kpi, index) => {
              const Icon = kpi.icon;
              const tone = kpi.color === "emerald" ? "text-emerald-600 bg-emerald-50" : kpi.color === "violet" ? "text-violet-600 bg-violet-50" : kpi.color === "amber" ? "text-amber-600 bg-amber-50" : "text-blue-600 bg-blue-50";
              return (
                <motion.div
                  key={kpi.label}
                  custom={index}
                  variants={kpiVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover="hover"
                >
                  <Card className="border border-slate-200/60 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
                    <CardContent className="p-5 relative">
                      <motion.div 
                        whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                        transition={{ duration: 0.3 }}
                        className={`flex h-10 w-10 items-center justify-center rounded-lg ${tone} mb-3`}
                      >
                        <Icon className="h-5 w-5" />
                      </motion.div>
                      <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">{kpi.label}</p>
                      <motion.p 
                        key={kpi.value}
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="text-2xl font-bold text-slate-900 tracking-tight mt-1"
                      >
                        {kpi.value}
                      </motion.p>
                      <p className="text-xs text-slate-400 mt-1">{periodLabels[period]}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Charts */}
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-2 gap-4"
            variants={itemVariants}
          >
            <motion.div 
              variants={itemVariants}
              whileHover={{ scale: 1.005 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              <Card className="border border-slate-200/60 shadow-sm hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-blue-600" />
                    Monthly Circulation
                  </CardTitle>
                  <CardDescription>Actual borrows vs returns for {periodLabels[period].toLowerCase()}</CardDescription>
                </CardHeader>
                <CardContent>
                  {hasActivity ? (
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                          <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} interval={period === "30d" ? 4 : 0} />
                          <YAxis allowDecimals={false} stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: "rgba(255,255,255,0.95)", 
                              backdropFilter: "blur(12px)",
                              border: "1px solid #e2e8f0", 
                              borderRadius: "12px", 
                              fontSize: "12px", 
                              boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)" 
                            }} 
                          />
                          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px", paddingTop: 8 }} />
                          <Bar dataKey="borrows" name="Borrows" fill="#2563eb" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="returns" name="Returns" fill="#10b981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : <ChartEmpty label="No circulation data for this period" />}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div 
              variants={itemVariants}
              whileHover={{ scale: 1.005 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              <Card className="border border-slate-200/60 shadow-sm hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <UserPlus className="h-4 w-4 text-violet-600" />
                    New Member Signups
                  </CardTitle>
                  <CardDescription>Actual registrations for {periodLabels[period].toLowerCase()}</CardDescription>
                </CardHeader>
                <CardContent>
                  {hasActivity ? (
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorNewMembers" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                          <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} interval={period === "30d" ? 4 : 0} />
                          <YAxis allowDecimals={false} stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: "rgba(255,255,255,0.95)", 
                              backdropFilter: "blur(12px)",
                              border: "1px solid #e2e8f0", 
                              borderRadius: "12px", 
                              fontSize: "12px", 
                              boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)" 
                            }} 
                          />
                          <Area 
                            type="monotone" 
                            dataKey="newMembers" 
                            name="New Members" 
                            stroke="#8b5cf6" 
                            strokeWidth={2.5} 
                            fillOpacity={1} 
                            fill="url(#colorNewMembers)" 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  ) : <ChartEmpty label="No member registrations for this period" />}
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Top Books & Export */}
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-3 gap-4"
            variants={itemVariants}
          >
            <motion.div 
              className="lg:col-span-2"
              variants={itemVariants}
            >
              <Card className="border border-slate-200/60 shadow-sm hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Award className="h-4 w-4 text-amber-500" />
                    Most Borrowed Books
                  </CardTitle>
                  <CardDescription>Live circulation ranking for {periodLabels[period].toLowerCase()}</CardDescription>
                </CardHeader>
                <CardContent>
                  {reportData.topBooks.length === 0 ? (
                    <EmptyState icon={BookOpen} title="No book borrowing data" description="Borrow records created in this period will appear here." />
                  ) : (
                    <div className="space-y-3">
                      {reportData.topBooks.map((book, index) => {
                        const max = reportData.topBooks[0]?.borrows || 1;
                        const isTop = index < 3;
                        return (
                          <motion.div 
                            key={book.title} 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ 
                              scale: 1.01,
                              backgroundColor: "rgba(241, 245, 249, 0.5)",
                              transition: { type: "spring", stiffness: 400, damping: 15 }
                            }}
                            className="flex items-center gap-4 p-2 rounded-lg transition-all duration-200"
                          >
                            <div className={cn(
                              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
                              isTop ? "bg-gradient-to-br from-amber-400 to-amber-500 text-white" : "bg-slate-100 text-slate-600"
                            )}>
                              {isTop ? <Award className="h-4 w-4" /> : index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-900 truncate">{book.title}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="h-1.5 flex-1 max-w-[260px] rounded-full bg-slate-100 overflow-hidden">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(book.borrows / max) * 100}%` }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                    className="h-full bg-blue-500 rounded-full" 
                                  />
                                </div>
                                <span className="text-xs text-slate-500">{book.borrows} borrow{book.borrows !== 1 ? "s" : ""}</span>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="border border-slate-200/60 shadow-sm hover:shadow-xl transition-all duration-300 h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Download className="h-4 w-4 text-blue-600" />
                    Export Reports
                  </CardTitle>
                  <CardDescription>Download live database reports</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {reportTypes.map((report, index) => {
                    const Icon = report.icon;
                    const colors = colorMap[report.color];
                    return (
                      <motion.button 
                        key={report.title} 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => exportReport(report)} 
                        disabled={!reportData}
                        className="w-full flex items-start gap-3 p-3 rounded-xl border border-slate-200/60 hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 group text-left"
                      >
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${colors.bg} ${colors.text} ring-4 ${colors.ring}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 group-hover:text-blue-600 transition-colors duration-200">{report.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{report.description}</p>
                        </div>
                        <Download className="h-4 w-4 text-slate-400 group-hover:text-blue-600 transition-colors duration-200 shrink-0 mt-1" />
                      </motion.button>
                    );
                  })}
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Summary */}
          <motion.div variants={itemVariants}>
            <Card className="border border-slate-200/60 shadow-sm hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-blue-500" />
                  Period Summary
                </CardTitle>
                <CardDescription>Calculated from your live database records</CardDescription>
              </CardHeader>
              <CardContent>
                <motion.div 
                  className="grid grid-cols-2 md:grid-cols-5 gap-4"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: {
                        staggerChildren: 0.05,
                        delayChildren: 0.1,
                      }
                    }
                  }}
                >
                  {[
                    { label: "Active Loans", value: reportData.summary.activeLoans.toLocaleString(), icon: ArrowLeftRight, tone: "text-blue-600" },
                    { label: "Overdue Books", value: reportData.summary.overdueBooks.toLocaleString(), icon: AlertTriangle, tone: "text-amber-600" },
                    { label: "Return Rate", value: `${reportData.summary.returnRate}%`, icon: TrendingUp, tone: "text-emerald-600" },
                    { label: "New Members", value: reportData.summary.newMembers.toLocaleString(), icon: Users, tone: "text-violet-600" },
                    { label: "Peak Borrow Period", value: reportData.summary.peakPeriod, icon: Calendar, tone: "text-sky-600" },
                  ].map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <motion.div 
                        key={item.label}
                        custom={index}
                        variants={summaryItemVariants}
                        initial="hidden"
                        animate="visible"
                        whileHover="hover"
                        className="p-4 rounded-xl bg-slate-50 border border-slate-100/60 transition-all duration-200"
                      >
                        <Icon className={`h-4 w-4 ${item.tone} mb-3`} />
                        <p className="text-xs text-slate-500 font-medium">{item.label}</p>
                        <motion.p 
                          key={item.value}
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: "spring", stiffness: 300, damping: 25 }}
                          className="text-xl font-bold text-slate-900 mt-1 truncate"
                        >
                          {item.value}
                        </motion.p>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      ) : null}
    </motion.div>
  );
}

function ChartEmpty({ label }: { label: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-[300px] flex flex-col items-center justify-center text-center"
    >
      <BarChart3 className="h-8 w-8 text-slate-300 mb-3" />
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="text-xs text-slate-400 mt-1">The chart will update automatically when records are added.</p>
    </motion.div>
  );
}