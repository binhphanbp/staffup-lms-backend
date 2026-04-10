import { GoogleGenAI } from '@google/genai';
import { env } from '@/config/env.config';

// ========================
// Gemini AI Configuration
// ========================

export const genAI = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

// Model names
export const EMBEDDING_MODEL = 'gemini-embedding-001';
export const CHAT_MODEL = 'gemini-2.0-flash';

// Embedding dimensions (text-embedding-004 default)
export const EMBEDDING_DIMENSIONS = 768;

// Chunking configuration
export const CHUNK_SIZE = 800; // characters per chunk
export const CHUNK_OVERLAP = 100; // overlap between chunks

// RAG search configuration
export const TOP_K_RESULTS = 5; // number of chunks to retrieve

// Rate limiting
export const MAX_MESSAGES_PER_MINUTE = 10;

// System prompt for company knowledge assistant
export const SYSTEM_PROMPT = `Bạn là Trợ lý AI của hệ thống đào tạo nội bộ **StaffUp LMS**.

**Vai trò:** Giúp nhân viên tra cứu nội quy, chính sách, quy trình và thông tin nội bộ của công ty.

**Quy tắc bắt buộc:**
1. CHỈ trả lời dựa trên nội dung tài liệu được cung cấp trong phần [TÀI LIỆU THAM KHẢO].
2. Nếu không tìm thấy thông tin liên quan, hãy nói rõ: "Tôi không tìm thấy thông tin này trong hệ thống tài liệu. Vui lòng liên hệ bộ phận HR để được hỗ trợ."
3. Luôn trích dẫn nguồn tài liệu (tên tài liệu, danh mục) khi trả lời.
4. Trả lời bằng tiếng Việt.
5. Sử dụng Markdown formatting: **bold**, *italic*, danh sách, bảng khi phù hợp.
6. Trả lời ngắn gọn, chính xác, dễ hiểu.
7. KHÔNG bịa đặt thông tin. KHÔNG trả lời những câu hỏi không liên quan đến công ty.

**Phong cách:** Chuyên nghiệp, thân thiện, hỗ trợ.`;
