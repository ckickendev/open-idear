"use client";

import {
  HelpCircle,
  ShieldAlert,
  BadgeCheck,
  Mail,
  AlertTriangle,
  ChevronRight,
  BookOpen,
  Lock,
  UserCog,
  Bell,
  CreditCard,
  Eye,
  Flag,
  MessageCircle,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import SupportInboxClient from "../SupportInboxClient";

/* ── Section content config ─────────────────────────── */

const SECTION_DATA: Record<
  string,
  {
    title: string;
    subtitle: string;
    icon: React.ElementType;
    iconBg: string;
    iconColor: string;
    accentColor: string;
    content: React.ReactNode;
  }
> = {
  "trung-tam-tro-giup": {
    title: "Help Center",
    subtitle: "Comprehensive guides and documentation for OpenIdear",
    icon: HelpCircle,
    iconBg: "bg-blue-100 dark:bg-blue-900/40",
    iconColor: "text-blue-600 dark:text-blue-400",
    accentColor: "border-l-blue-500",
    content: <HelpCenterContent />,
  },
  "help-center": {
    title: "Help Center",
    subtitle: "Comprehensive guides and documentation for OpenIdear",
    icon: HelpCircle,
    iconBg: "bg-blue-100 dark:bg-blue-900/40",
    iconColor: "text-blue-600 dark:text-blue-400",
    accentColor: "border-l-blue-500",
    content: <HelpCenterContent />,
  },
  "ngan-chan-lua-dao": {
    title: "Anti-Fraud Center",
    subtitle: "Protect yourself and the community from fraudulent activities",
    icon: ShieldAlert,
    iconBg: "bg-orange-100 dark:bg-orange-900/40",
    iconColor: "text-orange-600 dark:text-orange-400",
    accentColor: "border-l-orange-500",
    content: <AntiFraudContent />,
  },
  "anti-fraud": {
    title: "Anti-Fraud Center",
    subtitle: "Protect yourself and the community from fraudulent activities",
    icon: ShieldAlert,
    iconBg: "bg-orange-100 dark:bg-orange-900/40",
    iconColor: "text-orange-600 dark:text-orange-400",
    accentColor: "border-l-orange-500",
    content: <AntiFraudContent />,
  },
  "trang-thai-tai-khoan": {
    title: "Account Status",
    subtitle: "Information about your account health and access permissions",
    icon: BadgeCheck,
    iconBg: "bg-green-100 dark:bg-green-900/40",
    iconColor: "text-green-600 dark:text-green-400",
    accentColor: "border-l-green-500",
    content: <AccountStatusContent />,
  },
  "account-status": {
    title: "Account Status",
    subtitle: "Information about your account health and access permissions",
    icon: BadgeCheck,
    iconBg: "bg-green-100 dark:bg-green-900/40",
    iconColor: "text-green-600 dark:text-green-400",
    accentColor: "border-l-green-500",
    content: <AccountStatusContent />,
  },
  "hop-thu-ho-tro": {
    title: "Support Inbox",
    subtitle: "Submit requests and track responses from our support team",
    icon: Mail,
    iconBg: "bg-violet-100 dark:bg-violet-900/40",
    iconColor: "text-violet-600 dark:text-violet-400",
    accentColor: "border-l-violet-500",
    content: null,
  },
  "support-inbox": {
    title: "Support Inbox",
    subtitle: "Submit requests and track responses from our support team",
    icon: Mail,
    iconBg: "bg-violet-100 dark:bg-violet-900/40",
    iconColor: "text-violet-600 dark:text-violet-400",
    accentColor: "border-l-violet-500",
    content: null,
  },
  "bao-cao-su-co": {
    title: "Report an Issue",
    subtitle: "Report policy violations, system errors, or inappropriate behavior",
    icon: AlertTriangle,
    iconBg: "bg-red-100 dark:bg-red-900/40",
    iconColor: "text-red-600 dark:text-red-400",
    accentColor: "border-l-red-500",
    content: <ReportIssueContent />,
  },
  "report-issue": {
    title: "Report an Issue",
    subtitle: "Report policy violations, system errors, or inappropriate behavior",
    icon: AlertTriangle,
    iconBg: "bg-red-100 dark:bg-red-900/40",
    iconColor: "text-red-600 dark:text-red-400",
    accentColor: "border-l-red-500",
    content: <ReportIssueContent />,
  },
};

/* ── Shared subcomponents ────────────────────────────── */

function FAQItem({ q, a }: { q: string; a: string }) {
  return (
    <div className="border border-border rounded-xl p-5 bg-card hover:border-primary/30 transition-colors">
      <h4 className="font-semibold text-sm text-foreground mb-2 flex items-start gap-2">
        <HelpCircle size={16} className="text-primary mt-0.5 flex-shrink-0" />
        {q}
      </h4>
      <p className="text-sm text-muted-foreground leading-relaxed pl-6">{a}</p>
    </div>
  );
}

function SectionCard({
  icon: Icon,
  title,
  href,
  desc,
}: {
  icon: React.ElementType;
  title: string;
  href: string;
  desc: string;
}) {
  return (
    <Link href={href}>
      <div className="group flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer">
        <div className="w-10 h-10 rounded-full bg-muted group-hover:bg-primary/10 flex items-center justify-center flex-shrink-0 transition-colors">
          <Icon size={20} className="text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{title}</p>
          <p className="text-xs text-muted-foreground truncate">{desc}</p>
        </div>
        <ChevronRight size={16} className="text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
      </div>
    </Link>
  );
}

/* ─── Help Center Content ──────────────────────────── */
function HelpCenterContent() {
  const topics = [
    { icon: BookOpen, title: "Publish & edit articles", href: "#dang-bai", desc: "Guide on creating, editing, and managing posts" },
    { icon: Lock, title: "Sign in & passwords", href: "#mat-khau", desc: "Troubleshooting login issues and resetting passwords" },
    { icon: UserCog, title: "Account settings", href: "#cap-nhat", desc: "Update profile information, avatar, and settings" },
    { icon: Bell, title: "Notifications", href: "#thong-bao", desc: "Customize and manage notification preferences" },
    { icon: CreditCard, title: "Billing & plans", href: "#thanh-toan", desc: "Payment details, subscription upgrades" },
    { icon: Eye, title: "Privacy & security", href: "#quyen-rieng-tu", desc: "Control who can view your published content" },
  ];
  const faqs = [
    { q: "How do I publish a post on OpenIdear?", a: 'Click "Create Post" at the top right after signing in, write your content, and click Publish.' },
    { q: "Can I edit an article after publishing?", a: "Yes, go to your Profile → Posts → select the article → click Edit." },
    { q: "How do I reset my password?", a: 'Click "Forgot password?" on the sign-in page and enter your email address. We will send a reset link.' },
    { q: "Can I delete my account?", a: "Go to Settings → Account → Delete Account. Please note this action is permanent and cannot be undone." },
  ];
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Popular Topics</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {topics.map((t) => <SectionCard key={t.href} icon={t.icon} title={t.title} href={t.href} desc={t.desc} />)}
        </div>
      </div>
      <div>
        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Frequently Asked Questions</h3>
        <div className="space-y-3">
          {faqs.map((faq) => <FAQItem key={faq.q} q={faq.q} a={faq.a} />)}
        </div>
      </div>
    </div>
  );
}

/* ─── Anti-Fraud Content ───────────────────────────── */
function AntiFraudContent() {
  const tips = [
    { title: "Never share your password", desc: "OpenIdear will never ask for your password via email or direct messages." },
    { title: "Check URLs carefully", desc: "Ensure you are visiting openidear.xyz and not a fraudulent phishing site." },
    { title: "Enable two-factor authentication", desc: "Turn on 2FA in Security Settings to better protect your account." },
    { title: "Beware of suspicious links", desc: "Do not click links from unverified emails or messages." },
    { title: "Report suspicious accounts", desc: "Noticed unusual behavior? Report it immediately using our reporting tools." },
  ];
  const signs = [
    "Requests for money transfers or gift cards",
    "Requests for sensitive personal or ID information",
    "Unexpected prizes or rewards",
    "Login links sent via unsolicited email or SMS",
    "Accounts asking to borrow banking credentials",
  ];
  return (
    <div className="space-y-8">
      <div className="flex items-start gap-4 p-5 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-2xl">
        <ShieldAlert size={24} className="text-orange-500 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-orange-900 dark:text-orange-300 mb-1">Important Notice</h4>
          <p className="text-sm text-orange-800 dark:text-orange-400 leading-relaxed">OpenIdear <strong>never</strong> requests your passwords, banking information, or OTP codes via any channel.</p>
        </div>
      </div>
      <div>
        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Safety Tips</h3>
        <div className="space-y-3">
          {tips.map((tip, i) => (
            <div key={i} className="flex items-start gap-4 p-4 bg-card border border-border rounded-xl">
              <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 size={18} className="text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{tip.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{tip.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Warning Signs of Fraud</h3>
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          {signs.map((sign, i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-3.5 border-b border-border last:border-0">
              <XCircle size={18} className="text-red-500 flex-shrink-0" />
              <span className="text-sm text-foreground">{sign}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="text-center bg-card border border-border rounded-2xl p-6">
        <AlertTriangle size={28} className="mx-auto text-orange-500 mb-3" />
        <h4 className="font-bold text-foreground mb-2">Spotted fraudulent behavior?</h4>
        <p className="text-sm text-muted-foreground mb-4">Report it immediately to keep the OpenIdear community safe.</p>
        <Link href="/help/bao-cao-su-co">
          <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors">Report Now</button>
        </Link>
      </div>
    </div>
  );
}

/* ─── Account Status Content ───────────────────────── */
function AccountStatusContent() {
  const statuses = [
    { icon: CheckCircle2, color: "text-green-500", bg: "bg-green-50 dark:bg-green-950/30", border: "border-green-200 dark:border-green-800", status: "Active", desc: "Your account is operating normally with full access to all features." },
    { icon: AlertCircle, color: "text-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-950/30", border: "border-yellow-200 dark:border-yellow-800", status: "Partially Restricted", desc: "Some features are restricted due to policy concerns. Check your email for details." },
    { icon: XCircle, color: "text-red-500", bg: "bg-red-50 dark:bg-red-950/30", border: "border-red-200 dark:border-red-800", status: "Suspended", desc: "Your account is temporarily suspended. Contact support for recovery instructions." },
  ];
  const accountInfoItems = [
    { label: "Account Type", value: "Standard Member" },
    { label: "Registration Date", value: "—" },
    { label: "Verification Status", value: "Unverified" },
    { label: "Published Articles", value: "—" },
    { label: "Followers", value: "—" },
  ];
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Account Status Categories</h3>
        <div className="space-y-3">
          {statuses.map((s) => (
            <div key={s.status} className={`flex items-start gap-4 p-5 border rounded-2xl ${s.bg} ${s.border}`}>
              <s.icon size={22} className={`${s.color} flex-shrink-0 mt-0.5`} />
              <div>
                <p className={`font-bold text-sm ${s.color} mb-1`}>{s.status}</p>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Account Information</h3>
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          {accountInfoItems.map((item, i) => (
            <div key={i} className="flex items-center justify-between px-5 py-3.5 border-b border-border last:border-0">
              <span className="text-sm text-muted-foreground">{item.label}</span>
              <span className="text-sm font-semibold text-foreground">{item.value}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3 text-center">Log in to view detailed account information</p>
      </div>
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-800 rounded-2xl p-6 text-center">
        <BadgeCheck size={32} className="mx-auto text-green-500 mb-3" />
        <h4 className="font-bold text-foreground mb-1">Verify Your Account</h4>
        <p className="text-sm text-muted-foreground mb-4">Get verified to earn a blue checkmark and priority support.</p>
        <Link href="/profile/settings">
          <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors">Verify Now</button>
        </Link>
      </div>
    </div>
  );
}

/* ─── Report Issue Content ─────────────────────────── */
function ReportIssueContent() {
  const reportTypes = [
    { icon: Flag, title: "Inappropriate Content", desc: "Posts or comments containing spam, inappropriate material, or misinformation" },
    { icon: ShieldAlert, title: "Fraudulent Activity", desc: "Accounts or activities showing signs of scams or impersonation" },
    { icon: AlertTriangle, title: "Technical Glitch", desc: "System downtime, pages failing to load, or unexpected errors" },
    { icon: XCircle, title: "Copyright Infringement", desc: "Content copied or assets used without proper authorization" },
    { icon: UserCog, title: "Compromised Account", desc: "Suspected unauthorized access or hacked accounts" },
    { icon: MessageCircle, title: "Harassment", desc: "Harassing, abusive, or threatening comments or messages" },
  ];
  return (
    <div className="space-y-8">
      <div className="flex items-start gap-4 p-5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-2xl">
        <AlertTriangle size={22} className="text-red-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-red-900 dark:text-red-300 text-sm mb-1">Emergency Situation</p>
          <p className="text-sm text-red-700 dark:text-red-400">If you or someone else is in immediate danger, please contact local emergency authorities.</p>
        </div>
      </div>
      <div>
        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Select Report Category</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {reportTypes.map((type) => (
            <button key={type.title} className="flex items-start gap-4 p-4 rounded-xl border border-border bg-card hover:border-red-300 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all text-left group cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-muted group-hover:bg-red-100 dark:group-hover:bg-red-900/40 flex items-center justify-center flex-shrink-0 transition-colors">
                <type.icon size={20} className="text-muted-foreground group-hover:text-red-500 transition-colors" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">{type.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{type.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="font-bold text-base text-foreground mb-5 flex items-center gap-2">
          <AlertTriangle size={18} className="text-red-500" /> Report Details
        </h3>
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Report Type <span className="text-red-500">*</span></label>
            <select className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border text-sm text-foreground outline-none focus:ring-2 focus:ring-red-400/30">
              <option value="">Select report type...</option>
              <option>Inappropriate Content</option>
              <option>Fraudulent Activity</option>
              <option>Technical Glitch</option>
              <option>Copyright Infringement</option>
              <option>Compromised Account</option>
              <option>Harassment</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Related URL or Content ID</label>
            <input type="text" placeholder="https://openidear.xyz/post/..." className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-red-400/30" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Detailed Description <span className="text-red-500">*</span></label>
            <textarea rows={5} placeholder="Describe the issue in detail, including steps to reproduce if applicable..." className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-red-400/30 resize-none" />
          </div>
          <button type="submit" className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-semibold text-sm transition-colors shadow-md">
            <Flag size={16} /> Submit Report
          </button>
        </form>
      </div>
    </div>
  );
}

/* ── Page Component ──────────────────────────────────── */
export default function HelpSectionPage() {
  const params = useParams();
  const section = params?.section as string;
  const data = SECTION_DATA[section];

  if (!data) {
    return (
      <div className="text-center py-20">
        <HelpCircle size={48} className="mx-auto text-muted-foreground mb-4" />
        <h2 className="text-xl font-bold text-foreground mb-2">Page not found</h2>
        <p className="text-muted-foreground mb-6">This help page does not exist.</p>
        <Link href="/help">
          <button className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors">
            Back to Help Center
          </button>
        </Link>
      </div>
    );
  }

  const { title, subtitle, icon: Icon, iconBg, iconColor, accentColor, content } = data;

  return (
    <div className="space-y-6">
      {/* Section header */}
      <div className={`bg-card border border-border border-l-4 ${accentColor} rounded-2xl p-6 shadow-sm`}>
        <div className="flex items-start gap-4">
          <div className={`w-14 h-14 rounded-2xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
            <Icon size={28} className={iconColor} />
          </div>
          <div>
            <h2 className="text-xl font-black text-foreground mb-1">{title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{subtitle}</p>
            <div className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground">
              <Link href="/help" className="hover:text-primary transition-colors">Help</Link>
              <ChevronRight size={12} />
              <span className="text-foreground font-medium">{title}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section content */}
      {section === "hop-thu-ho-tro" || section === "support-inbox" ? <SupportInboxClient /> : content}

      {/* Back link */}
      <div className="pt-4 border-t border-border">
        <Link href="/help" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5">
          ← Back to Help Center
        </Link>
      </div>
    </div>
  );
}
