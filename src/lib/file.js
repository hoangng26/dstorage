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
      .then((response) => { })
      .catch((error) => {
        console.log(error);
      });

    fs.unlinkSync(filePath);
  });

  fs.rmSync(temporaryFolderPath, { recursive: true, force: true });

  await getFilesOnServer(server);
}

const ECBC_N = 42;
const ECBC_n = 19;
const ECBC_m = 6;
const ECBC_k = 13;
const ECBC_r = 1;
const ECBC_t = 3;
const ECBC_table = createECBCTable();

// Create and return the ECBC table with above variables
// input: only those ECBC_variables above
// output: return the ECBC_table in format list[list]
//   table[a][b] = 1 => file a saved in server b
//   table[a][b] = 0 => file a not saved in server b
//   0 <= a < ECBC_n, 0 <= b < ECBC_m
// Usage: getECBCTableFS(), getECBCTableSF()
export function createECBCTable() {
  let table = [];
  const tm = ECBC_m * ECBC_t;

  for (let i = 0; i < ECBC_m - ECBC_r; i++) {
    let row = [];
    for (let j = 0; j < ECBC_n; j++) {
      if (j >= tm || (j >= i * t && j < t * (i + ECBC_r + 1)))
        row.push(1);
      else
        row.push(0);
    }
    table.push(row);
  }

  for (let i = ECBC_m - ECBC_r; i < ECBC_m; i++) {
    let row = [];
    for (let j = 0; j < ECBC_n; j++) {
      if (j >= t * i || j < t * (i + ECBC_r + 1 - ECBC_m))
        row.push(1);
      else
        row.push(0);
    }
    table.push(row);
  }

  return table;
}

// input: none
// output: return the ECBC_table in format list[list]
//   tableFS[a] = [servers that save file a]
//   0 <= a < ECBC_n
// TODO: get the ECBC table, hash(filename, heading, content...) mod ECBC_n = x => file(x) saved to servers which table[x] = 1
export function getECBCTableFS() {
  let table_fs = [];

  for (let i = 0; i < ECBC_table.length; i++) {
    let row = ECBC_table[i].map((item, index) => item === 1 ? index : undefined).filter(item => item !== undefined);
    if (ECBC_table[i][n] == 1)
      table_fs.push(row);
  }

  return table_fs;
}

// input: none
// output: return the ECBC_table in format list[list]
//   tableSF[b] = [files that saved on server b]
//   0 <= b < ECBC_m
// TODO: get the ECBC table, hash(filename, heading, content...) mod ECBC_n = x => file(x) saved to servers which table[x] = 1
export function getECBCTableSF() {
  let table_sf = [];

  const tmp_table = ECBC_table[0].map((_, colIndex) => ECBC_table.map(row => row[colIndex]));

  for (let i = 0; i < tmp_table.length; i++) {
    let row = tmp_table[i].map((item, index) => item === 1 ? index : undefined).filter(item => item !== undefined);
    if (tmp_table[i][n] == 1)
      table_sf.push(row);
  }

  return table_sf;
}

// HopCroft - Karp Algorithm: return the list of files got from servers
// input: list of files to get
// output list of servers from which to get input files, in format list[] respectively to the list of files
//  server[i] is the server to get file[i]
// Usage: get the
export function getFilesFromServers_HopCroft_Karp(files) {
  const originalServers = getServerFileList(files);
  const slen = originalServers.length;
  const copy_servers = copyServers(files);

  for (let i = 0; i < slen; i++) {
    servers.push([]);
  }

  // get list of files
  let listoffiles = [...new Set([].concat(...A))];

  // do the dfs bfs hopcroft karp thiny...
  // we get the list of server-file matching
  const g = new BipGraph(copy_servers.length, listoffiles.length);
  g.addEdgeList(copy_servers);
  let servers = g.hopcroftKarp();
  // console.log(`Size of maximum matching is ${g.hopcroftKarp()[0]}`);
  // console.log(`Matches: ${g.hopcroftKarp()[1]}`);
  // console.log(`Matches: ${g.hopcroftKarp()}`);


  for (let i = 0; i < copy_servers.length; i++) {
    if (copy_servers[i].length > 0) {
      servers[i % slen].push(A[i][0]);
    }
  }

  return servers;
}

// input: list of files
// output: list of list show what server saved what files
//  server[a] = [list of files that saved on server a]
export function getServerFileList(files) {
  const table_sf = getECBCTableSF();
  return table_sf.map(list => list.filter(element => files.includes(element)));
}

// input: list of files (mod ECBC_n)
// output: number of copies
export function findNumberOfCopy(serverfilelist) {
  return Math.max(...serverfilelist.map(list => list.length));
}

// input: list of files
// output: list of servers after copy
export function copyServers(files) {
  const originalServers = getServerFileList(files);
  const count = findNumberOfCopy(originalServers);
  return Array[count].fill(...originalServers);
}

const INF = 2147483647;
const NIL = -100;
class BipGraph {
  constructor(m, n) {
    this.__m = m;
    this.__n = n;
    this.__adj = [...Array(m)].map(() => []);
  }

  addEdge(u, v) {
    this.__adj[u].push(v); // Add u to v’s list.
  }

  addEdgeList(fslist) {
    for (let i = 0; i < fslist.length; i++) {
      for (let j = 0; j < fslist[i].length; j++)
        this.addEdge(i, fslist[i]);
    }
  }

  bfs() {
    const Q = [];
    for (let u = 0; u < this.__m; u++) {
      if (this.__pairU[u] === NIL) {
        this.__dist[u] = 0;
        Q.push(u);
      } else {
        this.__dist[u] = INF;
      }
    }
    this.__dist[NIL] = INF;
    while (Q.length > 0) {
      const u = Q.shift();
      if (this.__dist[u] < this.__dist[NIL]) {
        for (const v of this.__adj[u]) {
          if (this.__dist[this.__pairV[v]] === INF) {
            this.__dist[this.__pairV[v]] = this.__dist[u] + 1;
            Q.push(this.__pairV[v]);
          }
        }
      }
    }
    return this.__dist[NIL] !== INF;
  }

  dfs(u) {
    if (u !== NIL) {
      for (const v of this.__adj[u]) {
        if (this.__dist[this.__pairV[v]] === this.__dist[u] + 1) {
          if (this.dfs(this.__pairV[v])) {
            this.__pairV[v] = u;
            this.__pairU[u] = v;
            return true;
          }
        }
      }
      this.__dist[u] = INF;
      return false;
    }
    return true;
  }

  hopcroftKarp() {
    this.__pairU = Array(this.__m).fill(NIL);
    this.__pairV = Array(this.__n).fill(NIL);
    this.__dist = Array(this.__m).fill(NIL);
    let count = 0;
    let tmp = [];
    while (this.bfs()) {
      for (let u = 0; u < this.__m; u++) {
        if (this.__pairU[u] === NIL)
          if (this.dfs(u)) {
            count++;
            if (count === this.__n) {
              for (let i = 0; i < count; i++)
                tmp.push([i, this.__pairU[i]]);
            }
          }
      }
    }
    // return [count, tmp];
    return tmp;
  }
}