import { DeleteOutlined, DownloadOutlined } from '@ant-design/icons';
import { Button, Dropdown, Popconfirm, notification } from 'antd';
import { useState } from 'react';
import FileIcon from './FileIcon';

export default function File({ server, fileName, onDelete, downloadLink }) {
  const [selection, setSelection] = useState(false);
  const [openDeletePopup, setOpenDeletePopup] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleClickEvent = (e) => {
    e.preventDefault();
    setSelection(!selection);
  };

  const handleDeleteEvent = async (e) => {
    setDeleteLoading(true);
    await onDelete(server, fileName);
    setOpenDeletePopup(false);
    setDeleteLoading(false);
    notification.open({
      message: 'Delete file',
      icon: <DeleteOutlined className="text-red-500" />,
      description: `"${fileName}" was successfully deleted.`,
      duration: 3,
    });
  };

  const handleDownloadEvent = (e) => {
    window.open(downloadLink, '_blank', 'noopener noreferrer');
  };

  const ActionMenuItems = [
    {
      key: 'action-download',
      icon: <DownloadOutlined />,
      label: 'Download',
      className: 'text-green-500 hover:bg-green-100',
      onClick: handleDownloadEvent,
    },
    {
      key: 'action-delete',
      icon: <DeleteOutlined />,
      label: (
        <Popconfirm
          title="Delete file"
          icon={<DeleteOutlined className="text-red-500" />}
          description={`Are you sure you want to delete "${fileName}"?`}
          open={openDeletePopup}
          okButtonProps={{
            loading: deleteLoading,
            icon: <DeleteOutlined />,
          }}
          onConfirm={handleDeleteEvent}
          onCancel={(e) => {
            setOpenDeletePopup(false);
            e.stopPropagation();
          }}
        >
          <span>Delete</span>
        </Popconfirm>
      ),
      danger: true,
      onClick: () => {
        setOpenDeletePopup(true);
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
      >
        <span className="overflow-hidden text-ellipsis w-full text-left">{fileName}</span>
      </Button>
    </Dropdown>
  );
}
