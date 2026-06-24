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
          colorPrimary: mode === 'dark' ? '#3498db' : '#2980b9',
          borderRadius: 2,
          fontSize: 14,
          ...(mode === 'dark' ? {
            colorBgContainer: '#1b2838',
            colorBgElevated: '#1e2d3d',
            colorBgLayout: '#0f1923',
            colorBorder: '#2a3f55',
            colorBorderSecondary: '#233040',
            colorText: '#dce4ec',
            colorTextSecondary: '#8899aa',
          } : {}),
        },
      }}
    >
      <RouterProvider router={router} />
    </ConfigProvider>
  );
}
