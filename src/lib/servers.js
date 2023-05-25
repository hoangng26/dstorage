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
        const response = await axios.get(`http://${server.address}/api`);
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
