import { createBrowserRouter, Navigate } from 'react-router-dom';
import AppLayout from '@/components/Layout';
import AuthGuard from '@/components/AuthGuard';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import ChannelList from '@/pages/Channel';
import ChannelDetail from '@/pages/Channel/Detail';
import MyChannel from '@/pages/Channel/MyChannel';
import AccountList from '@/pages/Account';
import OrderList from '@/pages/Order';
import TransactionList from '@/pages/Transaction';
import SettingsLayout from '@/pages/Settings';
import PermissionGroup from '@/pages/Settings/PermissionGroup';
import PermissionItem from '@/pages/Settings/PermissionItem';
import ReportTemplate from '@/pages/Settings/ReportTemplate';
import ReportContent from '@/pages/Settings/ReportContent';
import NotificationConfig from '@/pages/Settings/NotificationConfig';
import RoleManagement from '@/pages/Settings/RoleManagement';
import MenuManagement from '@/pages/Settings/MenuManagement';
import UserCenter from '@/pages/UserCenter';
import Profile from '@/pages/UserCenter/Profile';
import DictManagement from '@/pages/Settings/DictManagement';
import AdminAccount from '@/pages/UserCenter/AdminAccount';

const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  {
    path: '/',
    element: (
      <AuthGuard>
        <AppLayout />
      </AuthGuard>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'channel', element: <AuthGuard roles={['admin']}><ChannelList /></AuthGuard> },
      { path: 'channel/:id', element: <AuthGuard roles={['admin']}><ChannelDetail /></AuthGuard> },
      { path: 'channel/my', element: <AuthGuard roles={['channel']}><MyChannel /></AuthGuard> },
      { path: 'account', element: <AuthGuard roles={['admin']}><AccountList /></AuthGuard> },
      { path: 'order', element: <OrderList /> },
      { path: 'transaction', element: <TransactionList /> },
      {
        path: 'settings',
        element: <AuthGuard roles={['admin']}><SettingsLayout /></AuthGuard>,
        children: [
          { index: true, element: <Navigate to="permission-group" replace /> },
          { path: 'permission-group', element: <PermissionGroup /> },
          { path: 'permission-item', element: <PermissionItem /> },
          { path: 'role', element: <RoleManagement /> },
          { path: 'menu', element: <MenuManagement /> },
          { path: 'admin-account', element: <AuthGuard roles={['admin']}><AdminAccount /></AuthGuard> },
          { path: 'dict', element: <DictManagement /> },
          { path: 'report-template', element: <ReportTemplate /> },
          { path: 'report-content', element: <ReportContent /> },
          { path: 'notification', element: <NotificationConfig /> },
        ],
      },
      {
        path: 'user-center',
        element: <UserCenter />,
        children: [
          { index: true, element: <Navigate to="profile" replace /> },
          { path: 'profile', element: <Profile /> },
        ],
      },
    ],
  },
]);

export default router;
