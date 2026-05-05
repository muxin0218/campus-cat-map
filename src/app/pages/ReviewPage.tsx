import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import BottomNav from "../components/BottomNav";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { ArrowLeft, Shield, Check, X, RefreshCw } from "lucide-react";
import {
    listCats,
    listSightings,
    listFeedingEvents,
    reviewCat,
    reviewSighting,
    reviewFeedingEvent,
    checkIsAdmin,
} from "../api/client";
import type { CatListItem, SightingItem, FeedingEventItem } from "../api/client";

type Tab = "cats" | "sightings" | "feeding-events";

export default function ReviewPage() {
    const navigate = useNavigate();
    const [tab, setTab] = useState<Tab>("cats");
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<number | null>(null);

    const [pendingCats, setPendingCats] = useState<CatListItem[]>([]);
    const [pendingSightings, setPendingSightings] = useState<SightingItem[]>([]);
    const [pendingFeedEvents, setPendingFeedEvents] = useState<FeedingEventItem[]>([]);

    useEffect(() => {
        void checkIsAdmin().then(setIsAdmin);
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [cats, sightings, feedEvents] = await Promise.all([
                listCats({ status: "pending", limit: 100 }, { auth: true }),
                listSightings({ status: "pending", limit: 100 }, { auth: true }),
                listFeedingEvents({ status: "pending", limit: 100 }, { auth: true }),
            ]);
            setPendingCats(cats.items);
            setPendingSightings(sightings.items);
            setPendingFeedEvents(feedEvents.items);
        } catch (err) {
            console.error("加载待审核数据失败", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAdmin) loadData();
        else setLoading(false);
    }, [isAdmin]);

    const handleApprove = async (type: Tab, id: number) => {
        setProcessingId(id);
        try {
            if (type === "cats") {
                await reviewCat(id, "approved");
                setPendingCats((prev) => prev.filter((c) => c.id !== id));
            } else if (type === "sightings") {
                await reviewSighting(id, "approved");
                setPendingSightings((prev) => prev.filter((s) => s.id !== id));
            } else {
                await reviewFeedingEvent(id, "approved");
                setPendingFeedEvents((prev) => prev.filter((e) => e.id !== id));
            }
        } catch (err) {
            console.error("审核通过失败", err);
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (type: Tab, id: number) => {
        setProcessingId(id);
        try {
            if (type === "cats") {
                await reviewCat(id, "rejected");
                setPendingCats((prev) => prev.filter((c) => c.id !== id));
            } else if (type === "sightings") {
                await reviewSighting(id, "rejected");
                setPendingSightings((prev) => prev.filter((s) => s.id !== id));
            } else {
                await reviewFeedingEvent(id, "rejected");
                setPendingFeedEvents((prev) => prev.filter((e) => e.id !== id));
            }
        } catch (err) {
            console.error("审核拒绝失败", err);
        } finally {
            setProcessingId(null);
        }
    };

    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center pb-16">
                <Shield className="h-16 w-16 text-gray-300 mb-4" />
                <p className="text-gray-500">无权限，仅管理员可访问</p>
                <Button variant="outline" className="mt-4" onClick={() => navigate("/profile")}>
                    返回个人中心
                </Button>
                <BottomNav />
            </div>
        );
    }

    const tabs: { key: Tab; label: string; count: number }[] = [
        { key: "cats", label: "猫咪", count: pendingCats.length },
        { key: "sightings", label: "打卡", count: pendingSightings.length },
        { key: "feeding-events", label: "投喂", count: pendingFeedEvents.length },
    ];

    return (
        <div className="min-h-screen bg-gray-50 pb-16">
            {/* 顶部 */}
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
                    <h1 className="text-lg font-semibold">审核管理</h1>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={loadData}
                        className="text-white hover:bg-white/20"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                    </Button>
                </div>
            </header>

            {/* Tab */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="flex">
                    {tabs.map((t) => (
                        <button
                            key={t.key}
                            onClick={() => setTab(t.key)}
                            className={`flex-1 py-3 text-sm font-medium text-center border-b-2 transition ${tab === t.key
                                ? "border-purple-600 text-purple-600"
                                : "border-transparent text-gray-500"
                                }`}
                        >
                            {t.label}
                            {t.count > 0 && (
                                <Badge className="ml-1 bg-purple-100 text-purple-700 border-none">
                                    {t.count}
                                </Badge>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* 内容 */}
            <div className="px-4 py-4">
                {loading ? (
                    <p className="text-gray-500 text-center py-8">加载中...</p>
                ) : tab === "cats" && pendingCats.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">暂无待审核猫咪</p>
                ) : tab === "sightings" && pendingSightings.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">暂无待审核打卡</p>
                ) : tab === "feeding-events" && pendingFeedEvents.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">暂无待审核投喂记录</p>
                ) : null}

                {/* 猫咪 */}
                {tab === "cats" &&
                    pendingCats.map((cat) => (
                        <div
                            key={cat.id}
                            className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-3"
                        >
                            <div className="flex gap-3">
                                <img
                                    src={
                                        cat.photo_url ??
                                        "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=200"
                                    }
                                    alt={cat.name}
                                    className="w-16 h-16 rounded-lg object-cover"
                                />
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold">{cat.name}</h3>
                                    <p className="text-sm text-gray-500 truncate">
                                        {cat.description || "暂无描述"}
                                    </p>
                                    <div className="flex gap-2 mt-1">
                                        <Badge variant="outline" className="text-xs">
                                            {cat.sex === "male" ? "♂" : cat.sex === "female" ? "♀" : "未知"}
                                        </Badge>
                                        {cat.neutered && (
                                            <Badge variant="outline" className="text-xs">
                                                已绝育
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2 mt-3">
                                <Button
                                    size="sm"
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                    disabled={processingId === cat.id}
                                    onClick={() => handleApprove("cats", cat.id)}
                                >
                                    <Check className="h-4 w-4 mr-1" />
                                    通过
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                                    disabled={processingId === cat.id}
                                    onClick={() => handleReject("cats", cat.id)}
                                >
                                    <X className="h-4 w-4 mr-1" />
                                    拒绝
                                </Button>
                            </div>
                        </div>
                    ))}

                {/* 打卡 */}
                {tab === "sightings" &&
                    pendingSightings.map((s) => (
                        <div
                            key={s.id}
                            className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-3"
                        >
                            <div className="flex gap-3">
                                {s.photo_url && (
                                    <img
                                        src={s.photo_url}
                                        alt="打卡照片"
                                        className="w-16 h-16 rounded-lg object-cover"
                                    />
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium">猫咪 #{s.cat_id}</span>
                                        {" · "}
                                        {new Date(s.happened_at).toLocaleString()}
                                    </p>
                                    <p className="text-sm text-gray-500 truncate mt-1">
                                        {s.note || "（无备注）"}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {s.latitude.toFixed(5)}, {s.longitude.toFixed(5)}
                                        {s.reporter_username && ` · ${s.reporter_username}`}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2 mt-3">
                                <Button
                                    size="sm"
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                    disabled={processingId === s.id}
                                    onClick={() => handleApprove("sightings", s.id)}
                                >
                                    <Check className="h-4 w-4 mr-1" />
                                    通过
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                                    disabled={processingId === s.id}
                                    onClick={() => handleReject("sightings", s.id)}
                                >
                                    <X className="h-4 w-4 mr-1" />
                                    拒绝
                                </Button>
                            </div>
                        </div>
                    ))}

                {/* 投喂 */}
                {tab === "feeding-events" &&
                    pendingFeedEvents.map((e) => (
                        <div
                            key={e.id}
                            className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-3"
                        >
                            <div className="flex gap-3">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium">{e.feeding_point_name || `投喂点 #${e.feeding_point_id}`}</span>
                                        {e.cat_id && <> · 猫咪 #{e.cat_id}</>}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {e.food_type && `食物: ${e.food_type}`}
                                        {e.amount && ` · ${e.amount}`}
                                        {!e.food_type && !e.amount && "（无详细信息）"}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {new Date(e.fed_at).toLocaleString()}
                                        {e.feeder_username && ` · ${e.feeder_username}`}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2 mt-3">
                                <Button
                                    size="sm"
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                    disabled={processingId === e.id}
                                    onClick={() => handleApprove("feeding-events", e.id)}
                                >
                                    <Check className="h-4 w-4 mr-1" />
                                    通过
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                                    disabled={processingId === e.id}
                                    onClick={() => handleReject("feeding-events", e.id)}
                                >
                                    <X className="h-4 w-4 mr-1" />
                                    拒绝
                                </Button>
                            </div>
                        </div>
                    ))}
            </div>

            <BottomNav />
        </div>
    );
}
