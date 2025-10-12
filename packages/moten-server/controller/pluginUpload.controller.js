import multer from "multer";
import path from "path";
import fs from "fs";
import { response } from "../utils/response.js";
import { plugins } from "../models/plugins.js";

const upload = multer({
  dest: path.join(process.cwd(), "uploads/plugins/tmp"),
  limits: { fileSize: 50 * 1024 * 1024 },
});

export class PluginUploadController {
  uploadPlugin() {
    const handler = async (req, res) => {
      const { name, description, version, author, tags } = req.body;
      const userId = req.auth?.id;
      if (!userId) return res.json(response.authorizeFailed());
      if (!req.file) {
        return res.json(response.fail("请上传插件文件"));
      }
      const fileName = `${Date.now()}-${req.file.originalname}`;
      const finalPath = path.join(process.cwd(), "uploads/plugins", fileName);
      fs.renameSync(req.file.path, finalPath);
      const newwPlugin = {
        id: plugins.length + 1,
        name,
        description,
        version,
        author,
        tags: tags ? tags.split(",") : [],
        icon: "/uploads/plugins/default.png",
        status: "pending",
        filePath: finalPath,
        createdAt: new Date().toISOString(),
        submittedBy: userId,
      };
      plugins.push(newwPlugin);
      res.json(response.success(newwPlugin));
    };
    return [upload.single("pluginFile"), handler];
  }
}
