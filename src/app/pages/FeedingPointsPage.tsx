import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Plus, MapPin, Pencil, Trash2, UtensilsCrossed } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
    listFeedingPoints,
    createFeedingPoint,
    updateFeedingPoint,
    deleteFeedingPoint,
    getStoredUser,
    isLoggedIn,
    type FeedingPointItem
} from "../api/client";

export default function FeedingPointsPage() {
    const navigate = useNavigate();
    const [points, setPoints] = useState<FeedingPointItem[]>([]);
    const [loading, setLoading] = useState(true);

    // 表单
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [name, setName] = useState("");
    const [latitude, setLatitude] = useState("");
    const [longitude, setLongitude] = useState("");
    const [description, setDescription] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const loadData = () => {
        setLoading(true);
        void listFeedingPoints()
            .then((res) => setPoints(res.items))
            .catch(() => setPoints([]))
            .finally(() => setLoading(false));
    };

    useEffect(() => { loadData(); }, []);

    const resetForm = () => {
        setShowForm(false);
        setEditId(null);
        setName("");
        setLatitude("");
        setLongitude("");
        setDescription("");
    };

    const openEdit = (p: FeedingPointItem) => {
        setEditId(p.id);
        setName(p.name);
        setLatitude(String(p.latitude));
        setLongitude(String(p.longitude));
        setDescription(p.description ?? "");
        setShowForm(true);
    };

    const handleSubmit = async () => {
        const trimmedName = name.trim();
        if (!trimmedName) { alert("请输入投喂点名称"); return; }
        const lat = Number(latitude);
        const lng = Number(longitude);
        if (!Number.isFinite(lat) || lat < -90 || lat > 90) { alert("请输入有效的纬度（-90 ~ 90）"); return; }
        if (!Number.isFinite(lng) || lng < -180 || lng > 180) { alert("请输入有效的经度（-180 ~ 180）"); return; }

        const user = getStoredUser();
        if (!user) { alert("请先登录"); navigate("/login"); return; }

        setSubmitting(true);
        try {
            if (editId) {
                await updateFeedingPoint(editId, { name: trimmedName, latitude: lat, longitude: lng, description: description.trim() || undefined });
                alert("修改成功！");
            } else {
                await createFeedingPoint({ name: trimmedName, latitude: lat, longitude: lng, description: description.trim() || undefined, created_by: user.id });
                alert("添加成功！");
            }
            resetForm();
            loadData();
        } catch (e: any) {
            alert(`操作失败：${e?.message ?? "未知错误"}`);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("确定要删除这个投喂点吗？")) return;
        try {
            await deleteFeedingPoint(id);
            loadData();
        } catch (e: any) {
            alert(`删除失败：${e?.message ?? "未知错误"}`);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* 顶部导航 */}
            <header className="bg-white shadow-sm sticky top-0 z-50">
                <div className="px-4 py-3 flex items-center gap-3">
                    <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-lg font-semibold flex-1">投喂点管理</h1>
                    {!showForm && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => { resetForm(); setShowForm(true); }}
                            className="text-purple-600 hover:text-purple-700"
                        >
                            <Plus className="h-4 w-4 mr-1" />
                            新增
                        </Button>
                    )}
                </div>
            </header>

            <div className="p-4 space-y-4">
                {/* 未登录提示 */}
                {!isLoggedIn() && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm text-orange-700">
                        请先<button onClick={() => navigate("/login")} className="text-orange-600 underline font-medium">登录</button>后再管理投喂点
                    </div>
                )}

                {/* 新增/编辑表单 */}
                {showForm && (
                    <div className="bg-white rounded-lg p-4 space-y-3">
                        <h2 className="font-semibold">{editId ? "编辑投喂点" : "新增投喂点"}</h2>
                        <div>
                            <Label className="mb-1 block text-sm">名称 *</Label>
                            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="如：图书馆后面" maxLength={100} />
                        </div>
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <Label className="mb-1 block text-sm">纬度 *</Label>
                                <Input value={latitude} onChange={(e) => setLatitude(e.target.value)} placeholder="31.9131" />
                            </div>
                            <div className="flex-1">
                                <Label className="mb-1 block text-sm">经度 *</Label>
                                <Input value={longitude} onChange={(e) => setLongitude(e.target.value)} placeholder="118.7804" />
                            </div>
                        </div>
                        <div>
                            <Label className="mb-1 block text-sm">描述</Label>
                            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="投喂点的位置描述..." rows={2} maxLength={500} />
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" className="flex-1" onClick={resetForm} disabled={submitting}>取消</Button>
                            <Button onClick={handleSubmit} disabled={submitting || !name.trim()} className="flex-1 bg-purple-600 hover:bg-purple-700">
                                {submitting ? "提交中..." : editId ? "保存修改" : "添加"}
                            </Button>
                        </div>
                    </div>
                )}

                {/* 投喂点列表 */}
                {loading ? (
                    <p className="text-center text-gray-500 py-8">加载中...</p>
                ) : points.length === 0 ? (
                    <div className="text-center py-12">
                        <UtensilsCrossed className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 mb-2">暂无投喂点</p>
                        <Button
                            onClick={() => { resetForm(); setShowForm(true); }}
                            className="bg-purple-600 hover:bg-purple-700"
                        >
                            <Plus className="h-4 w-4 mr-1" />
                            添加第一个投喂点
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {points.map((p) => (
                            <div key={p.id} className="bg-white rounded-lg p-4 shadow-sm">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <h3 className="font-semibold flex items-center gap-1">
                                            🍽️ {p.name}
                                        </h3>
                                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                            <MapPin className="h-3 w-3" />
                                            {p.latitude.toFixed(5)}, {p.longitude.toFixed(5)}
                                        </p>
                                        {p.description && (
                                            <p className="text-sm text-gray-600 mt-1">{p.description}</p>
                                        )}
                                    </div>
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="sm" onClick={() => openEdit(p)} className="text-gray-500">
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => handleDelete(p.id)} className="text-red-500">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
