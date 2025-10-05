import { upload } from "../config/upload.js";

export const uploadSingle = (filename = "file") => {
  return upload.single(filename);
};

export const uploadMutiple = (filename = "files", maxCount = 5) => {
  return upload.array(filename, maxCount);
};
 