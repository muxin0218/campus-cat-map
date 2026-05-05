import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Cat, ShieldCheck } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { createCat, getStoredUser, isLoggedIn } from "../api/client";
import type { Sex } from "../api/client";

export default function AddCatPage() {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [sex, setSex] = useState<Sex>("unknown");
    const [neutered, setNeutered] = useState<string>("unknown");
    const [description, setDescription] = useState("");
    const [latitude, setLatitude] = useState("");
    const [longitude, setLongitude] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        const trimmed = name.trim();
        if (!trimmed) {
            alert("请输入猫咪名称");
            return;
        }

        const user = getStoredUser();
        if (!user) {
            alert("请先登录后再添加猫咪");
            navigate("/login");
            return;
        }

        const lat = Number(latitude);
        const lng = Number(longitude);
        const hasPosition = Number.isFinite(lat) && lat >= -90 && lat <= 90 && Number.isFinite(lng) && lng >= -180 && lng <= 180;

        setSubmitting(true);
        try {
            const result = await createCat({
                name: trimmed,
                sex,
                description: description.trim() || undefined,
                neutered: neutered === "yes" ? true : neutered === "no" ? false : undefined,
                created_by: user.id,
                ...(hasPosition ? { latitude: lat, longitude: lng } : {})
            });
            alert("添加成功！已提交审核，请等待管理员审核通过。");
            navigate(`/gallery`);
        } catch (e: any) {
            alert(`添加失败：${e?.message ?? "未知错误"}`);
        } finally {
            setSubmitting(false);
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
                    <h1 className="text-lg font-semibold">添加猫咪</h1>
                </div>
            </header>

            <div className="p-4 space-y-4">
                {/* 温馨提示 */}
                {!isLoggedIn() && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm text-orange-700">
                        请先<button onClick={() => navigate("/login")} className="text-orange-600 underline font-medium">登录</button>后再添加猫咪
                    </div>
                )}

                {/* 猫咪名称 */}
                <div className="bg-white rounded-lg p-4">
                    <Label className="mb-2 block">
                        猫咪名称 <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        placeholder="输入猫咪昵称"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        maxLength={50}
                    />
                </div>

                {/* 性别选择 */}
                <div className="bg-white rounded-lg p-4">
                    <Label className="mb-3 block">
                        性别 <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex gap-3">
                        {([
                            { value: "unknown", label: "未知" },
                            { value: "male", label: "公猫" },
                            { value: "female", label: "母猫" }
                        ] as const).map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => setSex(option.value)}
                                className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition ${sex === option.value
                                    ? "border-purple-600 bg-purple-50 text-purple-700"
                                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                                    }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 绝育状态 */}
                <div className="bg-white rounded-lg p-4">
                    <Label className="mb-3 block">是否绝育</Label>
                    <div className="flex gap-3">
                        {([
                            { value: "unknown", label: "不清楚" },
                            { value: "yes", label: "已绝育" },
                            { value: "no", label: "未绝育" }
                        ] as const).map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => setNeutered(option.value)}
                                className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition ${neutered === option.value
                                    ? "border-purple-600 bg-purple-50 text-purple-700"
                                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                                    }`}
                            >
                                <ShieldCheck className="h-4 w-4 inline mr-1" />
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 位置信息 */}
                <div className="bg-white rounded-lg p-4">
                    <Label className="mb-2 block">常出没位置（可选）</Label>
                    <p className="text-xs text-gray-400 mb-2">设置后没有打卡记录时也会在地图上显示</p>
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <Input
                                placeholder="纬度（如 31.9131）"
                                value={latitude}
                                onChange={(e) => setLatitude(e.target.value)}
                            />
                        </div>
                        <div className="flex-1">
                            <Input
                                placeholder="经度（如 118.7804）"
                                value={longitude}
                                onChange={(e) => setLongitude(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* 描述 */}
                <div className="bg-white rounded-lg p-4">
                    <Label className="mb-2 block">描述</Label>
                    <Textarea
                        placeholder="描述猫咪的外貌特征、性格特点等..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                        maxLength={500}
                    />
                    <p className="text-xs text-gray-400 mt-1">{description.length}/500</p>
                </div>

                {/* 提交按钮 */}
                <Button
                    onClick={handleSubmit}
                    disabled={submitting || !name.trim()}
                    className="w-full py-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50"
                >
                    <Cat className="h-5 w-5 mr-2" />
                    {submitting ? "提交中..." : "提交添加"}
                </Button>
            </div>
        </div>
    );
}
