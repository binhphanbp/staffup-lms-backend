-- Update course thumbnails with Cloudinary URLs
-- Giả sử bạn đã upload ảnh vào folder: staffup-lms/thumbnails/
-- Với tên file = slug của course

-- Cách 1: Update với Cloudinary transformation (tự động resize, optimize)
UPDATE courses 
SET thumbnail_url = CONCAT(
  'https://res.cloudinary.com/ds52btbjy/image/upload/',
  'w_800,h_450,c_fill,q_auto,f_auto/',
  'staffup-lms/thumbnails/',
  slug
)
WHERE slug IN (
  'python-programming-basics-advanced',
  'cpp-programming-fundamentals',
  'devops-aws-complete-guide',
  'uiux-design-figma',
  'visily-ai-ui-design',
  'php-mysql-web-development',
  'nextjs-typescript-modern-web',
  'git-github-version-control',
  'vuejs-progressive-framework',
  'angularjs-fundamentals',
  'nodejs-api-fundamentals',
  'product-discovery-workshop',
  'leadership-essentials-team-leads',
  'advanced-backend-patterns'
);

-- Kiểm tra kết quả
SELECT title, thumbnail_url FROM courses ORDER BY title;
