"use client";
import { useState } from "react";
import { Plus, Pencil, Trash2, Tag, User as UserIcon, Search, X } from "lucide-react";
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

const colorClassMap: Record<string, { bg: string; text: string; bar: string; ring: string }> = {
  primary: { bg: "bg-primary-50", text: "text-primary-700", bar: "bg-primary-500", ring: "ring-primary-200" },
  cyan: { bg: "bg-cyan-50", text: "text-cyan-700", bar: "bg-cyan-500", ring: "ring-cyan-200" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-700", bar: "bg-emerald-500", ring: "ring-emerald-200" },
  amber: { bg: "bg-amber-50", text: "text-amber-700", bar: "bg-amber-500", ring: "ring-amber-200" },
  rose: { bg: "bg-rose-50", text: "text-rose-700", bar: "bg-rose-500", ring: "ring-rose-200" },
  violet: { bg: "bg-violet-50", text: "text-violet-700", bar: "bg-violet-500", ring: "ring-violet-200" },
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

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title="Categories & Authors"
        description="Organize your collection by subject categories and author profiles."
        actions={
          <Button size="md" onClick={() => (tab === "categories" ? openAddCategory() : openAddAuthor())}>
            <Plus className="h-4 w-4" />
            {tab === "categories" ? "Add Category" : "Add Author"}
          </Button>
        }
      />

      {/* Tabs */}
      <div className="inline-flex p-1 bg-slate-100 rounded-lg">
        <button onClick={() => setTab("categories")} className={cn("inline-flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all", tab === "categories" ? "bg-white shadow-sm text-slate-900" : "text-slate-600 hover:text-slate-900")}>
          <Tag className="h-4 w-4" />Categories
          <Badge variant="neutral" className="text-[10px] px-1.5 py-0">{allCategories.length}</Badge>
        </button>
        <button onClick={() => setTab("authors")} className={cn("inline-flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all", tab === "authors" ? "bg-white shadow-sm text-slate-900" : "text-slate-600 hover:text-slate-900")}>
          <UserIcon className="h-4 w-4" />Authors
          <Badge variant="neutral" className="text-[10px] px-1.5 py-0">{authors?.length ?? 0}</Badge>
        </button>
      </div>

      {tab === "categories" ? (
        catError ? (
          <Card><ErrorState message={catError} onRetry={reloadCats} /></Card>
        ) : catLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-48 rounded-xl bg-white border border-slate-200 animate-pulse" />)}</div>
        ) : allCategories.length === 0 ? (
          <Card><EmptyState icon={Tag} title="No categories yet" description="Create your first category to organize books." action={<Button size="sm" onClick={openAddCategory}><Plus className="h-4 w-4" />Add Category</Button>} /></Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allCategories.map((cat) => {
              const colors = colorClassMap[cat.color] || colorClassMap.primary;
              const pct = cat.bookCount > 0 ? Math.round((cat.activeBorrows / cat.bookCount) * 100) : 0;
              return (
                <Card key={cat.id} className="hover:shadow-md transition-shadow group overflow-hidden">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl ring-4", colors.bg, colors.text, colors.ring)}><Tag className="h-5 w-5" /></div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditCategory(cat)} className="p-1.5 rounded-md text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition"><Pencil className="h-3.5 w-3.5" /></button>
                        <button onClick={() => setDeleteConfirm({ type: "category", id: cat.id, name: cat.name })} className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </div>
                    <h3 className="font-semibold text-slate-900 text-base">{cat.name}</h3>
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center justify-between text-sm"><span className="text-slate-500">Total Books</span><span className="font-semibold text-slate-900">{(cat.bookCount || 0).toLocaleString()}</span></div>
                      <div className="flex items-center justify-between text-sm"><span className="text-slate-500">Active Borrows</span><span className={cn("font-semibold", colors.text)}>{(cat.activeBorrows || 0).toLocaleString()}</span></div>
                      <div>
                        <div className="flex items-center justify-between text-xs text-slate-500 mb-1"><span>Borrow rate</span><span>{pct}%</span></div>
                        <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden"><div className={cn("h-full rounded-full", colors.bar)} style={{ width: `${pct}%` }} /></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )
      ) : (
        <Card>
          <div className="p-4 border-b border-slate-100">
            <div className="relative max-w-md">
              <Input leadingIcon={<Search className="h-4 w-4" />} placeholder="Search authors..." value={authorSearch} onChange={(e) => setAuthorSearch(e.target.value)} />
            </div>
          </div>
          <CardContent className="p-0">
            {authError ? (
              <ErrorState message={authError} onRetry={reloadAuthors} />
            ) : authLoading ? (
              <TableLoading />
            ) : allAuthors.length === 0 ? (
              <EmptyState icon={UserIcon} title="No authors found" description={authorSearch ? "Try a different search." : "Add your first author to get started."} action={<Button size="sm" onClick={openAddAuthor}><Plus className="h-4 w-4" />Add Author</Button>} />
            ) : (
              <div className="overflow-x-auto scrollbar-thin">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      <th className="text-left font-semibold text-xs text-slate-500 uppercase tracking-wider px-5 py-3">Author</th>
                      <th className="text-left font-semibold text-xs text-slate-500 uppercase tracking-wider px-3 py-3">Nationality</th>
                      <th className="text-left font-semibold text-xs text-slate-500 uppercase tracking-wider px-3 py-3">Books</th>
                      <th className="text-left font-semibold text-xs text-slate-500 uppercase tracking-wider px-3 py-3">Total Borrows</th>
                      <th className="text-right font-semibold text-xs text-slate-500 uppercase tracking-wider px-5 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {allAuthors.map((a) => (
                      <tr key={a.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-slate-100 to-slate-200 ring-2 ring-white shadow-sm">
                              <span className="text-xs font-semibold text-slate-600">{a.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}</span>
                            </div>
                            <div><p className="font-medium text-slate-900">{a.name}</p><p className="text-xs text-slate-500">{a.booksCount || 0} book{a.booksCount !== 1 ? "s" : ""} in catalog</p></div>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-slate-600">{a.nationality || "—"}</td>
                        <td className="px-3 py-3"><Badge variant="neutral">{a.booksCount || 0}</Badge></td>
                        <td className="px-3 py-3"><span className="font-semibold text-primary-600">{(a.totalBorrows || 0).toLocaleString()}</span></td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex items-center gap-1 justify-end">
                            <button onClick={() => openEditAuthor(a)} className="p-1.5 rounded-md text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition"><Pencil className="h-4 w-4" /></button>
                            <button onClick={() => setDeleteConfirm({ type: "author", id: a.id, name: a.name })} className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition"><Trash2 className="h-4 w-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Category Modal */}
      <Modal open={catModal} onClose={() => !submitting && setCatModal(false)} title={editingCat ? "Edit Category" : "Add New Category"} size="sm"
        footer={<><Button variant="outline" onClick={() => setCatModal(false)} disabled={submitting}>Cancel</Button><Button type="submit" form="cat-form" disabled={submitting}>{submitting ? "Saving…" : editingCat ? "Save Changes" : "Create Category"}</Button></>}>
        <form id="cat-form" onSubmit={handleCategorySubmit} className="space-y-4">
          <div><Label>Category Name *</Label><Input placeholder="e.g. Biology" value={catForm.name} onChange={(e) => setCatForm((p) => ({ ...p, name: e.target.value }))} /></div>
          <div>
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {COLOR_KEYS.map((c) => (
                <button key={c} type="button" onClick={() => setCatForm((p) => ({ ...p, color: c }))} className={cn("h-8 w-8 rounded-lg transition ring-offset-2", colorClassMap[c].bar, catForm.color === c ? "ring-2 ring-slate-400 scale-110" : "hover:scale-110")} />
              ))}
            </div>
          </div>
          <div><Label>Description</Label><Textarea placeholder="Brief description of the category..." value={catForm.description} onChange={(e) => setCatForm((p) => ({ ...p, description: e.target.value }))} /></div>
        </form>
      </Modal>

      {/* Add/Edit Author Modal */}
      <Modal open={authModal} onClose={() => !submitting && setAuthModal(false)} title={editingAuth ? "Edit Author" : "Add New Author"} size="md"
        footer={<><Button variant="outline" onClick={() => setAuthModal(false)} disabled={submitting}>Cancel</Button><Button type="submit" form="author-form" disabled={submitting}>{submitting ? "Saving…" : editingAuth ? "Save Changes" : "Add Author"}</Button></>}>
        <form id="author-form" onSubmit={handleAuthorSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2"><Label>Full Name *</Label><Input placeholder="Author name" value={authForm.name} onChange={(e) => setAuthForm((p) => ({ ...p, name: e.target.value }))} /></div>
          <div><Label>Nationality</Label><Input placeholder="e.g. American" value={authForm.nationality} onChange={(e) => setAuthForm((p) => ({ ...p, nationality: e.target.value }))} /></div>
          <div><Label>Birth Year</Label><Input type="number" placeholder="1960" value={authForm.birthYear} onChange={(e) => setAuthForm((p) => ({ ...p, birthYear: e.target.value }))} /></div>
          <div className="md:col-span-2"><Label>Biography</Label><Textarea placeholder="Short biography..." value={authForm.bio} onChange={(e) => setAuthForm((p) => ({ ...p, bio: e.target.value }))} /></div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <Modal open={!!deleteConfirm} onClose={() => !deleting && setDeleteConfirm(null)} title={`Delete ${deleteConfirm?.type === "category" ? "Category" : "Author"}`} description="This action cannot be undone." size="sm"
        footer={<><Button variant="outline" onClick={() => setDeleteConfirm(null)} disabled={deleting}>Cancel</Button><Button variant="danger" onClick={handleDelete} disabled={deleting}>{deleting ? "Deleting…" : "Delete"}</Button></>}>
        <p className="text-sm text-slate-600">
          Are you sure you want to delete <span className="font-semibold text-slate-900">"{deleteConfirm?.name}"</span>?
        </p>
      </Modal>
    </div>
  );
}
