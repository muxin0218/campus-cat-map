import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { ArrowLeft, Camera, Info, MapPin, Upload } from "lucide-react";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { createSighting, listCats, getStoredUser, type CatListItem } from "../api/client";

export default function CheckInPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type") || "encounter";

  const [cats, setCats] = useState<CatListItem[]>([]);
  const [selectedCat, setSelectedCat] = useState<string>("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [comment, setComment] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [foodType, setFoodType] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const showTip = type === "feeding";

  useEffect(() => {
    void listCats()
      .then((res) => setCats(res.items))
      .catch(() => setCats([]));
  }, []);

  const locationText = useMemo(() => {
    if (!coords) return "";
    return `GPS: ${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`;
  }, [coords]);

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
    const catId = Number(selectedCat);
    if (!Number.isFinite(catId) || catId <= 0) {
      alert("请选择猫咪");
      return;
    }
    if (!coords) {
      alert("请先获取定位");
      return;
    }
    if (!image) {
      alert("请上传照片（当前版本仅用于演示，不会保存到数据库）");
      return;
    }

    const noteParts: string[] = [];
    noteParts.push(type === "feeding" ? "[feeding]" : "[encounter]");
    if (type === "feeding") {
      if (foodType.trim()) noteParts.push(`food=${foodType.trim()}`);
      if (amount.trim()) noteParts.push(`amount=${amount.trim()}`);
    }
    if (comment.trim()) noteParts.push(comment.trim());

    setSubmitting(true);
    try {
      const user = getStoredUser();
      await createSighting({
        cat_id: catId,
        latitude: coords.lat,
        longitude: coords.lng,
        note: noteParts.join(" "),
        reporter_id: user?.id
      });
      alert("打卡成功（已写入数据库 sightings）");
      navigate(-1);
    } catch (e: any) {
      alert(`提交失败：${e?.message ?? "unknown error"}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-semibold">{type === "feeding" ? "投喂打卡" : "偶遇打卡"}</h1>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {showTip && (
          <Alert className="bg-orange-50 border-orange-200">
            <Info className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>投喂小贴士：</strong>不建议投喂牛奶、巧克力、洋葱等对猫咪有害食物，建议猫粮/清水。
            </AlertDescription>
          </Alert>
        )}

        <div className="bg-white rounded-lg p-4">
          <Label className="mb-2 block">拍照上传 *</Label>
          {image ? (
            <div className="relative">
              <img src={image} alt="upload" className="w-full h-64 object-cover rounded-lg" />
              <Button variant="destructive" size="sm" onClick={() => setImage(null)} className="absolute top-2 right-2">
                删除
              </Button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition">
              <Camera className="h-12 w-12 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500 mb-1">点击拍照或上传图片</p>
              <p className="text-xs text-gray-400">当前版本仅用于演示（不保存图片）</p>
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
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-white rounded-lg p-4">
          <Label className="mb-2 block">位置信息 *</Label>
          <div className="flex gap-2">
            <Input placeholder="点击获取当前定位" value={locationText} readOnly className="flex-1" />
            <Button onClick={handleGetLocation} variant="outline" className="shrink-0">
              <MapPin className="h-4 w-4 mr-1" />
              定位
            </Button>
          </div>
        </div>

        {type === "feeding" && (
          <div className="bg-white rounded-lg p-4">
            <Label className="mb-2 block">投喂内容</Label>
            <Input placeholder="例如：猫粮" className="mb-2" value={foodType} onChange={(e) => setFoodType(e.target.value)} />
            <Label className="mb-2 block">投喂量</Label>
            <Input placeholder="例如：约 50g" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
        )}

        <div className="bg-white rounded-lg p-4">
          <Label className="mb-2 block">备注说明</Label>
          <Textarea
            placeholder={type === "feeding" ? "分享投喂时的趣事..." : "记录偶遇的瞬间..."}
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
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            disabled={submitting}
          >
            <Upload className="h-4 w-4 mr-2" />
            {submitting ? "提交中..." : "提交打卡"}
          </Button>
        </div>
      </div>
    </div>
  );
}

