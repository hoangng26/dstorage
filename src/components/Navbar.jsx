import { AntCloudOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Input } from 'antd';
import Link from 'next/link';

export default function Navbar() {
  return (
    <>
      <Link href="/">
        <h1 className="font-bold text-2xl text-slate-50">
          <span>
            <AntCloudOutlined />
          </span>{' '}
          Distributed Storage
        </h1>
      </Link>
      <Input.Search className="w-96 flex justify-center" placeholder="Search" size="large" />
      <Avatar size="large" icon={<UserOutlined />} />
    </>
  );
}
