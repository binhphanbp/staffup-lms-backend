/**
 * Generates a URL-friendly slug from a string.
 * Specifically designed to handle Vietnamese diacritics and common punctuation.
 */
export const slugify = (text: string): string => {
  if (!text) return '';

  let slug = text.toLowerCase();

  // Remove Vietnamese accents
  slug = slug.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  slug = slug.replace(/[đĐ]/g, 'd');

  // Replace special characters and spaces with hyphens
  slug = slug
    .replace(/[^a-z0-9\s-]/g, '') // Remove non-alphanumeric (except space and hyphen)
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-'); // Remove consecutive hyphens

  return slug;
};
