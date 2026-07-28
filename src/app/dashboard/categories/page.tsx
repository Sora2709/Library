"use client";
import { useState } from "react";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Tag, 
  User as UserIcon, 
  Search, 
  X,
  Sparkles,
  ArrowRight,
  BookOpen,
  TrendingUp,
  Users as UsersIcon,
  Award,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Label, Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { TableLoading, EmptyState, ErrorState } from "@/components/ui/states";
import { useApi } from "@/hooks/useApi";
import type { Category, Author } from "@/lib/types";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const colorClassMap: Record<string, { bg: string; text: string; bar: string; ring: string; light: string }> = {
  primary: { bg: "bg-blue-50", text: "text-blue-700", bar: "bg-blue-500", ring: "ring-blue-200", light: "bg-blue-100" },
  cyan: { bg: "bg-cyan-50", text: "text-cyan-700", bar: "bg-cyan-500", ring: "ring-cyan-200", light: "bg-cyan-100" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-700", bar: "bg-emerald-500", ring: "ring-emerald-200", light: "bg-emerald-100" },
  amber: { bg: "bg-amber-50", text: "text-amber-700", bar: "bg-amber-500", ring: "ring-amber-200", light: "bg-amber-100" },
  rose: { bg: "bg-rose-50", text: "text-rose-700", bar: "bg-rose-500", ring: "ring-rose-200", light: "bg-rose-100" },
  violet: { bg: "bg-violet-50", text: "text-violet-700", bar: "bg-violet-500", ring: "ring-violet-200", light: "bg-violet-100" },
};
const COLOR_KEYS = ["primary", "cyan", "emerald", "amber", "rose", "violet"];

export default function CategoriesPage() {
  const { toast } = useToast();
  const { data: categories, loading: catLoading, error: catError, reload: reloadCats } = useApi<Category[]>("/api/categories");
  const { data: authors, loading: authLoading, error: authError, reload: reloadAuthors } = useApi<Author[]>("/api/authors");

  const [tab, setTab] = useState<"categories" | "authors">("categories");

  // Modals
  const [catModal, setCatModal] = useState(false);
  const [authModal, setAuthModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: "category" | "author"; id: string | number; name: string } | null>(null);

  // Edit state
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [editingAuth, setEditingAuth] = useState<Author | null>(null);

  // Forms
  const [catForm, setCatForm] = useState({ name: "", description: "", color: "primary" });
  const [authForm, setAuthForm] = useState({ name: "", nationality: "", birthYear: "", bio: "" });
  const [authorSearch, setAuthorSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const allCategories = categories ?? [];
  const allAuthors = (authors ?? []).filter((a) =>
    a.name.toLowerCase().includes(authorSearch.toLowerCase()) ||
    (a.nationality || "").toLowerCase().includes(authorSearch.toLowerCase())
  );

  // --- Category handlers ---
  const openAddCategory = () => {
    setEditingCat(null);
    setCatForm({ name: "", description: "", color: "primary" });
    setCatModal(true);
  };

  const openEditCategory = (cat: Category) => {
    setEditingCat(cat);
    setCatForm({ name: cat.name, description: cat.description || "", color: cat.color || "primary" });
    setCatModal(true);
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catForm.name.trim()) { toast("Category name is required", "error"); return; }
    setSubmitting(true);
    try {
      if (editingCat) {
        const res = await fetch(`/api/categories/${editingCat.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(catForm),
        });
        const json = await res.json();
        if (!json.ok) throw new Error(json.error || "Failed to update category");
        toast("Category updated", "success");
      } else {
        const res = await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(catForm),
        });
        const json = await res.json();
        if (!json.ok) throw new Error(json.error || "Failed to add category");
        toast("Category created", "success");
      }
      setCatModal(false);
      reloadCats();
    } catch (err) {
      toast((err as Error).message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  // --- Author handlers ---
  const openAddAuthor = () => {
    setEditingAuth(null);
    setAuthForm({ name: "", nationality: "", birthYear: "", bio: "" });
    setAuthModal(true);
  };

  const openEditAuthor = (a: Author) => {
    setEditingAuth(a);
    setAuthForm({ name: a.name, nationality: a.nationality || "", birthYear: "", bio: "" });
    setAuthModal(true);
  };

  const handleAuthorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authForm.name.trim()) { toast("Author name is required", "error"); return; }
    setSubmitting(true);
    try {
      if (editingAuth) {
        const res = await fetch(`/api/authors/${editingAuth.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: authForm.name, nationality: authForm.nationality }),
        });
        const json = await res.json();
        if (!json.ok) throw new Error(json.error || "Failed to update author");
        toast("Author updated", "success");
      } else {
        const res = await fetch("/api/authors", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: authForm.name, nationality: authForm.nationality, birthYear: authForm.birthYear ? Number(authForm.birthYear) : undefined, bio: authForm.bio }),
        });
        const json = await res.json();
        if (!json.ok) throw new Error(json.error || "Failed to add author");
        toast("Author added", "success");
      }
      setAuthModal(false);
      reloadAuthors();
    } catch (err) {
      toast((err as Error).message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  // --- Delete handler ---
  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      const url = deleteConfirm.type === "category"
        ? `/api/categories/${deleteConfirm.id}`
        : `/api/authors/${deleteConfirm.id}`;
      const res = await fetch(url, { method: "DELETE" });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Failed to delete");
      toast(`${deleteConfirm.type === "category" ? "Category" : "Author"} deleted`, "success");
      setDeleteConfirm(null);
      if (deleteConfirm.type === "category") reloadCats();
      else reloadAuthors();
    } catch (err) {
      toast((err as Error).message, "error");
    } finally {
      setDeleting(false);
    }
  };

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

  const cardVariants = {
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
        title="Categories & Authors"
        description="Organize your collection by subject categories and author profiles."
        actions={
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} variants={itemVariants}>
            <Button size="md" onClick={() => (tab === "categories" ? openAddCategory() : openAddAuthor())} className="relative bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 transition-all duration-300 text-white overflow-hidden group">
              <span className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-white/10 to-blue-400/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <Plus className="h-4 w-4 relative z-10" />
              <span className="relative z-10">{tab === "categories" ? "Add Category" : "Add Author"}</span>
            </Button>
          </motion.div>
        }
      />

      {/* Tabs */}
      <motion.div variants={itemVariants} className="inline-flex p-1 bg-slate-100 rounded-xl">
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setTab("categories")} 
          className={cn("inline-flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200", tab === "categories" ? "bg-white shadow-sm text-slate-900" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50")}
        >
          <Tag className="h-4 w-4" />Categories
          <motion.span 
            key={allCategories.length}
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <Badge variant="neutral" className="text-[10px] px-1.5 py-0 bg-slate-200 text-slate-600">{allCategories.length}</Badge>
          </motion.span>
        </motion.button>
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setTab("authors")} 
          className={cn("inline-flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200", tab === "authors" ? "bg-white shadow-sm text-slate-900" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50")}
        >
          <UserIcon className="h-4 w-4" />Authors
          <motion.span 
            key={authors?.length}
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <Badge variant="neutral" className="text-[10px] px-1.5 py-0 bg-slate-200 text-slate-600">{authors?.length ?? 0}</Badge>
          </motion.span>
        </motion.button>
      </motion.div>

      {tab === "categories" ? (
        catError ? (
          <Card><ErrorState message={catError} onRetry={reloadCats} /></Card>
        ) : catLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="h-48 rounded-xl bg-white border border-slate-200/60 animate-pulse"
              />
            ))}
          </div>
        ) : allCategories.length === 0 ? (
          <Card><EmptyState icon={Tag} title="No categories yet" description="Create your first category to organize books." action={<Button size="sm" onClick={openAddCategory} className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"><Plus className="h-4 w-4" />Add Category</Button>} /></Card>
        ) : (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
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
            {allCategories.map((cat, index) => {
              const colors = colorClassMap[cat.color] || colorClassMap.primary;
              const pct = cat.bookCount > 0 ? Math.round((cat.activeBorrows / cat.bookCount) * 100) : 0;
              return (
                <motion.div
                  key={cat.id}
                  custom={index}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover="hover"
                >
                  <Card className="hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-300 group overflow-hidden border border-slate-200/60">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-4">
                        <motion.div 
                          whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                          transition={{ duration: 0.3 }}
                          className={cn("flex h-11 w-11 items-center justify-center rounded-xl ring-4", colors.bg, colors.text, colors.ring)}
                        >
                          <Tag className="h-5 w-5" />
                        </motion.div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <motion.button 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => openEditCategory(cat)} 
                            className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </motion.button>
                          <motion.button 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setDeleteConfirm({ type: "category", id: cat.id, name: cat.name })} 
                            className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors duration-200"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </motion.button>
                        </div>
                      </div>
                      <h3 className="font-semibold text-slate-900 text-base">{cat.name}</h3>
                      {cat.description && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{cat.description}</p>
                      )}
                      <div className="mt-4 space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-500 flex items-center gap-1">
                            <BookOpen className="h-3 w-3" /> Total Books
                          </span>
                          <span className="font-semibold text-slate-900">{(cat.bookCount || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-500 flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" /> Active Borrows
                          </span>
                          <span className={cn("font-semibold", colors.text)}>{(cat.activeBorrows || 0).toLocaleString()}</span>
                        </div>
                        <div>
                          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                            <span>Borrow rate</span>
                            <span>{pct}%</span>
                          </div>
                          <motion.div 
                            className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                          >
                            <motion.div 
                              className={cn("h-full rounded-full", colors.bar)} 
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.8, ease: "easeOut" }}
                            />
                          </motion.div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )
      ) : (
        <motion.div variants={itemVariants}>
          <Card className="border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="p-4 border-b border-slate-100/60 flex items-center gap-3 flex-wrap">
              <div className="relative flex-1 max-w-md">
                <motion.div whileHover={{ scale: 1.01 }} transition={{ type: "spring", stiffness: 400, damping: 15 }}>
                  <Input leadingIcon={<Search className="h-4 w-4" />} placeholder="Search authors..." value={authorSearch} onChange={(e) => setAuthorSearch(e.target.value)} className="h-11 rounded-xl border-slate-200/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200" />
                </motion.div>
              </div>
              {authorSearch && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => setAuthorSearch("")}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-700"
                >
                  <X className="h-3.5 w-3.5" /> Clear
                </motion.button>
              )}
            </div>
            <CardContent className="p-0">
              {authError ? (
                <ErrorState message={authError} onRetry={reloadAuthors} />
              ) : authLoading ? (
                <TableLoading />
              ) : allAuthors.length === 0 ? (
                <EmptyState icon={UserIcon} title="No authors found" description={authorSearch ? "Try a different search." : "Add your first author to get started."} action={<Button size="sm" onClick={openAddAuthor} className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"><Plus className="h-4 w-4" />Add Author</Button>} />
              ) : (
                <div className="overflow-x-auto scrollbar-thin">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100/60 bg-slate-50/50">
                        <th className="text-left font-semibold text-xs text-slate-500 uppercase tracking-wider px-5 py-3">Author</th>
                        <th className="text-left font-semibold text-xs text-slate-500 uppercase tracking-wider px-3 py-3">Nationality</th>
                        <th className="text-left font-semibold text-xs text-slate-500 uppercase tracking-wider px-3 py-3">Books</th>
                        <th className="text-left font-semibold text-xs text-slate-500 uppercase tracking-wider px-3 py-3">Total Borrows</th>
                        <th className="text-right font-semibold text-xs text-slate-500 uppercase tracking-wider px-5 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100/60">
                      {allAuthors.map((a, index) => (
                        <motion.tr
                          key={a.id}
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
                          className="group"
                        >
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              <motion.div 
                                whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                                transition={{ duration: 0.3 }}
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-blue-200 ring-2 ring-white shadow-sm"
                              >
                                <span className="text-xs font-semibold text-blue-700">{a.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}</span>
                              </motion.div>
                              <div>
                                <p className="font-medium text-slate-900">{a.name}</p>
                                <p className="text-xs text-slate-500">{a.booksCount || 0} book{a.booksCount !== 1 ? "s" : ""} in catalog</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-slate-600">{a.nationality || "—"}</td>
                          <td className="px-3 py-3">
                            <motion.div whileHover={{ scale: 1.05 }}>
                              <Badge variant="neutral" className="bg-slate-100 text-slate-600">{a.booksCount || 0}</Badge>
                            </motion.div>
                          </td>
                          <td className="px-3 py-3">
                            <motion.span 
                              key={a.totalBorrows}
                              initial={{ scale: 0.5 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 300, damping: 25 }}
                              className="font-semibold text-blue-600"
                            >
                              {(a.totalBorrows || 0).toLocaleString()}
                            </motion.span>
                          </td>
                          <td className="px-5 py-3 text-right">
                            <div className="flex items-center gap-1 justify-end">
                              <motion.button 
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => openEditAuthor(a)} 
                                className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200"
                              >
                                <Pencil className="h-4 w-4" />
                              </motion.button>
                              <motion.button 
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setDeleteConfirm({ type: "author", id: a.id, name: a.name })} 
                                className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors duration-200"
                              >
                                <Trash2 className="h-4 w-4" />
                              </motion.button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Add/Edit Category Modal */}
      <Modal open={catModal} onClose={() => !submitting && setCatModal(false)} title={editingCat ? "Edit Category" : "Add New Category"} size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setCatModal(false)} disabled={submitting} className="border-slate-200/60 hover:border-slate-300 hover:bg-slate-50 transition-all duration-200">Cancel</Button>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button type="submit" form="cat-form" disabled={submitting} className="relative bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 transition-all duration-300 text-white overflow-hidden">
                <span className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-white/10 to-blue-400/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                {submitting ? "Saving…" : editingCat ? "Save Changes" : "Create Category"}
              </Button>
            </motion.div>
          </>
        }>
        <form id="cat-form" onSubmit={handleCategorySubmit} className="space-y-4">
          <div>
            <Label className="text-xs font-medium text-slate-700 uppercase tracking-wide">Category Name *</Label>
            <Input placeholder="e.g. Biology" value={catForm.name} onChange={(e) => setCatForm((p) => ({ ...p, name: e.target.value }))} className="mt-1.5 h-11 rounded-xl border-slate-200/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200" />
          </div>
          <div>
            <Label className="text-xs font-medium text-slate-700 uppercase tracking-wide">Color</Label>
            <div className="flex flex-wrap gap-2 mt-1.5">
              {COLOR_KEYS.map((c) => (
                <motion.button 
                  key={c} 
                  type="button" 
                  onClick={() => setCatForm((p) => ({ ...p, color: c }))} 
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  className={cn("h-8 w-8 rounded-lg transition-all duration-200 ring-offset-2", colorClassMap[c].bar, catForm.color === c ? "ring-2 ring-slate-400 scale-110" : "hover:scale-110")} 
                />
              ))}
            </div>
          </div>
          <div>
            <Label className="text-xs font-medium text-slate-700 uppercase tracking-wide">Description</Label>
            <Textarea placeholder="Brief description of the category..." value={catForm.description} onChange={(e) => setCatForm((p) => ({ ...p, description: e.target.value }))} className="mt-1.5 rounded-xl border-slate-200/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-y transition-all duration-200" />
          </div>
        </form>
      </Modal>

      {/* Add/Edit Author Modal */}
      <Modal open={authModal} onClose={() => !submitting && setAuthModal(false)} title={editingAuth ? "Edit Author" : "Add New Author"} size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setAuthModal(false)} disabled={submitting} className="border-slate-200/60 hover:border-slate-300 hover:bg-slate-50 transition-all duration-200">Cancel</Button>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button type="submit" form="author-form" disabled={submitting} className="relative bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 transition-all duration-300 text-white overflow-hidden">
                <span className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-white/10 to-blue-400/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                {submitting ? "Saving…" : editingAuth ? "Save Changes" : "Add Author"}
              </Button>
            </motion.div>
          </>
        }>
        <form id="author-form" onSubmit={handleAuthorSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label className="text-xs font-medium text-slate-700 uppercase tracking-wide">Full Name *</Label>
            <Input placeholder="Author name" value={authForm.name} onChange={(e) => setAuthForm((p) => ({ ...p, name: e.target.value }))} className="mt-1.5 h-11 rounded-xl border-slate-200/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200" />
          </div>
          <div>
            <Label className="text-xs font-medium text-slate-700 uppercase tracking-wide">Nationality</Label>
            <Input placeholder="e.g. American" value={authForm.nationality} onChange={(e) => setAuthForm((p) => ({ ...p, nationality: e.target.value }))} className="mt-1.5 h-11 rounded-xl border-slate-200/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200" />
          </div>
          <div>
            <Label className="text-xs font-medium text-slate-700 uppercase tracking-wide">Birth Year</Label>
            <Input type="number" placeholder="1960" value={authForm.birthYear} onChange={(e) => setAuthForm((p) => ({ ...p, birthYear: e.target.value }))} className="mt-1.5 h-11 rounded-xl border-slate-200/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200" />
          </div>
          <div className="md:col-span-2">
            <Label className="text-xs font-medium text-slate-700 uppercase tracking-wide">Biography</Label>
            <Textarea placeholder="Short biography..." value={authForm.bio} onChange={(e) => setAuthForm((p) => ({ ...p, bio: e.target.value }))} className="mt-1.5 rounded-xl border-slate-200/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-y transition-all duration-200" />
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <Modal open={!!deleteConfirm} onClose={() => !deleting && setDeleteConfirm(null)} title={`Delete ${deleteConfirm?.type === "category" ? "Category" : "Author"}`} description="This action cannot be undone." size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)} disabled={deleting} className="border-slate-200/60 hover:border-slate-300 hover:bg-slate-50 transition-all duration-200">Cancel</Button>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button variant="danger" onClick={handleDelete} disabled={deleting} className="bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/25 hover:shadow-red-500/35 transition-all duration-300 text-white">
                {deleting ? "Deleting…" : "Delete"}
              </Button>
            </motion.div>
          </>
        }>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-sm text-slate-600 leading-relaxed"
        >
          Are you sure you want to delete <span className="font-semibold text-slate-900">"{deleteConfirm?.name}"</span>?
        </motion.p>
        {deleteConfirm && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-3 p-3 bg-red-50 rounded-xl border border-red-200/60"
          >
            <p className="text-xs text-red-600 flex items-center gap-2">
              <AlertTriangle className="h-3.5 w-3.5" />
              This will permanently delete "{deleteConfirm.name}" and remove it from all records.
            </p>
          </motion.div>
        )}
      </Modal>
    </motion.div>
  );
}