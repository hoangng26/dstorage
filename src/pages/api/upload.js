import fs from 'fs/promises';
import path from 'path';
import { readFile } from '../lib/file';

const storagePath = path.join(process.cwd(), 'storage');

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  try {
    await fs.readdir(storagePath);
  } catch (error) {
    await fs.mkdir(storagePath);
  }

  await readFile(req);
  res.json({ done: 'Ok' });
}
