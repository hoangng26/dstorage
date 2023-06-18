import { DeleteOutlined, DownloadOutlined } from '@ant-design/icons';
import { Button, Dropdown } from 'antd';
import { useState } from 'react';
import FileIcon from './FileIcon';

export default function File({ server, fileName, onDelete, downloadLink }) {
  const [selection, setSelection] = useState(false);

  const handleClickEvent = (e) => {
    e.preventDefault();
    setSelection(!selection);
  };

  const ActionMenuItems = [
    {
      key: 'action-download',
      icon: <DownloadOutlined />,
      label: 'Download',
      className: 'text-green-500 hover:bg-green-100',
      onClick: () => {
        window.open(downloadLink, '_blank', 'noopener noreferrer');
      },
    },
    {
      key: 'action-delete',
      icon: <DeleteOutlined />,
      label: 'Delete',
      danger: true,
      onClick: async () => {
        await onDelete(server, fileName);
      },
    },
  ];

  return (
    <Dropdown
      menu={{
        items: ActionMenuItems,
      }}
      trigger={['contextMenu']}
    >
      <Button
        href={downloadLink}
        target="_blank"
        key={fileName}
        onClick={handleClickEvent}
        className={`flex justify-between gap-4 items-center rounded-xl w-96 px-4 py-10 ${
          selection && 'border-blue-400 text-blue-400'
        }`}
        icon={<FileIcon extension={fileName.split('.').pop()} />}
        onContextMenu={(e) => console.log('Right click')}
      >
        <span className="overflow-hidden text-ellipsis w-full text-left">{fileName}</span>
      </Button>
    </Dropdown>
  );
}
