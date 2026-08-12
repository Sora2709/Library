// src/app/dashboard/books/page.tsx
"use client";
import { useState, useRef, useEffect } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  BookOpen,
  Download,
  Upload,
  X,
  Tag,
  Image as ImageIcon,
  Loader2,
  RefreshCw,
  User,
  Sparkles,
  ChevronDown,
  ArrowUpDown,
  Filter,
  LayoutGrid,
  List,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { TableLoading, EmptyState, ErrorState } from "@/components/ui/states";
import { exportToExcel } from "@/lib/xlsx-export";
import { useApi } from "@/hooks/useApi";
import { type Book, type Category } from "@/lib/types";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// Source options
const SOURCE_OPTIONS = [
  { value: "purchase", label: "Purchase" },
  { value: "donation", label: "Donation" },
  { value: "other", label: "Other" },
];

// Book Form Data Type
interface BookFormData {
  title: string;
  author: string;
  isbn: string;
  category: string;
  publisher: string;
  year: string;
  totalCopies: string;
  cover: string;
  coverUrl: string;
  description: string;
  source: string;
  donatedBy: string;
}

function emptyBookForm(): BookFormData {
  return {
    title: "",
    author: "",
    isbn: "",
    category: "",
    publisher: "",
    year: "",
    totalCopies: "1",
    cover: "",
    coverUrl: "",
    description: "",
    source: "",
    donatedBy: "",
  };
}

function bookToForm(book: Book): BookFormData {
  return {
    title: book.title || "",
    author: book.author || "",
    isbn: book.isbn || "",
    category: book.category || "",
    publisher: book.publisher || "",
    year: String(book.year || ""),
    totalCopies: String(book.totalCopies || 1),
    cover: book.cover || "",
    coverUrl: (book as any).coverUrl || book.cover || "",
    description: book.description || "",
    source: (book as any).source || "",
    donatedBy: (book as any).donatedBy || "",
  };
}

// Detail component for view modal with spring animation
function Detail({ label, value, mono, delay = 0 }: { label: string; value: string; mono?: boolean; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring" as const,
        stiffness: 300,
        damping: 25,
        delay,
      }}
      whileHover={{ scale: 1.02, x: 2 }}
      className="p-2 rounded-lg hover:bg-slate-50/50 transition-colors duration-200"
    >
      <p className="text-xs text-slate-500 uppercase tracking-wide">{label}</p>
      <p className={cn("text-sm font-medium text-slate-700", mono && "font-mono")}>{value || "—"}</p>
    </motion.div>
  );
}

// Generate ISBN based on title and author
function generateISBN(title: string, author: string): string {
  if (!title && !author) return "";
  
  const baseString = (title + author).toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (baseString.length === 0) return "";
  
  let hash = 0;
  for (let i = 0; i < baseString.length; i++) {
    const char = baseString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  const seed = Math.abs(hash);
  let isbn = "978";
  let remaining = 10;
  let temp = seed;
  
  for (let i = 0; i < remaining; i++) {
    const digit = temp % 10;
    isbn += digit;
    temp = Math.floor(temp / 10);
    if (temp === 0) {
      temp = seed + i + 1;
    }
  }
  
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(isbn[i]);
    sum += (i % 2 === 0) ? digit : digit * 3;
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  isbn += checkDigit;
  
  return `${isbn.substring(0, 3)}-${isbn.substring(3, 4)}-${isbn.substring(4, 8)}-${isbn.substring(8, 12)}-${isbn.substring(12, 13)}`;
}

// Get source label
function getSourceLabel(value: string): string {
  const option = SOURCE_OPTIONS.find(s => s.value === value);
  return option ? option.label : value;
}

// BookForm component with enhanced animations
function BookForm({ 
  initial, 
  onSubmit, 
  submitLabel, 
  submitting, 
  categories = [],
  onToast,
  isNew = false,
}: { 
  initial: BookFormData; 
  onSubmit: (data: BookFormData) => Promise<void>; 
  submitLabel: string; 
  submitting: boolean; 
  categories?: string[];
  onToast: (message: string, type: "success" | "error" | "info") => void;
  isNew?: boolean;
}) {
  const [form, setForm] = useState<BookFormData>(initial);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showDonatedBy, setShowDonatedBy] = useState(initial.source === "donation");

  // Auto-generate ISBN when title or author changes (only for new books)
  useEffect(() => {
    if (isNew && (form.title || form.author)) {
      const generated = generateISBN(form.title, form.author);
      if (generated) {
        setForm((prev) => ({ ...prev, isbn: generated }));
      }
    }
  }, [form.title, form.author, isNew]);

  // Show/hide donated by field based on source selection
  useEffect(() => {
    setShowDonatedBy(form.source === "donation");
    if (form.source !== "donation") {
      setForm((prev) => ({ ...prev, donatedBy: "" }));
    }
  }, [form.source]);

  const handleGenerateISBN = () => {
    if (!form.title && !form.author) {
      onToast("Please enter a title and author first", "error");
      return;
    }
    setIsGenerating(true);
    const generated = generateISBN(form.title, form.author);
    if (generated) {
      setForm((prev) => ({ ...prev, isbn: generated }));
      onToast("ISBN generated successfully", "success");
    } else {
      onToast("Unable to generate ISBN. Please enter title and author.", "error");
    }
    setIsGenerating(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  // Get the image URL to display
  const imageUrl = form.coverUrl || form.cover;

  return (
    <form id="book-form" onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="md:col-span-2">
          <label className="text-xs font-medium text-slate-700 uppercase tracking-wide block mb-1.5">
            Title <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="Book title"
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            required
            className="h-11 rounded-xl border-slate-200/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
          />
        </div>
        
        <div>
          <label className="text-xs font-medium text-slate-700 uppercase tracking-wide block mb-1.5">
            Author <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="Author name"
            value={form.author}
            onChange={(e) => setForm((p) => ({ ...p, author: e.target.value }))}
            required
            className="h-11 rounded-xl border-slate-200/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
          />
        </div>
        
        <div>
          <label className="text-xs font-medium text-slate-700 uppercase tracking-wide block mb-1.5 flex items-center gap-2">
            ISBN {isNew && <span className="text-xs text-slate-400 font-normal">(auto-generated)</span>}
          </label>
          <div className="relative">
            <Input
              placeholder="978-0-123-45678-9"
              value={form.isbn}
              onChange={(e) => setForm((p) => ({ ...p, isbn: e.target.value }))}
              className="h-11 rounded-xl border-slate-200/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 pr-20 transition-all duration-200"
            />
            {isNew && (
              <button
                type="button"
                onClick={handleGenerateISBN}
                disabled={isGenerating}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-[10px] font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 disabled:opacity-50"
              >
                {isGenerating ? "..." : "Generate"}
              </button>
            )}
          </div>
        </div>
        
        <div>
          <label className="text-xs font-medium text-slate-700 uppercase tracking-wide block mb-1.5">
            Category <span className="text-red-500">*</span>
          </label>
          <Select
            value={form.category}
            onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
            required
            className="h-11 rounded-xl border-slate-200/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </Select>
        </div>
        
        <div>
          <label className="text-xs font-medium text-slate-700 uppercase tracking-wide block mb-1.5">Publisher</label>
          <Input
            placeholder="Publisher name"
            value={form.publisher}
            onChange={(e) => setForm((p) => ({ ...p, publisher: e.target.value }))}
            className="h-11 rounded-xl border-slate-200/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
          />
        </div>
        
        <div>
          <label className="text-xs font-medium text-slate-700 uppercase tracking-wide block mb-1.5">Year</label>
          <Input
            type="number"
            placeholder="2024"
            value={form.year}
            onChange={(e) => setForm((p) => ({ ...p, year: e.target.value }))}
            className="h-11 rounded-xl border-slate-200/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
          />
        </div>
        
        <div>
          <label className="text-xs font-medium text-slate-700 uppercase tracking-wide block mb-1.5">Total Copies</label>
          <Input
            type="number"
            placeholder="1"
            min="1"
            value={form.totalCopies}
            onChange={(e) => setForm((p) => ({ ...p, totalCopies: e.target.value }))}
            className="h-11 rounded-xl border-slate-200/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
          />
        </div>
        
        <div>
          <label className="text-xs font-medium text-slate-700 uppercase tracking-wide block mb-1.5">
            Source <span className="text-slate-400 text-xs font-normal">(optional)</span>
          </label>
          <Select
            value={form.source}
            onChange={(e) => setForm((p) => ({ ...p, source: e.target.value }))}
            className="h-11 rounded-xl border-slate-200/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
          >
            <option value="">Select source</option>
            {SOURCE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>

        {/* Donated By - shows only when Donation is selected */}
        <AnimatePresence mode="wait">
          {showDonatedBy && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              transition={{ duration: 0.3, type: "spring" as const, stiffness: 300, damping: 25 }}
              className="md:col-span-2 overflow-hidden"
            >
              <div className="pt-5 border-t border-slate-200/60">
                <label className="text-xs font-medium text-slate-700 uppercase tracking-wide block mb-1.5">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-600" />
                    Donated By <span className="text-red-500">*</span>
                  </div>
                </label>
                <Input
                  placeholder="Enter donor name"
                  value={form.donatedBy}
                  onChange={(e) => setForm((p) => ({ ...p, donatedBy: e.target.value }))}
                  required={showDonatedBy}
                  className="h-11 rounded-xl border-slate-200/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cover Image URL */}
        <div className="md:col-span-2">
          <label className="text-xs font-medium text-slate-700 uppercase tracking-wide block mb-1.5">Cover Image URL</label>
          <Input
            placeholder="https://example.com/book-cover.jpg"
            value={imageUrl}
            onChange={(e) => {
              const value = e.target.value;
              setForm((p) => ({ ...p, coverUrl: value, cover: value }));
            }}
            className="h-11 rounded-xl border-slate-200/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
          />
          
          {/* Preview with enhanced animations */}
          <AnimatePresence mode="wait">
            {imageUrl && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, rotate: -2 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.8, rotate: 2 }}
                transition={{ type: "spring" as const, stiffness: 300, damping: 25 }}
                className="mt-3 relative inline-block"
              >
                <motion.img
                  src={imageUrl}
                  alt="Book cover preview"
                  className="h-48 w-auto object-contain rounded-xl border border-slate-200/60 shadow-sm"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/uploads/default-book-cover.jpg";
                  }}
                  whileHover={{ scale: 1.05, rotate: 1, boxShadow: "0 10px 40px -5px rgba(0,0,0,0.15)" }}
                  transition={{ type: "spring" as const, stiffness: 300, damping: 20 }}
                />
                <button
                  type="button"
                  onClick={() => {
                    setForm((p) => ({ ...p, coverUrl: "", cover: "" }));
                  }}
                  className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all duration-200 shadow-md hover:shadow-lg"
                  title="Remove image"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          
          {!imageUrl && (
            <div className="mt-3 p-8 border-2 border-dashed border-slate-200/60 rounded-xl text-center text-slate-400 bg-slate-50/50 hover:border-blue-400 hover:bg-blue-50/30 transition-all duration-200">
              <ImageIcon className="h-12 w-12 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-medium text-slate-500">No cover image</p>
              <p className="text-xs mt-1 text-slate-400">Enter a URL above to add a cover</p>
            </div>
          )}
          
          <p className="text-xs text-slate-400 mt-2">
            Enter a direct URL to an image (JPG, PNG, WEBP)
          </p>
        </div>

        <div className="md:col-span-2">
          <label className="text-xs font-medium text-slate-700 uppercase tracking-wide block mb-1.5">Description</label>
          <Textarea
            rows={4}
            placeholder="Book description..."
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            className="rounded-xl border-slate-200/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-y transition-all duration-200"
          />
        </div>
      </div>
    </form>
  );
}

export default function BooksPage() {
  const { toast } = useToast();
  const { data: books, loading, error, reload, setData } = useApi<Book[]>("/api/books");
  const { data: categories } = useApi<Category[]>("/api/categories");

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Modals
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [viewModalBook, setViewModalBook] = useState<Book | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Book | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formKey, setFormKey] = useState(0);

  const allBooks = books ?? [];
  const categoryOptions = categories?.map(c => c.name) || [];

  // Get category color
  const getCategoryColor = (categoryName: string) => {
    const cat = categories?.find(c => c.name === categoryName);
    return cat?.color || "primary";
  };

  const filteredBooks = allBooks.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase()) ||
      (b.isbn && b.isbn.includes(search));
    const matchesCategory = categoryFilter === "all" || b.category === categoryFilter;
    const matchesSource = sourceFilter === "all" || b.source === sourceFilter;
    return matchesSearch && matchesCategory && matchesSource;
  });

  const openAdd = () => {
    setEditingBook(null);
    setFormKey((k) => k + 1);
    setFormModalOpen(true);
  };

  const openEdit = (book: Book) => {
    setEditingBook(book);
    setFormKey((k) => k + 1);
    setFormModalOpen(true);
    setViewModalBook(null);
  };

  const handleSubmit = async (data: BookFormData) => {
    setSubmitting(true);
    try {
      const payload = {
        title: data.title,
        isbn: data.isbn || "",
        author: data.author,
        category: data.category,
        publisher: data.publisher,
        year: data.year ? Number(data.year) : 0,
        totalCopies: Number(data.totalCopies || 1),
        cover: data.coverUrl || data.cover || "",
        description: data.description,
        source: data.source || "",
        donatedBy: data.donatedBy || "",
      };
      
      if (editingBook) {
        const res = await fetch(`/api/books/${editingBook.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!json.ok) throw new Error(json.error || "Failed to update book");
        toast("Book updated successfully", "success");
        setData(allBooks.map((b) => (b.id === editingBook.id ? { ...b, ...payload } : b)));
      } else {
        const res = await fetch("/api/books", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!json.ok) throw new Error(json.error || "Failed to add book");
        toast("Book added successfully", "success");
      }
      setFormModalOpen(false);
      reload();
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/books/${deleteConfirm.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Failed to delete book");
      toast("Book deleted", "success");
      setData(allBooks.filter((b) => (b.id !== deleteConfirm.id)));
      setDeleteConfirm(null);
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setDeleting(false);
    }
  };

  const handleExport = () => {
    if (filteredBooks.length === 0) {
      toast("No books to export", "info");
      return;
    }
    exportToExcel([{
      name: "Books",
      headers: ["Title", "Author", "ISBN", "Category", "Publisher", "Year", "Available", "Total", "Source", "Donated By"],
      rows: filteredBooks.map((b) => [b.title, b.author, b.isbn || "", b.category, b.publisher, b.year, b.availableCopies, b.totalCopies, getSourceLabel(b.source || ""), b.donatedBy || ""]),
    }], "books-export");
    toast(`Exported ${filteredBooks.length} books as Excel`, "success");
  };

  // Page transition
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

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="space-y-5"
    >
      <PageHeader
        title="Book Management"
        description="Manage your library's book catalog, inventory, and metadata."
        actions={
          <>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} variants={itemVariants}>
              <Button variant="outline" size="md" onClick={handleExport} className="border-slate-200/60 hover:border-slate-300 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-all duration-200">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} variants={itemVariants}>
              <Button variant="outline" size="md" onClick={() => toast("Import from CSV coming soon", "info")} className="border-slate-200/60 hover:border-slate-300 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-all duration-200">
                <Upload className="h-4 w-4" />
                Import
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} variants={itemVariants}>
              <Button size="md" onClick={openAdd} className="relative bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 transition-all duration-300 text-white overflow-hidden group">
                <span className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-white/10 to-blue-400/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <Plus className="h-4 w-4 relative z-10" />
                <span className="relative z-10">Add Book</span>
              </Button>
            </motion.div>
          </>
        }
      />

      <motion.div
        variants={itemVariants}
        className="space-y-4"
      >
        <Card>
          {/* Filters */}
          <div className="p-4 border-b border-slate-100/60 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1 max-w-md">
              <Input
                leadingIcon={<Search className="h-4 w-4" />}
                placeholder="Search by title, author, ISBN..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-11 rounded-xl border-slate-200/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="w-40 h-11 rounded-xl border-slate-200/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200">
                <option value="all">All Categories</option>
                {categoryOptions.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Select>
              <Select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)} className="w-40 h-11 rounded-xl border-slate-200/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200">
                <option value="all">All Sources</option>
                {SOURCE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </Select>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setViewMode("table")}
                  className={cn(
                    "p-2 rounded-lg transition-all duration-200",
                    viewMode === "table" ? "bg-blue-50 text-blue-600" : "text-slate-400 hover:bg-slate-100"
                  )}
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "p-2 rounded-lg transition-all duration-200",
                    viewMode === "grid" ? "bg-blue-50 text-blue-600" : "text-slate-400 hover:bg-slate-100"
                  )}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
              </div>
              {(search || categoryFilter !== "all" || sourceFilter !== "all") && (
                <button
                  onClick={() => { setSearch(""); setCategoryFilter("all"); setSourceFilter("all"); }}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 h-11 px-2 transition-colors duration-200"
                >
                  <X className="h-3.5 w-3.5" />
                  Clear
                </button>
              )}
            </div>
            <div className="ml-auto text-xs text-slate-500">
              Showing <span className="font-semibold text-slate-700">{filteredBooks.length}</span> of{" "}
              <span className="font-semibold text-slate-700">{allBooks.length}</span> books
            </div>
          </div>

          {/* Content with view mode toggle */}
          <CardContent className="p-0">
            {error ? (
              <ErrorState message={error} onRetry={reload} />
            ) : loading ? (
              <TableLoading />
            ) : filteredBooks.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="No books found"
                description={search || categoryFilter !== "all" || sourceFilter !== "all" ? "Try adjusting your filters." : "Add your first book to get started."}
                action={<Button size="sm" onClick={openAdd} className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"><Plus className="h-4 w-4" />Add Book</Button>}
              />
            ) : viewMode === "grid" ? (
              /* Grid View */
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4">
                {filteredBooks.map((book, index) => {
                  const catColor = getCategoryColor(book.category);
                  const colors = colorClassMap[catColor] || colorClassMap.primary;
                  return (
                    <motion.div
                      key={book.id}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ 
                        opacity: 1, 
                        y: 0, 
                        scale: 1,
                        transition: {
                          delay: index * 0.03,
                          type: "spring" as const,
                          stiffness: 300,
                          damping: 25,
                        }
                      }}
                      whileHover={{ 
                        y: -8,
                        scale: 1.02,
                        boxShadow: "0 20px 60px -10px rgba(0,0,0,0.15)",
                        transition: {
                          type: "spring" as const,
                          stiffness: 400,
                          damping: 15,
                        }
                      }}
                      className="group relative bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden cursor-pointer"
                      onClick={() => setViewModalBook(book)}
                    >
                      {/* Cover image */}
                      <div className="aspect-[2/3] w-full bg-gradient-to-br from-slate-100 to-slate-200 relative overflow-hidden">
                        {book.cover ? (
                          <motion.img
                            src={book.cover}
                            alt={book.title}
                            className="h-full w-full object-cover"
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: "spring" as const, stiffness: 300, damping: 20 }}
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <BookOpen className="h-12 w-12 text-slate-300" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <span className="text-xs font-medium text-white bg-black/50 px-2 py-0.5 rounded-full">
                            {book.availableCopies}/{book.totalCopies}
                          </span>
                        </div>
                      </div>
                      
                      {/* Book info */}
                      <div className="p-3">
                        <p className="text-sm font-medium text-slate-900 truncate">{book.title}</p>
                        <p className="text-xs text-slate-500 truncate">{book.author}</p>
                        <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                          <Badge variant="neutral" className={cn("text-[10px]", colors.bg, colors.text, colors.border)}>
                            <Tag className="h-2.5 w-2.5 mr-0.5" />
                            {book.category}
                          </Badge>
                          {book.source === "donation" && book.donatedBy && (
                            <span className="text-[9px] text-slate-400">• Donated</span>
                          )}
                        </div>
                      </div>
                      
                      {/* Quick actions overlay */}
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={(e) => { e.stopPropagation(); openEdit(book); }}
                          className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg text-slate-600 hover:text-blue-600 shadow-sm transition-all duration-200"
                          title="Edit"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setDeleteConfirm(book); }}
                          className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg text-slate-600 hover:text-red-600 shadow-sm transition-all duration-200"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              /* Table View */
              <div className="overflow-x-auto scrollbar-thin">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100/60 bg-slate-50/50">
                      <th className="text-left font-semibold text-xs text-slate-500 uppercase tracking-wider px-5 py-3">Book</th>
                      <th className="text-left font-semibold text-xs text-slate-500 uppercase tracking-wider px-3 py-3">ISBN</th>
                      <th className="text-left font-semibold text-xs text-slate-500 uppercase tracking-wider px-3 py-3">Category</th>
                      <th className="text-left font-semibold text-xs text-slate-500 uppercase tracking-wider px-3 py-3">Copies</th>
                      <th className="text-left font-semibold text-xs text-slate-500 uppercase tracking-wider px-3 py-3">Source</th>
                      <th className="text-right font-semibold text-xs text-slate-500 uppercase tracking-wider px-5 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/60">
                    {filteredBooks.map((book, index) => {
                      const catColor = getCategoryColor(book.category);
                      const colors = colorClassMap[catColor] || colorClassMap.primary;
                      return (
                        <motion.tr
                          key={book.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ 
                            opacity: 1, 
                            y: 0,
                            transition: {
                              delay: index * 0.03,
                              type: "spring" as const,
                              stiffness: 300,
                              damping: 25,
                            }
                          }}
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
                                className="h-11 w-8 shrink-0 rounded-sm bg-gradient-to-br from-slate-100 to-slate-200 shadow-sm overflow-hidden border border-slate-200/50 relative"
                                whileHover={{ scale: 1.05, rotate: 2 }}
                                transition={{ type: "spring" as const, stiffness: 300, damping: 20 }}
                              >
                                {book.cover ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={book.cover} alt={book.title} className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center"><BookOpen className="h-3 w-3 text-slate-400" /></div>
                                )}
                              </motion.div>
                              <div className="min-w-0">
                                <p className="font-medium text-slate-900 truncate max-w-[280px]">{book.title}</p>
                                <p className="text-xs text-slate-500 truncate">{book.author}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-3 font-mono text-xs text-slate-600">{book.isbn || "—"}</td>
                          <td className="px-3 py-3">
                            <Badge variant="neutral" className={cn("text-xs", colors.bg, colors.text, colors.border)}>
                              <Tag className="h-3 w-3 mr-1" />
                              {book.category}
                            </Badge>
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-1.5">
                              <span className={cn("font-semibold", book.availableCopies === 0 ? "text-red-600" : book.availableCopies < 5 ? "text-amber-600" : "text-slate-900")}>{book.availableCopies}</span>
                              <span className="text-slate-400 text-xs">/ {book.totalCopies}</span>
                            </div>
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex flex-col">
                              <span className="text-xs text-slate-600">{getSourceLabel(book.source || "")}</span>
                              {book.source === "donation" && book.donatedBy && (
                                <span className="text-[10px] text-slate-400">by {book.donatedBy}</span>
                              )}
                            </div>
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-1 justify-end">
                              <motion.button 
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setViewModalBook(book)} 
                                className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200" 
                                title="View details"
                              >
                                <Eye className="h-4 w-4" />
                              </motion.button>
                              <motion.button 
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => openEdit(book)} 
                                className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200" 
                                title="Edit"
                              >
                                <Pencil className="h-4 w-4" />
                              </motion.button>
                              <motion.button 
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setDeleteConfirm(book)} 
                                className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors duration-200" 
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </motion.button>
                            </div>
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

      {/* Add/Edit Book Modal */}
      <Modal
        open={formModalOpen}
        onClose={() => !submitting && setFormModalOpen(false)}
        title={editingBook ? "Edit Book" : "Add New Book"}
        description={editingBook ? "Update the book details below." : "Enter the book details below to add it to the catalog."}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setFormModalOpen(false)} disabled={submitting} className="border-slate-200/60 hover:border-slate-300 hover:bg-slate-50 transition-all duration-200">Cancel</Button>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button type="submit" form="book-form" disabled={submitting} className="relative bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 transition-all duration-300 text-white overflow-hidden">
                <span className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-white/10 to-blue-400/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2 relative z-10" />
                    <span className="relative z-10">Saving…</span>
                  </>
                ) : (
                  <span className="relative z-10">{editingBook ? "Save Changes" : "Add Book"}</span>
                )}
              </Button>
            </motion.div>
          </>
        }
      >
        <BookForm
          key={formKey}
          initial={editingBook ? bookToForm(editingBook) : emptyBookForm()}
          onSubmit={handleSubmit}
          submitLabel={editingBook ? "Save Changes" : "Add Book"}
          submitting={submitting}
          categories={categoryOptions}
          onToast={toast}
          isNew={!editingBook}
        />
      </Modal>

      {/* View Book Modal with enhanced animations */}
      <Modal
        open={!!viewModalBook}
        onClose={() => setViewModalBook(null)}
        title="Book Details"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setViewModalBook(null)} className="border-slate-200/60 hover:border-slate-300 hover:bg-slate-50 transition-all duration-200">Close</Button>
            {viewModalBook && (
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button onClick={() => openEdit(viewModalBook)} className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 transition-all duration-300 text-white">
                  Edit Book
                </Button>
              </motion.div>
            )}
          </>
        }
      >
        {viewModalBook && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col md:flex-row gap-6"
          >
            <motion.div 
              className="w-full md:w-40 shrink-0 flex items-start justify-center"
              initial={{ opacity: 0, x: -30, rotate: -2 }}
              animate={{ opacity: 1, x: 0, rotate: 0 }}
              transition={{ type: "spring" as const, stiffness: 300, damping: 25, delay: 0.1 }}
            >
              <motion.div 
                className="h-56 w-40 rounded-md bg-gradient-to-br from-slate-100 to-slate-200 shadow-md border border-slate-200/60 overflow-hidden"
                whileHover={{ scale: 1.03, rotate: 1, boxShadow: "0 10px 40px -5px rgba(0,0,0,0.15)" }}
                transition={{ type: "spring" as const, stiffness: 300, damping: 20 }}
              >
                {viewModalBook.cover ? (
                  <img src={viewModalBook.cover} alt={viewModalBook.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center"><BookOpen className="h-8 w-8 text-slate-400" /></div>
                )}
              </motion.div>
            </motion.div>
            <div className="flex-1 space-y-4">
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <h3 className="text-lg font-bold text-slate-900">{viewModalBook.title}</h3>
                <p className="text-sm text-slate-500">by {viewModalBook.author}</p>
              </motion.div>
              <div className="grid grid-cols-2 gap-3">
                <Detail label="ISBN" value={viewModalBook.isbn || "—"} mono delay={0.1} />
                <Detail label="Category" value={viewModalBook.category} delay={0.15} />
                <Detail label="Publisher" value={viewModalBook.publisher} delay={0.2} />
                <Detail label="Year" value={String(viewModalBook.year)} delay={0.25} />
                <Detail label="Source" value={getSourceLabel(viewModalBook.source || "")} delay={0.3} />
                {viewModalBook.source === "donation" && viewModalBook.donatedBy && (
                  <Detail label="Donated By" value={viewModalBook.donatedBy} delay={0.35} />
                )}
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="p-2 rounded-lg bg-emerald-50/50 border border-emerald-100/50"
                >
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Available</p>
                  <p className="text-sm font-semibold text-emerald-600">{viewModalBook.availableCopies} of {viewModalBook.totalCopies} copies</p>
                </motion.div>
              </div>
              {viewModalBook.description && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Description</p>
                  <p className="text-sm text-slate-600 leading-relaxed">{viewModalBook.description}</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </Modal>

      {/* Delete Confirmation with enhanced animations */}
      <Modal
        open={!!deleteConfirm}
        onClose={() => !deleting && setDeleteConfirm(null)}
        title="Delete Book"
        description="This action cannot be undone."
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)} disabled={deleting} className="border-slate-200/60 hover:border-slate-300 hover:bg-slate-50 transition-all duration-200">Cancel</Button>
            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              animate={deleting ? { scale: [1, 0.95, 1], transition: { repeat: Infinity, duration: 0.5 } } : {}}
            >
              <Button variant="danger" onClick={handleDelete} disabled={deleting} className="bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/25 hover:shadow-red-500/35 transition-all duration-300 text-white">
                {deleting ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" />Deleting…</>
                ) : (
                  "Delete Book"
                )}
              </Button>
            </motion.div>
          </>
        }
      >
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-sm text-slate-600 leading-relaxed"
        >
          Are you sure you want to delete <span className="font-semibold text-slate-900">"{deleteConfirm?.title}"</span>? All associated records will be permanently removed.
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
              This will permanently delete "{deleteConfirm.title}" and remove it from all records.
            </p>
          </motion.div>
        )}
      </Modal>
    </motion.div>
  );
}