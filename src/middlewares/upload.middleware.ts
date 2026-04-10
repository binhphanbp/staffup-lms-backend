import multer from 'multer';
import { AppError } from '@/utils';

const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_MEDIA_UPLOAD_SIZE_BYTES = 250 * 1024 * 1024;

const allowedMediaMimeTypes = new Set([
  'video/mp4',
  'video/quicktime',
  'video/webm',
  'video/x-msvideo',
  'video/x-matroska',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'application/pdf',
  'application/zip',
  'application/x-zip-compressed',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]);

export const excelUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_UPLOAD_SIZE_BYTES,
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    const isExcelMime =
      file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.mimetype === 'application/vnd.ms-excel' ||
      file.mimetype === 'application/octet-stream';

    const hasExcelExtension = /\.(xlsx|xls)$/i.test(file.originalname);

    if (!isExcelMime && !hasExcelExtension) {
      return cb(new AppError('Only Excel files (.xlsx, .xls) are allowed', 400));
    }

    cb(null, true);
  },
});

export const mediaUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_MEDIA_UPLOAD_SIZE_BYTES,
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    const isSupportedMimeType =
      allowedMediaMimeTypes.has(file.mimetype) ||
      file.mimetype.startsWith('video/') ||
      file.mimetype.startsWith('image/');

    const hasSupportedExtension =
      /\.(mp4|mov|webm|avi|mkv|jpg|jpeg|png|webp|gif|svg|pdf|zip|doc|docx|ppt|pptx|xls|xlsx)$/i.test(
        file.originalname,
      );

    if (!isSupportedMimeType && !hasSupportedExtension) {
      return cb(
        new AppError(
          'Only video, image, PDF, ZIP, Word, PowerPoint, and Excel files are allowed.',
          400,
        ),
      );
    }

    cb(null, true);
  },
});
