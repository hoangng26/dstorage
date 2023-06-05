import { CloudServerOutlined } from '@ant-design/icons';
import { Menu } from 'antd';

export default function ListServers({ activeServers, selectedServer, onSelectServer }) {
  return (
    <Menu
      mode="inline"
      defaultSelectedKeys={[selectedServer]}
      defaultOpenKeys={[selectedServer]}
      className="h-full"
      onSelect={onSelectServer}
      items={activeServers.map((server, index) => {
        return {
          key: server,
          icon: <CloudServerOutlined />,
          label: `Server ${index + 1}`,
        };
      })}
    />
  );
}
