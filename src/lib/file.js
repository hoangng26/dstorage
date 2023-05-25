import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export async function readAllFilenames(folder = '') {
  const storagePath = path.join(process.cwd(), `storage/${folder}`);
  try {
    const fileNames = fs.readdirSync(storagePath);
    return fileNames;
  } catch (error) {
    return null;
  }
}

export async function readFile(req) {
  const options = {};
  options.uploadDir = storagePath;
  options.filename = (name, ext, path, form) => path.originalFilename;

  const form = formidable(options);
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err);
      } else {
        resolve({ fields, files });
      }
    });
  });
}
