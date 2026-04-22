import { useParams, useNavigate } from 'react-router';
import { mockCats, mockCheckIns } from '../data/mockData';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { ArrowLeft, MapPin, Heart, Camera, Share2, MessageCircle, ThumbsUp } from 'lucide-react';
import { useState } from 'react';
import { Textarea } from '../components/ui/textarea';

export default function CatDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [comment, setComment] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);

  const cat = mockCats.find(c => c.id === id);
  const catCheckIns = mockCheckIns.filter(c => c.catId === id);

  if (!cat) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-gray-500">猫咪不存在</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 顶部图片 */}
      <div className="relative">
        <img
          src={cat.image}
          alt={cat.name}
          className="w-full h-72 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* 顶部导航 */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="bg-white/90 hover:bg-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFavorite(!isFavorite)}
              className="bg-white/90 hover:bg-white"
            >
              <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="bg-white/90 hover:bg-white"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* 底部信息 */}
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <h1 className="text-3xl font-bold mb-1">{cat.nickname}</h1>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4" />
            <span>{cat.location.name}</span>
          </div>
        </div>
      </div>

      {/* 详细信息 */}
      <div className="bg-white px-4 py-4">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">档案编号</p>
            <p className="font-medium">{cat.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">性别</p>
            <p className="font-medium">{cat.gender}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">毛色</p>
            <p className="font-medium">{cat.color}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">健康状态</p>
            <p className="font-medium">{cat.health}</p>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-500 mb-2">性格标签</p>
          <div className="flex gap-2">
            {cat.personality.map(tag => (
              <Badge key={tag} variant="secondary" className="bg-purple-100 text-purple-700">
                {tag}
              </Badge>
            ))}
            <Badge variant="secondary" className={cat.neutered ? 'bg-green-100 text-green-700' : 'bg-gray-100'}>
              {cat.neutered ? '已绝育' : '未绝育'}
            </Badge>
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-500 mb-2">关于TA</p>
          <p className="text-gray-700 leading-relaxed">{cat.description}</p>
        </div>
      </div>

      <Separator className="my-4" />

      {/* 快捷操作 */}
      <div className="px-4 mb-4">
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => navigate('/checkin')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Camera className="h-4 w-4 mr-2" />
            偶遇打卡
          </Button>
          <Button
            onClick={() => navigate('/checkin?type=feeding')}
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
          >
            <Heart className="h-4 w-4 mr-2" />
            投喂打卡
          </Button>
        </div>
      </div>

      {/* 故事墙 */}
      <div className="bg-white px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-purple-600" />
            故事墙
          </h2>
          <span className="text-sm text-gray-500">{catCheckIns.length} 条记录</span>
        </div>

        {/* 发布评论 */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <Textarea
            placeholder="分享你和这只猫的故事..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="mb-2 resize-none"
            rows={3}
          />
          <div className="flex justify-end">
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
              发布
            </Button>
          </div>
        </div>

        {/* 打卡记录列表 */}
        <div className="space-y-4">
          {catCheckIns.map(record => (
            <div key={record.id} className="border-b pb-4 last:border-0">
              <div className="flex items-start gap-3 mb-2">
                <img
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                  alt={record.userName}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{record.userName}</span>
                    <Badge variant="outline" className="text-xs">
                      {record.type === 'feeding' ? '投喂' : '偶遇'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">{record.timestamp}</p>
                  <p className="text-gray-700 mb-2">{record.comment}</p>
                  {record.image && (
                    <img
                      src={record.image}
                      alt="打卡照片"
                      className="w-full max-w-xs rounded-lg"
                    />
                  )}
                  <div className="flex items-center gap-4 mt-3">
                    <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-purple-600">
                      <ThumbsUp className="h-4 w-4" />
                      <span>{record.likes}</span>
                    </button>
                    <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-purple-600">
                      <MessageCircle className="h-4 w-4" />
                      <span>回复</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
