import multer from "multer";
import path from "path";
import fs from "fs";

const ensureUploadDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// 上传目录配置
const UPLOAD_DIR = path.join(process.cwd(), "uploads");
ensureUploadDir(UPLOAD_DIR);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const filename = `media-${uniqueSuffix}${ext}`;
    cb(null, filename);
  },
});

// 文件=过滤器
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype.startsWith("image/") ||
    file.mimetype.startsWith("video/")
  ) {
    cb(null, true);
  } else {
    cb(new Error("只允许上传图片和视频文件！"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fieldSize: 10 * 1024 * 1024,
  },
});

export { upload, UPLOAD_DIR };
