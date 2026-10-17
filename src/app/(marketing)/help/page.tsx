import Link from "next/link";
import {
  HelpCircle,
  ShieldAlert,
  BadgeCheck,
  Mail,
  AlertTriangle,
  Search,
  BookOpen,
  Lock,
  UserCog,
  Bell,
  CreditCard,
  MessageCircle,
  ChevronRight,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Help Center — OpenIdear",
  description:
    "Find answers to your questions and get support from the OpenIdear team.",
};

const QUICK_SECTIONS = [
  {
    href: "/help/trung-tam-tro-giup",
    icon: HelpCircle,
    color: "from-blue-500 to-blue-600",
    iconBg: "bg-blue-100 dark:bg-blue-900/50",
    iconColor: "text-blue-600 dark:text-blue-400",
    title: "Help Center",
    desc: "Frequently asked questions, user guides, and comprehensive documentation.",
  },
  {
    href: "/help/ngan-chan-lua-dao",
    icon: ShieldAlert,
    color: "from-orange-500 to-amber-500",
    iconBg: "bg-orange-100 dark:bg-orange-900/50",
    iconColor: "text-orange-600 dark:text-orange-400",
    title: "Anti-Fraud Center",
    desc: "Protect yourself against fraudulent behavior and online threats.",
  },
  {
    href: "/help/trang-thai-tai-khoan",
    icon: BadgeCheck,
    color: "from-green-500 to-emerald-500",
    iconBg: "bg-green-100 dark:bg-green-900/50",
    iconColor: "text-green-600 dark:text-green-400",
    title: "Account Status",
    desc: "Check account health, verification status, and active restrictions.",
  },
  {
    href: "/help/hop-thu-ho-tro",
    icon: Mail,
    color: "from-violet-500 to-purple-500",
    iconBg: "bg-violet-100 dark:bg-violet-900/50",
    iconColor: "text-violet-600 dark:text-violet-400",
    title: "Support Inbox",
    desc: "View and manage support requests submitted to our team.",
  },
  {
    href: "/help/bao-cao-su-co",
    icon: AlertTriangle,
    color: "from-red-500 to-rose-500",
    iconBg: "bg-red-100 dark:bg-red-900/50",
    iconColor: "text-red-600 dark:text-red-400",
    title: "Report an Issue",
    desc: "Report bugs, content violations, or inappropriate behavior.",
  },
];

const POPULAR_TOPICS = [
  { icon: BookOpen, label: "How to publish a post?", href: "/help/trung-tam-tro-giup#dang-bai" },
  { icon: Lock, label: "Change account password", href: "/help/trung-tam-tro-giup#mat-khau" },
  { icon: UserCog, label: "Update profile information", href: "/help/trung-tam-tro-giup#cap-nhat" },
  { icon: Bell, label: "Manage notifications", href: "/help/trung-tam-tro-giup#thong-bao" },
  { icon: CreditCard, label: "Billing and payments", href: "/help/trung-tam-tro-giup#thanh-toan" },
  { icon: MessageCircle, label: "Contact direct support", href: "/help/hop-thu-ho-tro" },
];

export default function HelpPage() {
  return (
    <div className="space-y-8">
      {/* Search Hero */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-black text-foreground mb-1">
          How can we help you?
        </h2>
        <p className="text-sm text-muted-foreground mb-5">
          Search for answers or browse categories below
        </p>
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            placeholder="Ask a question or describe your issue..."
            className="w-full pl-11 pr-5 py-3.5 rounded-xl bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/40 transition"
          />
        </div>
      </div>

      {/* Section cards */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">
          Main Topics
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {QUICK_SECTIONS.map((s) => (
            <Link key={s.href} href={s.href}>
              <div className="group h-full bg-card border border-border rounded-2xl p-5 hover:border-primary/30 hover:shadow-md transition-all duration-200 cursor-pointer">
                <div
                  className={`w-12 h-12 rounded-2xl ${s.iconBg} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}
                >
                  <s.icon size={24} className={s.iconColor} />
                </div>
                <h4 className="font-bold text-base text-foreground mb-1.5 group-hover:text-primary transition-colors">
                  {s.title}
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {s.desc}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Popular topics */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="font-bold text-base text-foreground">Popular Questions</h3>
        </div>
        <div className="divide-y divide-border">
          {POPULAR_TOPICS.map((topic) => (
            <Link key={topic.href} href={topic.href}>
              <div className="flex items-center gap-4 px-6 py-4 hover:bg-muted transition-colors group cursor-pointer">
                <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 transition-colors">
                  <topic.icon size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <span className="flex-1 text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                  {topic.label}
                </span>
                <ChevronRight size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Contact CTA */}
      <div className="bg-gradient-to-br from-primary/10 via-transparent to-violet-500/10 border border-border rounded-2xl p-6 text-center">
        <MessageCircle size={32} className="mx-auto text-primary mb-3" />
        <h3 className="font-bold text-lg text-foreground mb-1">Still need help?</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Our support team is always available to help 24/7.
        </p>
        <Link href="/help/hop-thu-ho-tro">
          <button className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors shadow-md">
            <Mail size={16} /> Submit a Request
          </button>
        </Link>
      </div>
    </div>
  );
}
