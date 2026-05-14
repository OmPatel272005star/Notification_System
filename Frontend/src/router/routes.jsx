import { Navigate } from 'react-router-dom';

// Auth Pages
import LoginPage from '../pages/auth/LoginPage';
import SignupPage from '../pages/auth/SignupPage';

// Dashboard Pages
import HomePage from '../pages/dashboard/HomePage';
import AudiencePage from '../pages/dashboard/AudiencePage';
import TemplatePage from '../pages/dashboard/TemplatePage';
import CampaignPage from '../pages/dashboard/CampaignPage';
import ConnectionPage from '../pages/dashboard/ConnectionPage';
import UsersPage from '../pages/dashboard/UsersPage';

// Layout
import MainLayout from '../components/layout/MainLayout';

export const routes = [
  {
    path: '/',
    element: <Navigate to="/home" replace />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/signup',
    element: <SignupPage />,
  },
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        path: 'home',
        element: <HomePage />,
      },
      {
        path: 'audience',
        element: <AudiencePage />,
      },
      {
        path: 'templates',
        element: <TemplatePage />,
      },
      {
        path: 'campaigns',
        element: <CampaignPage />,
      },
      {
        path: 'connections',
        element: <ConnectionPage />,
      },
      {
        path: 'users',
        element: <UsersPage />,
      },
    ],
  },
];
