import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { ArrowLeft, Camera, MapPin, Upload, Info } from 'lucide-react';
import { mockCats } from '../data/mockData';
import { Alert, AlertDescription } from '../components/ui/alert';

export default function CheckInPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') || 'encounter';

  const [selectedCat, setSelectedCat] = useState('');
  const [location, setLocation] = useState('');
  const [comment, setComment] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [showTip, setShowTip] = useState(type === 'feeding');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGetLocation = () => {
    // 模拟获取GPS位置
    setLocation('河海大学江宁校区图书馆门口 (GPS: 31.9132, 118.7811)');
  };

  const handleSubmit = () => {
    if (!selectedCat || !location || !image) {
      alert('请填写完整信息并上传照片');
      return;
    }
    alert('打卡成功!等待管理员审核');
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="px-4 py-3 flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-semibold">
            {type === 'feeding' ? '投喂打卡' : '偶遇打卡'}
          </h1>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* 科普提示 */}
        {showTip && (
          <Alert className="bg-orange-50 border-orange-200">
            <Info className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>投喂小贴士:</strong> 请不要喂食牛奶、巧克力、洋葱等对猫咪有害的食物。建议投喂专业猫粮或猫罐头。
            </AlertDescription>
          </Alert>
        )}

        {/* 拍照上传 */}
        <div className="bg-white rounded-lg p-4">
          <Label className="mb-2 block">拍照上传 *</Label>
          {image ? (
            <div className="relative">
              <img
                src={image}
                alt="上传照片"
                className="w-full h-64 object-cover rounded-lg"
              />
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setImage(null)}
                className="absolute top-2 right-2"
              >
                删除
              </Button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition">
              <Camera className="h-12 w-12 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500 mb-1">点击拍照或上传图片</p>
              <p className="text-xs text-gray-400">AI将自动识别猫咪</p>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* 选择猫咪 */}
        <div className="bg-white rounded-lg p-4">
          <Label className="mb-2 block">选择猫咪 *</Label>
          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
          >
            <option value="">请选择猫咪</option>
            {mockCats.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.nickname} - {cat.location.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-2">
            📝 如果列表中没有这只猫,照片审核通过后会自动创建新档案
          </p>
        </div>

        {/* 位置信息 */}
        <div className="bg-white rounded-lg p-4">
          <Label className="mb-2 block">位置信息 *</Label>
          <div className="flex gap-2">
            <Input
              placeholder="点击获取当前位置"
              value={location}
              readOnly
              className="flex-1"
            />
            <Button
              onClick={handleGetLocation}
              variant="outline"
              className="shrink-0"
            >
              <MapPin className="h-4 w-4 mr-1" />
              定位
            </Button>
          </div>
        </div>

        {/* 投喂记录 (仅投喂打卡) */}
        {type === 'feeding' && (
          <div className="bg-white rounded-lg p-4">
            <Label className="mb-2 block">投喂内容</Label>
            <Input
              placeholder="例如: 猫粮、罐头等"
              className="mb-2"
            />
            <Label className="mb-2 block">投喂量</Label>
            <Input
              placeholder="例如: 约50g"
            />
          </div>
        )}

        {/* 备注说明 */}
        <div className="bg-white rounded-lg p-4">
          <Label className="mb-2 block">备注说明</Label>
          <Textarea
            placeholder={type === 'feeding' ? '分享投喂时的趣事...' : '记录偶遇的瞬间...'}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
          />
        </div>

        {/* 提交按钮 */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => navigate(-1)}
          >
            取消
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Upload className="h-4 w-4 mr-2" />
            提交打卡
          </Button>
        </div>

        {/* 说明文字 */}
        <div className="text-center text-xs text-gray-500 pb-4">
          提交后需要管理员审核通过才会显示在地图上
        </div>
      </div>
    </div>
  );
}
