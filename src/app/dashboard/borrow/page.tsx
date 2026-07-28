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

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title="Borrow & Return Management"
        description="Issue, return, and track book loans."
        actions={
          <>
            <Button variant="outline" size="md" onClick={handleExport}><Download className="h-4 w-4" />Export</Button>
            <Button size="md" onClick={openIssue}><Plus className="h-4 w-4" />Issue Book</Button>
          </>
        }
      />

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-primary-50 to-white border-primary-100">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600 text-white shadow-sm"><BookOpen className="h-5 w-5" /></div>
            <div><p className="text-xs text-slate-500">Active Loans</p><p className="text-xl font-bold text-slate-900">{borrowedCount}</p></div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-50 to-white border-red-100">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500 text-white shadow-sm"><AlertTriangle className="h-5 w-5" /></div>
            <div><p className="text-xs text-slate-500">Overdue</p><p className="text-xl font-bold text-slate-900">{overdueCount}</p></div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-100">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500 text-white shadow-sm"><CheckCircle2 className="h-5 w-5" /></div>
            <div><p className="text-xs text-slate-500">Returned</p><p className="text-xl font-bold text-slate-900">{returnedCount}</p></div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <div className="p-4 border-b border-slate-100 flex flex-col gap-3">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-thin">
            {[
              { id: "all", label: "All Records", count: allRecords.length },
              { id: "borrowed", label: "Borrowed", count: borrowedCount },
              { id: "overdue", label: "Overdue", count: overdueCount },
              { id: "returned", label: "Returned", count: returnedCount },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
                  activeTab === tab.id ? "bg-primary-50 text-primary-700" : "text-slate-600 hover:bg-slate-100"
                )}
              >
                {tab.label}
                <span className={cn(
                  "ml-1.5 text-xs rounded-full px-1.5 py-0.5",
                  activeTab === tab.id ? "bg-primary-100 text-primary-700" : "bg-slate-100 text-slate-500"
                )}>{tab.count}</span>
              </button>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <div className="relative flex-1 max-w-md">
              <Input
                leadingIcon={<Search className="h-4 w-4" />}
                placeholder="Search by book, member, or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
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
              action={<Button size="sm" onClick={openIssue}><Plus className="h-4 w-4" />Issue Book</Button>}
            />
          ) : (
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="text-left font-semibold text-xs text-slate-500 uppercase tracking-wider px-5 py-3">Book</th>
                    <th className="text-left font-semibold text-xs text-slate-500 uppercase tracking-wider px-3 py-3">Member</th>
                    <th className="text-left font-semibold text-xs text-slate-500 uppercase tracking-wider px-3 py-3">Borrow Date</th>
                    <th className="text-left font-semibold text-xs text-slate-500 uppercase tracking-wider px-3 py-3">Due Date</th>
                    <th className="text-left font-semibold text-xs text-slate-500 uppercase tracking-wider px-3 py-3">Status</th>
                    <th className="text-right font-semibold text-xs text-slate-500 uppercase tracking-wider px-5 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((r) => {
                    const isOverdue = r.status === "overdue";
                    const status = statusMap[r.status] ?? statusMap.borrowed;
                    return (
                      <tr key={r.id} className={cn("hover:bg-slate-50/50 transition-colors", isOverdue && "bg-red-50/30")}>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-slate-400 shrink-0" />
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
                            {isOverdue ? <AlertTriangle className="h-3.5 w-3.5 text-red-500" /> : r.status === "borrowed" ? <Clock className="h-3.5 w-3.5 text-sky-500" /> : <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
                            <span className={cn("text-sm", isOverdue ? "text-red-600 font-medium" : "text-slate-600")}>{formatDate(r.dueDate)}</span>
                          </div>
                          {isOverdue && (
                            <p className="text-[11px] text-red-500 mt-0.5">
                              {Math.max(0, Math.ceil((Date.now() - new Date(r.dueDate).getTime()) / 86400000))} days overdue
                            </p>
                          )}
                        </td>
                        <td className="px-3 py-3"><Badge variant={status.variant}>{status.label}</Badge></td>
                        <td className="px-5 py-3 text-right">
                          {r.status !== "returned" ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReturn(r.id)}
                              disabled={returningId === r.id}
                            >
                              {returningId === r.id ? (
                                <><Clock className="h-3.5 w-3.5 mr-1 animate-spin" />Returning…</>
                              ) : (
                                <><ArrowLeftRight className="h-3.5 w-3.5 mr-1" />Return</>
                              )}
                            </Button>
                          ) : (
                            <span className="text-xs text-slate-400">Returned {formatDate(r.returnDate || "")}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

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
              <Button variant="outline" onClick={() => setIssueModal(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" form="issue-form" disabled={submitting || !issueBookId || !issueMemberId}>
                {submitting ? (
                  <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white mr-2" />Issuing…</>
                ) : (
                  <><ArrowLeftRight className="h-4 w-4 mr-2" />Issue Book</>
                )}
              </Button>
            </div>
          </div>
        }
      >
        <form id="issue-form" onSubmit={handleIssue} className="space-y-6">
          {/* Two-column layout for member and book selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Member Selection with Search */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-primary-600" />
                  <label className="text-sm font-semibold text-slate-700">Member</label>
                  <Badge variant="neutral" className="text-[10px]">Required</Badge>
                </div>
                {memberSearch && (
                  <span className="text-xs text-slate-500">
                    <span className="font-medium text-primary-600">{filteredMembers.length}</span> results
                  </span>
                )}
              </div>
              
              <div className="space-y-2">
                {/* Member Search Input */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search by name or ID..."
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    className="pl-9 h-10 bg-slate-50/50 border-slate-200 focus:bg-white"
                  />
                  {memberSearch && (
                    <button
                      type="button"
                      onClick={() => setMemberSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                
                {/* Member Select Dropdown */}
                <Select
                  value={issueMemberId}
                  onChange={(e) => setIssueMemberId(e.target.value)}
                  className="w-full h-10"
                  required
                >
                  <option value="">Select a member</option>
                  {filteredMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.firstName} {m.lastName} ({m.memberId})
                    </option>
                  ))}
                </Select>
                
                {memberSearch && filteredMembers.length === 0 && (
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <p className="text-xs text-amber-700 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      No members found matching "<strong>{memberSearch}</strong>"
                    </p>
                    <p className="text-[10px] text-amber-600 mt-1">Try adjusting your search terms</p>
                  </div>
                )}
                
                {!memberSearch && members && members.length > 0 && (
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <Users className="h-3 w-3" />
                    <span>{members.length} total members</span>
                  </div>
                )}
              </div>

              {/* Selected Member Card - Fixed height 72px */}
              {selectedMember && (
                <div className="h-[72px] p-3 bg-primary-50 rounded-lg border border-primary-200 animate-in fade-in slide-in-from-top-2 duration-200 flex items-center">
                  <div className="flex items-center gap-3 w-full">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700 font-semibold text-sm">
                      {selectedMember.firstName[0]}{selectedMember.lastName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {selectedMember.firstName} {selectedMember.lastName}
                      </p>
                      <p className="text-xs text-slate-500 font-mono">{selectedMember.memberId}</p>
                    </div>
                    <Badge variant="success" className="shrink-0 text-[10px]">Active</Badge>
                  </div>
                </div>
              )}
            </div>

            {/* Book Selection with Search */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Book className="h-4 w-4 text-primary-600" />
                  <label className="text-sm font-semibold text-slate-700">Book</label>
                  <Badge variant="neutral" className="text-[10px]">Required</Badge>
                </div>
                {bookSearch && (
                  <span className="text-xs text-slate-500">
                    <span className="font-medium text-primary-600">{filteredBooks.length}</span> results
                  </span>
                )}
              </div>
              
              <div className="space-y-2">
                {/* Book Search Input */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search by title, author, ISBN..."
                    value={bookSearch}
                    onChange={(e) => setBookSearch(e.target.value)}
                    className="pl-9 h-10 bg-slate-50/50 border-slate-200 focus:bg-white"
                  />
                  {bookSearch && (
                    <button
                      type="button"
                      onClick={() => setBookSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                
                {/* Book Select Dropdown */}
                <Select
                  value={issueBookId}
                  onChange={(e) => setIssueBookId(e.target.value)}
                  className="w-full h-10"
                  required
                >
                  <option value="">Select a book</option>
                  {filteredBooks.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.title} ({b.availableCopies} available)
                    </option>
                  ))}
                </Select>
                
                {bookSearch && filteredBooks.length === 0 && (
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <p className="text-xs text-amber-700 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      No books found matching "<strong>{bookSearch}</strong>"
                    </p>
                    <p className="text-[10px] text-amber-600 mt-1">Try adjusting your search terms</p>
                  </div>
                )}
                
                {!bookSearch && availableBooks.length === 0 && (
                  <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-xs text-red-700 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      No books currently available for lending
                    </p>
                  </div>
                )}
                
                {!bookSearch && availableBooks.length > 0 && (
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <Library className="h-3 w-3" />
                    <span>{availableBooks.length} books available</span>
                  </div>
                )}
              </div>

              {/* Selected Book Card - Fixed height 72px matching member card */}
              {selectedBook && (
                <div className="h-[72px] p-3 bg-primary-50 rounded-lg border border-primary-200 animate-in fade-in slide-in-from-top-2 duration-200 flex items-center">
                  <div className="flex items-center gap-3 w-full">
                    {selectedBook.cover ? (
                      <img 
                        src={selectedBook.cover} 
                        alt={selectedBook.title}
                        className="h-10 w-8 shrink-0 object-cover rounded border border-slate-200"
                      />
                    ) : (
                      <div className="flex h-10 w-8 shrink-0 items-center justify-center rounded bg-slate-200 text-slate-400">
                        <BookOpen className="h-4 w-4" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{selectedBook.title}</p>
                      <p className="text-xs text-slate-500 truncate">by {selectedBook.author}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Date Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-400" />
                <label className="text-sm font-medium text-slate-700">Borrow Date</label>
              </div>
              <Input
                type="date"
                value={borrowDate}
                onChange={(e) => setBorrowDate(e.target.value)}
                className="h-10"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-slate-400" />
                <label className="text-sm font-medium text-slate-700">Due Date</label>
              </div>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="h-10"
              />
            </div>
          </div>

          {/* Transaction Summary */}
          {(selectedBook || selectedMember) && (
            <div className="p-4 bg-gradient-to-r from-slate-50 to-slate-100/50 rounded-lg border border-slate-200 animate-in fade-in duration-300">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Transaction Summary</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">Member</span>
                  <span className="text-sm font-medium text-slate-900">
                    {selectedMember ? `${selectedMember.firstName} ${selectedMember.lastName}` : '—'}
                  </span>
                  {selectedMember && (
                    <span className="text-xs text-slate-500 font-mono">{selectedMember.memberId}</span>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">Book</span>
                  <span className="text-sm font-medium text-slate-900">
                    {selectedBook ? selectedBook.title : '—'}
                  </span>
                  {selectedBook && (
                    <span className="text-xs text-slate-500">by {selectedBook.author}</span>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">Return Date</span>
                  <span className="text-sm font-medium text-slate-900">{formatDate(dueDate)}</span>
                  <span className="text-xs text-slate-500">
                    {Math.ceil((new Date(dueDate).getTime() - new Date(borrowDate).getTime()) / 86400000)} days loan period
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Status indicator for form completion */}
          {(!issueMemberId || !issueBookId) && (
            <div className="flex items-center gap-2 p-2 bg-amber-50 rounded-lg border border-amber-200">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <p className="text-xs text-amber-700">
                Please select both a <strong>member</strong> and a <strong>book</strong> to issue.
              </p>
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
}