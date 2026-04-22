import { createHashRouter } from 'react-router';
import HomePage from './pages/HomePage';
import CatDetailPage from './pages/CatDetailPage';
import CheckInPage from './pages/CheckInPage';
import GalleryPage from './pages/GalleryPage';
import ProfilePage from './pages/ProfilePage';
import DashboardPage from './pages/DashboardPage';

export const router = createHashRouter([
  {
    path: '/',
    Component: HomePage,
  },
  {
    path: '/cat/:id',
    Component: CatDetailPage,
  },
  {
    path: '/checkin',
    Component: CheckInPage,
  },
  {
    path: '/gallery',
    Component: GalleryPage,
  },
  {
    path: '/profile',
    Component: ProfilePage,
  },
  {
    path: '/dashboard',
    Component: DashboardPage,
  },
  {
    path: '*',
    Component: () => (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">404</h1>
          <p className="text-gray-600">页面未找到</p>
        </div>
      </div>
    ),
  },
]);
