// src/components/books/BookForm.tsx
"use client";
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea, Label } from "@/components/ui/textarea";
import { CATEGORY_OPTIONS, type Book } from "@/lib/types";
import { 
  X, 
  Image as ImageIcon, 
  BookOpen, 
  Sparkles, 
  AlertCircle,
  CheckCircle2,
  Loader2,
  Upload,
  Trash2,
  Eye,
  EyeOff
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface BookFormData {
  title: string;
  isbn: string;
  author: string;
  category: string;
  publisher: string;
  year: string;
  totalCopies: string;
  cover: string;
  coverUrl?: string;
  description: string;
  source?: string;
  donatedBy?: string;
}

export function emptyBookForm(): BookFormData {
  return {
    title: "",
    isbn: "",
    author: "",
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

export function bookToForm(book: Book): BookFormData {
  return {
    title: book.title ?? "",
    isbn: book.isbn ?? "",
    author: book.author ?? "",
    category: book.category ?? "",
    publisher: book.publisher ?? "",
    year: book.year ? String(book.year) : "",
    totalCopies: book.totalCopies != null ? String(book.totalCopies) : "1",
    cover: book.cover ?? "",
    coverUrl: (book as any).coverUrl ?? "",
    description: book.description ?? "",
    source: (book as any).source ?? "",
    donatedBy: (book as any).donatedBy ?? "",
  };
}

interface BookFormProps {
  initial: BookFormData;
  onSubmit: (data: BookFormData) => Promise<void> | void;
  submitLabel: string;
  submitting?: boolean;
}

export function BookForm({ initial, onSubmit, submitLabel, submitting }: BookFormProps) {
  const [form, setForm] = useState<BookFormData>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [imageError, setImageError] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const set = (key: keyof BookFormData, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    // Clear error when field is edited
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: "" }));
    }
  };

  const handleBlur = (key: keyof BookFormData) => {
    setTouched((prev) => ({ ...prev, [key]: true }));
    setFocusedField(null);
    validateField(key);
  };

  const validateField = (key: keyof BookFormData) => {
    const e: Record<string, string> = {};
    if (key === "title" && !form.title.trim()) {
      e.title = "Title is required";
    }
    if (key === "isbn" && !form.isbn.trim()) {
      e.isbn = "ISBN is required";
    }
    if (key === "author" && !form.author.trim()) {
      e.author = "Author is required";
    }
    if (key === "category" && !form.category) {
      e.category = "Category is required";
    }
    if (Object.keys(e).length > 0) {
      setErrors((prev) => ({ ...prev, ...e }));
    } else {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.isbn.trim()) e.isbn = "ISBN is required";
    if (!form.author.trim()) e.author = "Author is required";
    if (!form.category) e.category = "Category is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Mark all fields as touched
    const allTouched = Object.keys(form).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setTouched(allTouched);
    
    if (!validate()) return;
    
    // Use coverUrl if available, otherwise use cover
    if (form.coverUrl) {
      form.cover = form.coverUrl;
    }
    
    await onSubmit(form);
  };

  const handleImageUrlChange = (url: string) => {
    set("coverUrl", url);
    set("cover", url);
    setImageError(false);
    setIsImageLoading(true);
  };

  const handleImageLoad = () => {
    setIsImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setIsImageLoading(false);
    setImageError(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        handleImageUrlChange(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const SOURCE_OPTIONS = [
    { value: "purchase", label: "Purchase" },
    { value: "donation", label: "Donation" },
    { value: "other", label: "Other" },
  ];

  // Form field animation variants
  const fieldVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      id="book-form"
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Title */}
        <motion.div variants={fieldVariants} className="space-y-1.5 group">
          <Label className="text-xs font-medium text-slate-700 uppercase tracking-wide flex items-center gap-2">
            <BookOpen className="h-3 w-3" />
            Title <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              placeholder="Book title"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              onFocus={() => setFocusedField("title")}
              onBlur={() => handleBlur("title")}
              className={`h-11 rounded-xl border-slate-200/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 ${
                errors.title && touched.title ? "border-red-300 focus:border-red-500 focus:ring-red-500/20" : ""
              } ${focusedField === "title" ? "shadow-lg shadow-blue-500/10" : ""}`}
            />
            {errors.title && touched.title && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <AlertCircle className="h-4 w-4 text-red-500" />
              </motion.div>
            )}
          </div>
          <AnimatePresence>
            {errors.title && touched.title && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-xs text-red-500 mt-1.5 flex items-center gap-1"
              >
                <AlertCircle className="h-3 w-3" />
                {errors.title}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ISBN */}
        <motion.div variants={fieldVariants} className="space-y-1.5 group">
          <Label className="text-xs font-medium text-slate-700 uppercase tracking-wide flex items-center gap-2">
            <Sparkles className="h-3 w-3" />
            ISBN <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              placeholder="978-..."
              value={form.isbn}
              onChange={(e) => set("isbn", e.target.value)}
              onFocus={() => setFocusedField("isbn")}
              onBlur={() => handleBlur("isbn")}
              className={`h-11 rounded-xl border-slate-200/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 ${
                errors.isbn && touched.isbn ? "border-red-300 focus:border-red-500 focus:ring-red-500/20" : ""
              } ${focusedField === "isbn" ? "shadow-lg shadow-blue-500/10" : ""}`}
            />
            {errors.isbn && touched.isbn && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <AlertCircle className="h-4 w-4 text-red-500" />
              </motion.div>
            )}
          </div>
          <AnimatePresence>
            {errors.isbn && touched.isbn && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-xs text-red-500 mt-1.5 flex items-center gap-1"
              >
                <AlertCircle className="h-3 w-3" />
                {errors.isbn}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Author */}
        <motion.div variants={fieldVariants} className="space-y-1.5 group">
          <Label className="text-xs font-medium text-slate-700 uppercase tracking-wide">
            Author <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              placeholder="Author name"
              value={form.author}
              onChange={(e) => set("author", e.target.value)}
              onFocus={() => setFocusedField("author")}
              onBlur={() => handleBlur("author")}
              className={`h-11 rounded-xl border-slate-200/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 ${
                errors.author && touched.author ? "border-red-300 focus:border-red-500 focus:ring-red-500/20" : ""
              } ${focusedField === "author" ? "shadow-lg shadow-blue-500/10" : ""}`}
            />
            {errors.author && touched.author && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <AlertCircle className="h-4 w-4 text-red-500" />
              </motion.div>
            )}
          </div>
          <AnimatePresence>
            {errors.author && touched.author && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-xs text-red-500 mt-1.5 flex items-center gap-1"
              >
                <AlertCircle className="h-3 w-3" />
                {errors.author}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Category */}
        <motion.div variants={fieldVariants} className="space-y-1.5 group">
          <Label className="text-xs font-medium text-slate-700 uppercase tracking-wide">
            Category <span className="text-red-500">*</span>
          </Label>
          <Select
            value={form.category}
            onChange={(e) => {
              set("category", e.target.value);
              if (errors.category) {
                setErrors((prev) => ({ ...prev, category: "" }));
              }
            }}
            onFocus={() => setFocusedField("category")}
            onBlur={() => handleBlur("category")}
            className={`h-11 rounded-xl border-slate-200/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 ${
              errors.category && touched.category ? "border-red-300 focus:border-red-500 focus:ring-red-500/20" : ""
            } ${focusedField === "category" ? "shadow-lg shadow-blue-500/10" : ""}`}
          >
            <option value="">Select category</option>
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
          <AnimatePresence>
            {errors.category && touched.category && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-xs text-red-500 mt-1.5 flex items-center gap-1"
              >
                <AlertCircle className="h-3 w-3" />
                {errors.category}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Publisher */}
        <motion.div variants={fieldVariants} className="space-y-1.5 group">
          <Label className="text-xs font-medium text-slate-700 uppercase tracking-wide">
            Publisher
          </Label>
          <Input
            placeholder="Publisher name"
            value={form.publisher}
            onChange={(e) => set("publisher", e.target.value)}
            onFocus={() => setFocusedField("publisher")}
            onBlur={() => setFocusedField(null)}
            className={`h-11 rounded-xl border-slate-200/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 ${
              focusedField === "publisher" ? "shadow-lg shadow-blue-500/10" : ""
            }`}
          />
        </motion.div>

        {/* Year */}
        <motion.div variants={fieldVariants} className="space-y-1.5 group">
          <Label className="text-xs font-medium text-slate-700 uppercase tracking-wide">
            Publication Year
          </Label>
          <Input
            type="number"
            placeholder="2024"
            value={form.year}
            onChange={(e) => set("year", e.target.value)}
            onFocus={() => setFocusedField("year")}
            onBlur={() => setFocusedField(null)}
            className={`h-11 rounded-xl border-slate-200/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 ${
              focusedField === "year" ? "shadow-lg shadow-blue-500/10" : ""
            }`}
          />
        </motion.div>

        {/* Total Copies */}
        <motion.div variants={fieldVariants} className="space-y-1.5 group">
          <Label className="text-xs font-medium text-slate-700 uppercase tracking-wide">
            Total Copies <span className="text-red-500">*</span>
          </Label>
          <Input
            type="number"
            min="0"
            placeholder="1"
            value={form.totalCopies}
            onChange={(e) => set("totalCopies", e.target.value)}
            onFocus={() => setFocusedField("totalCopies")}
            onBlur={() => setFocusedField(null)}
            className={`h-11 rounded-xl border-slate-200/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 ${
              focusedField === "totalCopies" ? "shadow-lg shadow-blue-500/10" : ""
            }`}
          />
        </motion.div>

        {/* Source */}
        <motion.div variants={fieldVariants} className="space-y-1.5 group">
          <Label className="text-xs font-medium text-slate-700 uppercase tracking-wide">
            Source (optional)
          </Label>
          <Select
            value={form.source || ""}
            onChange={(e) => set("source", e.target.value)}
            className="h-11 rounded-xl border-slate-200/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
          >
            <option value="">Select source</option>
            {SOURCE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </motion.div>

        {/* Donated By */}
        {form.source === "donation" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-1.5 group"
          >
            <Label className="text-xs font-medium text-slate-700 uppercase tracking-wide">
              Donated By
            </Label>
            <Input
              placeholder="Donor name"
              value={form.donatedBy || ""}
              onChange={(e) => set("donatedBy", e.target.value)}
              className="h-11 rounded-xl border-slate-200/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
            />
          </motion.div>
        )}

        {/* Cover Image URL */}
        <motion.div variants={fieldVariants} className="md:col-span-2 space-y-1.5 group">
          <Label className="text-xs font-medium text-slate-700 uppercase tracking-wide flex items-center gap-2">
            <ImageIcon className="h-3 w-3" />
            Cover Image URL
          </Label>
          <div className="relative">
            <Input
              placeholder="https://example.com/book-cover.jpg"
              value={form.coverUrl || form.cover}
              onChange={(e) => handleImageUrlChange(e.target.value)}
              className="h-11 rounded-xl border-slate-200/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 pr-24"
            />
            <div className="absolute right-1 top-1 flex gap-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all duration-200 flex items-center gap-1.5"
              >
                <Upload className="h-3.5 w-3.5" />
                Upload
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>
          
          {/* Image Preview */}
          {(form.coverUrl || form.cover) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative inline-block mt-3 group/image"
            >
              <div className="relative overflow-hidden rounded-xl border border-slate-200/60 shadow-sm">
                {isImageLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-50/80 backdrop-blur-sm">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  </div>
                )}
                <img
                  src={form.coverUrl || form.cover}
                  alt="Book cover preview"
                  className="h-52 w-auto object-contain transition-all duration-300 group-hover/image:scale-105"
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                />
                {!imageError && !isImageLoading && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity duration-300" />
                )}
              </div>
              <div className="absolute -top-2 -right-2 flex gap-1">
                <button
                  type="button"
                  onClick={() => {
                    set("coverUrl", "");
                    set("cover", "");
                    setImageError(false);
                  }}
                  className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-110 active:scale-95"
                  title="Remove image"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => window.open(form.coverUrl || form.cover, "_blank")}
                  className="p-1.5 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-110 active:scale-95"
                  title="View full size"
                >
                  <Eye className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}
          
          {!form.coverUrl && !form.cover && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3 p-8 border-2 border-dashed border-slate-200/60 rounded-xl text-center text-slate-400 bg-slate-50/50 hover:bg-slate-50 transition-all duration-300 cursor-pointer group/upload"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="transform transition-transform duration-300 group-hover/upload:scale-110">
                <ImageIcon className="h-12 w-12 mx-auto mb-2 text-slate-300 group-hover/upload:text-blue-400 transition-colors duration-300" />
              </div>
              <p className="text-sm font-medium text-slate-500 group-hover/upload:text-blue-600 transition-colors duration-300">
                Click to upload or enter URL
              </p>
              <p className="text-xs mt-1 text-slate-400">
                JPG, PNG, WEBP • Max 5MB
              </p>
            </motion.div>
          )}
          
          {imageError && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-amber-600 mt-1.5 flex items-center gap-1"
            >
              <AlertCircle className="h-3 w-3" />
              Could not load image. Please check the URL.
            </motion.p>
          )}
        </motion.div>

        {/* Description */}
        <motion.div variants={fieldVariants} className="md:col-span-2 space-y-1.5 group">
          <Label className="text-xs font-medium text-slate-700 uppercase tracking-wide">
            Description
          </Label>
          <Textarea
            rows={4}
            placeholder="Book description..."
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            onFocus={() => setFocusedField("description")}
            onBlur={() => setFocusedField(null)}
            className={`rounded-xl border-slate-200/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 resize-y ${
              focusedField === "description" ? "shadow-lg shadow-blue-500/10" : ""
            }`}
          />
        </motion.div>
      </div>
      
      {/* Hidden submit */}
      <button type="submit" className="hidden" disabled={submitting} aria-hidden>
        {submitLabel}
      </button>
    </motion.form>
  );
}