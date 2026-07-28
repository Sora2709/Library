"use client";
import { useState, useMemo } from "react";
import {
  Plus,
  Search,
  ArrowLeftRight,
  BookOpen,
  User as UserIcon,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Download,
  X,
  Calendar,
  User,
  Book,
  CalendarDays,
  Users,
  Library,
  Sparkles,
  ChevronDown,
  Filter,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { TableLoading, EmptyState, ErrorState } from "@/components/ui/states";
import { useApi } from "@/hooks/useApi";
import type { Book as BookType, Member as MemberType, BorrowRecord } from "@/lib/types";
import { exportToExcel } from "@/lib/xlsx-export";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// Date formatter for DD/MM/YYYY
const formatDate = (dateString: string) => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const statusMap: Record<string, { variant: "info" | "success" | "warning" | "danger"; label: string }> = {
  borrowed: { variant: "info", label: "Borrowed" },
  returned: { variant: "success", label: "Returned" },
  overdue: { variant: "danger", label: "Overdue" },
};

export default function BorrowPage() {
  const { toast } = useToast();
  const { data: records, loading, error, reload, setData } = useApi<BorrowRecord[]>("/api/borrow");
  const { data: books } = useApi<BookType[]>("/api/books");
  const { data: members } = useApi<MemberType[]>("/api/members");

  const [activeTab, setActiveTab] = useState<"all" | "borrowed" | "overdue" | "returned">("all");
  const [issueModal, setIssueModal] = useState(false);
  const [search, setSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [returningId, setReturningId] = useState<string | number | null>(null);

  // Issue form state
  const [bookSearch, setBookSearch] = useState("");
  const [memberSearch, setMemberSearch] = useState("");
  const [issueBookId, setIssueBookId] = useState("");
  const [issueMemberId, setIssueMemberId] = useState("");
  const [borrowDate, setBorrowDate] = useState(new Date().toISOString().split("T")[0]);
  const dueDefault = (() => { const d = new Date(); d.setDate(d.getDate() + 14); return d.toISOString().split("T")[0]; })();
  const [dueDate, setDueDate] = useState(dueDefault);

  const allRecords = records ?? [];
  const filtered = allRecords.filter((r) => {
    const matchesTab = activeTab === "all" || r.status === activeTab;
    const matchesSearch =
      r.bookTitle.toLowerCase().includes(search.toLowerCase()) ||
      r.memberName.toLowerCase().includes(search.toLowerCase()) ||
      r.memberId.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const overdueCount = allRecords.filter((r) => r.status === "overdue").length;
  const borrowedCount = allRecords.filter((r) => r.status === "borrowed").length;
  const returnedCount = allRecords.filter((r) => r.status === "returned").length;

  // Filter available books with search
  const availableBooks = (books ?? []).filter((b) => b.availableCopies > 0);
  const filteredBooks = useMemo(() => {
    if (!bookSearch.trim()) return availableBooks;
    const searchLower = bookSearch.toLowerCase();
    return availableBooks.filter((b) =>
      b.title.toLowerCase().includes(searchLower) ||
      b.author.toLowerCase().includes(searchLower) ||
      b.isbn.includes(searchLower)
    );
  }, [availableBooks, bookSearch]);

  // Filter members with search
  const filteredMembers = useMemo(() => {
    if (!memberSearch.trim()) return members ?? [];
    const searchLower = memberSearch.toLowerCase();
    return (members ?? []).filter((m) =>
      m.firstName.toLowerCase().includes(searchLower) ||
      m.lastName.toLowerCase().includes(searchLower) ||
      m.memberId.toLowerCase().includes(searchLower) ||
      `${m.firstName} ${m.lastName}`.toLowerCase().includes(searchLower)
    );
  }, [members, memberSearch]);

  const openIssue = () => {
    setIssueBookId(availableBooks[0]?.id ? String(availableBooks[0].id) : "");
    setIssueMemberId(members && members[0]?.id ? String(members[0].id) : "");
    setBorrowDate(new Date().toISOString().split("T")[0]);
    setDueDate(dueDefault);
    setBookSearch("");
    setMemberSearch("");
    setIssueModal(true);
  };

  const handleIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueBookId || !issueMemberId) {
      toast("Please select a book and a member", "error");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/borrow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId: issueBookId, memberId: issueMemberId, borrowDate, dueDate }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Failed to issue book");
      toast("Book issued successfully", "success");
      setIssueModal(false);
      reload();
    } catch (err) {
      toast((err as Error).message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReturn = async (id: string | number) => {
    setReturningId(id);
    try {
      const res = await fetch(`/api/borrow/${id}/return`, { method: "POST" });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Failed to return book");
      toast("Book returned successfully", "success");
      reload();
    } catch (err) {
      toast((err as Error).message, "error");
    } finally {
      setReturningId(null);
    }
  };

  const handleExport = () => {
    if (filtered.length === 0) { toast("No records to export", "info"); return; }
    exportToExcel([{
      name: "Borrow Records",
      headers: ["Book", "Member", "Member ID", "Borrow Date", "Due Date", "Return Date", "Status"],
      rows: filtered.map((r) => [r.bookTitle, r.memberName, r.memberId, formatDate(r.borrowDate), formatDate(r.dueDate), r.returnDate ? formatDate(r.returnDate) : "", r.status]),
    }], "borrow-records-export");
    toast(`Exported ${filtered.length} records as Excel`, "success");
  };

  // Get selected book and member names for display
  const selectedBook = books?.find(b => String(b.id) === issueBookId);
  const selectedMember = members?.find(m => String(m.id) === issueMemberId);

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
      }
    }
  };

  const cardVariants = {
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
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.03,
        type: "spring" as const,
        stiffness: 300,
        damping: 25,
      }
    }),
  };

  const tabVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      transition: {
        delay: i * 0.03,
        type: "spring" as const,
        stiffness: 300,
        damping: 25,
      }
    }),
  };

  // Count animation for stat cards
  const CountAnimation = ({ value, color = "blue" }: { value: number; color?: string }) => {
    const [displayValue, setDisplayValue] = useState(0);

    useState(() => {
      const duration = 500;
      const steps = 20;
      const increment = value / steps;
      let current = 0;
      const interval = setInterval(() => {
        current += increment;
        if (current >= value) {
          setDisplayValue(value);
          clearInterval(interval);
        } else {
          setDisplayValue(Math.floor(current));
        }
      }, duration / steps);
      return () => clearInterval(interval);
    });

    return (
      <motion.p 
        className={`text-xl font-bold text-${color}-600`}
        key={value}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        {displayValue}
      </motion.p>
    );
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="space-y-5"
    >
      <PageHeader
        title="Borrow & Return Management"
        description="Issue, return, and track book loans."
        actions={
          <>
            <motion.div whileHover={{ scale: 1.05, rotate: -2 }} whileTap={{ scale: 0.95 }}>
              <Button variant="outline" size="md" onClick={handleExport} className="border-slate-200/60 hover:border-slate-300 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-all duration-200">
                <Download className="h-4 w-4" />Export
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05, rotate: -2 }} whileTap={{ scale: 0.95 }}>
              <Button size="md" onClick={openIssue} className="relative bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 transition-all duration-300 text-white overflow-hidden group">
                <span className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-white/10 to-blue-400/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <Plus className="h-4 w-4 relative z-10" />
                <span className="relative z-10">Issue Book</span>
              </Button>
            </motion.div>
          </>
        }
      />

      {/* Summary cards with count animation */}
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
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
        <motion.div variants={cardVariants} custom={0}>
          <Card className="border-blue-200/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <CardContent className="p-4 flex items-center gap-3">
              <motion.div 
                whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                transition={{ duration: 0.5 }}
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-sm"
              >
                <BookOpen className="h-5 w-5" />
              </motion.div>
              <div>
                <p className="text-xs text-slate-500">Active Loans</p>
                <CountAnimation value={borrowedCount} color="blue" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div variants={cardVariants} custom={1}>
          <Card className="border-red-200/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <CardContent className="p-4 flex items-center gap-3">
              <motion.div 
                whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                transition={{ duration: 0.5 }}
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-red-600 to-red-700 text-white shadow-sm"
              >
                <AlertTriangle className="h-5 w-5" />
              </motion.div>
              <div>
                <p className="text-xs text-slate-500">Overdue</p>
                <CountAnimation value={overdueCount} color="red" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div variants={cardVariants} custom={2}>
          <Card className="border-emerald-200/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
            <CardContent className="p-4 flex items-center gap-3">
              <motion.div 
                whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                transition={{ duration: 0.5 }}
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-600 to-emerald-700 text-white shadow-sm"
              >
                <CheckCircle2 className="h-5 w-5" />
              </motion.div>
              <div>
                <p className="text-xs text-slate-500">Returned</p>
                <CountAnimation value={returnedCount} color="emerald" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="overflow-hidden">
          <div className="p-4 border-b border-slate-100/60 flex flex-col gap-3">
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-thin pb-1">
              {[
                { id: "all", label: "All Records", count: allRecords.length },
                { id: "borrowed", label: "Borrowed", count: borrowedCount },
                { id: "overdue", label: "Overdue", count: overdueCount },
                { id: "returned", label: "Returned", count: returnedCount },
              ].map((tab, index) => (
                <motion.button
                  key={tab.id}
                  custom={index}
                  variants={tabVariants}
                  initial="hidden"
                  animate="visible"
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200",
                    activeTab === tab.id ? "bg-blue-50 text-blue-700 shadow-sm shadow-blue-500/10" : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  {tab.label}
                  <motion.span 
                    key={tab.count}
                    className={cn(
                      "ml-1.5 text-xs rounded-full px-1.5 py-0.5 transition-all duration-200 inline-block",
                      activeTab === tab.id ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"
                    )}
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  >
                    {tab.count}
                  </motion.span>
                </motion.button>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              <div className="relative flex-1 max-w-md">
                <motion.div whileHover={{ scale: 1.01 }} transition={{ type: "spring", stiffness: 400, damping: 15 }}>
                  <Input
                    leadingIcon={<Search className="h-4 w-4" />}
                    placeholder="Search by book, member, or ID..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-11 rounded-xl border-slate-200/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                  />
                </motion.div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05, rotate: 90 }}
                whileTap={{ scale: 0.95 }}
                onClick={reload}
                className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
              >
                <RefreshCw className="h-4 w-4" />
              </motion.button>
            </div>
          </div>

          <CardContent className="p-0">
            {error ? (
              <ErrorState message={error} onRetry={reload} />
            ) : loading ? (
              <TableLoading />
            ) : filtered.length === 0 ? (
              <EmptyState
                icon={ArrowLeftRight}
                title="No records found"
                description={activeTab !== "all" || search ? "Try adjusting your filters." : "Issue your first book to get started."}
                action={<Button size="sm" onClick={openIssue} className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"><Plus className="h-4 w-4" />Issue Book</Button>}
              />
            ) : (
              <div className="overflow-x-auto scrollbar-thin">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100/60 bg-slate-50/50">
                      <th className="text-left font-semibold text-xs text-slate-500 uppercase tracking-wider px-5 py-3">Book</th>
                      <th className="text-left font-semibold text-xs text-slate-500 uppercase tracking-wider px-3 py-3">Member</th>
                      <th className="text-left font-semibold text-xs text-slate-500 uppercase tracking-wider px-3 py-3">Borrow Date</th>
                      <th className="text-left font-semibold text-xs text-slate-500 uppercase tracking-wider px-3 py-3">Due Date</th>
                      <th className="text-left font-semibold text-xs text-slate-500 uppercase tracking-wider px-3 py-3">Status</th>
                      <th className="text-right font-semibold text-xs text-slate-500 uppercase tracking-wider px-5 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/60">
                    {filtered.map((r, index) => {
                      const isOverdue = r.status === "overdue";
                      const status = statusMap[r.status] ?? statusMap.borrowed;
                      return (
                        <motion.tr
                          key={r.id}
                          custom={index}
                          variants={rowVariants}
                          initial="hidden"
                          animate="visible"
                          whileHover={{ 
                            scale: 1.005,
                            backgroundColor: "rgba(241, 245, 249, 0.5)",
                            transition: { 
                              type: "spring" as const, 
                              stiffness: 400, 
                              damping: 15 
                            }
                          }}
                          className={cn(
                            "transition-colors duration-150 group",
                            isOverdue && "bg-red-50/30"
                          )}
                        >
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2">
                              <motion.div
                                whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                                transition={{ duration: 0.3 }}
                              >
                                <BookOpen className="h-4 w-4 text-slate-400 shrink-0" />
                              </motion.div>
                              <span className="font-medium text-slate-900">{r.bookTitle}</span>
                            </div>
                          </td>
                          <td className="px-3 py-3">
                            <p className="font-medium text-slate-700 text-sm">{r.memberName}</p>
                            <p className="text-xs text-slate-500 font-mono">{r.memberId}</p>
                          </td>
                          <td className="px-3 py-3 text-sm text-slate-600">{formatDate(r.borrowDate)}</td>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-1.5">
                              {isOverdue ? (
                                <motion.div
                                  animate={{ 
                                    scale: [1, 1.2, 1],
                                    opacity: [1, 0.7, 1],
                                  }}
                                  transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                  }}
                                >
                                  <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                                </motion.div>
                              ) : r.status === "borrowed" ? (
                                <Clock className="h-3.5 w-3.5 text-blue-500" />
                              ) : (
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                              )}
                              <span className={cn("text-sm", isOverdue ? "text-red-600 font-medium" : "text-slate-600")}>{formatDate(r.dueDate)}</span>
                            </div>
                            {isOverdue && (
                              <motion.p 
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-[11px] text-red-500 mt-0.5 font-medium"
                              >
                                {Math.max(0, Math.ceil((Date.now() - new Date(r.dueDate).getTime()) / 86400000))} days overdue
                              </motion.p>
                            )}
                          </td>
                          <td className="px-3 py-3">
                            <motion.div whileHover={{ scale: 1.05 }}>
                              <Badge variant={status.variant}>{status.label}</Badge>
                            </motion.div>
                          </td>
                          <td className="px-5 py-3 text-right">
                            {r.status !== "returned" ? (
                              <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleReturn(r.id)}
                                  disabled={returningId === r.id}
                                  className="border-slate-200/60 hover:border-slate-300 hover:bg-slate-50 transition-all duration-200"
                                >
                                  {returningId === r.id ? (
                                    <><Clock className="h-3.5 w-3.5 mr-1 animate-spin" />Returning…</>
                                  ) : (
                                    <><ArrowLeftRight className="h-3.5 w-3.5 mr-1" />Return</>
                                  )}
                                </Button>
                              </motion.div>
                            ) : (
                              <motion.span 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-xs text-slate-400 flex items-center gap-1 justify-end"
                              >
                                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                                Returned {formatDate(r.returnDate || "")}
                              </motion.span>
                            )}
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Issue Book Modal with Search - Equal Height Cards */}
      <Modal
        open={issueModal}
        onClose={() => !submitting && setIssueModal(false)}
        title="Issue New Book"
        description="Search and select a member and book to complete the loan transaction."
        size="lg"
        footer={
          <div className="flex items-center justify-between w-full">
            <div className="text-xs text-slate-500">
              <span className="font-medium text-slate-700">Standard loan period:</span> 14 days
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setIssueModal(false)} disabled={submitting} className="border-slate-200/60 hover:border-slate-300 hover:bg-slate-50 transition-all duration-200">
                Cancel
              </Button>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button type="submit" form="issue-form" disabled={submitting || !issueBookId || !issueMemberId} className="relative bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 transition-all duration-300 text-white overflow-hidden">
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-white/10 to-blue-400/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  {submitting ? (
                    <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white mr-2" />Issuing…</>
                  ) : (
                    <><ArrowLeftRight className="h-4 w-4 mr-2 relative z-10" /><span className="relative z-10">Issue Book</span></>
                  )}
                </Button>
              </motion.div>
            </div>
          </div>
        }
      >
        <form id="issue-form" onSubmit={handleIssue} className="space-y-6">
          {/* Two-column layout for member and book selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Member Selection with Search */}
            <motion.div 
              className="space-y-3"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-600" />
                  <label className="text-sm font-semibold text-slate-700">Member</label>
                  <Badge variant="neutral" className="text-[10px]">Required</Badge>
                </div>
                <AnimatePresence>
                  {memberSearch && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="text-xs text-slate-500"
                    >
                      <span className="font-medium text-blue-600">{filteredMembers.length}</span> results
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              
              <div className="space-y-2">
                {/* Member Search Input */}
                <motion.div className="relative" whileHover={{ scale: 1.01 }} transition={{ type: "spring", stiffness: 400, damping: 15 }}>
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search by name or ID..."
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    className="pl-9 h-11 rounded-xl border-slate-200/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-slate-50/50 focus:bg-white transition-all duration-200"
                  />
                  <AnimatePresence>
                    {memberSearch && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        type="button"
                        onClick={() => setMemberSearch("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors duration-200"
                      >
                        <X className="h-4 w-4" />
                      </motion.button>
                    )}
                  </AnimatePresence>
                </motion.div>
                
                {/* Member Select Dropdown */}
                <Select
                  value={issueMemberId}
                  onChange={(e) => setIssueMemberId(e.target.value)}
                  className="w-full h-11 rounded-xl border-slate-200/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                  required
                >
                  <option value="">Select a member</option>
                  <AnimatePresence>
                    {filteredMembers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.firstName} {m.lastName} ({m.memberId})
                      </option>
                    ))}
                  </AnimatePresence>
                </Select>
                
                <AnimatePresence>
                  {memberSearch && filteredMembers.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="p-3 bg-amber-50 rounded-xl border border-amber-200/60"
                    >
                      <p className="text-xs text-amber-700 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        No members found matching "<strong>{memberSearch}</strong>"
                      </p>
                      <p className="text-[10px] text-amber-600 mt-1">Try adjusting your search terms</p>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {!memberSearch && members && members.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-1 text-xs text-slate-400"
                  >
                    <Users className="h-3 w-3" />
                    <span>{members.length} total members</span>
                  </motion.div>
                )}
              </div>

              {/* Selected Member Card */}
              <AnimatePresence mode="wait">
                {selectedMember && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="h-[72px] p-3 bg-blue-50 rounded-xl border border-blue-200/60 flex items-center"
                  >
                    <div className="flex items-center gap-3 w-full">
                      <motion.div 
                        whileHover={{ scale: 1.1 }}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-semibold text-sm"
                      >
                        {selectedMember.firstName[0]}{selectedMember.lastName[0]}
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {selectedMember.firstName} {selectedMember.lastName}
                        </p>
                        <p className="text-xs text-slate-500 font-mono">{selectedMember.memberId}</p>
                      </div>
                      <Badge variant="success" className="shrink-0 text-[10px] bg-emerald-100 text-emerald-700 border-emerald-200">Active</Badge>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Book Selection with Search */}
            <motion.div 
              className="space-y-3"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Book className="h-4 w-4 text-blue-600" />
                  <label className="text-sm font-semibold text-slate-700">Book</label>
                  <Badge variant="neutral" className="text-[10px]">Required</Badge>
                </div>
                <AnimatePresence>
                  {bookSearch && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="text-xs text-slate-500"
                    >
                      <span className="font-medium text-blue-600">{filteredBooks.length}</span> results
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              
              <div className="space-y-2">
                {/* Book Search Input */}
                <motion.div className="relative" whileHover={{ scale: 1.01 }} transition={{ type: "spring", stiffness: 400, damping: 15 }}>
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search by title, author, ISBN..."
                    value={bookSearch}
                    onChange={(e) => setBookSearch(e.target.value)}
                    className="pl-9 h-11 rounded-xl border-slate-200/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-slate-50/50 focus:bg-white transition-all duration-200"
                  />
                  <AnimatePresence>
                    {bookSearch && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        type="button"
                        onClick={() => setBookSearch("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors duration-200"
                      >
                        <X className="h-4 w-4" />
                      </motion.button>
                    )}
                  </AnimatePresence>
                </motion.div>
                
                {/* Book Select Dropdown */}
                <Select
                  value={issueBookId}
                  onChange={(e) => setIssueBookId(e.target.value)}
                  className="w-full h-11 rounded-xl border-slate-200/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                  required
                >
                  <option value="">Select a book</option>
                  {filteredBooks.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.title} ({b.availableCopies} available)
                    </option>
                  ))}
                </Select>
                
                <AnimatePresence>
                  {bookSearch && filteredBooks.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="p-3 bg-amber-50 rounded-xl border border-amber-200/60"
                    >
                      <p className="text-xs text-amber-700 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        No books found matching "<strong>{bookSearch}</strong>"
                      </p>
                      <p className="text-[10px] text-amber-600 mt-1">Try adjusting your search terms</p>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {!bookSearch && availableBooks.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-3 bg-red-50 rounded-xl border border-red-200/60"
                  >
                    <p className="text-xs text-red-700 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      No books currently available for lending
                    </p>
                  </motion.div>
                )}
                
                {!bookSearch && availableBooks.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-1 text-xs text-slate-400"
                  >
                    <Library className="h-3 w-3" />
                    <span>{availableBooks.length} books available</span>
                  </motion.div>
                )}
              </div>

              {/* Selected Book Card */}
              <AnimatePresence mode="wait">
                {selectedBook && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="h-[72px] p-3 bg-blue-50 rounded-xl border border-blue-200/60 flex items-center"
                  >
                    <div className="flex items-center gap-3 w-full">
                      <motion.div
                        whileHover={{ scale: 1.05, rotate: 2 }}
                        transition={{ type: "spring" as const, stiffness: 300, damping: 20 }}
                      >
                        {selectedBook.cover ? (
                          <img 
                            src={selectedBook.cover} 
                            alt={selectedBook.title}
                            className="h-10 w-8 shrink-0 object-cover rounded border border-slate-200/60"
                          />
                        ) : (
                          <div className="flex h-10 w-8 shrink-0 items-center justify-center rounded bg-slate-200 text-slate-400">
                            <BookOpen className="h-4 w-4" />
                          </div>
                        )}
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{selectedBook.title}</p>
                        <p className="text-xs text-slate-500 truncate">by {selectedBook.author}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Date Selection */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-200/60"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div 
              className="space-y-1.5"
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-400" />
                <label className="text-sm font-medium text-slate-700">Borrow Date</label>
              </div>
              <Input
                type="date"
                value={borrowDate}
                onChange={(e) => setBorrowDate(e.target.value)}
                className="h-11 rounded-xl border-slate-200/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
              />
            </motion.div>
            <motion.div 
              className="space-y-1.5"
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-slate-400" />
                <label className="text-sm font-medium text-slate-700">Due Date</label>
              </div>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="h-11 rounded-xl border-slate-200/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
              />
            </motion.div>
          </motion.div>

          {/* Transaction Summary */}
          <AnimatePresence>
            {(selectedBook || selectedMember) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 bg-gradient-to-r from-slate-50 to-slate-100/50 rounded-xl border border-slate-200/60"
              >
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Sparkles className="h-3 w-3 text-blue-500" />
                  Transaction Summary
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <motion.div 
                    className="flex flex-col"
                    whileHover={{ x: 2 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  >
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">Member</span>
                    <span className="text-sm font-medium text-slate-900">
                      {selectedMember ? `${selectedMember.firstName} ${selectedMember.lastName}` : '—'}
                    </span>
                    {selectedMember && (
                      <span className="text-xs text-slate-500 font-mono">{selectedMember.memberId}</span>
                    )}
                  </motion.div>
                  <motion.div 
                    className="flex flex-col"
                    whileHover={{ x: 2 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  >
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">Book</span>
                    <span className="text-sm font-medium text-slate-900">
                      {selectedBook ? selectedBook.title : '—'}
                    </span>
                    {selectedBook && (
                      <span className="text-xs text-slate-500">by {selectedBook.author}</span>
                    )}
                  </motion.div>
                  <motion.div 
                    className="flex flex-col"
                    whileHover={{ x: 2 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  >
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">Return Date</span>
                    <span className="text-sm font-medium text-slate-900">{formatDate(dueDate)}</span>
                    <span className="text-xs text-slate-500">
                      {Math.ceil((new Date(dueDate).getTime() - new Date(borrowDate).getTime()) / 86400000)} days loan period
                    </span>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Status indicator for form completion */}
          <AnimatePresence>
            {(!issueMemberId || !issueBookId) && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl border border-amber-200/60"
              >
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <p className="text-xs text-amber-700">
                  Please select both a <strong>member</strong> and a <strong>book</strong> to issue.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </Modal>
    </motion.div>
  );
}