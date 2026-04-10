/* eslint-disable no-console */
import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

const pgPool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pgPool);
const prisma = new PrismaClient({ adapter });

// ============================================================
// Seed Company Documents for RAG AI Chatbot
// Run: pnpm ts-node --compiler-options '{"module":"commonjs"}' prisma/seed-company-docs.ts
// Or: npx tsx prisma/seed-company-docs.ts
// ============================================================

interface DocumentSeed {
  title: string;
  category: string;
  content: string;
}

const ADMIN_USER_ID = 2n; // Admin user (admin@staffup.vn)

const documents: DocumentSeed[] = [
  // =============================================
  // 1. NỘI QUY LAO ĐỘNG
  // =============================================
  {
    title: 'Nội quy lao động công ty StaffUp',
    category: 'Nội quy',
    content: `# NỘI QUY LAO ĐỘNG CÔNG TY STAFFUP

## CHƯƠNG I: QUY ĐỊNH CHUNG

### Điều 1: Phạm vi áp dụng
Nội quy này áp dụng cho toàn bộ nhân viên đang làm việc tại Công ty StaffUp, bao gồm nhân viên chính thức, nhân viên thử việc, nhân viên hợp đồng và cộng tác viên.

### Điều 2: Giờ làm việc
1. **Giờ làm việc chính thức:** Thứ 2 đến Thứ 6, từ 08:00 đến 17:30.
2. **Giờ nghỉ trưa:** 12:00 – 13:30.
3. **Tổng thời gian làm việc:** 40 giờ/tuần.
4. **Chế độ Flexible Time:** Nhân viên có thể đến muộn hoặc về sớm 30 phút so với giờ quy định, với điều kiện đảm bảo đủ 8 tiếng làm việc/ngày và được quản lý trực tiếp đồng ý.
5. **Làm việc từ xa (Remote Work):** Nhân viên được phép làm việc từ xa tối đa 2 ngày/tuần sau khi hoàn thành thời gian thử việc. Cần đăng ký trước với quản lý ít nhất 1 ngày.

### Điều 3: Chấm công
1. Nhân viên chấm công bằng hệ thống nhận diện khuôn mặt tại cổng vào.
2. Đi trễ quá 15 phút mà không có lý do chính đáng sẽ bị trừ 0.5 ngày phép.
3. Đi trễ quá 3 lần/tháng sẽ bị nhắc nhở bằng văn bản.
4. Vắng mặt không phép 3 ngày liên tục sẽ bị kỷ luật theo quy định.

### Điều 4: Trang phục
1. **Thứ 2 - Thứ 5:** Trang phục công sở lịch sự, gọn gàng. Nam mặc áo sơ mi, quần tây. Nữ mặc áo sơ mi hoặc áo kiểu công sở.
2. **Thứ 6 (Casual Friday):** Được phép mặc trang phục thoải mái nhưng lịch sự. Không được mặc quần đùi, dép lê, áo ba lỗ.
3. **Ngày có khách hàng đến:** Tất cả nhân viên phải mặc đồng phục công ty.

## CHƯƠNG II: QUYỀN VÀ NGHĨA VỤ CỦA NHÂN VIÊN

### Điều 5: Quyền lợi
1. Được hưởng đầy đủ lương, thưởng theo hợp đồng lao động.
2. Được tham gia BHXH, BHYT, BHTN theo quy định pháp luật.
3. Được cấp trang thiết bị làm việc: laptop, màn hình phụ, bàn phím cơ.
4. Trợ cấp ăn trưa: 50,000 VND/ngày.
5. Trợ cấp đi lại: 500,000 VND/tháng (nhân viên ở cách công ty > 10km).
6. Trợ cấp điện thoại: 200,000 VND/tháng cho nhân viên từ cấp Senior trở lên.

### Điều 6: Nghĩa vụ
1. Tuân thủ nội quy và các quy định của công ty.
2. Hoàn thành công việc đúng tiến độ và chất lượng.
3. Bảo mật thông tin khách hàng và thông tin nội bộ công ty.
4. Giữ gìn văn minh nơi làm việc.
5. Tham gia đầy đủ các buổi họp và đào tạo bắt buộc.`,
  },

  // =============================================
  // 2. CHÍNH SÁCH NGHỈ PHÉP
  // =============================================
  {
    title: 'Chính sách nghỉ phép và ngày lễ',
    category: 'Chính sách',
    content: `# CHÍNH SÁCH NGHỈ PHÉP VÀ NGÀY LỄ

## I. NGHỈ PHÉP NĂM

### 1. Số ngày phép
- **Nhân viên chính thức:** 12 ngày phép/năm.
- **Nhân viên từ 5 năm trở lên:** Cộng thêm 1 ngày phép cho mỗi 5 năm làm việc.
- **Cấp quản lý (Manager trở lên):** 15 ngày phép/năm.
- **Nhân viên thử việc:** Không có phép năm, chỉ được nghỉ không lương khi có lý do chính đáng.

### 2. Quy trình xin nghỉ phép
1. Gửi đơn xin phép qua hệ thống HR Portal trước ít nhất **3 ngày làm việc**.
2. Nghỉ phép trên 3 ngày liên tục cần gửi đơn trước **1 tuần**.
3. Nghỉ phép trên 5 ngày liên tục cần được phê duyệt bởi **Giám đốc bộ phận**.
4. Trường hợp khẩn cấp: Thông báo qua điện thoại cho quản lý trực tiếp trước 08:00 sáng và gửi đơn bổ sung trong vòng 24 giờ.

### 3. Chuyển phép năm
- Được phép chuyển tối đa **5 ngày** phép chưa sử dụng sang năm sau.
- Phép chuyển sang phải được sử dụng trước **31/03** của năm tiếp theo.
- Không được quy đổi phép thành tiền.

## II. NGHỈ KHÔNG LƯƠNG

- Nhân viên có thể xin nghỉ không lương khi đã sử dụng hết phép năm.
- Tối đa **10 ngày** nghỉ không lương/năm.
- Cần được phê duyệt bởi quản lý trực tiếp và phòng HR.
- Nghỉ không lương trên 5 ngày liên tục cần có đơn giải trình.

## III. NGHỈ PHÉP ĐẶC BIỆT (CÓ LƯƠNG)

| Loại nghỉ phép | Số ngày |
|----------------|---------|
| Kết hôn (bản thân) | 3 ngày |
| Kết hôn (con) | 1 ngày |
| Tang (bố mẹ, vợ/chồng, con) | 3 ngày |
| Tang (ông bà, anh chị em) | 1 ngày |
| Sinh con (nam) | 5 ngày |
| Thai sản (nữ) | 6 tháng |
| Hiến máu | 1 ngày |
| Chuyển nhà | 1 ngày |

## IV. NGÀY LỄ

Nhân viên được nghỉ có lương vào các ngày lễ theo quy định pháp luật:
1. **Tết Dương lịch:** 1 ngày (01/01)
2. **Tết Âm lịch:** 5 ngày (từ 29 Tết đến mùng 3)
3. **Giỗ Tổ Hùng Vương:** 1 ngày (10/3 Âm lịch)
4. **Ngày Giải phóng:** 1 ngày (30/04)
5. **Ngày Quốc tế Lao động:** 1 ngày (01/05)
6. **Quốc khánh:** 2 ngày (02/09 - 03/09)

**Nếu ngày lễ trùng thứ 7 hoặc Chủ nhật:** Được nghỉ bù vào ngày làm việc kế tiếp.`,
  },

  // =============================================
  // 3. CHÍNH SÁCH LƯƠNG THƯỞNG
  // =============================================
  {
    title: 'Chính sách lương, thưởng và phúc lợi',
    category: 'Chính sách',
    content: `# CHÍNH SÁCH LƯƠNG, THƯỞNG VÀ PHÚC LỢI

## I. CƠ CẤU LƯƠNG

### 1. Thành phần lương
- **Lương cơ bản:** Theo hợp đồng lao động, trả vào ngày **10 hàng tháng**.
- **Phụ cấp cố định:** Ăn trưa (50,000/ngày), đi lại, điện thoại.
- **Phụ cấp chức vụ:** Áp dụng cho cấp Team Lead trở lên.
- **Thưởng KPI:** Đánh giá hàng quý, chi trả vào tháng cuối quý.

### 2. Kỳ trả lương
- Lương trả qua chuyển khoản ngân hàng vào ngày **10 hàng tháng**.
- Nếu ngày 10 trùng ngày nghỉ, lương sẽ được chuyển vào ngày làm việc trước đó.
- Nhân viên nhận bảng lương chi tiết qua email.

### 3. Tăng lương
- Xét tăng lương **1 lần/năm** vào tháng 4.
- Mức tăng lương dựa trên: Kết quả đánh giá KPI, năng lực, thái độ làm việc, và tình hình kinh doanh công ty.
- Mức tăng tối thiểu: 5% (đạt KPI). Tối đa: 20% (xuất sắc).

## II. THƯỞNG

### 1. Thưởng cố định
- **Thưởng Tết Nguyên đán:** 1 tháng lương (nhân viên đã làm đủ 12 tháng). Tỷ lệ pro-rata cho nhân viên chưa đủ 12 tháng.
- **Thưởng tháng 13:** 1 tháng lương, trả vào cuối tháng 12.
- **Thưởng giữa năm:** 0.5 tháng lương cho nhân viên đạt KPI xuất sắc, trả cuối tháng 6.

### 2. Thưởng đột xuất
- **Thưởng dự án:** 2-10 triệu VND cho các dự án hoàn thành đúng hạn và chất lượng.
- **Thưởng sáng kiến:** 1-5 triệu VND cho các đề xuất cải tiến được áp dụng.
- **Thưởng nhân viên xuất sắc quý:** 3 triệu VND + Giấy khen.
- **Thưởng giới thiệu nhân sự:** 5 triệu VND khi giới thiệu ứng viên được tuyển dụng và qua thử việc.

## III. PHÚC LỢI

### 1. Bảo hiểm
- BHXH, BHYT, BHTN theo quy định pháp luật.
- Bảo hiểm sức khỏe bổ sung (gói Premium) cho nhân viên chính thức.
- Bảo hiểm tai nạn 24/7.

### 2. Đào tạo & Phát triển
- Ngân sách đào tạo cá nhân: **10 triệu VND/năm** cho các khóa học, chứng chỉ chuyên môn.
- Tài khoản Udemy Business miễn phí.
- Hỗ trợ 50% chi phí học tiếng Anh (tối đa 3 triệu VND/năm).

### 3. Team Building & Hoạt động
- **Team building quý:** Ngân sách 500,000 VND/người/quý.
- **Company trip hàng năm:** 2 ngày, công ty chi trả 100%.
- **Sinh nhật nhân viên:** Quà tặng 500,000 VND + Team party.
- **Quà tặng dịp lễ:** Tết, 8/3, 20/10, 1/6 (cho nhân viên có con).

### 4. Thiết bị & Công cụ
- Laptop theo cấp bậc (MacBook Pro cho Senior+, ThinkPad cho Junior).
- Màn hình phụ 27 inch.
- Bàn phím cơ, chuột không dây.
- Tai nghe chống ồn (cho vị trí Dev/Design).
- Ghế công thái học.`,
  },

  // =============================================
  // 4. QUY TRÌNH XIN NGHỈ VIỆC
  // =============================================
  {
    title: 'Quy trình xin nghỉ việc và thôi việc',
    category: 'Quy trình',
    content: `# QUY TRÌNH XIN NGHỈ VIỆC VÀ THÔI VIỆC

## I. THỜI HẠN BÁO TRƯỚC

| Loại hợp đồng | Thời hạn báo trước |
|----------------|-------------------|
| Nhân viên thử việc | 3 ngày làm việc |
| Hợp đồng xác định thời hạn | 30 ngày |
| Hợp đồng không xác định thời hạn | 45 ngày |
| Cấp quản lý (Manager+) | 60 ngày |

## II. QUY TRÌNH CHI TIẾT

### Bước 1: Gửi đơn xin nghỉ việc
- Gửi đơn xin nghỉ việc bằng email cho quản lý trực tiếp và CC phòng HR.
- Email cần ghi rõ: lý do nghỉ việc, ngày làm việc cuối cùng dự kiến.
- Mẫu đơn có sẵn tại HR Portal > Biểu mẫu > Đơn xin nghỉ việc.

### Bước 2: Phỏng vấn giữ chân (Retention Interview)
- Phòng HR sẽ sắp xếp buổi phỏng vấn trong vòng 3 ngày sau khi nhận đơn.
- Mục đích: Tìm hiểu lý do và có giải pháp giữ chân (nếu phù hợp).

### Bước 3: Phê duyệt
- Quản lý trực tiếp phê duyệt đơn trong vòng 5 ngày làm việc.
- Phòng HR gửi thông báo chính thức về ngày làm việc cuối cùng.

### Bước 4: Bàn giao công việc
- Lập danh sách chi tiết các công việc đang thực hiện.
- Chuyển giao toàn bộ tài liệu, file dự án cho người thay thế hoặc quản lý.
- Bàn giao các tài khoản công việc (email, hệ thống nội bộ).
- Hoàn thành bàn giao trước ngày làm việc cuối cùng ít nhất 5 ngày.

### Bước 5: Hoàn tất thủ tục
- Trả lại tài sản công ty: laptop, thẻ nhân viên, khóa tủ.
- Phòng HR chuẩn bị: Quyết định thôi việc, Sổ BHXH, Giấy chứng nhận làm việc.
- Thanh toán lương và phép còn lại trong vòng **14 ngày** sau ngày làm việc cuối.

## III. CHẾ ĐỘ KHI NGHỈ VIỆC

- **Phép năm chưa sử dụng:** Được thanh toán bằng tiền.
- **Thưởng Tết:** Nếu nghỉ trước Tết, được hưởng thưởng pro-rata theo số tháng đã làm trong năm.
- **Giấy chứng nhận:** Công ty cấp Giấy chứng nhận kinh nghiệm và Thư giới thiệu (nếu yêu cầu).
- **Cam kết bảo mật:** Nhân viên tiếp tục chịu ràng buộc bảo mật thông tin trong 2 năm sau khi nghỉ việc.

## IV. SA THẢI

Công ty có quyền sa thải nhân viên trong các trường hợp:
1. Vi phạm nghiêm trọng nội quy (gian lận, trộm cắp, bạo lực).
2. Tiết lộ bí mật kinh doanh cho đối thủ cạnh tranh.
3. Bị kết án hình sự.
4. Vắng mặt không phép 5 ngày cộng dồn trong 1 tháng hoặc 20 ngày cộng dồn trong 1 năm.`,
  },

  // =============================================
  // 5. CHÍNH SÁCH BẢO MẬT THÔNG TIN
  // =============================================
  {
    title: 'Chính sách bảo mật và an toàn thông tin',
    category: 'Bảo mật',
    content: `# CHÍNH SÁCH BẢO MẬT VÀ AN TOÀN THÔNG TIN

## I. QUY ĐỊNH CHUNG

### 1. Phân loại thông tin
- **Công khai (Public):** Thông tin có thể chia sẻ rộng rãi (thông cáo báo chí, tuyển dụng).
- **Nội bộ (Internal):** Thông tin chỉ chia sẻ trong công ty (email nội bộ, tài liệu hướng dẫn).
- **Bảo mật (Confidential):** Thông tin nhạy cảm (lương nhân viên, chiến lược kinh doanh).
- **Tối mật (Strictly Confidential):** Thông tin tối quan trọng (thông tin khách hàng, mã nguồn sản phẩm).

### 2. Nguyên tắc Need-to-Know
- Nhân viên chỉ được truy cập thông tin cần thiết cho công việc của mình.
- Không được chia sẻ thông tin bảo mật với người không có quyền truy cập.

## II. BẢO MẬT TÀI KHOẢN

### 1. Mật khẩu
- Mật khẩu phải có ít nhất **12 ký tự**, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.
- Thay đổi mật khẩu mỗi **90 ngày**.
- Không sử dụng cùng mật khẩu cho nhiều hệ thống.
- Không chia sẻ mật khẩu với bất kỳ ai, kể cả quản lý.

### 2. Xác thực hai yếu tố (2FA)
- Bắt buộc bật 2FA cho tất cả hệ thống nội bộ.
- Sử dụng ứng dụng xác thực (Google Authenticator, Microsoft Authenticator).
- Không sử dụng SMS làm phương thức 2FA chính.

### 3. Thiết bị
- Laptop phải được mã hóa ổ cứng (BitLocker/FileVault).
- Bật tự động khóa màn hình sau **5 phút** không hoạt động.
- Không cài đặt phần mềm không được phê duyệt bởi bộ phận IT.
- Không sử dụng USB cá nhân trên thiết bị công ty.

## III. BẢO MẬT DỮ LIỆU KHÁCH HÀNG

1. Dữ liệu khách hàng là tài sản **Tối mật** của công ty.
2. Không được sao chép, chuyển dữ liệu khách hàng ra khỏi hệ thống công ty.
3. Không được thảo luận về thông tin khách hàng ở nơi công cộng.
4. Tuân thủ quy định PDPA (Personal Data Protection Act) và GDPR khi làm việc với khách hàng quốc tế.
5. Báo cáo ngay lập tức nếu phát hiện rò rỉ dữ liệu cho bộ phận IT Security qua email security@staffup.vn.

## IV. XỬ LÝ VI PHẠM

| Mức độ vi phạm | Hình thức xử lý |
|----------------|----------------|
| Nhẹ (quên khóa màn hình) | Nhắc nhở bằng email |
| Trung bình (chia sẻ mật khẩu) | Cảnh cáo bằng văn bản, đào tạo lại |
| Nghiêm trọng (rò rỉ dữ liệu khách hàng) | Đình chỉ công tác, điều tra |
| Đặc biệt nghiêm trọng (bán thông tin) | Sa thải ngay lập tức, kiện tụng pháp lý |`,
  },

  // =============================================
  // 6. QUY TRÌNH ĐÁNH GIÁ HIỆU SUẤT
  // =============================================
  {
    title: 'Quy trình đánh giá hiệu suất và KPI',
    category: 'Quy trình',
    content: `# QUY TRÌNH ĐÁNH GIÁ HIỆU SUẤT VÀ KPI

## I. CHU KỲ ĐÁNH GIÁ

### 1. Đánh giá hàng quý (Quarterly Review)
- Thực hiện vào tuần cuối cùng của mỗi quý (tháng 3, 6, 9, 12).
- Đánh giá dựa trên KPI cá nhân đã đặt ra đầu quý.
- Quản lý trực tiếp thực hiện đánh giá 1-on-1 với nhân viên.

### 2. Đánh giá hàng năm (Annual Review)
- Thực hiện vào tháng 12 - tháng 1 hàng năm.
- Tổng hợp 4 quý đánh giá + đánh giá tổng thể.
- Là cơ sở cho quyết định tăng lương, thăng chức.

## II. TIÊU CHÍ ĐÁNH GIÁ

### 1. KPI Công việc (60%)
- Hoàn thành mục tiêu công việc theo OKR đã cam kết.
- Chất lượng deliverables.
- Tiến độ hoàn thành dự án.

### 2. Năng lực chuyên môn (20%)
- Kỹ năng kỹ thuật/chuyên môn.
- Khả năng giải quyết vấn đề.
- Học tập và phát triển bản thân.

### 3. Thái độ và Teamwork (20%)
- Tinh thần hợp tác với đồng nghiệp.
- Tuân thủ nội quy, quy trình.
- Chủ động, sáng tạo trong công việc.
- Tham gia các hoạt động team.

## III. THANG ĐIỂM

| Mức đánh giá | Điểm | Mô tả |
|-------------|------|-------|
| Xuất sắc (Outstanding) | 9-10 | Vượt xa mong đợi, có đóng góp đặc biệt |
| Tốt (Exceeds) | 7-8 | Hoàn thành tốt, có nhiều điểm nổi bật |
| Đạt (Meets) | 5-6 | Hoàn thành yêu cầu, đáp ứng kỳ vọng |
| Cần cải thiện (Below) | 3-4 | Chưa đạt một số mục tiêu, cần hỗ trợ |
| Không đạt (Unsatisfactory) | 1-2 | Không đáp ứng yêu cầu, cần PIP |

## IV. KẾ HOẠCH CẢI THIỆN (PIP)

- Nhân viên có điểm dưới 4 sẽ vào chương trình PIP (Performance Improvement Plan).
- Thời gian PIP: **90 ngày**.
- Trong thời gian PIP: Họp 1-on-1 hàng tuần với quản lý, đặt mục tiêu cải thiện cụ thể.
- Nếu không cải thiện sau PIP: Xem xét chuyển vị trí hoặc chấm dứt hợp đồng.

## V. THĂNG CHỨC

### Điều kiện xét thăng chức:
1. Đánh giá KPI 2 quý liên tiếp đạt mức "Tốt" trở lên (≥ 7 điểm).
2. Làm việc tại vị trí hiện tại ít nhất **12 tháng**.
3. Hoàn thành các khóa đào tạo bắt buộc cho cấp bậc tiếp theo.
4. Được đề xuất bởi quản lý trực tiếp.
5. Được phê duyệt bởi Ban Giám đốc.`,
  },

  // =============================================
  // 7. QUY ĐỊNH LÀM THÊM GIỜ & CÔNG TÁC
  // =============================================
  {
    title: 'Quy định làm thêm giờ và công tác phí',
    category: 'Quy định',
    content: `# QUY ĐỊNH LÀM THÊM GIỜ VÀ CÔNG TÁC PHÍ

## I. LÀM THÊM GIỜ (OVERTIME)

### 1. Quy định chung
- Làm thêm giờ phải được quản lý trực tiếp phê duyệt **trước khi thực hiện**.
- Tối đa **40 giờ** làm thêm/tháng.
- Tối đa **200 giờ** làm thêm/năm.
- Không được ép buộc nhân viên làm thêm giờ, trừ trường hợp khẩn cấp.

### 2. Mức lương làm thêm giờ
| Thời gian | Hệ số lương |
|-----------|-------------|
| Ngày thường (sau 17:30) | 150% |
| Thứ 7 | 200% |
| Chủ nhật | 300% |
| Ngày lễ | 400% |

### 3. Quy trình
1. Gửi đề xuất OT trên HR Portal trước ít nhất **1 ngày**.
2. Quản lý phê duyệt trên hệ thống.
3. Chấm công OT riêng biệt.
4. Tiền OT được thanh toán cùng kỳ lương hàng tháng.

## II. CÔNG TÁC PHÍ

### 1. Đi công tác nội địa
| Hạng mục | Mức chi |
|---------|---------|
| Vé máy bay (dưới 500km) | Economy class |
| Vé máy bay (trên 500km) | Economy class |
| Khách sạn | Tối đa 1,500,000 VND/đêm |
| Ăn uống | 300,000 VND/ngày |
| Di chuyển nội thành | Theo hóa đơn thực tế (tối đa 200,000 VND/ngày) |
| Phụ cấp công tác | 200,000 VND/ngày |

### 2. Đi công tác quốc tế
| Hạng mục | Mức chi |
|---------|---------|
| Vé máy bay | Economy class (Business class cho cấp Director+) |
| Khách sạn | Theo chính sách từng khu vực |
| Ăn uống | $50 USD/ngày (Châu Á), $80 USD/ngày (Châu Âu/Mỹ) |
| Phụ cấp công tác | $30 USD/ngày |

### 3. Quy trình thanh toán
1. Gửi đề xuất công tác trên HR Portal trước ít nhất **5 ngày làm việc**.
2. Sau khi công tác: Gửi báo cáo công tác + hóa đơn/chứng từ trong vòng **7 ngày**.
3. Phòng Kế toán thanh toán trong vòng **14 ngày** sau khi nhận đầy đủ chứng từ.
4. Tạm ứng công tác phí: Đề xuất tạm ứng trước 70% chi phí dự kiến.

## III. ĐI LẠI HÀNG NGÀY

- Nhân viên sử dụng xe cá nhân: Công ty hỗ trợ phí gửi xe.
- Nhân viên sử dụng phương tiện công cộng: Hỗ trợ vé tháng.
- Đi công việc trong giờ làm: Thanh toán phí Grab/taxi theo hóa đơn.`,
  },

  // =============================================
  // 8. CHÍNH SÁCH ĐÀO TẠO
  // =============================================
  {
    title: 'Chính sách đào tạo và phát triển nhân sự',
    category: 'Đào tạo',
    content: `# CHÍNH SÁCH ĐÀO TẠO VÀ PHÁT TRIỂN NHÂN SỰ

## I. CHƯƠNG TRÌNH ONBOARDING

### 1. Tuần đầu tiên
- **Ngày 1:** Giới thiệu công ty, văn hóa, giá trị cốt lõi. Nhận tài khoản, thiết bị.
- **Ngày 2-3:** Đào tạo nội quy, quy trình, công cụ làm việc. Giới thiệu team và mentor.
- **Ngày 4-5:** Bắt đầu tìm hiểu dự án. Pair programming/shadowing với buddy.

### 2. Tháng đầu tiên
- Hoàn thành các khóa đào tạo bắt buộc trên StaffUp LMS.
- Họp 1-on-1 hàng tuần với mentor.
- Hoàn thành bài kiểm tra kiến thức nội bộ.

### 3. Tháng 2-3 (Giai đoạn thử việc)
- Nhận task thực tế, bắt đầu đóng góp vào dự án.
- Đánh giá giữa kỳ thử việc (cuối tháng 2).
- Cuối tháng 3: Đánh giá kết quả thử việc, quyết định ký hợp đồng chính thức.

## II. ĐÀO TẠO NỘI BỘ

### 1. Khóa học bắt buộc (Mandatory)
- **Seri Onboarding:** Cho tất cả nhân viên mới.
- **Bảo mật thông tin:** Cập nhật hàng năm.
- **Phòng chống quấy rối:** Cập nhật hàng năm.
- **Kỹ năng giao tiếp:** Cho tất cả nhân viên.

### 2. Khóa học chuyên môn (Technical)
- Tổ chức bởi các Senior/Lead trong công ty.
- **Tech Talk thứ 6:** Mỗi tuần 1 buổi, 30-45 phút.
- **Workshop tháng:** Chủ đề chuyên sâu, 2-3 giờ.
- **Code Review Session:** Hàng tuần cho dev team.

### 3. Đào tạo bên ngoài
- Ngân sách cá nhân: **10 triệu VND/năm**.
- Quy trình: Đề xuất ➜ Quản lý duyệt ➜ HR duyệt ➜ Đăng ký ➜ Thanh toán.
- Ưu tiên: Chứng chỉ quốc tế (AWS, Google Cloud, PMP, Scrum Master).
- Sau khi hoàn thành: Chia sẻ kiến thức cho team (Knowledge Sharing session).

## III. LỘ TRÌNH THĂNG TIẾN

### Engineering Track:
Junior → Mid → Senior → Lead → Staff → Principal → VP of Engineering

### Management Track:
IC → Team Lead → Manager → Senior Manager → Director → VP

### Thời gian tối thiểu tại mỗi cấp:
- Junior → Mid: 1-2 năm
- Mid → Senior: 2-3 năm
- Senior → Lead/Manager: 2-3 năm
- Lead → Staff/Senior Manager: 3-5 năm

## IV. CHƯƠNG TRÌNH MENTOR

- Mỗi nhân viên mới được assign 1 **Buddy** (hỗ trợ hòa nhập) và 1 **Mentor** (hướng dẫn chuyên môn).
- Buddy: Nhân viên cùng team, đã làm việc ≥ 6 tháng.
- Mentor: Senior+ cùng domain, được đào tạo về mentoring skills.
- Chương trình mentor kéo dài **6 tháng**, họp 1-on-1 mỗi 2 tuần.`,
  },
];

async function main() {
  console.log('🚀 Bắt đầu seed company documents...\n');

  for (const doc of documents) {
    const existing = await prisma.companyDocument.findFirst({
      where: { title: doc.title },
    });

    if (existing) {
      console.log(`⏭️  Đã tồn tại: "${doc.title}"`);
      continue;
    }

    await prisma.companyDocument.create({
      data: {
        title: doc.title,
        content: doc.content,
        category: doc.category,
        uploadedById: ADMIN_USER_ID,
      },
    });

    console.log(`✅ Đã tạo: "${doc.title}" (${doc.category})`);
  }

  const count = await prisma.companyDocument.count();
  console.log(`\n📊 Tổng số tài liệu: ${count}`);
  console.log('🎉 Seed company documents hoàn tất!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
