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
  Sparkles,
  ArrowRight,
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
import { motion, AnimatePresence } from "framer-motion";

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

  const gridCardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        delay: i * 0.03,
        type: "spring" as const,
        stiffness: 300,
        damping: 25,
      }
    }),
    hover: {
      y: -8,
      scale: 1.02,
      boxShadow: "0 20px 60px -10px rgba(0,0,0,0.15)",
      transition: {
        type: "spring" as const,
        stiffness: 400,
        damping: 15,
      }
    }
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

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="space-y-5"
    >
      <PageHeader
        title="Member Management"
        description="Manage students, faculty, and library members."
        actions={
          <>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} variants={itemVariants}>
              <Button variant="outline" size="md" onClick={handleExport} className="border-slate-200/60 hover:border-slate-300 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-all duration-200">
                <Download className="h-4 w-4" />Export
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} variants={itemVariants}>
              <Button size="md" onClick={() => { setForm(emptyForm); setAddModal(true); }} className="relative bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 transition-all duration-300 text-white overflow-hidden group">
                <span className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-white/10 to-blue-400/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <Plus className="h-4 w-4 relative z-10" />
                <span className="relative z-10">Add Member</span>
              </Button>
            </motion.div>
          </>
        }
      />

      <motion.div variants={itemVariants} className="space-y-4">
        <Card className="border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="p-4 border-b border-slate-100/60 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1 max-w-md">
              <motion.div whileHover={{ scale: 1.01 }} transition={{ type: "spring", stiffness: 400, damping: 15 }}>
                <Input leadingIcon={<Search className="h-4 w-4" />} placeholder="Search members by name, ID, email..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-11 rounded-xl border-slate-200/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200" />
              </motion.div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="w-32 h-11 rounded-xl border-slate-200/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200">
                <option value="all">All Types</option>
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
              </Select>
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-32 h-11 rounded-xl border-slate-200/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200">
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </Select>
            </div>
            <div className="ml-auto flex items-center gap-1 border border-slate-200/60 rounded-xl p-0.5">
              <motion.button 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
                onClick={() => setView("grid")} 
                className={cn("p-1.5 rounded-lg transition-all duration-200", view === "grid" ? "bg-white shadow-sm text-blue-600" : "text-slate-400 hover:text-slate-600")}
              >
                <LayoutGrid className="h-4 w-4" />
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
                onClick={() => setView("list")} 
                className={cn("p-1.5 rounded-lg transition-all duration-200", view === "list" ? "bg-white shadow-sm text-blue-600" : "text-slate-400 hover:text-slate-600")}
              >
                <List className="h-4 w-4" />
              </motion.button>
            </div>
          </div>

          <CardContent className="p-0">
            {error ? (
              <ErrorState message={error} onRetry={reload} />
            ) : loading ? (
              <div className="p-5"><TableLoading rows={4} /></div>
            ) : filtered.length === 0 ? (
              <EmptyState icon={UsersIcon} title="No members found" description={search || typeFilter !== "all" || statusFilter !== "all" ? "Try adjusting your filters." : "Register your first member to get started."} action={<Button size="sm" onClick={() => { setForm(emptyForm); setAddModal(true); }} className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"><Plus className="h-4 w-4" />Add Member</Button>} />
            ) : view === "grid" ? (
              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filtered.map((m, index) => {
                  const status = statusMap[m.status] ?? statusMap.active;
                  const type = typeMap[m.type] ?? typeMap.student;
                  return (
                    <motion.div
                      key={m.id}
                      custom={index}
                      variants={gridCardVariants}
                      initial="hidden"
                      animate="visible"
                      whileHover="hover"
                      className="cursor-pointer"
                      onClick={() => setSelectedMember(m)}
                    >
                      <Card className="hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-300 group border border-slate-200/60 overflow-hidden">
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between mb-4">
                            <motion.div
                              whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                              transition={{ duration: 0.3 }}
                            >
                              <Avatar className="h-12 w-12 ring-2 ring-white shadow-sm">
                                <AvatarFallback className="text-sm bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700">{initials(m)}</AvatarFallback>
                              </Avatar>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.05 }}>
                              <Badge variant={status.variant}>{status.label}</Badge>
                            </motion.div>
                          </div>
                          <h3 className="font-semibold text-slate-900 leading-tight">{m.firstName} {m.lastName}</h3>
                          <p className="text-xs text-slate-500 font-mono mt-0.5">{m.memberId}</p>
                          <div className="mt-3 space-y-1.5">
                            <div className="flex items-center gap-2 text-xs text-slate-600">
                              <GraduationCap className="h-3.5 w-3.5 text-slate-400" /><span className="truncate">{m.department}</span>
                              <motion.div whileHover={{ scale: 1.05 }}>
                                <Badge variant={type.variant} className="ml-auto text-[10px]">{type.label}</Badge>
                              </motion.div>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-600"><Mail className="h-3.5 w-3.5 text-slate-400" /><span className="truncate">{m.email}</span></div>
                          </div>
                          <div className="mt-4 pt-3 border-t border-slate-100/60 grid grid-cols-2 gap-2">
                            <motion.div 
                              className="text-center"
                              whileHover={{ scale: 1.05 }}
                              transition={{ type: "spring", stiffness: 400, damping: 15 }}
                            >
                              <p className="text-base font-bold text-blue-600">{m.borrowedCount}</p>
                              <p className="text-[10px] uppercase tracking-wider text-slate-400">Borrowed</p>
                            </motion.div>
                            <motion.div 
                              className="text-center border-l border-slate-100/60"
                              whileHover={{ scale: 1.05 }}
                              transition={{ type: "spring", stiffness: 400, damping: 15 }}
                            >
                              <p className="text-base font-bold text-emerald-600">{m.returnedCount}</p>
                              <p className="text-[10px] uppercase tracking-wider text-slate-400">Returned</p>
                            </motion.div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="overflow-x-auto scrollbar-thin">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100/60 bg-slate-50/50">
                      <th className="text-left font-semibold text-xs text-slate-500 uppercase tracking-wider px-5 py-3">Member</th>
                      <th className="text-left font-semibold text-xs text-slate-500 uppercase tracking-wider px-3 py-3">ID</th>
                      <th className="text-left font-semibold text-xs text-slate-500 uppercase tracking-wider px-3 py-3">Department</th>
                      <th className="text-left font-semibold text-xs text-slate-500 uppercase tracking-wider px-3 py-3">Contact</th>
                      <th className="text-left font-semibold text-xs text-slate-500 uppercase tracking-wider px-3 py-3">Books</th>
                      <th className="text-left font-semibold text-xs text-slate-500 uppercase tracking-wider px-3 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/60">
                    {filtered.map((m, index) => {
                      const status = statusMap[m.status] ?? statusMap.active;
                      return (
                        <motion.tr
                          key={m.id}
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
                          className="cursor-pointer group"
                          onClick={() => setSelectedMember(m)}
                        >
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              <motion.div
                                whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                                transition={{ duration: 0.3 }}
                              >
                                <Avatar className="h-9 w-9">
                                  <AvatarFallback className="text-xs bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700">{initials(m)}</AvatarFallback>
                                </Avatar>
                              </motion.div>
                              <div><p className="font-medium text-slate-900">{m.firstName} {m.lastName}</p><p className="text-xs text-slate-500">{m.email}</p></div>
                            </div>
                          </td>
                          <td className="px-3 py-3 font-mono text-xs text-slate-600">{m.memberId}</td>
                          <td className="px-3 py-3"><p className="text-sm text-slate-700">{m.department}</p><p className="text-xs text-slate-500">{m.year}</p></td>
                          <td className="px-3 py-3 text-xs text-slate-600">{m.phone}</td>
                          <td className="px-3 py-3"><span className="font-semibold text-blue-600">{m.borrowedCount}</span><span className="text-slate-400 text-xs"> active</span></td>
                          <td className="px-3 py-3">
                            <motion.div whileHover={{ scale: 1.05 }}>
                              <Badge variant={status.variant}>{status.label}</Badge>
                            </motion.div>
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

      {/* Add Member Modal */}
      <Modal open={addModal} onClose={() => !submitting && setAddModal(false)} title="Register New Member" description="Add a new student or faculty member to the library." size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setAddModal(false)} disabled={submitting} className="border-slate-200/60 hover:border-slate-300 hover:bg-slate-50 transition-all duration-200">Cancel</Button>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button type="submit" form="member-form" disabled={submitting} className="relative bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 transition-all duration-300 text-white overflow-hidden">
                <span className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-white/10 to-blue-400/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                {submitting ? "Registering…" : "Register Member"}
              </Button>
            </motion.div>
          </>
        }>
        <form id="member-form" onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs font-medium text-slate-700 uppercase tracking-wide">First Name *</Label>
            <Input placeholder="John" value={form.firstName} onChange={(e) => setField("firstName", e.target.value)} className="mt-1.5 h-11 rounded-xl border-slate-200/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200" />
          </div>
          <div>
            <Label className="text-xs font-medium text-slate-700 uppercase tracking-wide">Last Name *</Label>
            <Input placeholder="Doe" value={form.lastName} onChange={(e) => setField("lastName", e.target.value)} className="mt-1.5 h-11 rounded-xl border-slate-200/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200" />
          </div>
          <div>
            <Label className="text-xs font-medium text-slate-700 uppercase tracking-wide">Email *</Label>
            <Input type="email" placeholder="john@university.edu" value={form.email} onChange={(e) => setField("email", e.target.value)} className="mt-1.5 h-11 rounded-xl border-slate-200/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200" />
          </div>
          <div>
            <Label className="text-xs font-medium text-slate-700 uppercase tracking-wide">Phone</Label>
            <Input placeholder="+1 (555) ..." value={form.phone} onChange={(e) => setField("phone", e.target.value)} className="mt-1.5 h-11 rounded-xl border-slate-200/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200" />
          </div>
          <div>
            <Label className="text-xs font-medium text-slate-700 uppercase tracking-wide">Member Type *</Label>
            <Select value={form.type} onChange={(e) => setField("type", e.target.value)} className="mt-1.5 h-11 rounded-xl border-slate-200/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200">
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
            </Select>
          </div>
          <div>
            <Label className="text-xs font-medium text-slate-700 uppercase tracking-wide">Department</Label>
            <Input placeholder="e.g. Computer Science" value={form.department} onChange={(e) => setField("department", e.target.value)} className="mt-1.5 h-11 rounded-xl border-slate-200/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200" />
          </div>
          <div>
            <Label className="text-xs font-medium text-slate-700 uppercase tracking-wide">Year / Position</Label>
            <Input placeholder="e.g. Junior / Professor" value={form.year} onChange={(e) => setField("year", e.target.value)} className="mt-1.5 h-11 rounded-xl border-slate-200/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200" />
          </div>
          <div>
            <Label className="text-xs font-medium text-slate-700 uppercase tracking-wide">Member ID</Label>
            <Input placeholder="Auto-generated if blank" value={form.memberId} onChange={(e) => setField("memberId", e.target.value)} className="mt-1.5 h-11 rounded-xl border-slate-200/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200" />
          </div>
        </form>
      </Modal>

      {/* Member Profile Modal with enhanced animations */}
      <Modal open={!!selectedMember} onClose={() => setSelectedMember(null)} title="Member Profile" size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setSelectedMember(null)} className="border-slate-200/60 hover:border-slate-300 hover:bg-slate-50 transition-all duration-200">Close</Button>
            {selectedMember && (
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button variant="outline" onClick={() => handleDelete(selectedMember)} disabled={busyId === selectedMember.id} className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all duration-200">
                  <Trash2 className="h-4 w-4" />Delete
                </Button>
              </motion.div>
            )}
            {selectedMember && (
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  variant={selectedMember.status === "active" ? "danger" : "primary"} 
                  onClick={() => toggleStatus(selectedMember)} 
                  disabled={busyId === selectedMember.id} 
                  className={selectedMember.status === "active" 
                    ? "bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/25 hover:shadow-red-500/35 transition-all duration-300 text-white" 
                    : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 transition-all duration-300 text-white"}
                >
                  {selectedMember.status === "active" ? <><ShieldBan className="h-4 w-4" />Suspend</> : <><ShieldCheck className="h-4 w-4" />Activate</>}
                </Button>
              </motion.div>
            )}
          </>
        }>
        {selectedMember && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start pb-5 border-b border-slate-100/60">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 20 }}
              >
                <Avatar className="h-20 w-20 ring-4 ring-blue-50 shadow-md">
                  <AvatarFallback className="text-xl bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700">{initials(selectedMember)}</AvatarFallback>
                </Avatar>
              </motion.div>
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                  <h3 className="text-lg font-bold text-slate-900">{selectedMember.firstName} {selectedMember.lastName}</h3>
                  <motion.div whileHover={{ scale: 1.05 }}>
                    <Badge variant={(statusMap[selectedMember.status] ?? statusMap.active).variant}>{(statusMap[selectedMember.status] ?? statusMap.active).label}</Badge>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }}>
                    <Badge variant={(typeMap[selectedMember.type] ?? typeMap.student).variant}>{(typeMap[selectedMember.type] ?? typeMap.student).label}</Badge>
                  </motion.div>
                </div>
                <p className="text-sm text-slate-500 font-mono mt-1">{selectedMember.memberId}</p>
                <p className="text-sm text-slate-600 mt-2">{selectedMember.department} · {selectedMember.year}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Currently Borrowed", value: selectedMember.borrowedCount, color: "blue" },
                { label: "Total Returned", value: selectedMember.returnedCount, color: "emerald" },
                { label: "Member Since", value: new Date(selectedMember.joinedAt).getFullYear(), color: "slate" },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="bg-slate-50 rounded-xl border-0 shadow-none"
                >
                  <div className="p-3 text-center">
                    <p className={`text-xl font-bold text-${stat.color}-600`}>{stat.value}</p>
                    <p className="text-[11px] text-slate-500 uppercase tracking-wider mt-0.5">{stat.label}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-500" />
                Contact Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { icon: Mail, label: "Email", value: selectedMember.email },
                  { icon: Phone, label: "Phone", value: selectedMember.phone || "—" },
                  { icon: Calendar, label: "Joined", value: formatDate(selectedMember.joinedAt) },
                  { icon: UserIcon, label: "ID", value: selectedMember.memberId, mono: true },
                ].map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 + index * 0.05 }}
                    whileHover={{ scale: 1.02, x: 2 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100/60 hover:border-blue-200 transition-all duration-200"
                  >
                    <item.icon className="h-4 w-4 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500">{item.label}</p>
                      <p className={cn("text-sm font-medium text-slate-700", item.mono && "font-mono")}>{item.value}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h4 className="text-sm font-semibold text-slate-900 mb-3">Recent Borrowing History</h4>
              <div className="rounded-xl border border-slate-200/60 divide-y divide-slate-100/60">
                {["Introduction to Algorithms", "Clean Architecture", "Design Patterns"].map((book, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 + i * 0.05 }}
                    whileHover={{ scale: 1.01, backgroundColor: "rgba(241, 245, 249, 0.5)" }}
                    className="flex items-center gap-3 p-3 transition-all duration-200"
                  >
                    <BookOpen className="h-4 w-4 text-slate-400" />
                    <span className="text-sm text-slate-700 flex-1">{book}</span>
                    <motion.div whileHover={{ scale: 1.05 }}>
                      <Badge variant={i === 0 ? "info" : "success"}>{i === 0 ? "Borrowed" : "Returned"}</Badge>
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </Modal>
    </motion.div>
  );
}