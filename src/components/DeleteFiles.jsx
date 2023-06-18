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
      listFiles.map(async ({ fileName, servers }) => {
        for (const server of servers) {
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
      }),
    );
    onUpdateSelectedFiles('', '', true, true);
    onUpdateListFiles();

    notification.open({
      message: 'Delete Files',
      icon: <DeleteOutlined className="text-red-500" />,
      description: `${listFiles.length} files was successfully deleted.`,
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
