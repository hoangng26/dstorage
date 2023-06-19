import { shortenName } from '@/lib/file';
import axios from 'axios';
import File from './File';

export default function ListAllFiles({
  listFiles,
  activeServers,
  selectedFiles,
  onUpdateListFiles,
  onUpdateSelectedFiles,
}) {
  const handleDeleteEvent = async (listServers, fileName) => {
    for (const server of listServers) {
      await axios
        .delete(`http://${server}/api/delete`, {
          data: {
            fileName,
          },
        })
        .then((response) => {
          console.log(response.data);
        })
        .catch((error) => {
          console.error(error);
        });
    }
    onUpdateListFiles();
  };

  function getDownloadLink(fileName, listServers) {
    for (let server of listServers) {
      if (activeServers.find((item) => item === server)) {
        return `http://${server}/api/download/${fileName}`;
      }
    }
  }

  return (
    <div className="w-full my-8 flex gap-8 flex-wrap">
      {listFiles
        .sort((a, b) => {
          const oFa = shortenName(a.fileName);
          const oFb = shortenName(b.fileName);
          return oFa.localeCompare(oFb);
        })
        .map((file) => (
          <File
            key={file.fileName}
            fileName={file.fileName}
            server={file.servers}
            onDelete={handleDeleteEvent}
            downloadLink={getDownloadLink(file.fileName, file.servers)}
            selectedFiles={selectedFiles}
            onUpdateSelectedFiles={onUpdateSelectedFiles}
          />
        ))}
    </div>
  );
}
