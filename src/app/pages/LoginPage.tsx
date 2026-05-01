import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { authLogin } from '../api/client';

export default function LoginPage() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async () => {
        if (!username.trim() || !password) {
            setError('请填写用户名和密码');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await authLogin(username.trim(), password);
            // 保存 token 和用户信息到 localStorage
            localStorage.setItem('auth_token', res.token);
            localStorage.setItem('auth_user', JSON.stringify(res.user));
            // 触发 storage 事件让其他页面知道登录状态变了
            window.dispatchEvent(new Event('auth-change'));
            navigate('/');
        } catch (e: any) {
            setError(e?.message ?? '登录失败，请重试');
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleLogin();
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* 顶部导航 */}
            <header className="bg-white shadow-sm">
                <div className="px-4 py-3 flex items-center gap-3">
                    <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-lg font-semibold">登录</h1>
                </div>
            </header>

            <div className="flex-1 flex items-center justify-center px-4">
                <div className="w-full max-w-sm">
                    {/* Logo/标题 */}
                    <div className="text-center mb-8">
                        <div className="text-5xl mb-3">🐱</div>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            校园流浪猫地图
                        </h2>
                        <p className="text-gray-500 mt-2">登录以使用完整功能</p>
                    </div>

                    {/* 登录表单 */}
                    <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
                        {error && (
                            <div className="bg-red-50 text-red-700 px-4 py-2 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">用户名</label>
                            <Input
                                placeholder="请输入用户名"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                onKeyDown={handleKeyDown}
                                autoFocus
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
                            <div className="relative">
                                <Input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="请输入密码"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <Button
                            onClick={handleLogin}
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        >
                            {loading ? '登录中...' : '登录'}
                        </Button>

                        <div className="text-center text-sm text-gray-500">
                            还没有账号？
                            <button
                                onClick={() => navigate('/register')}
                                className="text-purple-600 hover:text-purple-700 font-medium ml-1"
                            >
                                立即注册
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
