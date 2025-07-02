import React, { useEffect, useState } from 'react';
import { Eye, EyeOff, Mail, User, Lock, ArrowLeft, CheckCircle} from 'lucide-react';
import { makeRequest } from '../../hook/useApi';
import { db } from '../../dexieDB';
import { isSending, notifyError } from '../../utils/useutils';
import { useGoogleLogin } from '@react-oauth/google';
import { signUpApi } from '../../api';

const WordStakeSignUp: React.FC = () => {
    const [formData, setFormData] = useState<any>({
        username: '',
        email: '',
        password: '',
        isGoogleAuth:false
    });

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const [errors, setErrors] = useState<any>({});
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [agreedToTerms, setAgreedToTerms] = useState<boolean>(false);

    const GoogleIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
        <svg className={className} viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
    );

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        // Username validation
        if (!formData.username.trim()) {
            newErrors.username = 'Username is required';
        } else if (formData.username.length < 3) {
            newErrors.username = 'Username must be at least 3 characters';
        } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
            newErrors.username = 'Username can only contain letters, numbers, and underscores';
        }

        // Email validation
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
            newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear error when user starts typing
        if (errors[name as keyof FormErrors]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!agreedToTerms) { alert('Please agree to the Terms of Service and Privacy Policy'); return }
        if (!validateForm()) return;
        setIsLoading(true);
        const { res, error } = await makeRequest("POST", signUpApi, formData, () => { setIsLoading(false) }, null, null, "urlencoded");
        if (res) {
            localStorage.setItem('ws_refresh_token', res?.data?.jwt);
            await db.cached_data.put(res?.data.gamer, `gamer_${res?.data?.jwt}`);
            setIsLoading(false);
            window.location.href = '/wordstake'
        }
        if (error) { setIsLoading(false) };
    };

    const handleBackToHome = () => {
        console.log('Back to home clicked');
    };

    const handleGoogleSignUp: () => void = useGoogleLogin({
        onSuccess: (tokenResponse) => handleSuccess(tokenResponse),
        onError: () => notifyError('Login Failed')
    });

    const handleSuccess = async (response: any) => {
        const googleres: any = await makeRequest('GET', 'https://www.googleapis.com/oauth2/v3/userinfo', null, null, response?.access_token, 'urlencoded');
        if (googleres) {
            isSending(true, 'Please Wait');
            const cb = () => { isSending(false); };
            const formDatas = { email: googleres?.res?.email, isGoogleAuth: true };
            const { res, error } = await makeRequest('POST', signUpApi, formDatas, cb, null, null, "urlencoded");
            if (res) {
                localStorage.setItem('ws_refresh_token', res?.data?.jwt);
                await db.cached_data.put(res?.data.gamer, `gamer_${res?.data?.jwt}`);
                setIsLoading(false);
                window.location.href = '/wordstake'
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute w-96 h-96 bg-purple-600 rounded-full blur-3xl top-10 -left-20"></div>
                <div className="absolute w-80 h-80 bg-blue-600 rounded-full blur-3xl bottom-10 -right-20"></div>
                <div className="absolute w-64 h-64 bg-cyan-600 rounded-full blur-3xl top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
            </div>
            {/* Back Button */}
            <button
                onClick={handleBackToHome}
                className="absolute top-6 left-6 z-10 flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
            >
                <ArrowLeft className="w-5 h-5" />
            </button>
            {/* Main Content */}
            <div className="relative z-10 flex items-center justify-center min-h-screen p-4">

                <div className="w-full max-w-md">

                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold mb-2">Play WordStake</h1>
                    </div>

                    {/* Sign-up Form */}
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">

                        <div className="space-y-6">

                            {/* Username Field */}
                            <div>
                                <label htmlFor="username" className="block text-sm font-medium mb-2">
                                    Username
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        id="username"
                                        name="username"
                                        value={formData?.username}
                                        onChange={handleInputChange}
                                        className={`w-full pl-12 pr-4 py-3 bg-gray-700/50 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${errors.username ? 'border-red-500' : 'border-gray-600'
                                            }`}
                                        placeholder="Enter your username"
                                    />
                                </div>
                                {errors.username && (
                                    <p className="text-red-400 text-sm mt-1">{errors?.username}</p>
                                )}
                            </div>

                            {/* Email Field */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData?.email}
                                        onChange={handleInputChange}
                                        className={`w-full pl-12 pr-4 py-3 bg-gray-700/50 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${errors.email ? 'border-red-500' : 'border-gray-600'
                                            }`}
                                        placeholder="Enter your email"
                                    />
                                </div>
                                {errors?.email && (
                                    <p className="text-red-400 text-sm mt-1">{errors?.email}</p>
                                )}
                            </div>

                            {/* Password Field */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        name="password"
                                        value={formData?.password}
                                        onChange={handleInputChange}
                                        className={`w-full pl-12 pr-12 py-3 bg-gray-700/50 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${errors.password ? 'border-red-500' : 'border-gray-600'
                                            }`}
                                        placeholder="Create a strong password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="text-red-400 text-sm mt-1">{errors.password}</p>
                                )}
                            </div>

                            {/* Terms Agreement */}
                            <div className="flex items-start space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setAgreedToTerms(!agreedToTerms)}
                                    className="mt-0.5 flex-shrink-0"
                                >
                                    {agreedToTerms ? (
                                        <CheckCircle className="w-5 h-5 text-purple-500" />
                                    ) : (
                                        <div className="w-5 h-5 border-2 border-gray-400 rounded"></div>
                                    )}
                                </button>
                                <p className="text-sm text-gray-400">
                                    I agree to the{' '}
                                    <a href="#" className="text-purple-400 hover:text-purple-300">Terms of Service</a>
                                    {' '}and{' '}
                                    <a href="#" className="text-purple-400 hover:text-purple-300">Privacy Policy</a>
                                </p>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                onClick={handleSubmit}
                                disabled={isLoading || !agreedToTerms}
                                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed py-3 rounded-lg font-semibold transition-all transform hover:scale-[1.02] disabled:hover:scale-100"
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center space-x-2">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>Creating Account...</span>
                                    </div>
                                ) : (
                                    'Create Account'
                                )}
                            </button>
                        </div>

                        {/* Divider */}
                        <div className="my-6 flex items-center">
                            <div className="flex-1 border-t border-gray-600"></div>
                            <span className="px-4 text-gray-400 text-sm">OR</span>
                            <div className="flex-1 border-t border-gray-600"></div>
                        </div>

                        {/* Alternative Sign-up Options */}
                        <div className="space-y-3">
                            {/* Google Sign-up */}
                            <button
                                onClick={handleGoogleSignUp}
                                className="w-full flex items-center justify-center space-x-3 py-3 border border-gray-600 rounded-lg hover:bg-gray-700/50 transition-all"
                            >
                                <GoogleIcon />
                                <span>Sign up with Google</span>
                            </button>

                            {/* Wallet Connect */}
                            {/* <button
                                onClick={handleWalletConnect}
                                className="w-full flex items-center justify-center space-x-3 py-3 border border-gray-600 rounded-lg hover:bg-gray-700/50 transition-all"
                            >
                                <Wallet className="w-5 h-5" />
                                <span>Connect Wallet</span>
                            </button> */}
                        </div>

                        {/* Sign-in Link */}
                        <div className="mt-6 text-center">
                            <p className="text-gray-400">
                                Already have an account?{''}
                                <a href="#" className="text-purple-400 hover:text-purple-300 font-medium">
                                    Sign in
                                </a>
                            </p>
                        </div>

                    </div>

                </div>

            </div>
        </div>
    );
};

export default WordStakeSignUp;