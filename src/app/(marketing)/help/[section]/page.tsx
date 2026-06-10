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
    title: "Trung tâm trợ giúp",
    subtitle: "Tài liệu hướng dẫn sử dụng OpenIdear đầy đủ và chi tiết",
    icon: HelpCircle,
    iconBg: "bg-blue-100 dark:bg-blue-900/40",
    iconColor: "text-blue-600 dark:text-blue-400",
    accentColor: "border-l-blue-500",
    content: <HelpCenterContent />,
  },
  "ngan-chan-lua-dao": {
    title: "Trung tâm ngăn chặn hành vi lừa đảo",
    subtitle: "Bảo vệ bản thân và cộng đồng khỏi các hành vi gian lận",
    icon: ShieldAlert,
    iconBg: "bg-orange-100 dark:bg-orange-900/40",
    iconColor: "text-orange-600 dark:text-orange-400",
    accentColor: "border-l-orange-500",
    content: <AntiFraudContent />,
  },
  "trang-thai-tai-khoan": {
    title: "Trạng thái tài khoản",
    subtitle: "Thông tin về trạng thái và quyền truy cập tài khoản của bạn",
    icon: BadgeCheck,
    iconBg: "bg-green-100 dark:bg-green-900/40",
    iconColor: "text-green-600 dark:text-green-400",
    accentColor: "border-l-green-500",
    content: <AccountStatusContent />,
  },
  "hop-thu-ho-tro": {
    title: "Hộp thư hỗ trợ",
    subtitle: "Gửi yêu cầu và theo dõi phản hồi từ đội ngũ hỗ trợ",
    icon: Mail,
    iconBg: "bg-violet-100 dark:bg-violet-900/40",
    iconColor: "text-violet-600 dark:text-violet-400",
    accentColor: "border-l-violet-500",
    content: null, // rendered separately below
  },
  "bao-cao-su-co": {
    title: "Báo cáo sự cố",
    subtitle: "Báo cáo nội dung vi phạm, lỗi hệ thống hoặc hành vi không phù hợp",
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
    { icon: BookOpen, title: "Đăng & chỉnh sửa bài viết", href: "#dang-bai", desc: "Hướng dẫn tạo, chỉnh sửa và quản lý bài viết" },
    { icon: Lock, title: "Đăng nhập & mật khẩu", href: "#mat-khau", desc: "Khắc phục sự cố đăng nhập và đổi mật khẩu" },
    { icon: UserCog, title: "Cài đặt tài khoản", href: "#cap-nhat", desc: "Cập nhật thông tin, ảnh đại diện và cài đặt" },
    { icon: Bell, title: "Thông báo", href: "#thong-bao", desc: "Tuỳ chỉnh và quản lý thông báo" },
    { icon: CreditCard, title: "Thanh toán & gói cước", href: "#thanh-toan", desc: "Thông tin thanh toán, nâng cấp tài khoản" },
    { icon: Eye, title: "Quyền riêng tư", href: "#quyen-rieng-tu", desc: "Kiểm soát ai có thể xem nội dung của bạn" },
  ];
  const faqs = [
    { q: "Làm thế nào để đăng bài viết lên OpenIdear?", a: 'Nhấn "Tạo bài viết" ở góc trên bên phải sau khi đăng nhập, điền nội dung và nhấn Đăng tải.' },
    { q: "Tôi có thể chỉnh sửa bài viết sau khi đã đăng không?", a: "Có, vào trang cá nhân → Bài viết → chọn bài → nhấn Chỉnh sửa." },
    { q: "Làm thế nào để đặt lại mật khẩu?", a: 'Nhấn "Quên mật khẩu?" trên trang đăng nhập và nhập email. Chúng tôi sẽ gửi link trong vài phút.' },
    { q: "Tôi có thể xóa tài khoản không?", a: "Vào Cài đặt → Tài khoản → Xóa tài khoản. Lưu ý thao tác này không thể hoàn tác." },
  ];
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Chủ đề phổ biến</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {topics.map((t) => <SectionCard key={t.href} icon={t.icon} title={t.title} href={t.href} desc={t.desc} />)}
        </div>
      </div>
      <div>
        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Câu hỏi thường gặp</h3>
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
    { title: "Không chia sẻ mật khẩu", desc: "OpenIdear sẽ không bao giờ yêu cầu mật khẩu qua email hay tin nhắn." },
    { title: "Kiểm tra URL cẩn thận", desc: "Đảm bảo bạn đang truy cập openidear.xyz, không phải trang giả mạo." },
    { title: "Bật xác thực 2 bước", desc: "Bật 2FA trong Cài đặt bảo mật để tăng cường bảo vệ tài khoản." },
    { title: "Cảnh giác với đường link lạ", desc: "Không nhấn link từ email, tin nhắn không rõ nguồn gốc." },
    { title: "Báo cáo tài khoản nghi ngờ", desc: "Thấy hành vi bất thường? Báo cáo ngay qua tính năng Báo cáo." },
  ];
  const signs = ["Yêu cầu chuyển tiền hay tặng thẻ cào", "Cung cấp thông tin cá nhân, CMND/CCCD", "Nhận thưởng hay giải thưởng bất ngờ", "Link đăng nhập gửi qua email / SMS", "Tài khoản hỏi mượn thông tin ngân hàng"];
  return (
    <div className="space-y-8">
      <div className="flex items-start gap-4 p-5 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-2xl">
        <ShieldAlert size={24} className="text-orange-500 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-orange-900 dark:text-orange-300 mb-1">Lưu ý quan trọng</h4>
          <p className="text-sm text-orange-800 dark:text-orange-400 leading-relaxed">OpenIdear <strong>không bao giờ</strong> yêu cầu mật khẩu, thông tin ngân hàng hoặc mã OTP của bạn qua bất kỳ kênh nào.</p>
        </div>
      </div>
      <div>
        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Mẹo bảo vệ bản thân</h3>
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
        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Dấu hiệu cảnh báo lừa đảo</h3>
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
        <h4 className="font-bold text-foreground mb-2">Phát hiện hành vi lừa đảo?</h4>
        <p className="text-sm text-muted-foreground mb-4">Báo cáo ngay để bảo vệ cộng đồng OpenIdear</p>
        <Link href="/help/bao-cao-su-co">
          <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors">Báo cáo ngay</button>
        </Link>
      </div>
    </div>
  );
}

/* ─── Account Status Content ───────────────────────── */
function AccountStatusContent() {
  const statuses = [
    { icon: CheckCircle2, color: "text-green-500", bg: "bg-green-50 dark:bg-green-950/30", border: "border-green-200 dark:border-green-800", status: "Đang hoạt động", desc: "Tài khoản đang hoạt động bình thường. Bạn có đầy đủ quyền truy cập vào tất cả tính năng." },
    { icon: AlertCircle, color: "text-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-950/30", border: "border-yellow-200 dark:border-yellow-800", status: "Bị hạn chế một phần", desc: "Một số tính năng bị hạn chế do vi phạm chính sách. Kiểm tra email để biết thêm." },
    { icon: XCircle, color: "text-red-500", bg: "bg-red-50 dark:bg-red-950/30", border: "border-red-200 dark:border-red-800", status: "Bị đình chỉ", desc: "Tài khoản tạm thời bị đình chỉ. Liên hệ bộ phận hỗ trợ để được hướng dẫn phục hồi." },
  ];
  const accountInfoItems = [
    { label: "Loại tài khoản", value: "Thành viên chuẩn" },
    { label: "Ngày đăng ký", value: "—" },
    { label: "Trạng thái xác minh", value: "Chưa xác minh" },
    { label: "Bài viết đã đăng", value: "—" },
    { label: "Người theo dõi", value: "—" },
  ];
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Các loại trạng thái tài khoản</h3>
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
        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Thông tin tài khoản</h3>
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          {accountInfoItems.map((item, i) => (
            <div key={i} className="flex items-center justify-between px-5 py-3.5 border-b border-border last:border-0">
              <span className="text-sm text-muted-foreground">{item.label}</span>
              <span className="text-sm font-semibold text-foreground">{item.value}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3 text-center">Đăng nhập để xem thông tin chi tiết</p>
      </div>
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-800 rounded-2xl p-6 text-center">
        <BadgeCheck size={32} className="mx-auto text-green-500 mb-3" />
        <h4 className="font-bold text-foreground mb-1">Xác minh tài khoản</h4>
        <p className="text-sm text-muted-foreground mb-4">Xác minh để được huy hiệu xanh và quyền ưu tiên hỗ trợ</p>
        <Link href="/profile/settings">
          <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors">Xác minh ngay</button>
        </Link>
      </div>
    </div>
  );
}

/* ─── Report Issue Content ─────────────────────────── */
function ReportIssueContent() {
  const reportTypes = [
    { icon: Flag, title: "Nội dung vi phạm", desc: "Bài viết, bình luận chứa nội dung không phù hợp, spam hoặc thông tin sai lệch" },
    { icon: ShieldAlert, title: "Hành vi lừa đảo", desc: "Tài khoản hoặc hoạt động có dấu hiệu lừa đảo, giả mạo người khác" },
    { icon: AlertTriangle, title: "Lỗi kỹ thuật", desc: "Sự cố hệ thống, trang không tải được, tính năng hoạt động sai" },
    { icon: XCircle, title: "Vi phạm bản quyền", desc: "Nội dung sao chép, sử dụng tài nguyên mà không có sự cho phép" },
    { icon: UserCog, title: "Tài khoản bị xâm phạm", desc: "Nghi ngờ tài khoản bị hack hoặc truy cập trái phép" },
    { icon: MessageCircle, title: "Hành vi quấy rối", desc: "Bị nhắn tin hoặc bình luận mang tính quấy rối, xúc phạm" },
  ];
  return (
    <div className="space-y-8">
      <div className="flex items-start gap-4 p-5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-2xl">
        <AlertTriangle size={22} className="text-red-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-red-900 dark:text-red-300 text-sm mb-1">Trường hợp khẩn cấp</p>
          <p className="text-sm text-red-700 dark:text-red-400">Nếu bạn đang gặp nguy hiểm, vui lòng liên hệ cơ quan chức năng tại địa phương.</p>
        </div>
      </div>
      <div>
        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Chọn loại báo cáo</h3>
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
          <AlertTriangle size={18} className="text-red-500" /> Chi tiết báo cáo
        </h3>
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Loại báo cáo <span className="text-red-500">*</span></label>
            <select className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border text-sm text-foreground outline-none focus:ring-2 focus:ring-red-400/30">
              <option value="">Chọn loại báo cáo...</option>
              <option>Nội dung vi phạm</option>
              <option>Hành vi lừa đảo</option>
              <option>Lỗi kỹ thuật</option>
              <option>Vi phạm bản quyền</option>
              <option>Tài khoản bị xâm phạm</option>
              <option>Hành vi quấy rối</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">URL hoặc ID nội dung liên quan</label>
            <input type="text" placeholder="https://openidear.xyz/post/..." className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-red-400/30" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Mô tả chi tiết <span className="text-red-500">*</span></label>
            <textarea rows={5} placeholder="Mô tả chi tiết sự cố..." className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-red-400/30 resize-none" />
          </div>
          <button type="submit" className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-semibold text-sm transition-colors shadow-md">
            <Flag size={16} /> Gửi báo cáo
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
        <h2 className="text-xl font-bold text-foreground mb-2">Không tìm thấy trang</h2>
        <p className="text-muted-foreground mb-6">Trang trợ giúp này không tồn tại.</p>
        <Link href="/help">
          <button className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors">
            Về trang trợ giúp
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
              <Link href="/help" className="hover:text-primary transition-colors">Trợ giúp</Link>
              <ChevronRight size={12} />
              <span className="text-foreground font-medium">{title}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section content */}
      {section === "hop-thu-ho-tro" ? <SupportInboxClient /> : content}

      {/* Back link */}
      <div className="pt-4 border-t border-border">
        <Link href="/help" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5">
          ← Quay về Trung tâm trợ giúp
        </Link>
      </div>
    </div>
  );
}
