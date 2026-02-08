import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: '/tmp/uploads',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 104857600 }, // 100MB
  fileFilter: (req, file, cb) => {
    const allowed = [
      'text/csv',
      'application/json',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    cb(null, allowed.includes(file.mimetype));
  },
});
