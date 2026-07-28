"use client";
import { useState } from "react";
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  Mail,
  Phone,
  BookOpen,
  Calendar,
  GraduationCap,
  User as UserIcon,
  X,
  Download,
  Users as UsersIcon,
  ShieldBan,
  ShieldCheck,
  Pencil,
  Trash2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Modal } from "@/components/ui/modal";
import { Label } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { TableLoading, EmptyState, ErrorState } from "@/components/ui/states";
import { useApi } from "@/hooks/useApi";
import { exportToExcel } from "@/lib/xlsx-export";
import type { Member } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

const typeMap: Record<string, { label: string; variant: "info" | "default" }> = {
  student: { label: "Student", variant: "info" },
  faculty: { label: "Faculty", variant: "default" },
};

const statusMap: Record<string, { label: string; variant: "success" | "danger" | "warning" }> = {
  active: { label: "Active", variant: "success" },
  suspended: { label: "Suspended", variant: "danger" },
  expired: { label: "Expired", variant: "warning" },
};

const emptyForm = {
  firstName: "", lastName: "", email: "", phone: "",
  type: "student", department: "", year: "", memberId: "",
};

export default function MembersPage() {
  const { toast } = useToast();
  const { data: members, loading, error, reload, setData } = useApi<Member[]>("/api/members");

  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [addModal, setAddModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [busyId, setBusyId] = useState<string | number | null>(null);

  const allMembers = members ?? [];
  const filtered = allMembers.filter((m) => {
    const matchesSearch =
      m.firstName.toLowerCase().includes(search.toLowerCase()) ||
      m.lastName.toLowerCase().includes(search.toLowerCase()) ||
      m.memberId.toLowerCase().includes(search.toLowerCase()) ||
      (m.email || "").toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || m.type === typeFilter;
    const matchesStatus = statusFilter === "all" || m.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const setField = (k: keyof typeof emptyForm, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) {
      toast("First name, last name, and email are required", "error");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          memberId: form.memberId || `STU-${Date.now().toString().slice(-6)}`,
        }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Failed to add member");
      toast("Member registered successfully", "success");
      setAddModal(false);
      setForm(emptyForm);
      reload();
    } catch (err) {
      toast((err as Error).message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (member: Member) => {
    const newStatus = member.status === "active" ? "suspended" : "active";
    setBusyId(member.id);
    try {
      const res = await fetch(`/api/members/${member.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Failed to update member");
      const updated = { ...member, status: newStatus };
      setSelectedMember(updated);
      setData(allMembers.map((m) => (m.id === member.id ? updated : m)));
      toast(`Member ${newStatus === "active" ? "activated" : "suspended"}`, "success");
    } catch (err) {
      toast((err as Error).message, "error");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (member: Member) => {
    setBusyId(member.id);
    try {
      const res = await fetch(`/api/members/${member.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Failed to delete member");
      setData(allMembers.filter((m) => m.id !== member.id));
      setSelectedMember(null);
      toast("Member deleted", "success");
    } catch (err) {
      toast((err as Error).message, "error");
    } finally {
      setBusyId(null);
    }
  };

  const handleExport = () => {
    if (filtered.length === 0) { toast("No members to export", "info"); return; }
    exportToExcel([{
      name: "Members",
      headers: ["Member ID", "First Name", "Last Name", "Email", "Phone", "Type", "Department", "Year", "Status"],
      rows: filtered.map((m) => [m.memberId, m.firstName, m.lastName, m.email, m.phone, m.type, m.department, m.year, m.status]),
    }], "members-export");
    toast(`Exported ${filtered.length} members as Excel`, "success");
  };

  const initials = (m: Member) => `${(m.firstName[0] || "")}${(m.lastName[0] || "")}`;

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title="Member Management"
        description="Manage students, faculty, and library members."
        actions={
          <>
            <Button variant="outline" size="md" onClick={handleExport}><Download className="h-4 w-4" />Export</Button>
            <Button size="md" onClick={() => { setForm(emptyForm); setAddModal(true); }}><Plus className="h-4 w-4" />Add Member</Button>
          </>
        }
      />

      <Card>
        <div className="p-4 border-b border-slate-100 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Input leadingIcon={<Search className="h-4 w-4" />} placeholder="Search members by name, ID, email..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="w-32">
              <option value="all">All Types</option>
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
            </Select>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-32">
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </Select>
          </div>
          <div className="ml-auto flex items-center gap-1 border border-slate-200 rounded-lg p-0.5">
            <button onClick={() => setView("grid")} className={cn("p-1.5 rounded-md transition", view === "grid" ? "bg-white shadow-sm text-primary-600" : "text-slate-400 hover:text-slate-600")}><LayoutGrid className="h-4 w-4" /></button>
            <button onClick={() => setView("list")} className={cn("p-1.5 rounded-md transition", view === "list" ? "bg-white shadow-sm text-primary-600" : "text-slate-400 hover:text-slate-600")}><List className="h-4 w-4" /></button>
          </div>
        </div>

        <CardContent className="p-0">
          {error ? (
            <ErrorState message={error} onRetry={reload} />
          ) : loading ? (
            <div className="p-5"><TableLoading rows={4} /></div>
          ) : filtered.length === 0 ? (
            <EmptyState icon={UsersIcon} title="No members found" description={search || typeFilter !== "all" || statusFilter !== "all" ? "Try adjusting your filters." : "Register your first member to get started."} action={<Button size="sm" onClick={() => { setForm(emptyForm); setAddModal(true); }}><Plus className="h-4 w-4" />Add Member</Button>} />
          ) : view === "grid" ? (
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((m) => {
                const status = statusMap[m.status] ?? statusMap.active;
                const type = typeMap[m.type] ?? typeMap.student;
                return (
                  <Card key={m.id} className="hover:shadow-md hover:shadow-slate-200/60 transition-all cursor-pointer group" onClick={() => setSelectedMember(m)}>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-4">
                        <Avatar className="h-12 w-12 ring-2 ring-white shadow-sm"><AvatarFallback className="text-sm bg-primary-100 text-primary-700">{initials(m)}</AvatarFallback></Avatar>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </div>
                      <h3 className="font-semibold text-slate-900 leading-tight">{m.firstName} {m.lastName}</h3>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">{m.memberId}</p>
                      <div className="mt-3 space-y-1.5">
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                          <GraduationCap className="h-3.5 w-3.5 text-slate-400" /><span className="truncate">{m.department}</span>
                          <Badge variant={type.variant} className="ml-auto text-[10px]">{type.label}</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-600"><Mail className="h-3.5 w-3.5 text-slate-400" /><span className="truncate">{m.email}</span></div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
                        <div className="text-center"><p className="text-base font-bold text-primary-600">{m.borrowedCount}</p><p className="text-[10px] uppercase tracking-wider text-slate-400">Borrowed</p></div>
                        <div className="text-center border-l border-slate-100"><p className="text-base font-bold text-emerald-600">{m.returnedCount}</p><p className="text-[10px] uppercase tracking-wider text-slate-400">Returned</p></div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="text-left font-semibold text-xs text-slate-500 uppercase tracking-wider px-5 py-3">Member</th>
                    <th className="text-left font-semibold text-xs text-slate-500 uppercase tracking-wider px-3 py-3">ID</th>
                    <th className="text-left font-semibold text-xs text-slate-500 uppercase tracking-wider px-3 py-3">Department</th>
                    <th className="text-left font-semibold text-xs text-slate-500 uppercase tracking-wider px-3 py-3">Contact</th>
                    <th className="text-left font-semibold text-xs text-slate-500 uppercase tracking-wider px-3 py-3">Books</th>
                    <th className="text-left font-semibold text-xs text-slate-500 uppercase tracking-wider px-3 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((m) => {
                    const status = statusMap[m.status] ?? statusMap.active;
                    return (
                      <tr key={m.id} className="hover:bg-slate-50/50 cursor-pointer" onClick={() => setSelectedMember(m)}>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9"><AvatarFallback className="text-xs bg-primary-100 text-primary-700">{initials(m)}</AvatarFallback></Avatar>
                            <div><p className="font-medium text-slate-900">{m.firstName} {m.lastName}</p><p className="text-xs text-slate-500">{m.email}</p></div>
                          </div>
                        </td>
                        <td className="px-3 py-3 font-mono text-xs text-slate-600">{m.memberId}</td>
                        <td className="px-3 py-3"><p className="text-sm text-slate-700">{m.department}</p><p className="text-xs text-slate-500">{m.year}</p></td>
                        <td className="px-3 py-3 text-xs text-slate-600">{m.phone}</td>
                        <td className="px-3 py-3"><span className="font-semibold text-primary-600">{m.borrowedCount}</span><span className="text-slate-400 text-xs"> active</span></td>
                        <td className="px-3 py-3"><Badge variant={status.variant}>{status.label}</Badge></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Member Modal */}
      <Modal open={addModal} onClose={() => !submitting && setAddModal(false)} title="Register New Member" description="Add a new student or faculty member to the library." size="lg"
        footer={<><Button variant="outline" onClick={() => setAddModal(false)} disabled={submitting}>Cancel</Button><Button type="submit" form="member-form" disabled={submitting}>{submitting ? "Registering…" : "Register Member"}</Button></>}>
        <form id="member-form" onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><Label>First Name *</Label><Input placeholder="John" value={form.firstName} onChange={(e) => setField("firstName", e.target.value)} /></div>
          <div><Label>Last Name *</Label><Input placeholder="Doe" value={form.lastName} onChange={(e) => setField("lastName", e.target.value)} /></div>
          <div><Label>Email *</Label><Input type="email" placeholder="john@university.edu" value={form.email} onChange={(e) => setField("email", e.target.value)} /></div>
          <div><Label>Phone</Label><Input placeholder="+1 (555) ..." value={form.phone} onChange={(e) => setField("phone", e.target.value)} /></div>
          <div><Label>Member Type *</Label><Select value={form.type} onChange={(e) => setField("type", e.target.value)}><option value="student">Student</option><option value="faculty">Faculty</option></Select></div>
          <div><Label>Department</Label><Input placeholder="e.g. Computer Science" value={form.department} onChange={(e) => setField("department", e.target.value)} /></div>
          <div><Label>Year / Position</Label><Input placeholder="e.g. Junior / Professor" value={form.year} onChange={(e) => setField("year", e.target.value)} /></div>
          <div><Label>Member ID</Label><Input placeholder="Auto-generated if blank" value={form.memberId} onChange={(e) => setField("memberId", e.target.value)} /></div>
        </form>
      </Modal>

      {/* Member Profile Modal */}
      <Modal open={!!selectedMember} onClose={() => setSelectedMember(null)} title="Member Profile" size="lg"
        footer={<>
          <Button variant="outline" onClick={() => setSelectedMember(null)}>Close</Button>
          {selectedMember && <Button variant="outline" onClick={() => handleDelete(selectedMember)} disabled={busyId === selectedMember.id}><Trash2 className="h-4 w-4" />Delete</Button>}
          {selectedMember && (
            <Button variant={selectedMember.status === "active" ? "danger" : "primary"} onClick={() => toggleStatus(selectedMember)} disabled={busyId === selectedMember.id}>
              {selectedMember.status === "active" ? <><ShieldBan className="h-4 w-4" />Suspend</> : <><ShieldCheck className="h-4 w-4" />Activate</>}
            </Button>
          )}
        </>}>
        {selectedMember && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start pb-5 border-b border-slate-100">
              <Avatar className="h-20 w-20 ring-4 ring-primary-50 shadow-md"><AvatarFallback className="text-xl bg-primary-100 text-primary-700">{initials(selectedMember)}</AvatarFallback></Avatar>
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                  <h3 className="text-lg font-bold text-slate-900">{selectedMember.firstName} {selectedMember.lastName}</h3>
                  <Badge variant={(statusMap[selectedMember.status] ?? statusMap.active).variant}>{(statusMap[selectedMember.status] ?? statusMap.active).label}</Badge>
                  <Badge variant={(typeMap[selectedMember.type] ?? typeMap.student).variant}>{(typeMap[selectedMember.type] ?? typeMap.student).label}</Badge>
                </div>
                <p className="text-sm text-slate-500 font-mono mt-1">{selectedMember.memberId}</p>
                <p className="text-sm text-slate-600 mt-2">{selectedMember.department} · {selectedMember.year}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Card className="bg-slate-50 border-0 shadow-none"><CardContent className="p-3 text-center"><p className="text-xl font-bold text-primary-600">{selectedMember.borrowedCount}</p><p className="text-[11px] text-slate-500 uppercase tracking-wider mt-0.5">Currently Borrowed</p></CardContent></Card>
              <Card className="bg-slate-50 border-0 shadow-none"><CardContent className="p-3 text-center"><p className="text-xl font-bold text-emerald-600">{selectedMember.returnedCount}</p><p className="text-[11px] text-slate-500 uppercase tracking-wider mt-0.5">Total Returned</p></CardContent></Card>
              <Card className="bg-slate-50 border-0 shadow-none"><CardContent className="p-3 text-center"><p className="text-xl font-bold text-slate-700">{new Date(selectedMember.joinedAt).getFullYear()}</p><p className="text-[11px] text-slate-500 uppercase tracking-wider mt-0.5">Member Since</p></CardContent></Card>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-3">Contact Information</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50"><Mail className="h-4 w-4 text-slate-400" /><div><p className="text-xs text-slate-500">Email</p><p className="text-sm font-medium text-slate-700">{selectedMember.email}</p></div></div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50"><Phone className="h-4 w-4 text-slate-400" /><div><p className="text-xs text-slate-500">Phone</p><p className="text-sm font-medium text-slate-700">{selectedMember.phone || "—"}</p></div></div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50"><Calendar className="h-4 w-4 text-slate-400" /><div><p className="text-xs text-slate-500">Joined</p><p className="text-sm font-medium text-slate-700">{formatDate(selectedMember.joinedAt)}</p></div></div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50"><UserIcon className="h-4 w-4 text-slate-400" /><div><p className="text-xs text-slate-500">ID</p><p className="text-sm font-medium text-slate-700 font-mono">{selectedMember.memberId}</p></div></div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-3">Recent Borrowing History</h4>
              <div className="rounded-lg border border-slate-200 divide-y divide-slate-100">
                {["Introduction to Algorithms", "Clean Architecture", "Design Patterns"].map((book, i) => (
                  <div key={i} className="flex items-center gap-3 p-3"><BookOpen className="h-4 w-4 text-slate-400" /><span className="text-sm text-slate-700 flex-1">{book}</span><Badge variant={i === 0 ? "info" : "success"}>{i === 0 ? "Borrowed" : "Returned"}</Badge></div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
