"use client";
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label, Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { Badge } from "@/components/ui/badge"; 
import { 
  HelpCircle, 
  Mail, 
  Phone, 
  Search, 
  ChevronDown, 
  ChevronRight,
  Sparkles,
  MessageSquare,
  Send,
  CheckCircle2,
  Clock,
  Users,
  FileText,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const faqItems = [
  { q: "How do I add a new book to the system?", a: "Navigate to Books, click Add Book, fill in the details, upload a cover image, and save." },
  { q: "How do I issue a book to a member?", a: "Go to Borrow & Return, click Issue Book, select a member and book, choose dates, and submit." },
  { q: "How do I return a borrowed book?", a: "Open Borrow & Return and click Return next to an active loan. The inventory updates automatically." },
  { q: "How do I export reports?", a: "Visit Reports and use the Export buttons to download Excel files for circulation, inventory, and members." },
  { q: "How do I manage categories and authors?", a: "Open Categories & Authors, then use Add, Edit, or Delete actions directly from the cards and tables." },
];

const quickLinks = [
  { icon: BookOpen, label: "Books", href: "/dashboard/books", color: "blue" },
  { icon: Users, label: "Members", href: "/dashboard/members", color: "violet" },
  { icon: FileText, label: "Reports", href: "/dashboard/reports", color: "emerald" },
  { icon: HelpCircle, label: "Categories", href: "/dashboard/categories", color: "amber" },
];

function FaqItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="border border-slate-200/60 rounded-xl overflow-hidden hover:border-slate-300 transition-colors duration-200"
    >
      <motion.button 
        onClick={() => setOpen(!open)} 
        whileHover={{ scale: 1.005, backgroundColor: "rgba(241, 245, 249, 0.5)" }}
        whileTap={{ scale: 0.995 }}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50/80 transition-all duration-200 group"
      >
        <span className="text-sm font-medium text-slate-900 pr-4 flex items-center gap-2">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-blue-600 text-xs font-bold">
            {index + 1}
          </span>
          {q}
        </span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="text-slate-400 group-hover:text-slate-600 transition-colors duration-200"
        >
          {open ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
        </motion.div>
      </motion.button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-3 border-t border-slate-100/60 text-sm text-slate-600 leading-relaxed bg-gradient-to-r from-slate-50/50 to-transparent">
              {a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function HelpSettingsPage() {
  const { toast } = useToast();
  const [helpSearch, setHelpSearch] = useState("");
  const [contactForm, setContactForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const filteredFaq = useMemo(() =>
    faqItems.filter((f) =>
      f.q.toLowerCase().includes(helpSearch.toLowerCase()) ||
      f.a.toLowerCase().includes(helpSearch.toLowerCase())
    ),
    [helpSearch]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.message.trim()) return toast("Please enter your message", "error");
    setSaving(true);
    await new Promise((r) => setTimeout(r, 700));
    setSaving(false);
    setSubmitted(true);
    setContactForm((prev) => ({ ...prev, subject: "", message: "" }));
    toast("Support message sent", "success");
    setTimeout(() => setSubmitted(false), 3000);
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

  const quickLinkVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      transition: {
        delay: i * 0.05,
        type: "spring" as const,
        stiffness: 300,
        damping: 25,
      }
    }),
    hover: {
      scale: 1.05,
      y: -2,
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
      {/* Header with animated icon */}
      <motion.div variants={itemVariants} className="flex items-start gap-4">
        <motion.div
          whileHover={{ scale: 1.1, rotate: [0, -10, 10, -5, 5, 0] }}
          transition={{ duration: 0.5 }}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25"
        >
          <HelpCircle className="h-6 w-6" />
        </motion.div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Help & Support</h2>
          <p className="text-sm text-slate-500">Find answers to common questions or contact support</p>
        </div>
      </motion.div>

      {/* Quick Links */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickLinks.map((link, index) => {
            const Icon = link.icon;
            const colorClasses = {
              blue: "bg-blue-50 text-blue-600 hover:bg-blue-100",
              violet: "bg-violet-50 text-violet-600 hover:bg-violet-100",
              emerald: "bg-emerald-50 text-emerald-600 hover:bg-emerald-100",
              amber: "bg-amber-50 text-amber-600 hover:bg-amber-100",
            };
            return (
              <motion.a
                key={link.label}
                href={link.href}
                custom={index}
                variants={quickLinkVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl border border-slate-200/60 transition-all duration-200 group",
                  colorClasses[link.color as keyof typeof colorClasses]
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="text-sm font-medium">{link.label}</span>
                <ArrowRight className="h-3.5 w-3.5 ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" />
              </motion.a>
            );
          })}
        </div>
      </motion.div>

      {/* FAQ Section */}
      <motion.div variants={itemVariants}>
        <Card className="border border-slate-200/60 shadow-sm hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <motion.div
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              >
                <HelpCircle className="h-4 w-4 text-blue-600" />
              </motion.div>
              Frequently Asked Questions
              <Badge variant="neutral" className="ml-auto text-[10px] bg-blue-50 text-blue-600 border-blue-200">
                {filteredFaq.length} questions
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <motion.div whileHover={{ scale: 1.01 }} transition={{ type: "spring", stiffness: 400, damping: 15 }}>
              <Input
                leadingIcon={<Search className="h-4 w-4" />}
                placeholder="Search FAQ..."
                value={helpSearch}
                onChange={(e) => setHelpSearch(e.target.value)}
                className="h-11 rounded-xl border-slate-200/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
              />
            </motion.div>
            <AnimatePresence mode="wait">
              {filteredFaq.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-sm text-slate-500 text-center py-12"
                >
                  <HelpCircle className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                  No matching questions found.
                  <p className="text-xs text-slate-400 mt-1">Try adjusting your search terms</p>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ staggerChildren: 0.03 }}
                >
                  {filteredFaq.map((item, index) => (
                    <FaqItem key={index} q={item.q} a={item.a} index={index} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>

      {/* Contact Support */}
      <motion.div variants={itemVariants}>
        <Card className="border border-slate-200/60 shadow-sm hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <motion.div
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              >
                <Mail className="h-4 w-4 text-blue-600" />
              </motion.div>
              Contact Support
            </CardTitle>
            <CardDescription>Need help? Send us a message</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Contact info cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {[
                { icon: Mail, label: "Email", value: "support@bophavuthy.edu", color: "blue" },
                { icon: Phone, label: "Phone", value: "+1 (555) 123-4567", color: "emerald" },
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    whileHover={{ scale: 1.02, backgroundColor: "rgb(241 245 249)" }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/80 border border-slate-100/60 transition-all duration-200"
                  >
                    <Icon className="h-4 w-4 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500">{item.label}</p>
                      <p className="text-sm font-medium text-slate-700">{item.value}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Contact form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div 
                  whileHover={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                >
                  <Label className="text-xs font-medium text-slate-700 uppercase tracking-wide">Your Name</Label>
                  <Input
                    value={contactForm.name}
                    onChange={(e) => setContactForm((p) => ({ ...p, name: e.target.value }))}
                    className="mt-1.5 h-11 rounded-xl border-slate-200/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                  />
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                >
                  <Label className="text-xs font-medium text-slate-700 uppercase tracking-wide">Email</Label>
                  <Input
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm((p) => ({ ...p, email: e.target.value }))}
                    className="mt-1.5 h-11 rounded-xl border-slate-200/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                  />
                </motion.div>
              </div>
              <motion.div 
                whileHover={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
              >
                <Label className="text-xs font-medium text-slate-700 uppercase tracking-wide">Subject</Label>
                <Input
                  value={contactForm.subject}
                  onChange={(e) => setContactForm((p) => ({ ...p, subject: e.target.value }))}
                  placeholder="How can we help?"
                  className="mt-1.5 h-11 rounded-xl border-slate-200/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                />
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
              >
                <Label className="text-xs font-medium text-slate-700 uppercase tracking-wide">Message</Label>
                <Textarea
                  rows={4}
                  value={contactForm.message}
                  onChange={(e) => setContactForm((p) => ({ ...p, message: e.target.value }))}
                  placeholder="Describe your issue or question..."
                  className="mt-1.5 rounded-xl border-slate-200/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-y transition-all duration-200"
                />
              </motion.div>
              <div className="flex justify-end items-center gap-3">
                <AnimatePresence>
                  {submitted && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="text-xs text-emerald-600 flex items-center gap-1"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Message sent successfully!
                    </motion.span>
                  )}
                </AnimatePresence>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    type="submit" 
                    disabled={saving} 
                    className="relative bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 transition-all duration-300 text-white overflow-hidden group"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-white/10 to-blue-400/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    {saving ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white mr-2 relative z-10" />
                        <span className="relative z-10">Sending…</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2 relative z-10" />
                        <span className="relative z-10">Send Message</span>
                      </>
                    )}
                  </Button>
                </motion.div>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}