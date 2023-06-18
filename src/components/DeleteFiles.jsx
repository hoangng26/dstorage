import { DeleteOutlined } from '@ant-design/icons';
import { Button } from 'antd';

function DeleteFiles({ listFiles }) {
  const handleDeleteEvents = () => {
    console.log(listFiles);
  };

  return (
    <>
      <Button type="primary" size="large" danger onClick={handleDeleteEvents} icon={<DeleteOutlined />}>
        Delete All
      </Button>
    </>
  );
}

export default DeleteFiles;
