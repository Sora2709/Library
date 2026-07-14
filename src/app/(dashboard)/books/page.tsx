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

// Status map for book status badges
const statusMap: Record<string, { variant: "success" | "danger" | "warning"; label: string }> = {
  available: { variant: "success", label: "Available" },
  unavailable: { variant: "danger", label: "Out of Stock" },
  low_stock: { variant: "warning", label: "Low Stock" },
};

// Color map for category badges
const colorClassMap: Record<string, { bg: string; text: string; border: string }> = {
  primary: { bg: "bg-primary-50", text: "text-primary-700", border: "border-primary-200" },
  cyan: { bg: "bg-cyan-50", text: "text-cyan-700", border: "border-cyan-200" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  amber: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  rose: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" },
  violet: { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200" },
};

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
  coverFile: File | null;
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
    coverFile: null,
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
    coverFile: null,
    description: book.description || "",
    source: book.source || "",
    donatedBy: book.donatedBy || "",
  };
}

// Detail component for view modal
function Detail({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-xs text-slate-500 uppercase tracking-wide">{label}</p>
      <p className={cn("text-sm font-medium text-slate-700", mono && "font-mono")}>{value || "—"}</p>
    </div>
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

// Book Form Component
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
  const [previewUrl, setPreviewUrl] = useState<string>(initial.cover || "");
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        onToast("Please upload an image file", "error");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        onToast("Image size should be less than 5MB", "error");
        return;
      }
      setForm((p) => ({ ...p, coverFile: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setForm((p) => ({ ...p, coverFile: null, cover: "" }));
    setPreviewUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form id="book-form" onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="text-sm font-medium text-slate-700 block mb-1.5">
            Title <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="Book title"
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1.5">
            Author <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="Author name"
            value={form.author}
            onChange={(e) => setForm((p) => ({ ...p, author: e.target.value }))}
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1.5 flex items-center gap-2">
            ISBN {isNew && <span className="text-xs text-slate-400 font-normal">(auto-generated)</span>}
          </label>
          <div className="relative">
            <Input
              placeholder="978-0-123-45678-9"
              value={form.isbn}
              onChange={(e) => setForm((p) => ({ ...p, isbn: e.target.value }))}
              className="pr-20"
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1.5">
            Category <span className="text-red-500">*</span>
          </label>
          <Select
            value={form.category}
            onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
            required
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1.5">Publisher</label>
          <Input
            placeholder="Publisher name"
            value={form.publisher}
            onChange={(e) => setForm((p) => ({ ...p, publisher: e.target.value }))}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1.5">Year</label>
          <Input
            type="number"
            placeholder="2024"
            value={form.year}
            onChange={(e) => setForm((p) => ({ ...p, year: e.target.value }))}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1.5">Total Copies</label>
          <Input
            type="number"
            placeholder="1"
            min="1"
            value={form.totalCopies}
            onChange={(e) => setForm((p) => ({ ...p, totalCopies: e.target.value }))}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1.5">
            Source <span className="text-slate-400 text-xs font-normal">(optional)</span>
          </label>
          <Select
            value={form.source}
            onChange={(e) => setForm((p) => ({ ...p, source: e.target.value }))}
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
        {showDonatedBy && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-200">
            <label className="text-sm font-medium text-slate-700 block mb-1.5">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary-600" />
                Donated By <span className="text-red-500">*</span>
              </div>
            </label>
            <Input
              placeholder="Enter donor name"
              value={form.donatedBy}
              onChange={(e) => setForm((p) => ({ ...p, donatedBy: e.target.value }))}
              required={showDonatedBy}
            />
          </div>
        )}

        <div className="md:col-span-2">
          <label className="text-sm font-medium text-slate-700 block mb-1.5">Cover Image</label>
          <div className="flex flex-col items-center justify-center w-full">
            {previewUrl ? (
              <div className="relative w-full max-w-xs">
                <img 
                  src={previewUrl} 
                  alt="Book cover preview" 
                  className="w-full h-auto max-h-48 object-contain rounded-lg border border-slate-200"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition shadow-md"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div 
                className="w-full max-w-xs h-48 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 transition bg-slate-50/50"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageIcon className="h-10 w-10 text-slate-400 mb-2" />
                <p className="text-sm text-slate-500">Click to upload cover image</p>
                <p className="text-xs text-slate-400">PNG, JPG, WEBP (max 5MB)</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
          {form.cover && !previewUrl && !form.coverFile && (
            <div className="mt-2 text-xs text-slate-500">
              Current cover: <span className="font-mono truncate">{form.cover}</span>
            </div>
          )}
        </div>
        <div className="md:col-span-2">
          <label className="text-sm font-medium text-slate-700 block mb-1.5">Description</label>
          <Textarea
            rows={3}
            placeholder="Book description..."
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
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
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [uploadingImage, setUploadingImage] = useState(false);

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

  // Upload image function
  const uploadImage = async (file: File): Promise<string> => {
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Upload failed');
      
      return data.url;
    } catch (error) {
      toast((error as Error).message, "error");
      throw error;
    } finally {
      setUploadingImage(false);
    }
  };

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
    const matchesStatus = statusFilter === "all" || b.status === statusFilter;
    const matchesSource = sourceFilter === "all" || b.source === sourceFilter;
    return matchesSearch && matchesCategory && matchesStatus && matchesSource;
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
      let coverUrl = data.cover;
      
      if (data.coverFile) {
        try {
          coverUrl = await uploadImage(data.coverFile);
        } catch (error) {
          setSubmitting(false);
          return;
        }
      }

      const payload = {
        title: data.title,
        isbn: data.isbn || "",
        author: data.author,
        category: data.category,
        publisher: data.publisher,
        year: data.year ? Number(data.year) : 0,
        totalCopies: Number(data.totalCopies || 1),
        cover: coverUrl,
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
      setData(allBooks.filter((b) => b.id !== deleteConfirm.id));
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
      headers: ["Title", "Author", "ISBN", "Category", "Publisher", "Year", "Available", "Total", "Status", "Source", "Donated By"],
      rows: filteredBooks.map((b) => [b.title, b.author, b.isbn || "", b.category, b.publisher, b.year, b.availableCopies, b.totalCopies, b.status, getSourceLabel(b.source || ""), b.donatedBy || ""]),
    }], "books-export");
    toast(`Exported ${filteredBooks.length} books as Excel`, "success");
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title="Book Management"
        description="Manage your library's book catalog, inventory, and metadata."
        actions={
          <>
            <Button variant="outline" size="md" onClick={handleExport}>
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button variant="outline" size="md" onClick={() => toast("Import from CSV coming soon", "info")}>
              <Upload className="h-4 w-4" />
              Import
            </Button>
            <Button size="md" onClick={openAdd}>
              <Plus className="h-4 w-4" />
              Add Book
            </Button>
          </>
        }
      />

      <Card>
        {/* Filters */}
        <div className="p-4 border-b border-slate-100 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Input
              leadingIcon={<Search className="h-4 w-4" />}
              placeholder="Search by title, author, ISBN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="w-40">
              <option value="all">All Categories</option>
              {categoryOptions.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-36">
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="low_stock">Low Stock</option>
              <option value="unavailable">Out of Stock</option>
            </Select>
            <Select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)} className="w-40">
              <option value="all">All Sources</option>
              {SOURCE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </Select>
            {(search || categoryFilter !== "all" || statusFilter !== "all" || sourceFilter !== "all") && (
              <button
                onClick={() => { setSearch(""); setCategoryFilter("all"); setStatusFilter("all"); setSourceFilter("all"); }}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 h-9 px-2"
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

        {/* Table */}
        <CardContent className="p-0">
          {error ? (
            <ErrorState message={error} onRetry={reload} />
          ) : loading ? (
            <TableLoading />
          ) : filteredBooks.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No books found"
              description={search || categoryFilter !== "all" || statusFilter !== "all" || sourceFilter !== "all" ? "Try adjusting your filters." : "Add your first book to get started."}
              action={<Button size="sm" onClick={openAdd}><Plus className="h-4 w-4" />Add Book</Button>}
            />
          ) : (
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="text-left font-semibold text-xs text-slate-500 uppercase tracking-wider px-5 py-3">Book</th>
                    <th className="text-left font-semibold text-xs text-slate-500 uppercase tracking-wider px-3 py-3">ISBN</th>
                    <th className="text-left font-semibold text-xs text-slate-500 uppercase tracking-wider px-3 py-3">Category</th>
                    <th className="text-left font-semibold text-xs text-slate-500 uppercase tracking-wider px-3 py-3">Copies</th>
                    <th className="text-left font-semibold text-xs text-slate-500 uppercase tracking-wider px-3 py-3">Status</th>
                    <th className="text-left font-semibold text-xs text-slate-500 uppercase tracking-wider px-3 py-3">Source</th>
                    <th className="text-right font-semibold text-xs text-slate-500 uppercase tracking-wider px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBooks.map((book) => {
                    const status = statusMap[book.status] ?? statusMap.available;
                    const catColor = getCategoryColor(book.category);
                    const colors = colorClassMap[catColor] || colorClassMap.primary;
                    return (
                      <tr key={book.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-11 w-8 shrink-0 rounded-sm bg-gradient-to-br from-slate-100 to-slate-200 shadow-sm overflow-hidden border border-slate-200/50 relative">
                              {book.cover ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={book.cover} alt={book.title} className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center"><BookOpen className="h-3 w-3 text-slate-400" /></div>
                              )}
                            </div>
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
                        <td className="px-3 py-3"><Badge variant={status.variant}>{status.label}</Badge></td>
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
                            <button onClick={() => setViewModalBook(book)} className="p-1.5 rounded-md text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition" title="View details"><Eye className="h-4 w-4" /></button>
                            <button onClick={() => openEdit(book)} className="p-1.5 rounded-md text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition" title="Edit"><Pencil className="h-4 w-4" /></button>
                            <button onClick={() => setDeleteConfirm(book)} className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition" title="Delete"><Trash2 className="h-4 w-4" /></button>
                          </div>
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

      {/* Add/Edit Book Modal */}
      <Modal
        open={formModalOpen}
        onClose={() => !submitting && setFormModalOpen(false)}
        title={editingBook ? "Edit Book" : "Add New Book"}
        description={editingBook ? "Update the book details below." : "Enter the book details below to add it to the catalog."}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setFormModalOpen(false)} disabled={submitting}>Cancel</Button>
            <Button type="submit" form="book-form" disabled={submitting || uploadingImage}>
              {submitting || uploadingImage ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {uploadingImage ? "Uploading image..." : "Saving…"}
                </>
              ) : (
                editingBook ? "Save Changes" : "Add Book"
              )}
            </Button>
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

      {/* View Book Modal */}
      <Modal
        open={!!viewModalBook}
        onClose={() => setViewModalBook(null)}
        title="Book Details"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setViewModalBook(null)}>Close</Button>
            {viewModalBook && <Button onClick={() => openEdit(viewModalBook)}>Edit Book</Button>}
          </>
        }
      >
        {viewModalBook && (
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-40 shrink-0 flex items-start justify-center">
              <div className="h-56 w-40 rounded-md bg-gradient-to-br from-slate-100 to-slate-200 shadow-md border border-slate-200 overflow-hidden">
                {viewModalBook.cover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={viewModalBook.cover} alt={viewModalBook.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center"><BookOpen className="h-8 w-8 text-slate-400" /></div>
                )}
              </div>
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{viewModalBook.title}</h3>
                <p className="text-sm text-slate-500">by {viewModalBook.author}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Detail label="ISBN" value={viewModalBook.isbn || "—"} mono />
                <Detail label="Category" value={viewModalBook.category} />
                <Detail label="Publisher" value={viewModalBook.publisher} />
                <Detail label="Year" value={String(viewModalBook.year)} />
                <Detail label="Source" value={getSourceLabel(viewModalBook.source || "")} />
                {viewModalBook.source === "donation" && viewModalBook.donatedBy && (
                  <Detail label="Donated By" value={viewModalBook.donatedBy} />
                )}
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Available</p>
                  <p className="text-sm font-semibold text-emerald-600">{viewModalBook.availableCopies} of {viewModalBook.totalCopies} copies</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Status</p>
                  <Badge variant={(statusMap[viewModalBook.status] ?? statusMap.available).variant}>{(statusMap[viewModalBook.status] ?? statusMap.available).label}</Badge>
                </div>
              </div>
              {viewModalBook.description && (
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Description</p>
                  <p className="text-sm text-slate-600">{viewModalBook.description}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        open={!!deleteConfirm}
        onClose={() => !deleting && setDeleteConfirm(null)}
        title="Delete Book"
        description="This action cannot be undone."
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)} disabled={deleting}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete} disabled={deleting}>{deleting ? "Deleting…" : "Delete Book"}</Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Are you sure you want to delete <span className="font-semibold text-slate-900">"{deleteConfirm?.title}"</span>? All associated records will be permanently removed.
        </p>
      </Modal>
    </div>
  );
}