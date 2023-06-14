import axios from 'axios';
import File from './File';

export default function ListFiles({ server, listFiles, onUpdateListFiles }) {
  const handleDeleleEvent = (ipAddress, fileName) => {
    axios
      .delete(`http://${ipAddress}/api/delete`, {
        data: {
          fileName,
        },
      })
      .then((response) => {
        console.log(response.data);
        onUpdateListFiles();
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <div className="w-full my-8 flex gap-8 flex-wrap">
      {listFiles.map((fileName) => (
        <File
          server={server}
          fileName={fileName}
          onDelete={handleDeleleEvent}
          key={fileName}
          downloadLink={`http://${server}/api/download/${fileName}`}
        />
      ))}
    </div>
  );
}
