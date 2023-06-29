import { DeleteOutlined } from '@ant-design/icons';
import { Button, Modal, notification } from 'antd';
import axios from 'axios';

function DeleteFiles({ listFiles, onUpdateListFiles, onUpdateSelectedFiles }) {
  const handleOpenDeleteModal = () => {
    Modal.confirm({
      title: 'Delete Files',
      icon: <DeleteOutlined className="text-red-500" />,
      content: `Are you sure you want to delete ${listFiles.length} files?`,
      onOk: handleDeleteEvent,
      okButtonProps: {
        icon: <DeleteOutlined />,
        danger: true,
      },
    });
  };

  const handleDeleteEvent = async () => {
    await Promise.all(
      listFiles.map(async ({ fileName }) => {
        await axios
          .delete(`/api/delete-file`, {
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
      }),
    );
    onUpdateSelectedFiles('', '', true, true);
    await onUpdateListFiles();

    notification.open({
      message: 'Delete Files',
      icon: <DeleteOutlined className="text-red-500" />,
      description: (
        <span>
          <span className="text-blue-500">{listFiles.length} files</span> was successfully deleted.
        </span>
      ),
      duration: 3,
    });
  };

  return (
    <>
      <Button type="primary" size="large" danger onClick={handleOpenDeleteModal} icon={<DeleteOutlined />}>
        Delete All
      </Button>
    </>
  );
}

export default DeleteFiles;
