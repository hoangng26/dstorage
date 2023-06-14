import { AppstoreOutlined, CloudServerOutlined } from '@ant-design/icons';
import { Menu } from 'antd';
import { useState } from 'react';

export default function ListServers({ servers, onSelectServer }) {
  const [openKeys, setOpenKeys] = useState(['each-server']);

  function getItem(label, key, icon, children, type) {
    return {
      key,
      icon,
      children,
      label,
      type,
    };
  }

  return (
    <Menu
      mode="inline"
      defaultSelectedKeys={['']}
      defaultOpenKeys={openKeys}
      className="h-full"
      openKeys={openKeys}
      onOpenChange={(keys) => setOpenKeys(keys)}
      onSelect={onSelectServer}
      items={[
        getItem('All servers', '', <CloudServerOutlined />),
        getItem(
          'Each server',
          'each-server',
          <AppstoreOutlined />,
          servers.map((server, index) => {
            return {
              key: server,
              icon: <CloudServerOutlined />,
              label: `Server ${index + 1}`,
            };
          }),
        ),
      ]}
    />
  );
}
