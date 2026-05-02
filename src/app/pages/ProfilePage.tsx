import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import BottomNav from '../components/BottomNav';
import { listCats, listSightings, getStoredUser, isLoggedIn, logout } from '../api/client';
import type { CatListItem, SightingItem, UserInfo } from '../api/client';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { ArrowLeft, Camera, Heart, Star, Settings, Award, TrendingUp, MapPin, LogOut, Shield } from 'lucide-react';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [cats, setCats] = useState<CatListItem[]>([]);
  const [sightings, setSightings] = useState<SightingItem[]>([]);
  const [loading, setLoading] = useState(true);
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
      listCats({ limit: 100 }),
      loggedIn && currentUser
        ? listSightings({ reporter_id: currentUser.id, limit: 50 })
        : Promise.resolve({ items: [] })
    ])
      .then(([catsRes, sightingsRes]) => {
        setCats(catsRes.items);
        setSightings(sightingsRes?.items ?? []);
      })
      .catch(() => {
        setCats([]);
        setSightings([]);
      })
      .finally(() => setLoading(false));
  }, [loggedIn, currentUser]);

  // 从 sightings 中提取打卡记录（按猫咪分组）
  const catSightingMap = new Map<number, SightingItem[]>();
  for (const s of sightings) {
    const list = catSightingMap.get(s.cat_id) ?? [];
    list.push(s);
    catSightingMap.set(s.cat_id, list);
  }

  const catMap = new Map<number, CatListItem>();
  for (const c of cats) {
    catMap.set(c.id, c);
  }

  // 最近打卡记录
  const recentRecords = sightings.slice(0, 5).map((s) => {
    const cat = catMap.get(s.cat_id);
    return {
      id: s.id,
      catId: s.cat_id,
      catName: cat?.name ?? `猫咪 #${s.cat_id}`,
      type: s.note?.includes('[feeding]') ? 'feeding' as const : 'encounter' as const,
      comment: s.note ?? '',
      timestamp: new Date(s.happened_at).toLocaleString(),
      image: cat?.photo_url ?? 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400'
    };
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">加载中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* 顶部导航 */}
      <header className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="px-4 py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-semibold">个人中心</h1>
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        {/* 用户信息 */}
        <div className="px-4 pb-6 flex items-center gap-4">
          <img
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(currentUser?.username ?? 'guest')}`}
            alt="用户头像"
            className="w-20 h-20 rounded-full border-4 border-white shadow-lg"
          />
          <div className="flex-1">
            {loggedIn && currentUser ? (
              <>
                <h2 className="text-xl font-bold mb-1">{currentUser.username}</h2>
                <Badge className="bg-white/20 text-white border-white/30">
                  {currentUser.role === 'admin' ? '管理员' : '普通用户'}
                </Badge>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold mb-1">未登录</h2>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => navigate('/login')}
                    className="text-sm bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-full transition"
                  >
                    登录
                  </button>
                  <button
                    onClick={() => navigate('/register')}
                    className="text-sm bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-full transition"
                  >
                    注册
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 统计卡片 */}
      <div className="px-4 -mt-4 mb-4">
        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="flex items-center justify-center mb-2">
                <Camera className="h-5 w-5 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-purple-600">{sightings.length}</p>
              <p className="text-xs text-gray-500">打卡次数</p>
            </div>
            <div>
              <div className="flex items-center justify-center mb-2">
                <Heart className="h-5 w-5 text-red-600" />
              </div>
              <p className="text-2xl font-bold text-red-600">
                {sightings.filter((s) => s.note?.includes('[feeding]')).length}
              </p>
              <p className="text-xs text-gray-500">投喂次数</p>
            </div>
            <div>
              <div className="flex items-center justify-center mb-2">
                <Star className="h-5 w-5 text-orange-600" />
              </div>
              <p className="text-2xl font-bold text-orange-600">{cats.length}</p>
              <p className="text-xs text-gray-500">猫咪总数</p>
            </div>
          </div>
        </div>
      </div>

      {/* 成就徽章 */}
      <div className="bg-white px-4 py-4 mb-2">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-600" />
            我的成就
          </h3>
          <Button variant="ghost" size="sm" className="text-purple-600">
            查看全部
          </Button>
        </div>
        <div className="grid grid-cols-4 gap-3">
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-2xl mx-auto mb-2">
              🏆
            </div>
            <p className="text-xs text-gray-600">爱心使者</p>
          </div>
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-2xl mx-auto mb-2">
              📸
            </div>
            <p className="text-xs text-gray-600">摄影达人</p>
          </div>
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center text-2xl mx-auto mb-2">
              🎯
            </div>
            <p className="text-xs text-gray-600">打卡达人</p>
          </div>
          <div className="text-center opacity-40">
            <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-2xl mx-auto mb-2">
              🔒
            </div>
            <p className="text-xs text-gray-600">待解锁</p>
          </div>
        </div>
      </div>


      {/* 打卡记录 */}
      <div className="bg-white px-4 py-4 mb-2">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Camera className="h-5 w-5 text-purple-600" />
            最近打卡
          </h3>
          <Button variant="ghost" size="sm" className="text-purple-600">
            查看全部
          </Button>
        </div>
        <div className="space-y-3">
          {recentRecords.map((record) => (
            <div key={record.id} className="flex gap-3">
              <img
                src={record.image}
                alt={record.catName}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{record.catName}</span>
                  <Badge variant="outline" className="text-xs">
                    {record.type === 'feeding' ? '投喂' : '偶遇'}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-1">{record.comment || '（无备注）'}</p>
                <p className="text-xs text-gray-400">{record.timestamp}</p>
              </div>
            </div>
          ))}
          {recentRecords.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">暂无打卡记录</p>
          )}
        </div>
      </div>

      <Separator />

      {/* 功能菜单 */}
      <div className="bg-white px-4 py-2 mb-20">
        {loggedIn && currentUser?.role === 'admin' && (
          <>
            <Button
              variant="ghost"
              className="w-full justify-between py-6"
              onClick={() => navigate('/review')}
            >
              <span className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-purple-600" />
                审核管理
              </span>
              <span className="text-gray-400">›</span>
            </Button>
            <Separator className="my-2" />
          </>
        )}
        <Button
          variant="ghost"
          className="w-full justify-between py-6"
          onClick={() => navigate('/dashboard')}
        >
          <span className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            数据统计
          </span>
          <span className="text-gray-400">›</span>
        </Button>
        <Separator className="my-2" />
        <Button
          variant="ghost"
          className="w-full justify-between py-6"
        >
          <span className="flex items-center gap-3">
            <Settings className="h-5 w-5 text-gray-600" />
            设置
          </span>
          <span className="text-gray-400">›</span>
        </Button>
        {loggedIn && (
          <>
            <Separator className="my-2" />
            <Button
              variant="ghost"
              className="w-full justify-between py-6 text-red-600 hover:text-red-700"
              onClick={() => {
                logout();
                navigate('/');
              }}
            >
              <span className="flex items-center gap-3">
                <LogOut className="h-5 w-5" />
                退出登录
              </span>
              <span className="text-gray-400">›</span>
            </Button>
          </>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
