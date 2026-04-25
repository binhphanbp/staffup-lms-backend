/**
 * Helper để lấy thumbnail URL từ Cloudinary
 * Mapping tên file ảnh với slug của course
 */

const THUMBNAIL_MAPPING = {
  'python-programming-basics-advanced': 'python',
  'cpp-programming-fundamentals': 'c++',
  'devops-aws-complete-guide': 'devop',
  'git-github-version-control': 'github',
  'nextjs-typescript-modern-web': 'nextjs',
  'php-mysql-web-development': 'php',
  'uiux-design-figma': 'uiux',
  'visily-ai-ui-design': 'visily',
  'vuejs-progressive-framework': 'vue',
  'angularjs-fundamentals': 'angular',
};

/**
 * Lấy Cloudinary thumbnail URL cho course
 * @param {string} slug - Course slug
 * @param {string} cloudName - Cloudinary cloud name (default: ds52btbjy)
 * @returns {string} Cloudinary thumbnail URL hoặc null
 */
function getCourseThumbnailUrl(slug, cloudName = 'ds52btbjy') {
  const thumbnailId = THUMBNAIL_MAPPING[slug];
  
  if (!thumbnailId) {
    return null;
  }
  
  // Cloudinary URL với transformation (resize, optimize)
  return `https://res.cloudinary.com/${cloudName}/image/upload/w_800,h_450,c_fill,q_auto,f_auto/staffup-lms/thumbnails/${thumbnailId}.jpg`;
}

/**
 * Kiểm tra xem course có thumbnail không
 * @param {string} slug - Course slug
 * @returns {boolean}
 */
function hasThumbnail(slug) {
  return slug in THUMBNAIL_MAPPING;
}

/**
 * Lấy danh sách tất cả course slugs có thumbnail
 * @returns {string[]}
 */
function getCoursesWithThumbnails() {
  return Object.keys(THUMBNAIL_MAPPING);
}

module.exports = {
  getCourseThumbnailUrl,
  hasThumbnail,
  getCoursesWithThumbnails,
  THUMBNAIL_MAPPING,
};
