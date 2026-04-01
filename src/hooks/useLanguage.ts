import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type Language = 'zh' | 'en'

interface LanguageState {
    language: Language
    setLanguage: (lang: Language) => void
    t: (key: string) => string
}

// 中文翻译
const zhTranslations: Record<string, string> = {
    // Common
    'common.continueWithGithub': '继续使用 GitHub',
    'common.continueWithGoogle': '继续使用 Google',
    'common.orContinueWithEmail': '或继续使用邮箱',

    // Login
    'login.title': '欢迎回来',
    'login.subtitle': '登录到你的账户',
    'login.email': '邮箱地址',
    'login.password': '密码',
    'login.forgotPassword': '忘记密码？',
    'login.loginButton': '登录',
    'login.loggingIn': '登录中...',
    'login.newToNebulaHub': '还没有账户？',
    'login.createAccount': '立即注册',
    'login.errorPasswordMismatch': '密码不匹配',
    'login.errorLoginFailed': '登录失败',
    'login.errorNetworkError': '网络错误，请重试',
    'login.successLogin': '登录成功',
    'login.welcomeBack': '欢迎回来！正在跳转...',
    'login.githubLoginFailed': 'GitHub 登录失败',

    // Register
    'register.title': '创建账户',
    'register.subtitle': '加入 NebulaHub 社区',
    'register.username': '用户名',
    'register.email': '邮箱地址',
    'register.password': '密码',
    'register.confirmPassword': '确认密码',
    'register.registerButton': '创建账户',
    'register.creatingAccount': '创建账户中...',
    'register.orContinueWithEmail': '或使用邮箱注册',
    'register.usernameMin3': '用户名至少 3 个字符',
    'register.passwordMin6': '密码至少 6 个字符',
    'register.passwordMatch': '密码一致',
    'register.alreadyHaveAccount': '已经有账户？',
    'register.signIn': '立即登录',
    'register.passwordMismatch': '两次输入的密码不一致',
    'register.usernameTooShort': '用户名太短',
    'register.passwordTooShort': '密码太短',
    'register.successRegister': '注册成功',
    'register.welcomeToNebulaHub': '欢迎加入 NebulaHub！正在跳转...',
    'register.registerFailed': '注册失败',
    'register.githubRegisterFailed': 'GitHub 注册失败',
    'register.networkError': '网络错误，请重试',

    // Language
    'language.zh': '中文',
    'language.en': 'English',
    'language.switchTo': '切换语言',
}

// 英文翻译
const enTranslations: Record<string, string> = {
    // Common
    'common.continueWithGithub': 'Continue with GitHub',
    'common.continueWithGoogle': 'Continue with Google',
    'common.orContinueWithEmail': 'Or continue with email',

    // Login
    'login.title': 'Welcome back',
    'login.subtitle': 'Sign in to your account',
    'login.email': 'Email address',
    'login.password': 'Password',
    'login.forgotPassword': 'Forgot password?',
    'login.loginButton': 'Sign in',
    'login.loggingIn': 'Signing in...',
    'login.newToNebulaHub': 'New to NebulaHub?',
    'login.createAccount': 'Sign up now',
    'login.errorPasswordMismatch': 'Password mismatch',
    'login.errorLoginFailed': 'Login failed',
    'login.errorNetworkError': 'Network error, please try again',
    'login.successLogin': 'Login successful',
    'login.welcomeBack': 'Welcome back! Redirecting...',
    'login.githubLoginFailed': 'GitHub login failed',

    // Register
    'register.title': 'Create account',
    'register.subtitle': 'Join the NebulaHub community',
    'register.username': 'Username',
    'register.email': 'Email address',
    'register.password': 'Password',
    'register.confirmPassword': 'Confirm password',
    'register.registerButton': 'Create account',
    'register.creatingAccount': 'Creating account...',
    'register.orContinueWithEmail': 'Or register with email',
    'register.usernameMin3': 'Username must be at least 3 characters',
    'register.passwordMin6': 'Password must be at least 6 characters',
    'register.passwordMatch': 'Passwords match',
    'register.alreadyHaveAccount': 'Already have an account?',
    'register.signIn': 'Sign in now',
    'register.passwordMismatch': 'Passwords do not match',
    'register.usernameTooShort': 'Username is too short',
    'register.passwordTooShort': 'Password is too short',
    'register.successRegister': 'Registration successful',
    'register.welcomeToNebulaHub': 'Welcome to NebulaHub! Redirecting...',
    'register.registerFailed': 'Registration failed',
    'register.githubRegisterFailed': 'GitHub registration failed',
    'register.networkError': 'Network error, please try again',

    // Language
    'language.zh': '中文',
    'language.en': 'English',
    'language.switchTo': 'Switch Language',
}

export const useLanguage = create<LanguageState>()(
    persist(
        (set, get) => ({
            language: 'zh',
            setLanguage: (lang) => set({ language: lang }),
            t: (key: string): string => {
                const { language } = get()
                const translations = language === 'zh' ? zhTranslations : enTranslations
                return translations[key] || key
            },
        }),
        {
            name: 'language-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
)
