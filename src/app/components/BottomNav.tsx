import { useNavigate, useLocation } from 'react-router';
import { MapPin, LayoutGrid, TrendingUp, User } from 'lucide-react';

const navItems = [
    { path: '/', label: '地图', icon: MapPin },
    { path: '/gallery', label: '图鉴', icon: LayoutGrid },
    { path: '/dashboard', label: '统计', icon: TrendingUp },
    { path: '/profile', label: '我的', icon: User },
];

export default function BottomNav() {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-[1000] pb-safe">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={`flex flex-col items-center justify-center gap-0.5 w-full h-full transition-colors ${isActive
                                    ? 'text-purple-600'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <Icon className={`h-5 w-5 ${isActive ? 'fill-purple-100' : ''}`} />
                            <span className={`text-xs ${isActive ? 'font-semibold' : ''}`}>
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
