import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { getAllServers } from './servers';

const storagePath = path.join(process.cwd(), 'storage');
const tempPath = path.join(process.cwd(), 'temp');

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
  return listFiles.find((item) => shortenName(item.fileName) === fileName);
}

export async function readAllFilenames(folder = '') {
  const fileStoragePath = path.join(storagePath, folder);
  try {
    const fileNames = fs.readdirSync(fileStoragePath);
    fileNames.sort((a, b) => compareFileNames(a, b));
    return fileNames;
  } catch (error) {
    return null;
  }
}

export function compareFileNames(fileName1, fileName2) {
  const tokens1 = fileName1.split('_');
  const tokens2 = fileName2.split('_');
  return tokens1[1] - tokens2[1];
}

export async function saveUploadFile(file, server = '', fileName = '') {
  const data = fs.readFileSync(file.filepath);
  const saveDirectory = path.join(storagePath);
  const availablePosition = await getBlankPosition();

  const checkIndex = await findIndexOnAllServers(file.originalFilename || fileName);

  const normalFileName = `File_${(checkIndex ? checkIndex.fileName.split('_')[1] : availablePosition) + 1}_${
    file.originalFilename
  }`;

  const saveFileName = fileName ? fileName : normalFileName;

  if (server) {
    await saveTempUploadFile(file, server, saveFileName);
  } else {
    try {
      fs.readdirSync(saveDirectory);
    } catch (error) {
      fs.mkdirSync(saveDirectory);
    }

    fs.writeFileSync(`${saveDirectory}/${saveFileName}`, data);
    fs.unlinkSync(file.filepath);
  }
  return;
}

export async function saveTempUploadFile(file, server, fileName) {
  const data = fs.readFileSync(file.filepath);
  const saveDirectory = path.join(tempPath, 'storage', server);

  try {
    fs.readdirSync(saveDirectory);
  } catch (error) {
    fs.mkdirSync(saveDirectory, { recursive: true });
  }

  fs.writeFileSync(`${saveDirectory}/${fileName}`, data);
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

export async function saveDeleteLogFile(server, fileName) {
  const deleteLogFolderPath = path.join(tempPath, 'delete');

  if (!fs.existsSync(deleteLogFolderPath)) {
    fs.mkdirSync(deleteLogFolderPath, { recursive: true });
  }

  const filePath = path.join(deleteLogFolderPath, `${server}.json`);
  try {
    const data = JSON.parse(fs.readFileSync(filePath));
    data.push(fileName);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), (err) => {
      console.log(err);
    });
  } catch (error) {
    const data = [fileName];
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), (err) => {
      console.log(err);
    });
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
}

export async function getDeleteFilesOfServer(server) {
  const temporaryDeleteLogPath = path.join(tempPath, 'delete', `${server}.json`);

  try {
    const data = JSON.parse(fs.readFileSync(temporaryDeleteLogPath));
    return data;
  } catch (error) {
    return null;
  }
}

export async function fetchDeleteFilesToServer(server) {
  const deleteFiles = await getDeleteFilesOfServer(server);

  await Promise.all(
    deleteFiles.map(async (fileName) => {
      await axios
        .delete(`http://${server}/api/delete`, {
          data: {
            fileName,
          },
        })
        .then((response) => {
          console.log(response);
        })
        .catch(async (error) => {
          await saveDeleteLogFile(server, fileName);
        });
    }),
  );

  fs.rmSync(temporaryDeleteLogPath, { recursive: true, force: true });
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

  listFilesOnServers.sort((a, b) => compareFileNames(a.fileName, b.fileName));

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
