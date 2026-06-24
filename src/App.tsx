import { RouterProvider } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import router from '@/router';

export default function App() {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#2980b9',
          borderRadius: 2,
          fontSize: 14,
        },
      }}
    >
      <RouterProvider router={router} />
    </ConfigProvider>
  );
}
