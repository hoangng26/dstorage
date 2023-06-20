import axios from 'axios';
import fs from 'fs';
import path from 'path';

const serversPath = path.join(process.cwd(), 'static/servers.json');

export function getAllServers() {
  const servers = JSON.parse(fs.readFileSync(serversPath));
  return servers;
}

export async function getActiveServer() {
  await updateActiveServer();
  const servers = getAllServers().filter((server) => server.active);
  return servers;
}

export async function updateActiveServer() {
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
  if (!serverAddress) {
    return false;
  }

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
