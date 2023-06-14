import { Button } from 'antd';
import FileIcon from './FileIcon';

export default function File({ server, fileName, onDelete, downloadLink }) {
  return (
    <Button
      href={downloadLink}
      target="_blank"
      key={fileName}
      className="flex justify-between gap-4 items-center rounded-xl w-96 px-4 py-10"
      icon={<FileIcon extension={fileName.split('.').pop()} />}
      onContextMenu={(e) => console.log('Right click')}
    >
      <span className="overflow-hidden text-ellipsis w-full text-left">{fileName}</span>
      <Button
        onClick={(e) => {
          e.preventDefault();
          onDelete(server, fileName);
        }}
        danger
      >
        Delete
      </Button>
    </Button>
  );
}
