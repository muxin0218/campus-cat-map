import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Camera, Heart, MapPin, MessageCircle, Share2, ThumbsUp } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Separator } from "../components/ui/separator";
import { Textarea } from "../components/ui/textarea";
import { getCat, listSightings, type CatListItem, type SightingItem } from "../api/client";

export default function CatDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [comment, setComment] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [cat, setCat] = useState<CatListItem | null>(null);
  const [records, setRecords] = useState<SightingItem[]>([]);
  const [loading, setLoading] = useState(true);

  const catId = useMemo(() => Number(id), [id]);

  useEffect(() => {
    if (!Number.isFinite(catId) || catId <= 0) {
      setLoading(false);
      setCat(null);
      return;
    }

    setLoading(true);
    void Promise.all([getCat(catId), listSightings({ cat_id: catId, limit: 50 })])
      .then(([catRes, sightingsRes]) => {
        setCat(catRes);
        setRecords(sightingsRes.items);
      })
      .catch(() => {
        setCat(null);
        setRecords([]);
      })
      .finally(() => setLoading(false));
  }, [catId]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-gray-500">加载中...</p>
      </div>
    );
  }

  if (!cat) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-gray-500">猫咪不存在</p>
      </div>
    );
  }

  const headerImg = cat.photo_url ?? "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=1200";

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="relative">
        <img src={headerImg} alt={cat.name} className="w-full h-72 object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="bg-white/90 hover:bg-white">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFavorite(!isFavorite)}
              className="bg-white/90 hover:bg-white"
            >
              <Heart className={`h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
            </Button>
            <Button variant="ghost" size="sm" className="bg-white/90 hover:bg-white">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="absolute bottom-4 left-4 right-4 text-white">
          <h1 className="text-3xl font-bold mb-1">{cat.name}</h1>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4" />
            <span>
              {cat.latitude != null && cat.longitude != null
                ? `${cat.latitude.toFixed(5)}, ${cat.longitude.toFixed(5)}`
                : "暂无定位"}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white px-4 py-4">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">档案编号</p>
            <p className="font-medium">{cat.id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">性别</p>
            <p className="font-medium">{cat.sex}</p>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-500 mb-2">状态</p>
          <div className="flex gap-2">
            <Badge variant="secondary" className={cat.neutered ? "bg-green-100 text-green-700" : "bg-gray-100"}>
              {cat.neutered ? "已绝育" : "未绝育"}
            </Badge>
            {cat.last_seen_at && (
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                最近出现：{new Date(cat.last_seen_at).toLocaleString()}
              </Badge>
            )}
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-500 mb-2">关于 TA</p>
          <p className="text-gray-700 leading-relaxed">{cat.description ?? "暂无描述"}</p>
        </div>
      </div>

      <Separator className="my-4" />

      <div className="px-4 mb-4">
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => navigate("/checkin")}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Camera className="h-4 w-4 mr-2" />
            偶遇打卡
          </Button>
          <Button
            onClick={() => navigate("/checkin?type=feeding")}
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
          >
            <Heart className="h-4 w-4 mr-2" />
            投喂打卡
          </Button>
        </div>
      </div>

      <div className="bg-white px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-purple-600" />
            出现记录
          </h2>
          <span className="text-sm text-gray-500">{records.length} 条</span>
        </div>

        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <Textarea
            placeholder="写点备注（本页面暂不提交，仅示意）..."
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

        <div className="space-y-4">
          {records.map((record) => (
            <div key={record.id} className="border-b pb-4 last:border-0">
              <div className="flex items-start gap-3 mb-2">
                <img
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                  alt="user"
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">匿名用户</span>
                    <Badge variant="outline" className="text-xs">
                      出现
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">{new Date(record.happened_at).toLocaleString()}</p>
                  <p className="text-gray-700 mb-2">{record.note ?? "（无备注）"}</p>
                  <div className="flex items-center gap-4 mt-3">
                    <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-purple-600">
                      <ThumbsUp className="h-4 w-4" />
                      <span>0</span>
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

          {records.length === 0 && <p className="text-sm text-gray-500">暂无出现记录（可去“打卡”页新增）</p>}
        </div>
      </div>
    </div>
  );
}

