import { useEffect, useMemo, useState } from 'react';
import MapView from '../components/MapView';
import BottomNav from '../components/BottomNav';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { MapPin, Search, Camera, Heart, User } from 'lucide-react';
import { useNavigate } from 'react-router';
import { listCats, listFeedingPoints, getStoredUser, isLoggedIn } from '../api/client';
import type { CatListItem, FeedingPointItem, UserInfo } from '../api/client';

export default function HomePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [cats, setCats] = useState<CatListItem[]>([]);
  const [feedingPoints, setFeedingPoints] = useState<FeedingPointItem[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(getStoredUser());
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());

  // 监听登录状态变化
  useEffect(() => {
    const handleAuthChange = () => {
      setCurrentUser(getStoredUser());
      setLoggedIn(isLoggedIn());
    };
    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, []);

  useEffect(() => {
    void Promise.all([
      listCats(),
      listFeedingPoints()
    ])
      .then(([catsRes, fpRes]) => {
        setCats(catsRes.items);
        setFeedingPoints(fpRes.items);
        setLoadError(null);
      })
      .catch((e: unknown) => {
        const message = e instanceof Error ? e.message : '加载失败';
        setCats([]);
        setFeedingPoints([]);
        setLoadError(message);
      });
  }, []);

  const filteredCats = useMemo(() => {
    const q = searchQuery.trim();
    if (!q) return [];
    return cats.filter((cat) => cat.name.includes(q));
  }, [cats, searchQuery]);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* 顶部导航栏 */}
      <header className="bg-white shadow-sm z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              🐱 校园流浪猫地图
            </h1>
            {loggedIn && currentUser ? (
              <Button
                onClick={() => navigate('/profile')}
                variant="ghost"
                size="sm"
                className="h-8 w-8 rounded-full p-0 overflow-hidden"
              >
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(currentUser.username)}`}
                  alt={currentUser.username}
                  className="w-8 h-8 rounded-full"
                />
              </Button>
            ) : (
              <Button
                onClick={() => navigate('/login')}
                variant="ghost"
                size="sm"
                className="text-purple-600 hover:text-purple-700 text-sm font-medium"
              >
                登录
              </Button>
            )}
          </div>

          {/* 搜索栏 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="搜索猫咪名称或位置..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4"
            />
          </div>
        </div>

        {/* 快捷操作按钮 */}
        <div className="px-4 pb-3 flex gap-2 overflow-x-auto">
          <Button
            onClick={() => navigate('/checkin')}
            className="flex-1 min-w-fit bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Camera className="h-4 w-4 mr-1" />
            偶遇打卡
          </Button>
          <Button
            onClick={() => navigate('/checkin?type=feeding')}
            className="flex-1 min-w-fit bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
          >
            <Heart className="h-4 w-4 mr-1" />
            投喂打卡
          </Button>
          <Button
            onClick={() => navigate('/gallery')}
            variant="outline"
            className="flex-1 min-w-fit"
          >
            <MapPin className="h-4 w-4 mr-1" />
            猫咪图鉴
          </Button>
        </div>
      </header>

      {/* 搜索结果列表 (当有搜索时显示) */}
      {loadError && (
        <div className="px-4 py-2 bg-red-50 text-red-700 border-b text-sm">
          加载猫咪数据失败：{loadError}（请直接访问 <span className="font-mono">/api/cats</span> 检查后端）
        </div>
      )}

      {searchQuery && (
        <div className="px-4 py-2 bg-white border-b max-h-48 overflow-y-auto">
          {filteredCats.length > 0 ? (
            <div className="space-y-2">
              {filteredCats.map(cat => (
                <div
                  key={cat.id}
                  onClick={() => navigate(`/cat/${cat.id}`)}
                  className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition"
                >
                  <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                    <span className="text-xl">🐱</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{cat.name}</p>
                    <p className="text-sm text-gray-500">
                      {cat.latitude != null && cat.longitude != null
                        ? `${cat.latitude.toFixed(5)}, ${cat.longitude.toFixed(5)}`
                        : '暂无定位'}
                    </p>
                  </div>
                  <MapPin className="h-4 w-4 text-gray-400" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-4">未找到相关猫咪</p>
          )}
        </div>
      )}

      {/* 地图视图 */}
      <div className="flex-1 relative">
        <MapView cats={cats} feedingPoints={feedingPoints} />
      </div>

      <BottomNav />
    </div>
  );
}
