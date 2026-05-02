import { createHashRouter } from 'react-router';
import HomePage from './pages/HomePage';
import CatDetailPage from './pages/CatDetailPage';
import CheckInPage from './pages/CheckInPage';
import GalleryPage from './pages/GalleryPage';
import ProfilePage from './pages/ProfilePage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AddCatPage from './pages/AddCatPage';
import FeedingPointsPage from './pages/FeedingPointsPage';
import ReviewPage from './pages/ReviewPage';

export const router = createHashRouter([
  {
    path: '/feeding-points',
    Component: FeedingPointsPage,
  },
  {
    path: '/',
    Component: HomePage,
  },
  {
    path: '/review',
    Component: ReviewPage,
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
    path: '/login',
    Component: LoginPage,
  },
  {
    path: '/register',
    Component: RegisterPage,
  },
  {
    path: '/add-cat',
    Component: AddCatPage,
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
