import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import BottomNav from '../components/BottomNav';
import { ArrowLeft, TrendingUp, Award, Calendar, Users } from 'lucide-react';
import { listCats, listSightings, listFeedingEvents } from '../api/client';
import type { CatListItem, SightingItem, FeedingEventItem } from '../api/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [cats, setCats] = useState<CatListItem[]>([]);
  const [sightings, setSightings] = useState<SightingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void Promise.all([
      listCats({ limit: 100 }),
      listSightings({ limit: 200 })
    ])
      .then(([catsRes, sightingsRes]) => {
        setCats(catsRes.items);
        setSightings(sightingsRes.items);
      })
      .catch(() => {
        setCats([]);
        setSightings([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // 猫咪性别分布
  const maleCount = cats.filter((c) => c.sex === 'male').length;
  const femaleCount = cats.filter((c) => c.sex === 'female').length;
  const unknownSexCount = cats.filter((c) => c.sex === 'unknown').length;

  const genderData = [
    { name: '公猫', value: maleCount || 1, color: '#667eea' },
    { name: '母猫', value: femaleCount || 1, color: '#f093fb' },
  ];
  if (unknownSexCount > 0) {
    genderData.push({ name: '未知', value: unknownSexCount, color: '#94a3b8' });
  }

  // 绝育状态
  const neuteredCount = cats.filter((c) => c.neutered).length;
  const notNeuteredCount = cats.length - neuteredCount;

  const neuteredData = [
    { name: '已绝育', value: neuteredCount || 1, color: '#4ade80' },
    { name: '未绝育', value: notNeuteredCount || 1, color: '#fb923c' },
  ];

  // 近 7 天打卡趋势（按具体日期）
  const dateLabels: string[] = [];
  const dateCounts: number[] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    dateLabels.push(`${d.getMonth() + 1}/${d.getDate()}`);
    dateCounts.push(0);
  }
  for (const s of sightings) {
    const d = new Date(s.happened_at);
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays >= 0 && diffDays < 7) {
      const idx = 6 - diffDays;
      dateCounts[idx]++;
    }
  }
  const weeklyData = dateLabels.map((label, i) => ({
    date: label,
    count: dateCounts[i]
  }));

  // 出现点位数量
  const locationSet = new Set<string>();
  for (const s of sightings) {
    locationSet.add(`${s.latitude.toFixed(4)},${s.longitude.toFixed(4)}`);
  }

  // 明星猫咪排行（按 sightings 数量）
  const catSightingCount = new Map<number, number>();
  for (const s of sightings) {
    catSightingCount.set(s.cat_id, (catSightingCount.get(s.cat_id) ?? 0) + 1);
  }
  const topCats = cats
    .map((cat) => ({
      id: cat.id,
      name: cat.name,
      checkIns: catSightingCount.get(cat.id) ?? 0,
      photo_url: cat.photo_url
    }))
    .sort((a, b) => b.checkIns - a.checkIns)
    .slice(0, 3);

  // 积极用户排行（按 sightings 数量）
  const userSightingCount = new Map<string, { username: string; count: number; photoSeed: string }>();
  for (const s of sightings) {
    const name = s.reporter_username ?? '匿名用户';
    const seed = s.reporter_username ?? `user_${s.reporter_id}`;
    const entry = userSightingCount.get(name) ?? { username: name, count: 0, photoSeed: seed };
    entry.count++;
    userSightingCount.set(name, entry);
  }
  const topUsers = Array.from(userSightingCount.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">加载中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
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
          <h1 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            数据看板
          </h1>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* 核心指标 */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90">校园流浪猫</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{cats.length}</p>
              <p className="text-xs opacity-75 mt-1">已记录 {cats.length} 只</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90">总打卡数</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{sightings.length}</p>
              <p className="text-xs opacity-75 mt-1">累计记录</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-teal-500 text-white border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90">投喂记录</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {sightings.filter((s) => s.note?.includes('[feeding]')).length}
              </p>
              <p className="text-xs opacity-75 mt-1">含投喂标记</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90">出现点位</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{locationSet.size}</p>
              <p className="text-xs opacity-75 mt-1">不同位置</p>
            </CardContent>
          </Card>
        </div>

        {/* 近 7 天打卡趋势 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4 text-purple-600" />
              近 7 天打卡趋势
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip labelFormatter={(label) => `${label}`} formatter={(value: number) => [value, '打卡次数']} />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#667eea"
                  strokeWidth={2}
                  dot={{ fill: '#667eea', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 猫咪分布统计 */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">性别分布</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie
                    data={genderData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={50}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {genderData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">绝育状态</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie
                    data={neuteredData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={50}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {neuteredData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* 明星猫咪排行榜 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Award className="h-4 w-4 text-yellow-600" />
              明星猫咪排行榜
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topCats.length > 0 ? topCats.map((cat, index) => (
                <div key={cat.id} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${index === 0 ? 'bg-yellow-500' :
                    index === 1 ? 'bg-gray-400' :
                      'bg-orange-600'
                    }`}>
                    {index + 1}
                  </div>
                  <img
                    src={cat.photo_url ?? 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400'}
                    alt={cat.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{cat.name}</p>
                    <p className="text-xs text-gray-500">{cat.checkIns} 次打卡</p>
                  </div>
                  {index === 0 && <span className="text-2xl">👑</span>}
                </div>
              )) : (
                <p className="text-sm text-gray-500 text-center py-4">暂无数据</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 积极用户排行榜 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              积极用户排行榜
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topUsers.length > 0 ? topUsers.map((user, index) => (
                <div key={user.username} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${index === 0 ? 'bg-yellow-500' :
                    index === 1 ? 'bg-gray-400' :
                      'bg-orange-600'
                    }`}>
                    {index + 1}
                  </div>
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.photoSeed)}`}
                    alt={user.username}
                    className="w-12 h-12 rounded-full object-cover bg-gray-100"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{user.username}</p>
                    <p className="text-xs text-gray-500">{user.count} 次打卡</p>
                  </div>
                  {index === 0 && <span className="text-2xl">🏆</span>}
                </div>
              )) : (
                <p className="text-sm text-gray-500 text-center py-4">暂无数据</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      <BottomNav />
    </div>
  );
}
