import { useNavigate } from 'react-router';
import { mockUser, mockCheckIns, mockCats } from '../data/mockData';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { ArrowLeft, Camera, Heart, Star, Settings, Award, TrendingUp, MapPin } from 'lucide-react';

export default function ProfilePage() {
  const navigate = useNavigate();
  const userCheckIns = mockCheckIns.filter(c => c.userId === mockUser.id);
  const favoriteCats = mockCats.filter(c => mockUser.favorites.includes(c.id));

  return (
    <div className="min-h-screen bg-gray-50">
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
            src={mockUser.avatar}
            alt={mockUser.name}
            className="w-20 h-20 rounded-full border-4 border-white shadow-lg"
          />
          <div className="flex-1">
            <h2 className="text-xl font-bold mb-1">{mockUser.name}</h2>
            <Badge className="bg-white/20 text-white border-white/30">
              {mockUser.role === 'admin' ? '管理员' : '普通用户'}
            </Badge>
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
              <p className="text-2xl font-bold text-purple-600">{mockUser.checkInCount}</p>
              <p className="text-xs text-gray-500">打卡次数</p>
            </div>
            <div>
              <div className="flex items-center justify-center mb-2">
                <Heart className="h-5 w-5 text-red-600" />
              </div>
              <p className="text-2xl font-bold text-red-600">{mockUser.feedingCount}</p>
              <p className="text-xs text-gray-500">投喂次数</p>
            </div>
            <div>
              <div className="flex items-center justify-center mb-2">
                <Star className="h-5 w-5 text-orange-600" />
              </div>
              <p className="text-2xl font-bold text-orange-600">{mockUser.favorites.length}</p>
              <p className="text-xs text-gray-500">收藏猫咪</p>
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

      <Separator />

      {/* 我的收藏 */}
      <div className="bg-white px-4 py-4 mb-2">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Star className="h-5 w-5 text-orange-600" />
            我的收藏
          </h3>
          <Button variant="ghost" size="sm" className="text-purple-600">
            查看全部
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {favoriteCats.map(cat => (
            <div
              key={cat.id}
              onClick={() => navigate(`/cat/${cat.id}`)}
              className="cursor-pointer"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full aspect-square object-cover rounded-lg mb-1"
              />
              <p className="text-xs font-medium truncate">{cat.nickname}</p>
              <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {cat.location.name}
              </p>
            </div>
          ))}
        </div>
      </div>

      <Separator />

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
          {userCheckIns.slice(0, 3).map(record => (
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
                <p className="text-sm text-gray-600 mb-1">{record.comment}</p>
                <p className="text-xs text-gray-400">{record.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* 功能菜单 */}
      <div className="bg-white px-4 py-2 mb-20">
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
      </div>
    </div>
  );
}
