import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { listCats, checkIsAdmin } from '../api/client';
import type { CatListItem } from '../api/client';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import BottomNav from '../components/BottomNav';
import { ArrowLeft, Search, MapPin, Heart, Plus, UtensilsCrossed } from 'lucide-react';

export default function GalleryPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'neutered'>('all');
  const [isAdmin, setIsAdmin] = useState(false);
  const [cats, setCats] = useState<CatListItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 通过后端 API 判断是否管理员
  useEffect(() => {
    void checkIsAdmin().then(setIsAdmin);
    // 监听登录状态变化时重新检查
    const handleAuthChange = () => {
      void checkIsAdmin().then(setIsAdmin);
    };
    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, []);

  useEffect(() => {
    void listCats()
      .then((res) => setCats(res.items))
      .catch(() => setCats([]))
      .finally(() => setLoading(false));
  }, []);

  const filteredCats = cats.filter((cat) => {
    const matchSearch = cat.name.includes(searchQuery);

    if (!matchSearch) return false;

    if (filter === 'neutered') return cat.neutered;
    return true;
  });

  const sexLabel = (sex: string) => {
    if (sex === 'male') return '公';
    if (sex === 'female') return '母';
    return '未知';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">加载中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3 mb-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-lg font-semibold flex-1">猫咪图鉴</h1>
            {isAdmin && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/feeding-points')}
                className="text-orange-600 hover:text-orange-700"
              >
                <UtensilsCrossed className="h-4 w-4 mr-1" />
                投喂点
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/add-cat')}
              className="text-purple-600 hover:text-purple-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              添加
            </Button>
          </div>

          {/* 搜索栏 */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="搜索猫咪..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* 筛选标签 */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
              className={filter === 'all' ? 'bg-purple-600 hover:bg-purple-700' : ''}
            >
              全部 ({cats.length})
            </Button>
            <Button
              variant={filter === 'neutered' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('neutered')}
              className={filter === 'neutered' ? 'bg-purple-600 hover:bg-purple-700' : ''}
            >
              已绝育 ({cats.filter((c) => c.neutered).length})
            </Button>
          </div>
        </div>
      </header>

      {/* 猫咪卡片网格 */}
      <div className="p-4">
        <div className="grid grid-cols-3 gap-3">
          {filteredCats.map((cat) => (
            <div
              key={cat.id}
              onClick={() => navigate(`/cat/${cat.id}`)}
              className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer"
            >
              {/* 图片 */}
              <div className="relative">
                <img
                  src={cat.photo_url ?? 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400'}
                  alt={cat.name}
                  className="w-full aspect-square object-cover"
                />
                <div className="absolute top-2 right-2">
                  <Badge className="bg-white/90 text-gray-800 border-0">
                    {sexLabel(cat.sex)}
                  </Badge>
                </div>
              </div>

              {/* 信息 */}
              <div className="p-3">
                <h3 className="font-semibold mb-1 truncate">{cat.name}</h3>
                <p className="text-xs text-gray-500 mb-2">{cat.description ?? '暂无描述'}</p>

                {/* 标签 */}
                <div className="flex flex-wrap gap-1 mb-2">
                  {cat.neutered && (
                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                      已绝育
                    </Badge>
                  )}
                </div>

                {/* 位置 */}
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate">
                    {cat.latitude != null && cat.longitude != null
                      ? `${cat.latitude.toFixed(5)}, ${cat.longitude.toFixed(5)}`
                      : '暂无定位'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCats.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">未找到符合条件的猫咪</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
