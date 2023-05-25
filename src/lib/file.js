import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

const storagePath = path.join(process.cwd(), 'storage');

export async function readAllFilenames(folder = '') {
  const fileStoragePath = path.join(storagePath, `/${folder}`);
  try {
    const fileNames = fs.readdirSync(fileStoragePath);
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
