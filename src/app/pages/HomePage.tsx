import { useState } from 'react';
import MapView from '../components/MapView';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { MapPin, Search, Camera, Heart } from 'lucide-react';
import { useNavigate } from 'react-router';
import { mockCats } from '../data/mockData';

export default function HomePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCats = mockCats.filter(cat =>
    cat.name.includes(searchQuery) ||
    cat.nickname.includes(searchQuery) ||
    cat.location.name.includes(searchQuery)
  );

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* 顶部导航栏 */}
      <header className="bg-white shadow-sm z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              🐱 校园流浪猫地图
            </h1>
            <Button
              onClick={() => navigate('/profile')}
              variant="ghost"
              size="sm"
              className="h-8 w-8 rounded-full p-0"
            >
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                alt="用户头像"
                className="w-8 h-8 rounded-full"
              />
            </Button>
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
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{cat.nickname}</p>
                    <p className="text-sm text-gray-500">{cat.location.name}</p>
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
        <MapView />

        {/* 浮动底部导航 */}
        <div className="absolute bottom-4 left-4 right-4 bg-white rounded-xl shadow-lg p-2 flex justify-around z-[1000]">
          <Button
            variant="ghost"
            className="flex-1 flex flex-col items-center gap-1 h-auto py-2"
            onClick={() => navigate('/')}
          >
            <MapPin className="h-5 w-5 text-purple-600" />
            <span className="text-xs text-purple-600 font-medium">地图</span>
          </Button>
          <Button
            variant="ghost"
            className="flex-1 flex flex-col items-center gap-1 h-auto py-2"
            onClick={() => navigate('/gallery')}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span className="text-xs">图鉴</span>
          </Button>
          <Button
            variant="ghost"
            className="flex-1 flex flex-col items-center gap-1 h-auto py-2"
            onClick={() => navigate('/dashboard')}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-xs">数据</span>
          </Button>
          <Button
            variant="ghost"
            className="flex-1 flex flex-col items-center gap-1 h-auto py-2"
            onClick={() => navigate('/profile')}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-xs">我的</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
