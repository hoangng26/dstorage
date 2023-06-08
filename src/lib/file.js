import axios from 'axios';
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
  const data = await fs.readFileSync(file.filepath);
  const saveDirectory = path.join(storagePath, server);

  try {
    await fs.readdirSync(saveDirectory);
  } catch (error) {
    await fs.mkdirSync(saveDirectory);
  }

  await fs.writeFileSync(`${saveDirectory}/${file.originalFilename}`, data);
  await fs.unlinkSync(file.filepath);
  return;
}

export async function getFilesOnServer(server) {
  try {
    let response = await axios.get(`http://${server}/api/read`);
    await fs.writeFileSync(
      path.join(process.cwd(), `static/${server}.json`),
      JSON.stringify(response.data, null, 2),
      (error) => console.log(error),
    );
    return response.data;
  } catch (error) {
    return [];
  }
}
