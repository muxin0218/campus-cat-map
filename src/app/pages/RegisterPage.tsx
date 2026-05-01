import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ArrowLeft, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import { authRegister } from '../api/client';

export default function RegisterPage() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // 密码强度检查
    const passwordChecks = {
        length: password.length >= 6,
        hasLetter: /[a-zA-Z]/.test(password),
        hasNumber: /\d/.test(password),
    };
    const passwordStrength = Object.values(passwordChecks).filter(Boolean).length;

    const handleRegister = async () => {
        if (!username.trim()) {
            setError('请填写用户名');
            return;
        }
        if (username.trim().length < 2) {
            setError('用户名至少2个字符');
            return;
        }
        if (password.length < 6) {
            setError('密码至少6个字符');
            return;
        }
        if (password !== confirmPassword) {
            setError('两次密码输入不一致');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await authRegister(username.trim(), password);
            // 注册成功，自动登录
            localStorage.setItem('auth_token', res.token);
            localStorage.setItem('auth_user', JSON.stringify(res.user));
            window.dispatchEvent(new Event('auth-change'));
            navigate('/');
        } catch (e: any) {
            setError(e?.message ?? '注册失败，请重试');
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleRegister();
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* 顶部导航 */}
            <header className="bg-white shadow-sm">
                <div className="px-4 py-3 flex items-center gap-3">
                    <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-lg font-semibold">注册</h1>
                </div>
            </header>

            <div className="flex-1 flex items-center justify-center px-4">
                <div className="w-full max-w-sm">
                    {/* Logo/标题 */}
                    <div className="text-center mb-8">
                        <div className="text-5xl mb-3">🐱</div>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            创建账号
                        </h2>
                        <p className="text-gray-500 mt-2">加入校园流浪猫地图</p>
                    </div>

                    {/* 注册表单 */}
                    <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
                        {error && (
                            <div className="bg-red-50 text-red-700 px-4 py-2 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">用户名</label>
                            <Input
                                placeholder="2-32个字符"
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
                                    placeholder="至少6个字符"
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

                            {/* 密码强度提示 */}
                            {password.length > 0 && (
                                <div className="mt-2 space-y-1">
                                    <div className="flex items-center gap-1 text-xs">
                                        {passwordChecks.length ? <CheckCircle className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-red-500" />}
                                        <span className={passwordChecks.length ? 'text-green-600' : 'text-red-600'}>至少6个字符</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs">
                                        {passwordChecks.hasLetter ? <CheckCircle className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-red-500" />}
                                        <span className={passwordChecks.hasLetter ? 'text-green-600' : 'text-red-600'}>包含字母</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs">
                                        {passwordChecks.hasNumber ? <CheckCircle className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-red-500" />}
                                        <span className={passwordChecks.hasNumber ? 'text-green-600' : 'text-red-600'}>包含数字</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">确认密码</label>
                            <Input
                                type="password"
                                placeholder="再次输入密码"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                        </div>

                        <Button
                            onClick={handleRegister}
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        >
                            {loading ? '注册中...' : '注册'}
                        </Button>

                        <div className="text-center text-sm text-gray-500">
                            已有账号？
                            <button
                                onClick={() => navigate('/login')}
                                className="text-purple-600 hover:text-purple-700 font-medium ml-1"
                            >
                                立即登录
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
