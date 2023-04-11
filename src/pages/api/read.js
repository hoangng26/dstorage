import { readAllFilenames } from '../lib/file';

export default async function handler(req, res, next) {
  const fileNames = await readAllFilenames();
  res.status(200).json(fileNames);
}
