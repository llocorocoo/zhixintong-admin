import { RouterProvider } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import router from '@/router';
import { useTheme } from '@/store/useTheme';

export default function App() {
  const { mode } = useTheme();

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: mode === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
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
