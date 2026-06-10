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
  title: "Trung tâm trợ giúp — OpenIdear",
  description:
    "Tìm kiếm câu trả lời cho các câu hỏi của bạn và nhận hỗ trợ từ đội ngũ OpenIdear.",
};

const QUICK_SECTIONS = [
  {
    href: "/help/trung-tam-tro-giup",
    icon: HelpCircle,
    color: "from-blue-500 to-blue-600",
    iconBg: "bg-blue-100 dark:bg-blue-900/50",
    iconColor: "text-blue-600 dark:text-blue-400",
    title: "Trung tâm trợ giúp",
    desc: "Câu hỏi thường gặp, hướng dẫn sử dụng và tài liệu hỗ trợ đầy đủ.",
  },
  {
    href: "/help/ngan-chan-lua-dao",
    icon: ShieldAlert,
    color: "from-orange-500 to-amber-500",
    iconBg: "bg-orange-100 dark:bg-orange-900/50",
    iconColor: "text-orange-600 dark:text-orange-400",
    title: "Ngăn chặn lừa đảo",
    desc: "Bảo vệ bản thân khỏi hành vi gian lận và các mối đe dọa trực tuyến.",
  },
  {
    href: "/help/trang-thai-tai-khoan",
    icon: BadgeCheck,
    color: "from-green-500 to-emerald-500",
    iconBg: "bg-green-100 dark:bg-green-900/50",
    iconColor: "text-green-600 dark:text-green-400",
    title: "Trạng thái tài khoản",
    desc: "Kiểm tra tình trạng tài khoản, xác minh và các hạn chế đang hoạt động.",
  },
  {
    href: "/help/hop-thu-ho-tro",
    icon: Mail,
    color: "from-violet-500 to-purple-500",
    iconBg: "bg-violet-100 dark:bg-violet-900/50",
    iconColor: "text-violet-600 dark:text-violet-400",
    title: "Hộp thư hỗ trợ",
    desc: "Xem và quản lý các yêu cầu hỗ trợ đã gửi cho đội ngũ chúng tôi.",
  },
  {
    href: "/help/bao-cao-su-co",
    icon: AlertTriangle,
    color: "from-red-500 to-rose-500",
    iconBg: "bg-red-100 dark:bg-red-900/50",
    iconColor: "text-red-600 dark:text-red-400",
    title: "Báo cáo sự cố",
    desc: "Báo cáo lỗi, nội dung vi phạm hoặc hành vi không phù hợp.",
  },
];

const POPULAR_TOPICS = [
  { icon: BookOpen, label: "Cách đăng bài viết?", href: "/help/trung-tam-tro-giup#dang-bai" },
  { icon: Lock, label: "Đổi mật khẩu tài khoản", href: "/help/trung-tam-tro-giup#mat-khau" },
  { icon: UserCog, label: "Cập nhật thông tin cá nhân", href: "/help/trung-tam-tro-giup#cap-nhat" },
  { icon: Bell, label: "Quản lý thông báo", href: "/help/trung-tam-tro-giup#thong-bao" },
  { icon: CreditCard, label: "Thông tin thanh toán", href: "/help/trung-tam-tro-giup#thanh-toan" },
  { icon: MessageCircle, label: "Liên hệ hỗ trợ trực tiếp", href: "/help/hop-thu-ho-tro" },
];

export default function HelpPage() {
  return (
    <div className="space-y-8">
      {/* Search Hero */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-black text-foreground mb-1">
          Tôi có thể giúp gì cho bạn?
        </h2>
        <p className="text-sm text-muted-foreground mb-5">
          Tìm kiếm câu trả lời hoặc chọn một chủ đề bên dưới
        </p>
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            placeholder="Đặt câu hỏi hoặc mô tả vấn đề của bạn..."
            className="w-full pl-11 pr-5 py-3.5 rounded-xl bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/40 transition"
          />
        </div>
      </div>

      {/* Section cards */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">
          Chủ đề chính
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
          <h3 className="font-bold text-base text-foreground">Câu hỏi phổ biến</h3>
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
        <h3 className="font-bold text-lg text-foreground mb-1">Vẫn cần hỗ trợ?</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng giúp đỡ bạn 24/7.
        </p>
        <Link href="/help/hop-thu-ho-tro">
          <button className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors shadow-md">
            <Mail size={16} /> Gửi yêu cầu hỗ trợ
          </button>
        </Link>
      </div>
    </div>
  );
}
