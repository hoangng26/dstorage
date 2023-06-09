import axios from 'axios';
import FormData from 'form-data';
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

export async function saveUploadFile(file, server = '', fileName = '') {
  const data = fs.readFileSync(file.filepath);
  const saveDirectory = path.join(storagePath, server);

  try {
    fs.readdirSync(saveDirectory);
  } catch (error) {
    fs.mkdirSync(saveDirectory);
  }

  fs.writeFileSync(`${saveDirectory}/${file.originalFilename || fileName}`, data);
  fs.unlinkSync(file.filepath);
  return;
}

export async function getFilesOnServer(server) {
  try {
    let response = await axios.get(`http://${server}/api/read`);
    fs.writeFileSync(
      path.join(process.cwd(), `static/${server}.json`),
      JSON.stringify(response.data, null, 2),
      (error) => console.log(error),
    );
    return response.data;
  } catch (error) {
    try {
      const files = await getFilesOnServerStatic(server);
      return files;
    } catch (error) {
      return [];
    }
  }
}

export async function getFilesOnServerStatic(server) {
  const staticStoragePath = path.join(process.cwd(), `static/${server}.json`);

  try {
    const files = JSON.parse(fs.readFileSync(staticStoragePath));
    return files;
  } catch (error) {
    return [];
  }
}

export async function getTemporaryFilesOfServer(server) {
  const temporaryFolderPath = path.join(storagePath, server);
  try {
    const files = fs.readdirSync(temporaryFolderPath);
    return files;
  } catch (error) {
    return null;
  }
}

export async function fetchTemporaryFilesToServer(server) {
  const temporaryFolderPath = path.join(storagePath, server);
  const files = fs.readdirSync(temporaryFolderPath);

  files.forEach(async (file) => {
    const filePath = path.join(temporaryFolderPath, file);
    const fileRead = fs.readFileSync(filePath);

    const data = new FormData();
    data.append('file', fileRead);
    data.append('fileName', file);

    await axios
      .post(`http://${server}/api/upload`, data)
      .then((response) => {})
      .catch((error) => {
        console.log(error);
      });

    fs.unlinkSync(filePath);
  });

  fs.rmSync(temporaryFolderPath, { recursive: true, force: true });

  await getFilesOnServer(server);
}
