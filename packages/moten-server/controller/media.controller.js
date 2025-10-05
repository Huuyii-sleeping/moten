import { uploadMutiple, uploadSingle } from "../middleware/upload.js";

export class MediaController {
  upload() {
    const rules = uploadSingle("file");
    const handler = async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({
            code: 400,
            message: "没有文件上传",
            data: null,
          });
        } 
        const fileUrl = `/uploads/${req.file.filename}`;
        return res.json({
          code: 200,
          mesage: "上传成功",
          data: {
            url: fileUrl,
            filename: req.file.filename,
            originalname: req.file.originalname,
            size: req.file.size,
            mimetype: req.file.mimetype,
          },
        });
      } catch (error) {
        console.warn("upload error", error);
        return res.status(500).json({
          code: 500,
          message: "上传失败" + error.message,
          data: null,
        });
      }
    };
    return [rules, handler];
  }
  uploadMutiple() {
    const rules = uploadMutiple("files", 5);
    const handler = async (req, res) => {
      try {
        if (!req.files || req.files.length === 0) {
          return res.status(400).json({
            code: 400,
            message: "文件还没有被上传",
            data: null,
          });
        }
        const files = req.files.map((file) => ({
          url: `/uploads/${file.filename}`,
          filename: file.filename,
          originalname: file.originalname,
          size: file.size,
          mimetype: file.mimetype,
        }));
        return res.json({
          code: 200,
          message: "上传成功",
          data: files,
        });
      } catch (error) {
        console.warn("Upload multiple error:", error);
        return res.status(500).json({
          code: 500,
          message: "上传失败" + error.message,
          data: null,
        });
      }
    };
    return [rules, handler];
  }
}
