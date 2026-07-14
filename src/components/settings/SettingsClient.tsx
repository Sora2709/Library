"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label, Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import {
  Save,
  Building2,
  Bell,
  Shield,
  User,
  Sliders,
  HelpCircle,
  Mail,
  Phone,
  Camera,
  Globe,
  Monitor,
  Search,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "general", label: "General", icon: Building2 },
  { id: "profile", label: "Profile", icon: User },
  { id: "preferences", label: "Preferences", icon: Sliders },
  { id: "help", label: "Help & Support", icon: HelpCircle },
] as const;

type TabId = (typeof tabs)[number]["id"];

const faqItems = [
  { q: "How do I add a new book to the system?", a: "Navigate to Books, click Add Book, fill in the details, upload a cover image, and save." },
  { q: "How do I issue a book to a member?", a: "Go to Borrow & Return, click Issue Book, select a member and book, choose dates, and submit." },
  { q: "How do I return a borrowed book?", a: "Open Borrow & Return and click Return next to an active loan. The inventory updates automatically." },
  { q: "How do I export reports?", a: "Visit Reports and use the Export buttons to download Excel files for circulation, inventory, and members." },
  { q: "How do I manage categories and authors?", a: "Open Categories & Authors, then use Add, Edit, or Delete actions directly from the cards and tables." },
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`h-6 w-11 rounded-full relative cursor-pointer transition-colors ${checked ? "bg-primary-600" : "bg-slate-300"}`}
    >
      <div className={`h-5 w-5 rounded-full bg-white absolute top-0.5 transition-all shadow-sm ${checked ? "left-[22px]" : "left-0.5"}`} />
    </button>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition">
        <span className="text-sm font-medium text-slate-900 pr-4">{q}</span>
        {open ? <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" /> : <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />}
      </button>
      {open && <div className="px-4 pb-4 pt-3 border-t border-slate-100 text-sm text-slate-600 leading-relaxed">{a}</div>}
    </div>
  );
}

export function SettingsClient({ initialTab = "general" }: { initialTab?: string }) {
  const { toast } = useToast();
  const router = useRouter();
  const activeTab: TabId = tabs.some((t) => t.id === initialTab) ? (initialTab as TabId) : "general";

  const [profile, setProfile] = useState({ 
    name: "Admin User", 
    email: "admin@libraria.edu", 
    role: "Head Librarian", 
    avatar: "AD", 
    phone: "", 
    bio: "" 
  });
  const [preferences, setPreferences] = useState({ 
    language: "en", 
    timezone: "UTC", 
    itemsPerPage: "10", 
    emailNotifs: true, 
    pushNotifs: true, 
    weeklyDigest: false 
  });
  const [helpSearch, setHelpSearch] = useState("");
  const [contactForm, setContactForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [saving, setSaving] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Try to get user from localStorage first
    try {
      const storedUser = localStorage.getItem("libraria_user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setProfile((prev) => ({ 
          ...prev, 
          name: user.name || prev.name, 
          email: user.email || prev.email, 
          role: user.role || prev.role, 
          avatar: user.avatar || prev.avatar 
        }));
        setContactForm((prev) => ({ ...prev, name: user.name || prev.name, email: user.email || prev.email }));
        setIsAuthenticated(true);
      }
    } catch {}

    // Then fetch from API to get latest data
    fetch("/api/auth/me", { cache: "no-store" })
      .then((res) => res.json())
      .then((json) => {
        if (json.ok && json.data) {
          const user = json.data;
          setProfile((prev) => ({ 
            ...prev, 
            name: user.name || prev.name, 
            email: user.email || prev.email, 
            role: user.role || prev.role, 
            avatar: user.avatar || prev.avatar 
          }));
          setContactForm((prev) => ({ ...prev, name: user.name || prev.name, email: user.email || prev.email }));
          try { localStorage.setItem("libraria_user", JSON.stringify(user)); } catch {}
          setIsAuthenticated(true);
        }
      })
      .catch(() => {
        // If API fails but we have stored user, keep using it
        if (!isAuthenticated) {
          // Use default profile
        }
      });

    try {
      const storedPrefs = localStorage.getItem("libraria_prefs");
      if (storedPrefs) setPreferences((prev) => ({ ...prev, ...JSON.parse(storedPrefs) }));
    } catch {}
  }, []);

  const filteredFaq = useMemo(() => 
    faqItems.filter((f) => 
      f.q.toLowerCase().includes(helpSearch.toLowerCase()) || 
      f.a.toLowerCase().includes(helpSearch.toLowerCase())
    ), 
    [helpSearch]
  );

  const goTab = (tab: TabId) => router.push(`/settings?tab=${tab}`);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: profile.name, email: profile.email }),
      });
      const json = await response.json();
      if (!response.ok || !json.ok) throw new Error(json.error || "Unable to update profile.");
      setProfile((prev) => ({ ...prev, ...json.data }));
      localStorage.setItem("libraria_user", JSON.stringify(json.data));
      toast("Profile updated successfully", "success");
    } catch (error) {
      toast((error as Error).message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSavePreferences = async () => {
    setSaving(true);
    try { 
      localStorage.setItem("libraria_prefs", JSON.stringify(preferences)); 
    } catch {}
    await new Promise((r) => setTimeout(r, 400));
    setSaving(false);
    toast("Preferences saved", "success");
  };

  const handleGeneralSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    setSaving(false);
    toast("Settings saved", "success");
  };

  const handleHelpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.message.trim()) return toast("Please enter your message", "error");
    setSaving(true);
    await new Promise((r) => setTimeout(r, 700));
    setSaving(false);
    setContactForm((prev) => ({ ...prev, subject: "", message: "" }));
    toast("Support message sent", "success");
  };

  return (
    <div className="space-y-5 animate-fade-in max-w-5xl">
      <PageHeader
        title="Settings"
        description="Manage library configuration, account preferences, and support in one place."
        actions={
          <Button 
            onClick={() => {
              if (activeTab === "profile") handleSaveProfile();
              else if (activeTab === "preferences") handleSavePreferences();
              else if (activeTab === "general") handleGeneralSave();
              else toast("Nothing to save in this tab", "info");
            }} 
            disabled={saving || activeTab === "help"}
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving…" : "Save Changes"}
          </Button>
        }
      />

      <div className="inline-flex w-full flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button 
              key={tab.id} 
              onClick={() => goTab(tab.id)} 
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all",
                isActive 
                  ? "bg-primary-50 text-primary-700 shadow-sm" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "general" && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Building2 className="h-4 w-4 text-primary-600" />
                Library Information
              </CardTitle>
              <CardDescription>Basic information about your library</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label>Library Name</Label>
                <Input defaultValue="Central University Library" />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" defaultValue="library@university.edu" />
              </div>
              <div>
                <Label>Phone</Label>
                <Input defaultValue="+1 (555) 123-4567" />
              </div>
              <div className="md:col-span-2">
                <Label>Address</Label>
                <Input defaultValue="123 University Ave, Academic City, AC 12345" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Bell className="h-4 w-4 text-primary-600" />
                Borrowing Policies
              </CardTitle>
              <CardDescription>Configure loan periods and limits</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Default Loan Period (days)</Label>
                <Input type="number" defaultValue={14} />
              </div>
              <div>
                <Label>Max Books Per Student</Label>
                <Input type="number" defaultValue={5} />
              </div>
              <div>
                <Label>Max Books Per Faculty</Label>
                <Input type="number" defaultValue={10} />
              </div>
              <div>
                <Label>Renewal Limit</Label>
                <Input type="number" defaultValue={2} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="h-4 w-4 text-primary-600" />
                Notification Settings
              </CardTitle>
              <CardDescription>Configure email and system notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Due date reminders", desc: "Send reminder 3 days before due date", checked: true },
                { label: "Overdue alerts", desc: "Notify members when books are overdue", checked: true },
                { label: "New book arrivals", desc: "Weekly newsletter with new additions", checked: false },
                { label: "Membership expiry", desc: "Notify members 30 days before membership ends", checked: true }
              ].map((n) => (
                <div key={n.label} className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{n.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{n.desc}</p>
                  </div>
                  <Toggle checked={n.checked} onChange={() => {}} />
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}

      {activeTab === "profile" && (
        <>
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative group">
                  <Avatar className="h-24 w-24 ring-4 ring-white shadow-lg">
                    <AvatarFallback className="text-2xl bg-primary-100 text-primary-700 font-bold">
                      {profile.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <button className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition">
                    <Camera className="h-6 w-6 text-white" />
                  </button>
                </div>
                <div className="text-center sm:text-left flex-1">
                  <h2 className="text-xl font-bold text-slate-900">{profile.name}</h2>
                  <p className="text-sm text-slate-500 mt-0.5">{profile.email}</p>
                  <div className="flex items-center gap-2 mt-2 justify-center sm:justify-start">
                    <Badge variant="default">{profile.role}</Badge>
                    <Badge variant="success">Active</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4 text-primary-600" />
                Personal Information
              </CardTitle>
              <CardDescription>Update your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Full Name</Label>
                  <Input 
                    value={profile.name} 
                    onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} 
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input 
                    value={profile.email} 
                    type="email" 
                    onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))} 
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input 
                    value={profile.phone} 
                    placeholder="+1 (555) ..." 
                    onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} 
                  />
                </div>
                <div>
                  <Label>Role</Label>
                  <Input value={profile.role} disabled className="bg-slate-50" />
                </div>
              </div>
              <div>
                <Label>Bio</Label>
                <Textarea 
                  rows={3} 
                  value={profile.bio} 
                  placeholder="Tell us about yourself..." 
                  onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))} 
                />
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {activeTab === "preferences" && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Globe className="h-4 w-4 text-primary-600" />
                Language & Region
              </CardTitle>
              <CardDescription>Set your preferred language and timezone</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Language</Label>
                <Select 
                  value={preferences.language} 
                  onChange={(e) => setPreferences((p) => ({ ...p, language: e.target.value }))}
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </Select>
              </div>
              <div>
                <Label>Timezone</Label>
                <Select 
                  value={preferences.timezone} 
                  onChange={(e) => setPreferences((p) => ({ ...p, timezone: e.target.value }))}
                >
                  <option value="UTC">UTC</option>
                  <option value="EST">Eastern (EST)</option>
                  <option value="CST">Central (CST)</option>
                  <option value="PST">Pacific (PST)</option>
                </Select>
              </div>
              <div>
                <Label>Items Per Page</Label>
                <Select 
                  value={preferences.itemsPerPage} 
                  onChange={(e) => setPreferences((p) => ({ ...p, itemsPerPage: e.target.value }))}
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Bell className="h-4 w-4 text-primary-600" />
                Notifications
              </CardTitle>
              <CardDescription>Choose what updates you receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                ["emailNotifs", "Email Notifications", "Receive email alerts for overdue books and new registrations"],
                ["pushNotifs", "Push Notifications", "Browser alerts for real-time updates"],
                ["weeklyDigest", "Weekly Digest", "Get a weekly library activity summary"]
              ].map(([key, label, desc]) => (
                <div key={key} className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                  </div>
                  <Toggle 
                    checked={preferences[key as keyof typeof preferences] as boolean} 
                    onChange={(v) => setPreferences((p) => ({ ...p, [key]: v }))} 
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Monitor className="h-4 w-4 text-primary-600" />
                Appearance
              </CardTitle>
              <CardDescription>Customize the interface appearance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 rounded-xl border-2 border-primary-500 bg-primary-50/40 p-4 max-w-sm">
                <Monitor className="h-5 w-5 text-primary-600" />
                <div>
                  <p className="text-sm font-medium text-slate-900">Light Mode</p>
                  <p className="text-xs text-slate-500">Currently active</p>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-3">Dark mode coming soon</p>
            </CardContent>
          </Card>
        </>
      )}

      {activeTab === "help" && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <HelpCircle className="h-4 w-4 text-primary-600" />
                Frequently Asked Questions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input 
                leadingIcon={<Search className="h-4 w-4" />} 
                placeholder="Search FAQ..." 
                value={helpSearch} 
                onChange={(e) => setHelpSearch(e.target.value)} 
              />
              {filteredFaq.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-6">No matching questions found.</p>
              ) : (
                filteredFaq.map((item, index) => <FaqItem key={index} q={item.q} a={item.a} />)
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Mail className="h-4 w-4 text-primary-600" />
                Contact Support
              </CardTitle>
              <CardDescription>Need help? Send us a message</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Email</p>
                    <p className="text-sm font-medium text-slate-700">support@libraria.edu</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                  <Phone className="h-4 w-4 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Phone</p>
                    <p className="text-sm font-medium text-slate-700">+1 (555) 123-4567</p>
                  </div>
                </div>
              </div>
              <form onSubmit={handleHelpSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Your Name</Label>
                    <Input 
                      value={contactForm.name} 
                      onChange={(e) => setContactForm((p) => ({ ...p, name: e.target.value }))} 
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input 
                      type="email" 
                      value={contactForm.email} 
                      onChange={(e) => setContactForm((p) => ({ ...p, email: e.target.value }))} 
                    />
                  </div>
                </div>
                <div>
                  <Label>Subject</Label>
                  <Input 
                    value={contactForm.subject} 
                    onChange={(e) => setContactForm((p) => ({ ...p, subject: e.target.value }))} 
                    placeholder="How can we help?" 
                  />
                </div>
                <div>
                  <Label>Message</Label>
                  <Textarea 
                    rows={4} 
                    value={contactForm.message} 
                    onChange={(e) => setContactForm((p) => ({ ...p, message: e.target.value }))} 
                    placeholder="Describe your issue or question..." 
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={saving}>
                    {saving ? "Sending…" : "Send Message"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}