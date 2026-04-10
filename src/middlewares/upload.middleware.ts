import multer from 'multer';
import { AppError } from '@/utils';

const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024;

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
