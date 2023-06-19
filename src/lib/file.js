import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { getAllServers } from './servers';

const storagePath = path.join(process.cwd(), 'storage');

export async function getBlankPosition() {
  try {
    const { listFilesOnServers: listFiles } = await getListFilesFromAllServers();

    const availablePosition = listFiles.findIndex((f, index) => f.fileName.split('_')[1] != index + 1);
    return availablePosition >= 0 ? availablePosition : listFiles.length;
  } catch (error) {
    return 0;
  }
}

export function shortenName(fileName) {
  const tokens = fileName.split('_');
  return fileName.replace(`${tokens[0]}_${tokens[1]}_`, '');
}

export async function findIndexOnLocal(filename) {
  const listFiles = await readAllFilenames();
  return listFiles.findIndex((file) => shortenName(file) === filename);
}

export async function findIndexOnAllServers(fileName) {
  const { listFilesOnServers: listFiles } = await getListFilesFromAllServers();
  return listFiles.findIndex((item) => shortenName(item.fileName) === fileName);
}

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
  const availablePosition = await getBlankPosition();

  const checkIndex = await findIndexOnAllServers(file.originalFilename || fileName);

  const saveFileName = `File_${(checkIndex >= 0 ? checkIndex : availablePosition) + 1}_${
    file.originalFilename || fileName
  }`;

  try {
    fs.readdirSync(saveDirectory);
  } catch (error) {
    fs.mkdirSync(saveDirectory);
  }

  fs.writeFileSync(`${saveDirectory}/${saveFileName}`, data);
  fs.unlinkSync(file.filepath);
  return;
}

export function getLocalStoragePath(fileName) {
  const filePath = path.join(storagePath, fileName);
  return filePath;
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

export async function getListFilesFromAllServers() {
  const servers = getAllServers().map((server) => server.address);
  const listFilesOnServers = [];
  const listServersSaveFiles = {};

  for (let server of servers) {
    const response = await getFilesOnServer(server);

    response.forEach((fileName) => {
      const checkIndex = listFilesOnServers.findIndex((file) => file.fileName === fileName);
      if (checkIndex >= 0) {
        listFilesOnServers[checkIndex].servers.push(server);
        return;
      }

      listFilesOnServers.push({
        fileName: fileName,
        servers: [server],
      });
    });

    listServersSaveFiles[server] = response;
  }

  listFilesOnServers.sort((a, b) => (a.fileName > b.fileName ? 1 : -1));

  fs.writeFileSync(
    path.join(process.cwd(), `static/files.json`),
    JSON.stringify(listFilesOnServers, null, 2),
    (error) => console.log(error),
  );

  fs.writeFileSync(
    path.join(process.cwd(), `static/fservers.json`),
    JSON.stringify(listServersSaveFiles, null, 2),
    (error) => console.log(error),
  );

  return {
    listFilesOnServers,
    listServersSaveFiles,
  };
}

export async function getECBCParameters() {
  const { listFilesOnServers: listFiles, listServersSaveFiles: listServers } = await getListFilesFromAllServers();
  const ECBC_N = 42;
  const ECBC_n = listFiles.length + 1;
  // const ECBC_n = 1;
  const ECBC_m = Object.keys(listServers).length;
  const ECBC_k = 13;
  const ECBC_r = 2;
  const ECBC_t = 3;
  return {
    ECBC_N,
    ECBC_n,
    ECBC_m,
    ECBC_k,
    ECBC_r,
    ECBC_t,
  };
}

export async function createECBCTable() {
  const { ECBC_N, ECBC_k, ECBC_m, ECBC_n, ECBC_r, ECBC_t } = await getECBCParameters();

  let table = [];
  const tm = ECBC_m * ECBC_t;

  for (let i = 0; i < ECBC_m - ECBC_r; i++) {
    let row = [];
    for (let j = 0; j < ECBC_n; j++) {
      if (j >= tm || (j >= i * ECBC_t && j < ECBC_t * (i + ECBC_r + 1))) row.push(1);
      else row.push(0);
    }
    table.push(row);
  }

  for (let i = ECBC_m - ECBC_r; i < ECBC_m; i++) {
    let row = [];
    for (let j = 0; j < ECBC_n; j++) {
      if (j >= ECBC_t * i || j < ECBC_t * (i + ECBC_r + 1 - ECBC_m)) row.push(1);
      else row.push(0);
    }
    table.push(row);
  }

  return table;
}
