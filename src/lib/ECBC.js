const ECBC_N = 60;
const ECBC_n = 19;
const ECBC_nfiles = 30;
const ECBC_count = Math.ceil(ECBC_nfiles / ECBC_n);
const ECBC_m = 6;
const ECBC_k = 10;
const ECBC_r = 2;
const ECBC_t = 3;
const ECBC_table_origin = createECBCTable();

const list_of_files = [0, 1, 2, 3, 26];
const list_of_servers = [0, 1];
const ECBC_table = handleInactiveServers(list_of_servers);

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

  let rs = table.slice();
  for (let i = 1; i < ECBC_count; i++) {
    for (let j = 0; j < rs.length; j++) {
      rs[j] = rs[j].concat(table[j]);
    }
  }

  return rs;
}

// input: none
// output: return the ECBC_table in format list[list]
//   tableSF[b] = [files that saved on server b]
//   0 <= b < ECBC_m
// TODO: get the ECBC table, hash(filename, heading, content...) mod ECBC_n = x => file(x) saved to servers which table[x] = 1
export function getECBCTableSF() {
  let table_sf = [];

  for (let i = 0; i < ECBC_table.length; i++) {
    let row = ECBC_table[i].map((item, index) => (item === 1 ? index : undefined)).filter((item) => item !== undefined);
    table_sf.push(row);
  }

  return table_sf;
}

// input: none
// output: return the ECBC_table in format list[list]
//   tableFS[a] = [servers that save file a]
//   0 <= a < ECBC_n
// TODO: get the ECBC table, hash(filename, heading, content...) mod ECBC_n = x => file(x) saved to servers which table[x] = 1
export function getECBCTableFS() {
  let table_fs = [];

  const tmp_table = ECBC_table[0].map((_, colIndex) => ECBC_table.map((row) => row[colIndex]));

  for (let i = 0; i < tmp_table.length; i++) {
    let row = tmp_table[i].map((item, index) => (item === 1 ? index : undefined)).filter((item) => item !== undefined);
    table_fs.push(row);
  }

  return table_fs;
}

// input: list of inactive servers
// output: ECBC_table after remove the inactive servers
// Usage: before upload/download files
export function handleInactiveServers(servers) {
  if (!Array.isArray(servers)) throw Error('handleInactiveServers(): invalid parameter');

  let result_table = ECBC_table_origin.slice();
  for (let index of servers)
    result_table[index].fill(0);

  return result_table;
}

// HopCroft - Karp Algorithm: return the list of files got from servers
// input: list of files to get
// output list of servers from which to get input files, in format list[] respectively to the list of files
//  server[i] is the server to get file[i]
// Usage: get the
export function getFilesFromServers_HopCroft_Karp(files) {
  const slen = ECBC_m;
  const copy_servers = copyServers(files);
  // console.log(`Copy_servers:`, copy_servers);

  let servers = [];

  for (let i = 0; i < slen; i++) {
    servers.push([]);
  }

  // do the dfs bfs hopcroft karp thiny...
  // we get the list of server-file matching
  const g = new BipGraph(copy_servers.length, files.length);
  g.addEdgeList(copy_servers);
  let matchSF = g.hopcroftKarp();
  // console.log(`Matches:`, matchSF);


  for (let i = 0; i < copy_servers.length; i++) {
    if (matchSF[i][1] > NIL) {
      servers[i % slen].push(matchSF[i][1]);
    }
  }

  return servers;
}

// input: list of files
// output: list of list show what server saved what files
//  server[a] = [list of files that saved on server a]
export function getServerFileList(files) {
  const table_sf = getECBCTableSF();
  return table_sf.map((list) => list.filter((element) => files.includes(element)));
}

// input: list of files (mod ECBC_n)
// output: number of copies
export function findNumberOfCopy(serverfilelist) {
  return ECBC_t;
  // return Math.max(...serverfilelist.map((list) => list.length));
}

// input: list of files
// output: list of servers after copy
export function copyServers(files) {
  const originalServers = getServerFileList(files);
  const count = findNumberOfCopy(originalServers);
  let rs = originalServers;
  for (let i = 1; i < count; i++) rs = rs.concat(originalServers);

  return rs;
}

const INF = 2147483647;
const NIL = -100;
class BipGraph {
  constructor(m, n) {
    this.__m = m;
    this.__n = n;
    this.__adj = [...Array(m)].map(() => []);
    this.__match = new Map();
    this.countN = 0;
  }

  addEdge(u, v) {
    if (this.__match.has(v) === false)
      this.__match.set(v, this.countN++);
    this.__adj[u].push(this.__match.get(v)); // Add u to v’s list.
  }

  addEdgeList(fslist) {
    for (let i = 0; i < fslist.length; i++) {
      for (const item of fslist[i]) this.addEdge(i, item);
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

  fromAdjToMatch(adj) {
    // let match = adj.slice();
    const deMatch = new Map();

    for (let [key, value] of this.__match) {
      deMatch.set(value, key);
    }

    for (const item of adj) {
      if (deMatch.has(item[1])) {
        item[1] = deMatch.get(item[1]);
      }
    }

    return adj;
  }

  hopcroftKarp() {
    this.__pairU = Array(this.__m).fill(NIL);
    this.__pairV = Array(this.__n).fill(NIL);
    this.__dist = Array(this.__m).fill(NIL);
    let count = 0;
    let adj = [];
    while (this.bfs()) {
      for (let u = 0; u < this.__m; u++) {
        if (this.__pairU[u] === NIL && this.dfs(u)) {
          count++;
          // if (count === this.__n) {
          //   for (let i = 0; i < this.__m; i++) {
          //     console.log([i, this.__pairU[i]]);
          //     adj.push([i, this.__pairU[i]]);
          //   }
          // }
        }
      }
    }

    for (let i = 0; i < this.__m; i++) {
      //   console.log([i, this.__pairU[i]]);
      adj.push([i, this.__pairU[i]]);
    }

    // console.log(adj);

    return this.fromAdjToMatch(adj);;
  }
}

console.log(getFilesFromServers_HopCroft_Karp(list_of_files));