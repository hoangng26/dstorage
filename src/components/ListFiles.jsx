import { shortenName } from '@/lib/file';
import axios from 'axios';
import File from './File';

export default function ListFiles({ server, listFiles, onUpdateListFiles, selectedFiles, onUpdateSelectedFiles }) {
  const handleDeleleEvent = async (servers, fileName) => {
    await axios
      .delete(`http://${servers[0]}/api/delete`, {
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
    await onUpdateListFiles();
  };

  return (
    <div className="w-full my-8 flex gap-8 flex-wrap">
      {listFiles
        .sort((a, b) => {
          const oFa = shortenName(a);
          const oFb = shortenName(b);
          return oFa.localeCompare(oFb);
        })
        .map((fileName) => (
          <File
            key={fileName}
            server={server}
            fileName={fileName}
            onDelete={handleDeleleEvent}
            downloadLink={`http://${server[0]}/api/download/${fileName}`}
            selectedFiles={selectedFiles}
            onUpdateSelectedFiles={onUpdateSelectedFiles}
          />
        ))}
    </div>
  );
}
