const { createSeedContext, disposeSeedContext } = require('../shared/client');

/**
 * COMPREHENSIVE QUESTION & QUIZ SEED SYSTEM
 * Each MODULE gets 1 quiz with 10 diverse questions
 * Questions are contextual to the module content
 */

// Question generator functions by course type
const QUESTION_GENERATORS = {
  python: (moduleIndex) => [
    { type: 'single_choice', content: `Module ${moduleIndex}: Python là ngôn ngữ lập trình thuộc loại nào?`, explanation: 'Python là ngôn ngữ thông dịch (interpreted) và hỗ trợ nhiều paradigm lập trình.', options: [{ content: 'Ngôn ngữ thông dịch (Interpreted)', isCorrect: true }, { content: 'Ngôn ngữ biên dịch (Compiled)', isCorrect: false }, { content: 'Ngôn ngữ Assembly', isCorrect: false }, { content: 'Ngôn ngữ máy', isCorrect: false }] },
    { type: 'multiple_choice', content: `Module ${moduleIndex}: Những kiểu dữ liệu nào là built-in trong Python?`, explanation: 'Python có nhiều kiểu dữ liệu built-in như int, str, list, dict, tuple, set.', options: [{ content: 'int (số nguyên)', isCorrect: true }, { content: 'str (chuỗi)', isCorrect: true }, { content: 'list (danh sách)', isCorrect: true }, { content: 'array (mảng)', isCorrect: false }] },
    { type: 'single_choice', content: `Module ${moduleIndex}: Cú pháp nào đúng để khai báo biến trong Python?`, explanation: 'Python không cần từ khóa khai báo biến.', options: [{ content: 'x = 10', isCorrect: true }, { content: 'var x = 10', isCorrect: false }, { content: 'int x = 10', isCorrect: false }, { content: 'let x = 10', isCorrect: false }] },
    { type: 'single_choice', content: `Module ${moduleIndex}: Hàm nào dùng để in ra màn hình trong Python?`, explanation: 'print() là hàm built-in để xuất dữ liệu ra console.', options: [{ content: 'print()', isCorrect: true }, { content: 'console.log()', isCorrect: false }, { content: 'echo()', isCorrect: false }, { content: 'printf()', isCorrect: false }] },
    { type: 'multiple_choice', content: `Module ${moduleIndex}: Cấu trúc dữ liệu nào trong Python là mutable?`, explanation: 'List, dict, set là mutable. Tuple và string là immutable.', options: [{ content: 'list', isCorrect: true }, { content: 'dict', isCorrect: true }, { content: 'set', isCorrect: true }, { content: 'tuple', isCorrect: false }] },
    { type: 'single_choice', content: `Module ${moduleIndex}: Từ khóa nào dùng để định nghĩa hàm trong Python?`, explanation: 'def là từ khóa để định nghĩa function.', options: [{ content: 'def', isCorrect: true }, { content: 'function', isCorrect: false }, { content: 'func', isCorrect: false }, { content: 'define', isCorrect: false }] },
    { type: 'single_choice', content: `Module ${moduleIndex}: Vòng lặp nào dùng để duyệt qua list?`, explanation: 'for loop thường được dùng để iterate qua collection.', options: [{ content: 'for loop', isCorrect: true }, { content: 'foreach loop', isCorrect: false }, { content: 'do-while loop', isCorrect: false }, { content: 'repeat loop', isCorrect: false }] },
    { type: 'multiple_choice', content: `Module ${moduleIndex}: Module nào là built-in trong Python?`, explanation: 'os, sys, math, datetime là các module built-in.', options: [{ content: 'os', isCorrect: true }, { content: 'sys', isCorrect: true }, { content: 'math', isCorrect: true }, { content: 'numpy', isCorrect: false }] },
    { type: 'single_choice', content: `Module ${moduleIndex}: Exception handling trong Python sử dụng từ khóa nào?`, explanation: 'try-except được dùng để xử lý exception.', options: [{ content: 'try-except', isCorrect: true }, { content: 'try-catch', isCorrect: false }, { content: 'try-error', isCorrect: false }, { content: 'catch-throw', isCorrect: false }] },
    { type: 'essay', content: `Module ${moduleIndex}: Giải thích những kiến thức chính bạn học được từ module này và cách áp dụng vào thực tế.`, explanation: 'Tổng hợp kiến thức Python từ module này.', options: [] },
  ],
  
  cpp: (moduleIndex) => [
    { type: 'single_choice', content: `Module ${moduleIndex}: Compiler trong C++ có vai trò gì?`, explanation: 'Compiler biên dịch mã nguồn C++ thành mã máy.', options: [{ content: 'Biên dịch mã nguồn thành mã máy', isCorrect: true }, { content: 'Thông dịch từng dòng', isCorrect: false }, { content: 'Chỉ kiểm tra lỗi', isCorrect: false }, { content: 'Chạy trực tiếp', isCorrect: false }] },
    { type: 'multiple_choice', content: `Module ${moduleIndex}: IDE nào phổ biến cho C++?`, explanation: 'Visual Studio, Code::Blocks, CLion là các IDE phổ biến.', options: [{ content: 'Visual Studio', isCorrect: true }, { content: 'Code::Blocks', isCorrect: true }, { content: 'CLion', isCorrect: true }, { content: 'Android Studio', isCorrect: false }] },
    { type: 'single_choice', content: `Module ${moduleIndex}: Từ khóa nào khai báo hằng số trong C++?`, explanation: 'const được dùng để khai báo hằng số.', options: [{ content: 'const', isCorrect: true }, { content: 'final', isCorrect: false }, { content: 'readonly', isCorrect: false }, { content: 'static', isCorrect: false }] },
    { type: 'multiple_choice', content: `Module ${moduleIndex}: Kiểu dữ liệu cơ bản nào có trong C++?`, explanation: 'int, float, double, char, bool là các kiểu cơ bản.', options: [{ content: 'int', isCorrect: true }, { content: 'float', isCorrect: true }, { content: 'char', isCorrect: true }, { content: 'string (built-in)', isCorrect: false }] },
    { type: 'single_choice', content: `Module ${moduleIndex}: Header file nào cần include để dùng cout?`, explanation: 'iostream chứa cout và cin.', options: [{ content: '#include <iostream>', isCorrect: true }, { content: '#include <stdio.h>', isCorrect: false }, { content: '#include <conio.h>', isCorrect: false }, { content: '#include <stdlib.h>', isCorrect: false }] },
    { type: 'single_choice', content: `Module ${moduleIndex}: Namespace nào được dùng phổ biến nhất?`, explanation: 'std namespace chứa thư viện chuẩn.', options: [{ content: 'std', isCorrect: true }, { content: 'system', isCorrect: false }, { content: 'core', isCorrect: false }, { content: 'main', isCorrect: false }] },
    { type: 'multiple_choice', content: `Module ${moduleIndex}: Cấu trúc điều khiển nào có trong C++?`, explanation: 'if-else, switch-case, for, while là cấu trúc cơ bản.', options: [{ content: 'if-else', isCorrect: true }, { content: 'switch-case', isCorrect: true }, { content: 'for loop', isCorrect: true }, { content: 'foreach loop', isCorrect: false }] },
    { type: 'single_choice', content: `Module ${moduleIndex}: Con trỏ (pointer) được khai báo bằng ký tự nào?`, explanation: '* được dùng để khai báo pointer.', options: [{ content: '*', isCorrect: true }, { content: '&', isCorrect: false }, { content: '@', isCorrect: false }, { content: '#', isCorrect: false }] },
    { type: 'single_choice', content: `Module ${moduleIndex}: C++ standard nào được dùng rộng rãi nhất?`, explanation: 'C++17 và C++20 là phiên bản phổ biến.', options: [{ content: 'C++17 và C++20', isCorrect: true }, { content: 'C++98', isCorrect: false }, { content: 'C++03', isCorrect: false }, { content: 'C89', isCorrect: false }] },
    { type: 'essay', content: `Module ${moduleIndex}: Tổng hợp kiến thức C++ bạn học được từ module này.`, explanation: 'Tự đánh giá và tổng hợp kiến thức.', options: [] },
  ],
  
  figma: (moduleIndex) => [
    { type: 'single_choice', content: `Module ${moduleIndex}: Figma là công cụ thiết kế gì?`, explanation: 'Figma là công cụ thiết kế UI/UX dựa trên web.', options: [{ content: 'Công cụ thiết kế UI/UX trên web', isCorrect: true }, { content: 'Phần mềm chỉnh sửa ảnh', isCorrect: false }, { content: 'IDE lập trình', isCorrect: false }, { content: 'Công cụ quản lý dự án', isCorrect: false }] },
    { type: 'multiple_choice', content: `Module ${moduleIndex}: Tính năng nào là điểm mạnh của Figma?`, explanation: 'Figma nổi bật với collaboration, components, auto layout.', options: [{ content: 'Collaboration real-time', isCorrect: true }, { content: 'Components và variants', isCorrect: true }, { content: 'Auto Layout', isCorrect: true }, { content: 'Chỉnh sửa video', isCorrect: false }] },
    { type: 'single_choice', content: `Module ${moduleIndex}: Phím tắt nào tạo Frame trong Figma?`, explanation: 'F hoặc A là phím tắt tạo Frame.', options: [{ content: 'F hoặc A', isCorrect: true }, { content: 'Ctrl+F', isCorrect: false }, { content: 'Shift+F', isCorrect: false }, { content: 'Alt+F', isCorrect: false }] },
    { type: 'single_choice', content: `Module ${moduleIndex}: Component trong Figma có lợi ích gì?`, explanation: 'Component giúp tái sử dụng và duy trì consistency.', options: [{ content: 'Tái sử dụng và consistency', isCorrect: true }, { content: 'Tăng dung lượng file', isCorrect: false }, { content: 'Chỉ để trang trí', isCorrect: false }, { content: 'Không có lợi ích', isCorrect: false }] },
    { type: 'multiple_choice', content: `Module ${moduleIndex}: Auto Layout hỗ trợ tính năng nào?`, explanation: 'Auto Layout hỗ trợ spacing, padding, resizing.', options: [{ content: 'Spacing tự động', isCorrect: true }, { content: 'Padding', isCorrect: true }, { content: 'Resizing responsive', isCorrect: true }, { content: 'Animation 3D', isCorrect: false }] },
    { type: 'single_choice', content: `Module ${moduleIndex}: Constraints trong Figma dùng để làm gì?`, explanation: 'Constraints giữ vị trí khi resize frame.', options: [{ content: 'Giữ vị trí khi resize', isCorrect: true }, { content: 'Thêm màu sắc', isCorrect: false }, { content: 'Tạo animation', isCorrect: false }, { content: 'Export file', isCorrect: false }] },
    { type: 'single_choice', content: `Module ${moduleIndex}: Prototype trong Figma dùng để làm gì?`, explanation: 'Prototype tạo interactive mockup.', options: [{ content: 'Tạo interactive mockup', isCorrect: true }, { content: 'Chỉnh sửa ảnh', isCorrect: false }, { content: 'Code HTML', isCorrect: false }, { content: 'Quản lý version', isCorrect: false }] },
    { type: 'multiple_choice', content: `Module ${moduleIndex}: Figma hỗ trợ export format nào?`, explanation: 'Figma export PNG, JPG, SVG, PDF.', options: [{ content: 'PNG', isCorrect: true }, { content: 'SVG', isCorrect: true }, { content: 'PDF', isCorrect: true }, { content: 'PSD', isCorrect: false }] },
    { type: 'single_choice', content: `Module ${moduleIndex}: Plugins trong Figma có tác dụng gì?`, explanation: 'Plugins mở rộng chức năng Figma.', options: [{ content: 'Mở rộng chức năng', isCorrect: true }, { content: 'Làm chậm Figma', isCorrect: false }, { content: 'Không có tác dụng', isCorrect: false }, { content: 'Chỉ để trang trí', isCorrect: false }] },
    { type: 'essay', content: `Module ${moduleIndex}: Giải thích cách bạn sẽ áp dụng kiến thức Figma từ module này vào dự án thực tế.`, explanation: 'Tự đánh giá và kế hoạch áp dụng.', options: [] },
  ],

  visily: (moduleIndex) => [
    { type: 'single_choice', content: `Module ${moduleIndex}: Visily sử dụng công nghệ gì?`, explanation: 'Visily sử dụng AI để chuyển screenshot thành design.', options: [{ content: 'AI (Artificial Intelligence)', isCorrect: true }, { content: 'Blockchain', isCorrect: false }, { content: 'IoT', isCorrect: false }, { content: 'VR/AR', isCorrect: false }] },
    { type: 'multiple_choice', content: `Module ${moduleIndex}: Visily tạo design từ nguồn nào?`, explanation: 'Visily hỗ trợ screenshot, text prompt, templates.', options: [{ content: 'Screenshot của website', isCorrect: true }, { content: 'Text prompt', isCorrect: true }, { content: 'Templates có sẵn', isCorrect: true }, { content: 'File video', isCorrect: false }] },
    { type: 'single_choice', content: `Module ${moduleIndex}: Screenshot-to-Design của Visily làm gì?`, explanation: 'Chuyển screenshot thành editable design.', options: [{ content: 'Chuyển screenshot thành editable design', isCorrect: true }, { content: 'Chỉ lưu ảnh', isCorrect: false }, { content: 'Tạo video', isCorrect: false }, { content: 'Code HTML', isCorrect: false }] },
    { type: 'single_choice', content: `Module ${moduleIndex}: Visily 4.0 có cải tiến gì?`, explanation: 'AI thông minh hơn và nhiều tính năng mới.', options: [{ content: 'AI thông minh hơn', isCorrect: true }, { content: 'Không có gì mới', isCorrect: false }, { content: 'Chậm hơn', isCorrect: false }, { content: 'Ít tính năng hơn', isCorrect: false }] },
    { type: 'multiple_choice', content: `Module ${moduleIndex}: Visily hỗ trợ loại diagram nào?`, explanation: 'Wireframes, flowcharts, wireflows.', options: [{ content: 'Wireframes', isCorrect: true }, { content: 'Flowcharts', isCorrect: true }, { content: 'Wireflows', isCorrect: true }, { content: 'UML diagrams', isCorrect: false }] },
    { type: 'single_choice', content: `Module ${moduleIndex}: Auto-Prototyping trong Visily làm gì?`, explanation: 'Tự động tạo prototype từ design.', options: [{ content: 'Tự động tạo prototype', isCorrect: true }, { content: 'Xóa design', isCorrect: false }, { content: 'Export code', isCorrect: false }, { content: 'Không làm gì', isCorrect: false }] },
    { type: 'single_choice', content: `Module ${moduleIndex}: Visily có plugin cho Figma không?`, explanation: 'Có, Visily có plugin cho Figma.', options: [{ content: 'Có', isCorrect: true }, { content: 'Không', isCorrect: false }, { content: 'Chỉ cho Sketch', isCorrect: false }, { content: 'Chỉ cho Adobe XD', isCorrect: false }] },
    { type: 'multiple_choice', content: `Module ${moduleIndex}: Visily phù hợp với ai?`, explanation: 'Beginners, non-designers, product managers.', options: [{ content: 'Beginners', isCorrect: true }, { content: 'Non-designers', isCorrect: true }, { content: 'Product managers', isCorrect: true }, { content: 'Chỉ professionals', isCorrect: false }] },
    { type: 'single_choice', content: `Module ${moduleIndex}: Visily có hỗ trợ collaboration không?`, explanation: 'Có, Visily hỗ trợ team collaboration.', options: [{ content: 'Có', isCorrect: true }, { content: 'Không', isCorrect: false }, { content: 'Chỉ single user', isCorrect: false }, { content: 'Cần trả phí cao', isCorrect: false }] },
    { type: 'essay', content: `Module ${moduleIndex}: So sánh Visily và Figma dựa trên kiến thức bạn học được.`, explanation: 'Phân tích và so sánh hai công cụ.', options: [] },
  ],

  aws: (moduleIndex) => [
    { type: 'single_choice', content: `Module ${moduleIndex}: EC2 trong AWS là gì?`, explanation: 'EC2 là dịch vụ máy chủ ảo của AWS.', options: [{ content: 'Dịch vụ máy chủ ảo', isCorrect: true }, { content: 'Dịch vụ lưu trữ file', isCorrect: false }, { content: 'Dịch vụ database', isCorrect: false }, { content: 'Dịch vụ CDN', isCorrect: false }] },
    { type: 'multiple_choice', content: `Module ${moduleIndex}: Core services của AWS là gì?`, explanation: 'EC2, S3, RDS, VPC là các dịch vụ cốt lõi.', options: [{ content: 'EC2 (Compute)', isCorrect: true }, { content: 'S3 (Storage)', isCorrect: true }, { content: 'RDS (Database)', isCorrect: true }, { content: 'GitHub Actions', isCorrect: false }] },
    { type: 'single_choice', content: `Module ${moduleIndex}: VPC trong AWS là gì?`, explanation: 'Virtual Private Cloud - mạng ảo riêng.', options: [{ content: 'Virtual Private Cloud', isCorrect: true }, { content: 'Virtual Public Cloud', isCorrect: false }, { content: 'Very Private Computer', isCorrect: false }, { content: 'Virtual Processing Center', isCorrect: false }] },
    { type: 'single_choice', content: `Module ${moduleIndex}: RDS là dịch vụ gì?`, explanation: 'Relational Database Service.', options: [{ content: 'Relational Database Service', isCorrect: true }, { content: 'Remote Desktop Service', isCorrect: false }, { content: 'Real-time Data Service', isCorrect: false }, { content: 'Resource Distribution', isCorrect: false }] },
    { type: 'multiple_choice', content: `Module ${moduleIndex}: Jenkins có thể làm gì?`, explanation: 'CI/CD, automated testing, deployment.', options: [{ content: 'Continuous Integration', isCorrect: true }, { content: 'Continuous Deployment', isCorrect: true }, { content: 'Automated Testing', isCorrect: true }, { content: 'Design UI', isCorrect: false }] },
    { type: 'single_choice', content: `Module ${moduleIndex}: IAM trong AWS dùng để làm gì?`, explanation: 'Identity and Access Management.', options: [{ content: 'Quản lý quyền truy cập', isCorrect: true }, { content: 'Lưu trữ file', isCorrect: false }, { content: 'Tạo database', isCorrect: false }, { content: 'Monitor hệ thống', isCorrect: false }] },
    { type: 'single_choice', content: `Module ${moduleIndex}: Security Group có vai trò gì?`, explanation: 'Firewall ảo kiểm soát traffic.', options: [{ content: 'Firewall ảo', isCorrect: true }, { content: 'Backup data', isCorrect: false }, { content: 'Load balancer', isCorrect: false }, { content: 'DNS service', isCorrect: false }] },
    { type: 'multiple_choice', content: `Module ${moduleIndex}: AWS Budgets giúp gì?`, explanation: 'Theo dõi chi phí, cảnh báo ngân sách.', options: [{ content: 'Theo dõi chi phí', isCorrect: true }, { content: 'Cảnh báo vượt ngân sách', isCorrect: true }, { content: 'Quản lý billing', isCorrect: true }, { content: 'Tạo EC2', isCorrect: false }] },
    { type: 'single_choice', content: `Module ${moduleIndex}: Docker dùng để làm gì?`, explanation: 'Containerization - đóng gói ứng dụng.', options: [{ content: 'Containerization', isCorrect: true }, { content: 'Version control', isCorrect: false }, { content: 'Database management', isCorrect: false }, { content: 'UI design', isCorrect: false }] },
    { type: 'essay', content: `Module ${moduleIndex}: Giải thích quy trình DevOps bạn học được từ module này.`, explanation: 'Tổng hợp kiến thức DevOps.', options: [] },
  ],

  php: (moduleIndex) => [
    { type: 'single_choice', content: `Module ${moduleIndex}: PHP là viết tắt của gì?`, explanation: 'PHP là Hypertext Preprocessor.', options: [{ content: 'Hypertext Preprocessor', isCorrect: true }, { content: 'Personal Home Page', isCorrect: false }, { content: 'Private Hypertext Protocol', isCorrect: false }, { content: 'Programming Hypertext', isCorrect: false }] },
    { type: 'multiple_choice', content: `Module ${moduleIndex}: Kiểu dữ liệu nào có trong PHP?`, explanation: 'PHP hỗ trợ string, integer, float, array.', options: [{ content: 'String', isCorrect: true }, { content: 'Integer', isCorrect: true }, { content: 'Array', isCorrect: true }, { content: 'Tuple', isCorrect: false }] },
    { type: 'single_choice', content: `Module ${moduleIndex}: Cú pháp khai báo biến trong PHP?`, explanation: 'PHP sử dụng $ để khai báo biến.', options: [{ content: '$name = "John";', isCorrect: true }, { content: 'var name = "John";', isCorrect: false }, { content: 'name = "John";', isCorrect: false }, { content: 'let name = "John";', isCorrect: false }] },
    { type: 'single_choice', content: `Module ${moduleIndex}: Hàm kết nối MySQL trong PHP?`, explanation: 'mysqli_connect() hoặc PDO.', options: [{ content: 'mysqli_connect()', isCorrect: true }, { content: 'mysql_open()', isCorrect: false }, { content: 'db_connect()', isCorrect: false }, { content: 'connect_mysql()', isCorrect: false }] },
    { type: 'multiple_choice', content: `Module ${moduleIndex}: Toán tử nào có trong PHP?`, explanation: 'Arithmetic, comparison, logical operators.', options: [{ content: 'Arithmetic (+, -, *, /)', isCorrect: true }, { content: 'Comparison (==, !=)', isCorrect: true }, { content: 'Logical (&&, ||)', isCorrect: true }, { content: 'Bitwise XOR (^^^)', isCorrect: false }] },
    { type: 'single_choice', content: `Module ${moduleIndex}: Cấu trúc điều kiện trong PHP?`, explanation: 'if-else, switch-case.', options: [{ content: 'if-else', isCorrect: true }, { content: 'when-then', isCorrect: false }, { content: 'select-case', isCorrect: false }, { content: 'choose-when', isCorrect: false }] },
    { type: 'single_choice', content: `Module ${moduleIndex}: Vòng lặp nào có trong PHP?`, explanation: 'for, while, do-while, foreach.', options: [{ content: 'for, while, foreach', isCorrect: true }, { content: 'repeat-until', isCorrect: false }, { content: 'loop-end', isCorrect: false }, { content: 'iterate', isCorrect: false }] },
    { type: 'multiple_choice', content: `Module ${moduleIndex}: Superglobal nào có trong PHP?`, explanation: '$_GET, $_POST, $_SESSION, $_COOKIE.', options: [{ content: '$_GET', isCorrect: true }, { content: '$_POST', isCorrect: true }, { content: '$_SESSION', isCorrect: true }, { content: '$_GLOBAL', isCorrect: false }] },
    { type: 'single_choice', content: `Module ${moduleIndex}: Hàm include file trong PHP?`, explanation: 'include, require, include_once, require_once.', options: [{ content: 'include hoặc require', isCorrect: true }, { content: 'import', isCorrect: false }, { content: 'use', isCorrect: false }, { content: 'load', isCorrect: false }] },
    { type: 'essay', content: `Module ${moduleIndex}: Giải thích kiến thức PHP bạn học được và cách áp dụng.`, explanation: 'Tổng hợp kiến thức PHP.', options: [] },
  ],

  nextjs: (moduleIndex) => [
    { type: 'single_choice', content: `Module ${moduleIndex}: Next.js là framework của thư viện nào?`, explanation: 'Next.js là React framework.', options: [{ content: 'React', isCorrect: true }, { content: 'Vue', isCorrect: false }, { content: 'Angular', isCorrect: false }, { content: 'Svelte', isCorrect: false }] },
    { type: 'multiple_choice', content: `Module ${moduleIndex}: Next.js hỗ trợ rendering mode nào?`, explanation: 'CSR, SSR, SSG, ISR.', options: [{ content: 'CSR (Client-Side)', isCorrect: true }, { content: 'SSR (Server-Side)', isCorrect: true }, { content: 'SSG (Static)', isCorrect: true }, { content: 'VR (Virtual)', isCorrect: false }] },
    { type: 'single_choice', content: `Module ${moduleIndex}: App Router trong Next.js 13+ ở thư mục nào?`, explanation: 'App Router sử dụng thư mục app/.', options: [{ content: 'app/', isCorrect: true }, { content: 'pages/', isCorrect: false }, { content: 'src/', isCorrect: false }, { content: 'routes/', isCorrect: false }] },
    { type: 'single_choice', content: `Module ${moduleIndex}: Server Components có lợi ích gì?`, explanation: 'Giảm JavaScript bundle size.', options: [{ content: 'Giảm bundle size', isCorrect: true }, { content: 'Tăng bundle size', isCorrect: false }, { content: 'Không có lợi ích', isCorrect: false }, { content: 'Chỉ cho styling', isCorrect: false }] },
    { type: 'multiple_choice', content: `Module ${moduleIndex}: File đặc biệt trong App Router?`, explanation: 'page.tsx, layout.tsx, loading.tsx, error.tsx.', options: [{ content: 'page.tsx', isCorrect: true }, { content: 'layout.tsx', isCorrect: true }, { content: 'loading.tsx', isCorrect: true }, { content: 'component.tsx', isCorrect: false }] },
    { type: 'single_choice', content: `Module ${moduleIndex}: TypeScript trong Next.js có bắt buộc không?`, explanation: 'Không bắt buộc nhưng được khuyến khích.', options: [{ content: 'Không bắt buộc', isCorrect: true }, { content: 'Bắt buộc', isCorrect: false }, { content: 'Không hỗ trợ', isCorrect: false }, { content: 'Chỉ cho production', isCorrect: false }] },
    { type: 'single_choice', content: `Module ${moduleIndex}: API Routes nằm ở đâu?`, explanation: 'app/api/ cho App Router.', options: [{ content: 'app/api/', isCorrect: true }, { content: 'src/api/', isCorrect: false }, { content: 'routes/api/', isCorrect: false }, { content: 'backend/', isCorrect: false }] },
    { type: 'multiple_choice', content: `Module ${moduleIndex}: Next.js có thể deploy ở đâu?`, explanation: 'Vercel, Netlify, AWS, Docker.', options: [{ content: 'Vercel', isCorrect: true }, { content: 'Netlify', isCorrect: true }, { content: 'AWS', isCorrect: true }, { content: 'Chỉ localhost', isCorrect: false }] },
    { type: 'single_choice', content: `Module ${moduleIndex}: Image component có lợi ích gì?`, explanation: 'Tự động optimize images.', options: [{ content: 'Auto optimization', isCorrect: true }, { content: 'Không có lợi ích', isCorrect: false }, { content: 'Chỉ để hiển thị', isCorrect: false }, { content: 'Làm chậm website', isCorrect: false }] },
    { type: 'essay', content: `Module ${moduleIndex}: Tổng hợp kiến thức Next.js từ module này và kế hoạch áp dụng.`, explanation: 'Tự đánh giá kiến thức Next.js.', options: [] },
  ],

  vue: (moduleIndex) => [
    { type: 'single_choice', content: `Module ${moduleIndex}: Vue.js được tạo ra bởi ai?`, explanation: 'Vue.js được tạo ra bởi Evan You.', options: [{ content: 'Evan You', isCorrect: true }, { content: 'Jordan Walke', isCorrect: false }, { content: 'Ryan Dahl', isCorrect: false }, { content: 'Brendan Eich', isCorrect: false }] },
    { type: 'multiple_choice', content: `Module ${moduleIndex}: Vue.js có tính năng core nào?`, explanation: 'Reactive data, components, directives.', options: [{ content: 'Reactive data binding', isCorrect: true }, { content: 'Component-based', isCorrect: true }, { content: 'Directives (v-if, v-for)', isCorrect: true }, { content: 'Native mobile', isCorrect: false }] },
    { type: 'single_choice', content: `Module ${moduleIndex}: Directive nào render list trong Vue?`, explanation: 'v-for dùng để loop qua array.', options: [{ content: 'v-for', isCorrect: true }, { content: 'v-loop', isCorrect: false }, { content: 'v-each', isCorrect: false }, { content: 'v-repeat', isCorrect: false }] },
    { type: 'single_choice', content: `Module ${moduleIndex}: Directive nào cho conditional rendering?`, explanation: 'v-if, v-else-if, v-else.', options: [{ content: 'v-if', isCorrect: true }, { content: 'v-show-if', isCorrect: false }, { content: 'v-display', isCorrect: false }, { content: 'v-render', isCorrect: false }] },
    { type: 'multiple_choice', content: `Module ${moduleIndex}: Vue 3 có tính năng mới nào?`, explanation: 'Composition API, Teleport, Fragments.', options: [{ content: 'Composition API', isCorrect: true }, { content: 'Teleport', isCorrect: true }, { content: 'Fragments', isCorrect: true }, { content: 'jQuery integration', isCorrect: false }] },
    { type: 'single_choice', content: `Module ${moduleIndex}: Vuex là gì?`, explanation: 'State management library.', options: [{ content: 'State management', isCorrect: true }, { content: 'Router', isCorrect: false }, { content: 'UI library', isCorrect: false }, { content: 'Testing tool', isCorrect: false }] },
    { type: 'single_choice', content: `Module ${moduleIndex}: Vue Router dùng để làm gì?`, explanation: 'Official router cho Vue.js.', options: [{ content: 'Routing/navigation', isCorrect: true }, { content: 'State management', isCorrect: false }, { content: 'API calls', isCorrect: false }, { content: 'Styling', isCorrect: false }] },
    { type: 'multiple_choice', content: `Module ${moduleIndex}: Lifecycle hooks nào có trong Vue?`, explanation: 'created, mounted, updated, unmounted.', options: [{ content: 'created', isCorrect: true }, { content: 'mounted', isCorrect: true }, { content: 'updated', isCorrect: true }, { content: 'initialized', isCorrect: false }] },
    { type: 'single_choice', content: `Module ${moduleIndex}: Single File Component có extension gì?`, explanation: '.vue file chứa template, script, style.', options: [{ content: '.vue', isCorrect: true }, { content: '.vuecomp', isCorrect: false }, { content: '.component', isCorrect: false }, { content: '.jsx', isCorrect: false }] },
    { type: 'essay', content: `Module ${moduleIndex}: So sánh Options API và Composition API dựa trên kiến thức bạn học được.`, explanation: 'Phân tích hai API patterns.', options: [] },
  ],

  angular: (moduleIndex) => [
    { type: 'single_choice', content: `Module ${moduleIndex}: Angular được phát triển bởi công ty nào?`, explanation: 'Angular được phát triển bởi Google.', options: [{ content: 'Google', isCorrect: true }, { content: 'Facebook', isCorrect: false }, { content: 'Microsoft', isCorrect: false }, { content: 'Amazon', isCorrect: false }] },
    { type: 'multiple_choice', content: `Module ${moduleIndex}: Angular sử dụng ngôn ngữ nào?`, explanation: 'TypeScript, JavaScript, HTML.', options: [{ content: 'TypeScript', isCorrect: true }, { content: 'JavaScript', isCorrect: true }, { content: 'HTML', isCorrect: true }, { content: 'Python', isCorrect: false }] },
    { type: 'single_choice', content: `Module ${moduleIndex}: Component được định nghĩa bằng decorator nào?`, explanation: '@Component decorator.', options: [{ content: '@Component', isCorrect: true }, { content: '@View', isCorrect: false }, { content: '@Module', isCorrect: false }, { content: '@Directive', isCorrect: false }] },
    { type: 'single_choice', content: `Module ${moduleIndex}: Angular CLI command tạo component?`, explanation: 'ng generate component hoặc ng g c.', options: [{ content: 'ng generate component', isCorrect: true }, { content: 'ng create component', isCorrect: false }, { content: 'ng new component', isCorrect: false }, { content: 'ng add component', isCorrect: false }] },
    { type: 'multiple_choice', content: `Module ${moduleIndex}: Angular có building blocks nào?`, explanation: 'Components, Services, Modules, Directives.', options: [{ content: 'Components', isCorrect: true }, { content: 'Services', isCorrect: true }, { content: 'Modules', isCorrect: true }, { content: 'Widgets', isCorrect: false }] },
    { type: 'single_choice', content: `Module ${moduleIndex}: Dependency Injection có lợi ích gì?`, explanation: 'Tăng testability, reusability.', options: [{ content: 'Tăng testability', isCorrect: true }, { content: 'Giảm performance', isCorrect: false }, { content: 'Không có lợi ích', isCorrect: false }, { content: 'Chỉ cho styling', isCorrect: false }] },
    { type: 'single_choice', content: `Module ${moduleIndex}: RxJS trong Angular dùng để làm gì?`, explanation: 'Reactive programming với Observables.', options: [{ content: 'Reactive programming', isCorrect: true }, { content: 'Routing', isCorrect: false }, { content: 'Styling', isCorrect: false }, { content: 'Testing', isCorrect: false }] },
    { type: 'multiple_choice', content: `Module ${moduleIndex}: Angular Forms có loại nào?`, explanation: 'Template-driven và Reactive forms.', options: [{ content: 'Template-driven', isCorrect: true }, { content: 'Reactive forms', isCorrect: true }, { content: 'Model-driven', isCorrect: true }, { content: 'Static forms', isCorrect: false }] },
    { type: 'single_choice', content: `Module ${moduleIndex}: Angular Router dùng để làm gì?`, explanation: 'Navigation và routing.', options: [{ content: 'Navigation/routing', isCorrect: true }, { content: 'State management', isCorrect: false }, { content: 'HTTP requests', isCorrect: false }, { content: 'Animation', isCorrect: false }] },
    { type: 'essay', content: `Module ${moduleIndex}: Giải thích kiến trúc Angular bạn học được từ module này.`, explanation: 'Tổng hợp kiến thức Angular.', options: [] },
  ],

  git: (moduleIndex) => [
    { type: 'single_choice', content: `Module ${moduleIndex}: Git là loại version control nào?`, explanation: 'Git là distributed version control system.', options: [{ content: 'Distributed VCS', isCorrect: true }, { content: 'Centralized VCS', isCorrect: false }, { content: 'Local VCS', isCorrect: false }, { content: 'Cloud VCS', isCorrect: false }] },
    { type: 'multiple_choice', content: `Module ${moduleIndex}: Lệnh Git nào được dùng thường xuyên?`, explanation: 'git add, git commit, git push, git pull.', options: [{ content: 'git add', isCorrect: true }, { content: 'git commit', isCorrect: true }, { content: 'git push', isCorrect: true }, { content: 'git install', isCorrect: false }] },
    { type: 'single_choice', content: `Module ${moduleIndex}: Lệnh tạo branch mới?`, explanation: 'git branch <name> hoặc git checkout -b.', options: [{ content: 'git branch <name>', isCorrect: true }, { content: 'git create branch', isCorrect: false }, { content: 'git new branch', isCorrect: false }, { content: 'git add branch', isCorrect: false }] },
    { type: 'single_choice', content: `Module ${moduleIndex}: Lệnh merge branch?`, explanation: 'git merge <branch-name>.', options: [{ content: 'git merge', isCorrect: true }, { content: 'git combine', isCorrect: false }, { content: 'git join', isCorrect: false }, { content: 'git unite', isCorrect: false }] },
    { type: 'multiple_choice', content: `Module ${moduleIndex}: Git có vùng làm việc nào?`, explanation: 'Working directory, Staging area, Repository.', options: [{ content: 'Working directory', isCorrect: true }, { content: 'Staging area', isCorrect: true }, { content: 'Repository', isCorrect: true }, { content: 'Deployment area', isCorrect: false }] },
    { type: 'single_choice', content: `Module ${moduleIndex}: .gitignore file dùng để làm gì?`, explanation: 'Chỉ định files không track bởi Git.', options: [{ content: 'Ignore files from tracking', isCorrect: true }, { content: 'Delete files', isCorrect: false }, { content: 'Encrypt files', isCorrect: false }, { content: 'Backup files', isCorrect: false }] },
    { type: 'single_choice', content: `Module ${moduleIndex}: GitHub là gì?`, explanation: 'Platform hosting Git repositories.', options: [{ content: 'Git hosting platform', isCorrect: true }, { content: 'Version control system', isCorrect: false }, { content: 'IDE', isCorrect: false }, { content: 'Database', isCorrect: false }] },
    { type: 'multiple_choice', content: `Module ${moduleIndex}: GitHub có tính năng nào?`, explanation: 'Pull requests, Issues, Actions, Projects.', options: [{ content: 'Pull requests', isCorrect: true }, { content: 'Issues tracking', isCorrect: true }, { content: 'GitHub Actions', isCorrect: true }, { content: 'Video editing', isCorrect: false }] },
    { type: 'single_choice', content: `Module ${moduleIndex}: Pull Request dùng để làm gì?`, explanation: 'Đề xuất merge code changes.', options: [{ content: 'Đề xuất merge changes', isCorrect: true }, { content: 'Delete branch', isCorrect: false }, { content: 'Create repository', isCorrect: false }, { content: 'Download code', isCorrect: false }] },
    { type: 'essay', content: `Module ${moduleIndex}: Giải thích Git workflow bạn học được và cách áp dụng trong team.`, explanation: 'Tổng hợp kiến thức Git.', options: [] },
  ],

  generic: (moduleIndex) => [
    { type: 'single_choice', content: `Module ${moduleIndex}: Bạn đã hiểu nội dung module này chưa?`, explanation: 'Đánh giá mức độ hiểu bài.', options: [{ content: 'Đã hiểu hoàn toàn', isCorrect: true }, { content: 'Hiểu một phần', isCorrect: true }, { content: 'Chưa hiểu', isCorrect: false }, { content: 'Cần xem lại', isCorrect: false }] },
    { type: 'multiple_choice', content: `Module ${moduleIndex}: Kiến thức nào bạn học được?`, explanation: 'Tổng hợp kiến thức.', options: [{ content: 'Kiến thức lý thuyết', isCorrect: true }, { content: 'Kỹ năng thực hành', isCorrect: true }, { content: 'Best practices', isCorrect: true }, { content: 'Không học được gì', isCorrect: false }] },
    { type: 'single_choice', content: `Module ${moduleIndex}: Mức độ khó của module?`, explanation: 'Đánh giá độ khó.', options: [{ content: 'Vừa phải', isCorrect: true }, { content: 'Quá dễ', isCorrect: false }, { content: 'Quá khó', isCorrect: false }, { content: 'Không đánh giá được', isCorrect: false }] },
    { type: 'single_choice', content: `Module ${moduleIndex}: Bạn có thể áp dụng kiến thức này không?`, explanation: 'Đánh giá tính ứng dụng.', options: [{ content: 'Có thể áp dụng', isCorrect: true }, { content: 'Cần học thêm', isCorrect: true }, { content: 'Không áp dụng được', isCorrect: false }, { content: 'Chưa rõ', isCorrect: false }] },
    { type: 'multiple_choice', content: `Module ${moduleIndex}: Phần nào hữu ích nhất?`, explanation: 'Đánh giá nội dung.', options: [{ content: 'Video bài giảng', isCorrect: true }, { content: 'Ví dụ thực tế', isCorrect: true }, { content: 'Bài tập', isCorrect: true }, { content: 'Không có gì hữu ích', isCorrect: false }] },
    { type: 'single_choice', content: `Module ${moduleIndex}: Thời lượng module có phù hợp không?`, explanation: 'Đánh giá thời lượng.', options: [{ content: 'Phù hợp', isCorrect: true }, { content: 'Quá ngắn', isCorrect: false }, { content: 'Quá dài', isCorrect: false }, { content: 'Không ý kiến', isCorrect: false }] },
    { type: 'single_choice', content: `Module ${moduleIndex}: Bạn muốn tìm hiểu sâu hơn không?`, explanation: 'Đánh giá hứng thú.', options: [{ content: 'Có', isCorrect: true }, { content: 'Có thể', isCorrect: true }, { content: 'Không', isCorrect: false }, { content: 'Chưa quyết định', isCorrect: false }] },
    { type: 'multiple_choice', content: `Module ${moduleIndex}: Kỹ năng nào cần cải thiện?`, explanation: 'Tự đánh giá.', options: [{ content: 'Kỹ năng lý thuyết', isCorrect: true }, { content: 'Kỹ năng thực hành', isCorrect: true }, { content: 'Giải quyết vấn đề', isCorrect: true }, { content: 'Không cần cải thiện', isCorrect: false }] },
    { type: 'single_choice', content: `Module ${moduleIndex}: Đánh giá chất lượng module?`, explanation: 'Đánh giá tổng thể.', options: [{ content: 'Tốt', isCorrect: true }, { content: 'Trung bình', isCorrect: true }, { content: 'Kém', isCorrect: false }, { content: 'Rất kém', isCorrect: false }] },
    { type: 'essay', content: `Module ${moduleIndex}: Tóm tắt kiến thức chính từ module này và cách áp dụng vào công việc.`, explanation: 'Tự đánh giá và tổng hợp.', options: [] },
  ],
};

/**
 * Get question generator for a course
 */
function getQuestionGenerator(courseSlug) {
  if (courseSlug.includes('python')) return QUESTION_GENERATORS.python;
  if (courseSlug.includes('cpp') || courseSlug.includes('c++')) return QUESTION_GENERATORS.cpp;
  if (courseSlug.includes('figma')) return QUESTION_GENERATORS.figma;
  if (courseSlug.includes('visily')) return QUESTION_GENERATORS.visily;
  if (courseSlug.includes('aws') || courseSlug.includes('devops')) return QUESTION_GENERATORS.aws;
  if (courseSlug.includes('php')) return QUESTION_GENERATORS.php;
  if (courseSlug.includes('nextjs') || courseSlug.includes('next')) return QUESTION_GENERATORS.nextjs;
  if (courseSlug.includes('vue')) return QUESTION_GENERATORS.vue;
  if (courseSlug.includes('angular')) return QUESTION_GENERATORS.angular;
  if (courseSlug.includes('git') || courseSlug.includes('github')) return QUESTION_GENERATORS.git;
  return QUESTION_GENERATORS.generic;
}

/**
 * Seed questions and quizzes for all courses
 * Each MODULE gets 1 quiz with 10 questions
 */
async function seedQuestionQuiz(context) {
  const { prisma } = context;
  
  console.log('🎯 Starting Comprehensive Question & Quiz Seed...\n');
  console.log('📋 Strategy: 1 Quiz per Module with 10 diverse questions\n');

  // Get all courses with their modules
  const courses = await prisma.course.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      categoryId: true,
      trainerUserId: true,
      modules: {
        include: {
          lessons: true,
        },
        orderBy: { orderIndex: 'asc' },
      },
      category: true,
    },
  });

  console.log(`Found ${courses.length} courses to process\n`);

  let totalQuestionBanks = 0;
  let totalQuestions = 0;
  let totalQuizzes = 0;
  let totalModules = 0;

  for (const course of courses) {
    console.log(`\n📚 Processing: ${course.title}`);
    console.log(`   Category: ${course.category?.slug || 'unknown'}`);
    console.log(`   Modules: ${course.modules.length}`);
    
    // Skip courses without modules
    if (course.modules.length === 0) {
      console.log(`   ⚠️  Skipping: No modules found`);
      continue;
    }

    // Skip courses without owner
    if (!course.trainerUserId) {
      console.log(`   ⚠️  Skipping: No owner/trainer assigned`);
      continue;
    }
    
    totalModules += course.modules.length;

    // Create ONE question bank for this course
    const questionBank = await prisma.questionBank.create({
      data: {
        categoryId: course.categoryId,
        ownerTrainerId: course.trainerUserId,
        title: `${course.title} - Question Bank`,
        description: `Centralized question bank for ${course.title} course`,
        isActive: true,
      },
    });
    totalQuestionBanks++;

    console.log(`   ✓ Created question bank`);

    // Get question generator for this course
    const questionGenerator = getQuestionGenerator(course.slug);

    // Process each module
    for (const module of course.modules) {
      console.log(`\n   📖 Module ${module.orderIndex}: ${module.title}`);
      console.log(`      Lessons: ${module.lessons.length}`);

      // Generate 10 questions for this specific module
      const questionTemplates = questionGenerator(module.orderIndex);
      
      // Create questions for this module
      const moduleQuestions = [];
      for (let i = 0; i < questionTemplates.length; i++) {
        const template = questionTemplates[i];
        
        const question = await prisma.question.create({
          data: {
            questionBankId: questionBank.id,
            questionType: template.type,
            content: template.content,
            explanation: template.explanation,
            defaultPoints: template.type === 'essay' ? 5 : 1,
            isActive: true,
          },
        });
        
        // Create options for non-essay questions
        if (template.options && template.options.length > 0) {
          for (let j = 0; j < template.options.length; j++) {
            await prisma.questionOption.create({
              data: {
                questionId: question.id,
                content: template.options[j].content,
                isCorrect: template.options[j].isCorrect,
                orderIndex: j + 1,
              },
            });
          }
        }
        
        moduleQuestions.push(question);
        totalQuestions++;
      }

      console.log(`      ✓ Created ${moduleQuestions.length} questions for this module`);

      // Create 1 quiz for this module
      const quiz = await prisma.quiz.create({
        data: {
          courseId: course.id,
          moduleId: module.id,
          title: `${course.title} - ${module.title} Quiz`,
          description: `Quiz for ${module.title} covering key concepts and practical knowledge`,
          selectionMode: 'fixed',
          passScorePercent: 70.00,
          timeLimitMinutes: 30,
          maxAttempts: 3,
          shuffleQuestions: true,
          shuffleOptions: true,
        },
      });
      totalQuizzes++;

      // Link all module questions to this quiz
      for (let i = 0; i < moduleQuestions.length; i++) {
        await prisma.quizQuestion.create({
          data: {
            quizId: quiz.id,
            questionId: moduleQuestions[i].id,
            orderIndex: i + 1,
            points: moduleQuestions[i].defaultPoints,
            isRequired: true,
          },
        });
      }

      console.log(`      ✓ Created quiz with ${moduleQuestions.length} questions`);
    }

    console.log(`   ✅ Completed ${course.title}: ${course.modules.length} quizzes created`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ QUESTION & QUIZ SEED COMPLETED SUCCESSFULLY!');
  console.log('='.repeat(60));
  console.log(`\n📊 Final Statistics:`);
  console.log(`   • Courses Processed: ${courses.length}`);
  console.log(`   • Total Modules: ${totalModules}`);
  console.log(`   • Question Banks: ${totalQuestionBanks} (1 per course)`);
  console.log(`   • Total Questions: ${totalQuestions}`);
  console.log(`   • Total Quizzes: ${totalQuizzes} (1 per module)`);
  console.log(`   • Questions per Quiz: 10 (guaranteed)`);
  console.log(`   • Average Quizzes per Course: ${(totalQuizzes / courses.length).toFixed(1)}`);
  console.log('\n💡 Each module now has its own quiz with 10 contextual questions!');
  console.log('🎓 Students can test their knowledge after completing each module.\n');

  return {
    questionBanks: totalQuestionBanks,
    questions: totalQuestions,
    quizzes: totalQuizzes,
    modules: totalModules,
  };
}

module.exports = { seedQuestionQuiz };
