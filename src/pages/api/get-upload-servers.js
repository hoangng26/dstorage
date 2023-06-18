import { createECBCTable, getECBCParameters, getListFilesFromAllServers } from '@/lib/file';
import { addNewBlankForUpload, getNewBlankForUpload } from '@/lib/servers';
import NextCors from 'nextjs-cors';

export default async function handler(req, res, next) {
  await NextCors(req, res, {
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    origin: '*',
    optionsSuccessStatus: 200,
  });

  if (req.method === 'GET') {
    const availableServers = await getNewBlankForUpload();
    if (availableServers) {
      res.status(200).json(availableServers);
      return;
    }

    const ECBC_table = await createECBCTable();
    const { ECBC_m: m, ECBC_n: n, ECBC_t: t } = await getECBCParameters();
    const table = ECBC_table.map((item) => item[n % (m + t)]);
    const { listServersSaveFiles } = await getListFilesFromAllServers();
    const listServers = Object.keys(listServersSaveFiles);
    const chosenServers = table.map((item, index) => item && listServers[index]);

    res.status(200).json(chosenServers.filter((server) => Boolean(server)));
  } else if (req.method === 'POST') {
    const servers = req.body.servers;
    if (!servers || !servers.length) {
      res.status(400).json({
        message: 'Method not allowed.',
      });
      return;
    }
    await addNewBlankForUpload(servers);
    res.status(200).json({
      message: 'Successfully',
    });
  } else {
    res.status(404).json({
      message: 'Method not allowed.',
    });
  }
}
