import { DeleteOutlined, DownloadOutlined } from '@ant-design/icons';
import { Button, Dropdown, Modal, notification } from 'antd';
import FileIcon from './FileIcon';

export default function File({ server, fileName, onDelete, downloadLink, selectedFiles, onUpdateSelectedFiles }) {
  const handleClickEvent = (e) => {
    e.preventDefault();
    onUpdateSelectedFiles(fileName, server, selectedFiles.findIndex((file) => file.fileName === fileName) >= 0);
  };

  const handleOpenDeleteModal = () => {
    Modal.confirm({
      title: 'Delete Files',
      icon: <DeleteOutlined className="text-red-500" />,
      content: (
        <span>
          Are you sure you want to delete{' '}
          <a className="text-blue-500" href={downloadLink} target="_blank" rel="noopener noreferrer">
            {fileName}
          </a>
          ?
        </span>
      ),
      onOk: handleDeleteEvent,
      okButtonProps: {
        icon: <DeleteOutlined />,
        danger: true,
      },
    });
  };

  const handleDeleteEvent = async (e) => {
    await onDelete(server, fileName);
    onUpdateSelectedFiles(fileName, server, true, false);

    notification.open({
      message: 'Delete file',
      icon: <DeleteOutlined className="text-red-500" />,
      description: `"${fileName}" was successfully deleted.`,
      duration: 3,
    });
  };

  const handleDownloadEvent = (e) => {
    window.open(downloadLink, '_parent', 'noopener noreferrer');
  };

  const ActionMenuItems = [
    {
      key: 'action-download',
      icon: <DownloadOutlined />,
      label: 'Download',
      className: 'text-green-500 hover:bg-green-100 px-6 py-3',
      onClick: handleDownloadEvent,
    },
    {
      key: 'action-delete',
      icon: <DeleteOutlined />,
      label: 'Delete',
      danger: true,
      className: 'px-6 py-3',
      onClick: handleOpenDeleteModal,
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
        target="_parent"
        key={fileName}
        onClick={handleClickEvent}
        className={`flex justify-between gap-4 items-center rounded-xl w-96 px-4 py-10 ${
          selectedFiles.findIndex((file) => file.fileName === fileName) >= 0 && 'border-blue-400 text-blue-400'
        }`}
        icon={<FileIcon extension={fileName.split('.').pop()} />}
      >
        <span className="overflow-hidden text-ellipsis w-full text-left">{fileName}</span>
        {/* <span className="overflow-hidden text-ellipsis w-full text-left">{shortenName(fileName)}</span> */}
      </Button>
    </Dropdown>
  );
}
