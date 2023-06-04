import fs from 'fs';
import path from 'path';

const storagePath = path.join(process.cwd(), 'storage');

export async function readAllFilenames(folder = '') {
  const fileStoragePath = path.join(storagePath, folder);
  try {
    const fileNames = fs.readdirSync(fileStoragePath);
    return fileNames;
  } catch (error) {
    return null;
  }
}

export async function saveUploadFile(file, server = '') {
  const data = fs.readFileSync(file.filepath);
  const saveDirectory = path.join(storagePath, server);

  try {
    await fs.readdirSync(saveDirectory);
  } catch (error) {
    await fs.mkdirSync(saveDirectory);
  }

  fs.writeFileSync(`${saveDirectory}/${file.originalFilename}`, data);
  await fs.unlinkSync(file.filepath);
  return;
}
