# Shared Seed Utilities

Các utility functions dùng chung cho seed scripts.

## Files

### client.js

Quản lý Prisma client connection cho seed scripts.

### rbac.data.js

Dữ liệu RBAC (Roles, Permissions) cho hệ thống.

### thumbnail-helper.js

Helper functions để quản lý course thumbnails từ Cloudinary.

## Thumbnail Helper

### Cách sử dụng

```javascript
const { getCourseThumbnailUrl, hasThumbnail } = require('./shared/thumbnail-helper');

// Lấy thumbnail URL cho course
const thumbnailUrl = getCourseThumbnailUrl('python-programming-basics-advanced');
// Returns: https://res.cloudinary.com/ds52btbjy/image/upload/w_800,h_450,c_fill,q_auto,f_auto/staffup-lms/thumbnails/python.jpg

// Kiểm tra course có thumbnail không
if (hasThumbnail('python-programming-basics-advanced')) {
  console.log('Course has thumbnail');
}
```

### Thêm thumbnail mới

1. Upload ảnh lên Cloudinary bằng script:

   ```bash
   pnpm run upload-thumbnails
   ```

2. Thêm mapping vào `thumbnail-helper.js`:

   ```javascript
   const THUMBNAIL_MAPPING = {
     'course-slug': 'image-filename-without-extension',
     // Ví dụ:
     'python-programming-basics-advanced': 'python',
     'react-advanced-patterns': 'react',
   };
   ```

3. Seed sẽ tự động sử dụng thumbnail từ Cloudinary

### Fallback

Nếu course không có thumbnail trong mapping, seed sẽ:

- Trả về `null` từ `getCourseThumbnailUrl()`
- Seed script có thể sử dụng fallback URL (Unsplash, placeholder, etc.)

### Cloudinary URL Format

Thumbnails được serve với transformations:

- Width: 800px
- Height: 450px
- Crop: fill
- Quality: auto
- Format: auto (WebP cho browsers hỗ trợ)

URL pattern:

```
https://res.cloudinary.com/{cloud_name}/image/upload/w_800,h_450,c_fill,q_auto,f_auto/staffup-lms/thumbnails/{filename}.jpg
```
