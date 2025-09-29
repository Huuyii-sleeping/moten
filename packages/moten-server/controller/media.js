import { response } from "../utils/response.js";
import MAO from "multer-aliyun-oss";
import multer from "multer";
import dotenv from "dotenv";
dotenv.config();

export class MediaController {
  upload() {
    const handler = async (req, res) => {
      const upload = multer({
        storage: MAO({
          config: {
            region: process.env.OSS_REGION,
            accessKeyId: process.env.OSS_ACCESS_KEY_ID,
            accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
            bucket: process.env.OSS_BUCKET,
          },

          destination: "uploads/",
          //   filename: "test",
        }),
      });
      const singleFileUpload = upload.single("file");
      singleFileUpload(req, res, function (err) {
        if (!req.file) {
          return res.json(response.validatorFailed());
        }
        if (err) {
          res.json(response.fail(err));
        } else {
          res.send(
            response.success({
              url: req.file.url,
            })
          );
        }
      });
    };
    return [handler];
  }
}
