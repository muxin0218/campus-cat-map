import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, TrendingUp, Users, Heart, MapPin, Award, Calendar } from 'lucide-react';
import { mockStats, mockCats, mockCheckIns } from '../data/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

export default function DashboardPage() {
  const navigate = useNavigate();

  // 位置投喂频次数据
  const locationData = [
    { name: '图书馆', count: 45 },
    { name: '食堂', count: 38 },
    { name: '教学楼', count: 28 },
    { name: '宿舍', count: 22 },
    { name: '体育馆', count: 15 },
  ];

  // 猫咪性别分布
  const genderData = [
    { name: '公猫', value: 3, color: '#667eea' },
    { name: '母猫', value: 2, color: '#f093fb' },
  ];

  // 绝育状态
  const neuteredData = [
    { name: '已绝育', value: 4, color: '#4ade80' },
    { name: '未绝育', value: 1, color: '#fb923c' },
  ];

  // 每周打卡趋势
  const weeklyData = [
    { day: '周一', count: 12 },
    { day: '周二', count: 19 },
    { day: '周三', count: 15 },
    { day: '周四', count: 22 },
    { day: '周五', count: 28 },
    { day: '周六', count: 35 },
    { day: '周日', count: 30 },
  ];

  // 明星猫咪排行
  const topCats = [
    { name: '小橘', checkIns: 45, image: mockCats[0].image },
    { name: '奶牛', checkIns: 38, image: mockCats[2].image },
    { name: '雪球', checkIns: 28, image: mockCats[3].image },
  ];

  // 活跃用户排行
  const topUsers = [
    { name: '张三', count: 25, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix' },
    { name: '李四', count: 18, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucy' },
    { name: '王五', count: 15, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Max' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
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
              <p className="text-3xl font-bold">{mockStats.totalCats}</p>
              <p className="text-xs opacity-75 mt-1">活跃: {mockStats.activeCats} 只</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90">总打卡数</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{mockStats.totalCheckIns}</p>
              <p className="text-xs opacity-75 mt-1">本月新增: 86</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-teal-500 text-white border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90">投喂记录</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{mockStats.totalFeedings}</p>
              <p className="text-xs opacity-75 mt-1">今日: 12 次</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90">参与用户</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">156</p>
              <p className="text-xs opacity-75 mt-1">活跃: 89 人</p>
            </CardContent>
          </Card>
        </div>

        {/* 每周打卡趋势 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4 text-purple-600" />
              每周打卡趋势
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
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

        {/* 各点位投喂频次 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4 text-purple-600" />
              各点位投喂频次
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={locationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="url(#colorGradient)" radius={[8, 8, 0, 0]} />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#667eea" />
                    <stop offset="100%" stopColor="#764ba2" />
                  </linearGradient>
                </defs>
              </BarChart>
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
              {topCats.map((cat, index) => (
                <div key={cat.name} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                    index === 0 ? 'bg-yellow-500' :
                    index === 1 ? 'bg-gray-400' :
                    'bg-orange-600'
                  }`}>
                    {index + 1}
                  </div>
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{cat.name}</p>
                    <p className="text-xs text-gray-500">{cat.checkIns} 次打卡</p>
                  </div>
                  {index === 0 && <span className="text-2xl">👑</span>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 活跃用户榜 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-600" />
              活跃投喂/打卡用户榜
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topUsers.map((user, index) => (
                <div key={user.name} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                    index === 0 ? 'bg-purple-500' :
                    index === 1 ? 'bg-pink-500' :
                    'bg-indigo-500'
                  }`}>
                    {index + 1}
                  </div>
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.count} 次贡献</p>
                  </div>
                  <Badge variant="secondary">
                    爱心使者
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
