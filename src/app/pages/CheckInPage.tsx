import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { ArrowLeft, Camera, Info, MapPin, Upload, UtensilsCrossed } from "lucide-react";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  createSighting,
  createFeedingEvent,
  listCats,
  listFeedingPoints,
  getStoredUser,
  isLoggedIn,
  type CatListItem,
  type FeedingPointItem
} from "../api/client";

export default function CheckInPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type") || "encounter";
  const isFeeding = type === "feeding";

  // 偶遇打卡用
  const [cats, setCats] = useState<CatListItem[]>([]);
  const [selectedCat, setSelectedCat] = useState<string>("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [comment, setComment] = useState("");

  // 投喂打卡用
  const [feedingPoints, setFeedingPoints] = useState<FeedingPointItem[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<string>("");
  const [selectedFeedingCat, setSelectedFeedingCat] = useState<string>("");
  const [foodType, setFoodType] = useState("");
  const [amount, setAmount] = useState("");

  // 公共
  const [image, setImage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isFeeding) {
      void Promise.all([
        listFeedingPoints(),
        listCats()
      ])
        .then(([fpRes, catsRes]) => {
          setFeedingPoints(fpRes.items);
          setCats(catsRes.items);
        })
        .catch(() => {
          setFeedingPoints([]);
          setCats([]);
        });
    } else {
      void listCats()
        .then((res) => setCats(res.items))
        .catch(() => setCats([]));
    }
  }, [isFeeding]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("当前浏览器不支持定位");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => alert("定位失败，请检查权限或网络")
    );
  };

  const handleSubmit = async () => {
    if (!isLoggedIn()) {
      alert("请先登录后再打卡");
      navigate("/login");
      return;
    }

    if (isFeeding) {
      // ─── 投喂打卡 ───
      const pointId = Number(selectedPoint);
      if (!Number.isFinite(pointId) || pointId <= 0) {
        alert("请选择投喂点");
        return;
      }

      const user = getStoredUser();
      setSubmitting(true);
      try {
        await createFeedingEvent({
          feeding_point_id: pointId,
          cat_id: selectedFeedingCat ? Number(selectedFeedingCat) : undefined,
          feeder_id: user?.id,
          food_type: foodType.trim() || undefined,
          amount: amount.trim() || undefined,
          note: comment.trim() || undefined
        });
        alert("投喂打卡成功！");
        navigate(-1);
      } catch (e: any) {
        alert(`提交失败：${e?.message ?? "unknown error"}`);
      } finally {
        setSubmitting(false);
      }
    } else {
      // ─── 偶遇打卡 ───
      const catId = Number(selectedCat);
      if (!Number.isFinite(catId) || catId <= 0) {
        alert("请选择猫咪");
        return;
      }
      if (!coords) {
        alert("请先获取定位");
        return;
      }

      const user = getStoredUser();
      setSubmitting(true);
      try {
        await createSighting({
          cat_id: catId,
          latitude: coords.lat,
          longitude: coords.lng,
          note: comment.trim() || undefined,
          reporter_id: user?.id,
          image: image ?? undefined
        });
        alert("偶遇打卡成功！");
        navigate(-1);
      } catch (e: any) {
        alert(`提交失败：${e?.message ?? "unknown error"}`);
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-semibold">{isFeeding ? "投喂打卡" : "偶遇打卡"}</h1>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* 未登录提示 */}
        {!isLoggedIn() && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm text-orange-700">
            请先<button onClick={() => navigate("/login")} className="text-orange-600 underline font-medium">登录</button>后再打卡
          </div>
        )}

        {/* 投喂小贴士 */}
        {isFeeding && (
          <Alert className="bg-orange-50 border-orange-200">
            <Info className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>投喂小贴士：</strong>不建议投喂牛奶、巧克力、洋葱等对猫咪有害食物，建议猫粮/清水。
            </AlertDescription>
          </Alert>
        )}

        {/* 选择投喂点（投喂打卡） */}
        {isFeeding && (
          <div className="bg-white rounded-lg p-4">
            <Label className="mb-2 block flex items-center gap-1">
              <UtensilsCrossed className="h-4 w-4 text-orange-500" />
              选择投喂点 *
            </Label>
            <select
              value={selectedPoint}
              onChange={(e) => setSelectedPoint(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">请选择投喂点</option>
              {feedingPoints.map((fp) => (
                <option key={fp.id} value={fp.id}>
                  🍽️ {fp.name}
                </option>
              ))}
            </select>
            {feedingPoints.length === 0 && (
              <p className="text-xs text-gray-400 mt-1">
                暂无投喂点，
                <button onClick={() => navigate("/feeding-points")} className="text-orange-600 underline">
                  去添加
                </button>
              </p>
            )}
          </div>
        )}

        {/* 选择猫咪（偶遇打卡） */}
        {!isFeeding && (
          <div className="bg-white rounded-lg p-4">
            <Label className="mb-2 block">选择猫咪 *</Label>
            <select
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
            >
              <option value="">请选择猫咪</option>
              {cats.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  🐱 {cat.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 定位（仅偶遇打卡需要） */}
        {!isFeeding && (
          <div className="bg-white rounded-lg p-4">
            <Label className="mb-2 block">位置信息 *</Label>
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="纬度 (lat)"
                type="number"
                step="0.000001"
                value={coords?.lat ?? ""}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  setCoords(Number.isFinite(v) ? { lat: v, lng: coords?.lng ?? 0 } : null);
                }}
                className="flex-1"
              />
              <Input
                placeholder="经度 (lng)"
                type="number"
                step="0.000001"
                value={coords?.lng ?? ""}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  setCoords(Number.isFinite(v) ? { lat: coords?.lat ?? 0, lng: v } : null);
                }}
                className="flex-1"
              />
              <Button onClick={handleGetLocation} variant="outline" className="shrink-0">
                <MapPin className="h-4 w-4 mr-1" />
                定位
              </Button>
            </div>
            {coords && (
              <p className="text-xs text-green-600">
                ✅ 已获取位置：{coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
              </p>
            )}
          </div>
        )}

        {/* 投喂内容（投喂打卡） */}
        {isFeeding && (
          <div className="bg-white rounded-lg p-4 space-y-3">
            <div>
              <Label className="mb-2 block">食物类型</Label>
              <Input placeholder="例如：猫粮、罐头" value={foodType} onChange={(e) => setFoodType(e.target.value)} />
            </div>
            <div>
              <Label className="mb-2 block">投喂量</Label>
              <Input placeholder="例如：约 50g" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
          </div>
        )}

        {/* 关联猫咪（仅投喂打卡） */}
        {isFeeding && (
          <div className="bg-white rounded-lg p-4">
            <Label className="mb-2 block">关联猫咪（可选）</Label>
            <select
              value={selectedFeedingCat}
              onChange={(e) => setSelectedFeedingCat(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">不关联猫咪</option>
              {cats.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  🐱 {cat.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 上传图片（仅偶遇打卡） */}
        {!isFeeding && (
          <div className="bg-white rounded-lg p-4">
            <Label className="mb-2 block flex items-center gap-1">
              <Camera className="h-4 w-4 text-purple-500" />
              上传照片
            </Label>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => document.getElementById("photo-input")?.click()} className="shrink-0">
                <Camera className="h-4 w-4 mr-1" />
                选择照片
              </Button>
              <Input
                id="photo-input"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              {image && (
                <div className="relative flex-1">
                  <img src={image} alt="预览" className="h-20 w-20 object-cover rounded-lg border" />
                  <button
                    onClick={() => setImage(null)}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 备注说明 */}
        <div className="bg-white rounded-lg p-4">
          <Label className="mb-2 block">备注说明</Label>
          <Textarea
            placeholder={isFeeding ? "分享投喂时的趣事..." : "记录偶遇的瞬间..."}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
          />
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => navigate(-1)} disabled={submitting}>
            取消
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className={`flex-1 ${isFeeding
              ? "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              }`}
          >
            <Upload className="h-4 w-4 mr-2" />
            {submitting ? "提交中..." : "提交打卡"}
          </Button>
        </div>
      </div>
    </div>
  );
}
