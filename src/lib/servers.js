import axios from 'axios';
import fs from 'fs';
import path from 'path';

const serversPath = path.join(process.cwd(), 'static/servers.json');

export function getAllServers() {
  const servers = JSON.parse(fs.readFileSync(serversPath));
  return servers;
}

export function getActiveServer() {
  const servers = getAllServers().filter((server) => server.active);
  return servers;
}

export async function updateActiveServer() {
  console.log('Updating active server...');
  const servers = await Promise.all(
    getAllServers().map(async (server) => {
      try {
        const response = await axios.post(`http://${server.address}/api`, {
          ipAddress: process.env.IP_ADDRESS,
        });
        return {
          ...server,
          active: response.status === 200,
        };
      } catch (error) {
        return {
          ...server,
          active: false,
        };
      }
    }),
  );
  fs.writeFileSync(serversPath, JSON.stringify(servers, null, 2), (error) => {
    if (error) return console.log(error);
  });
}

export async function checkNewServer(serverAddress) {
  const listServers = getAllServers();
  if (listServers.find((server) => server.address === serverAddress)) {
    return false;
  }
  addNewServer(serverAddress);
  return true;
}

export async function addNewServer(serverAddress) {
  try {
    const response = await axios.post(`http://${serverAddress}/api`, {
      ipAddress: process.env.IP_ADDRESS,
    });

    if (response.status !== 200) {
      return;
    }

    const listServers = getAllServers();
    listServers.push({
      address: serverAddress,
      active: false,
    });

    fs.writeFileSync(serversPath, JSON.stringify(listServers, null, 2), (error) => {
      if (error) return console.log(error);
    });

    return listServers;
  } catch (error) {
    return;
  }
}

export async function getNewBlankForUpload() {
  const dataPath = path.join(process.cwd(), 'static/available.json');
  let result = true;

  try {
    const availableServers = JSON.parse(fs.readFileSync(dataPath));
    result = availableServers.shift();
    fs.writeFileSync(dataPath, JSON.stringify(availableServers, null, 2), (error) => {
      console.log(error);
      result = false;
    });
  } catch (error) {
    return null;
  }

  return result;
}

export async function addNewBlankForUpload(servers) {
  const dataPath = path.join(process.cwd(), 'static/available.json');
  let result = true;

  try {
    const availableServers = JSON.parse(fs.readFileSync(dataPath));
    availableServers.push(servers);
    fs.writeFileSync(dataPath, JSON.stringify(availableServers, null, 2), (error) => {
      console.log(error);
      result = false;
    });
  } catch (error) {
    fs.writeFileSync(dataPath, JSON.stringify([servers], null, 2), (error) => {
      console.log(error);
      result = false;
    });
  }

  return result;
}
