import React, { useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile as updateFirebaseAuthProfile,
} from 'firebase/auth';
import {
  GraduationCap,
  Mail,
  Lock,
  User,
  Building2,
  BookOpen,
  ShieldCheck,
  AlertCircle,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { auth, googleProvider } from '../lib/firebase';
import { createUserProfile, fetchUserProfile } from '../lib/firestoreService';
import { CAMPUSES } from '../data/sampleData';
import { UserProfile } from '../types';

interface AuthScreenProps {
  reasonMessage?: string;
  onSuccess: (profile: UserProfile) => void;
  onBack?: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error') => void;
}

export function AuthScreen({ reasonMessage, onSuccess, onBack, onShowToast }: AuthScreenProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [university, setUniversity] = useState(CAMPUSES[0].name);
  const [department, setDepartment] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showEmailEnableGuide, setShowEmailEnableGuide] = useState(false);

  const mapFirebaseAuthError = (code?: string): string => {
    switch (code) {
      case 'auth/email-already-in-use':
        return '이미 가입된 이메일 주소입니다. 로그인 탭에서 로그인해 주세요.';
      case 'auth/invalid-email':
        return '올바른 이메일 형식을 입력해 주세요.';
      case 'auth/weak-password':
        return '비밀번호는 6자 이상으로 입력해 주세요.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return '이메일 또는 비밀번호가 올바르지 않습니다.';
      case 'auth/operation-not-allowed':
        setShowEmailEnableGuide(true);
        return 'Firebase 콘솔에서 이메일/비밀번호 로그인이 아직 활성화되지 않았습니다. 아래 안내를 참고하거나 Google 계정으로 바로 시작해 보세요.';
      case 'auth/popup-closed-by-user':
        return 'Google 로그인 창이 닫혔습니다. 다시 시도해 주세요.';
      case 'auth/too-many-requests':
        return '잠시 후 다시 시도해 주세요.';
      default:
        return '인증 처리 중 오류가 발생했습니다. 입력 정보를 확인해 주세요.';
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setShowEmailEnableGuide(false);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setErrorMsg('이메일과 비밀번호를 모두 입력해 주세요.');
      return;
    }

    if (mode === 'signup') {
      if (!nickname.trim()) {
        setErrorMsg('닉네임을 입력해 주세요. (예: 김민준)');
        return;
      }
      if (!department.trim()) {
        setErrorMsg('학과/학번을 입력해 주세요. (예: 컴퓨터공학과 24학번)');
        return;
      }
      if (password.length < 6) {
        setErrorMsg('비밀번호는 6자 이상이어야 합니다.');
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === 'signup') {
        const cred = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
        await updateFirebaseAuthProfile(cred.user, {
          displayName: nickname.trim(),
        }).catch(() => undefined);

        const created = await createUserProfile(cred.user.uid, {
          nickname: nickname.trim(),
          university,
          department: department.trim(),
        });
        onShowToast('회원가입 및 재학생 인증이 완료되었습니다!');
        onSuccess(created);
      } else {
        const cred = await signInWithEmailAndPassword(auth, trimmedEmail, password);
        let profile = await fetchUserProfile(cred.user.uid);
        if (!profile) {
          profile = await createUserProfile(cred.user.uid, {
            nickname: cred.user.displayName || trimmedEmail.split('@')[0] || '캠퍼스학우',
            university: CAMPUSES[0].name,
            department: '컴퓨터공학과 24학번',
          });
        }
        onShowToast(`${profile.nickname}님, 환영합니다!`);
        onSuccess(profile);
      }
    } catch (err) {
      const code = (err as { code?: string })?.code;
      setErrorMsg(mapFirebaseAuthError(code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    setShowEmailEnableGuide(false);
    setLoading(true);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      let profile = await fetchUserProfile(cred.user.uid);
      if (!profile) {
        profile = await createUserProfile(cred.user.uid, {
          nickname: (nickname.trim() || cred.user.displayName || '김민준').slice(0, 30),
          university: university || CAMPUSES[0].name,
          department: department.trim() || '컴퓨터공학과 24학번',
          avatarUrl: cred.user.photoURL || undefined,
        });
      }
      onShowToast(`${profile.nickname}님, 캠퍼스마켓에 오신 걸 환영해요!`);
      onSuccess(profile);
    } catch (err) {
      const code = (err as { code?: string })?.code;
      setErrorMsg(mapFirebaseAuthError(code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-76px)] bg-[#F8FAFC] pb-28">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 h-14 bg-white border-b border-slate-100 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              aria-label="뒤로 가기"
              className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <span className="text-[16px] font-bold text-slate-900">
            {mode === 'login' ? '로그인' : '회원가입'}
          </span>
        </div>
        <div className="w-9 h-9 rounded-full bg-blue-50 text-[#2563EB] flex items-center justify-center">
          <GraduationCap className="w-5 h-5" />
        </div>
      </header>

      <div className="px-5 pt-6">
        {/* Brand Hero */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[#2563EB] text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-600/25">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h1 className="text-[22px] font-extrabold text-slate-900 tracking-tight">캠퍼스마켓</h1>
          <p className="text-[13px] text-slate-500 mt-1">
            {reasonMessage || '교내 재학생 인증 후 안전한 직거래를 시작하세요'}
          </p>
        </div>

        {/* Mode Segmented Tabs */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl mb-5">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg(null);
            }}
            className={`h-11 rounded-xl text-[14px] font-bold transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-white text-[#2563EB] shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            로그인
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMsg(null);
            }}
            className={`h-11 rounded-xl text-[14px] font-bold transition-all cursor-pointer ${
              mode === 'signup'
                ? 'bg-white text-[#2563EB] shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            회원가입
          </button>
        </div>

        {/* Form Card */}
        <form
          onSubmit={handleEmailSubmit}
          className="bg-white rounded-3xl p-5 shadow-[0_4px_20px_rgba(15,23,42,0.04)] border border-slate-100 space-y-4"
        >
          <div>
            <label className="block text-[13px] font-bold text-slate-700 mb-1.5">이메일</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@yonsei.ac.kr"
                autoComplete="email"
                className="w-full h-12 pl-10 pr-4 rounded-xl bg-[#F1F5F9] text-[14px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-bold text-slate-700 mb-1.5">비밀번호</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="6자 이상 입력해 주세요"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                className="w-full h-12 pl-10 pr-4 rounded-xl bg-[#F1F5F9] text-[14px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:bg-white transition-all"
              />
            </div>
          </div>

          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-[13px] font-bold text-slate-700 mb-1.5">닉네임</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="예: 김민준"
                    maxLength={30}
                    className="w-full h-12 pl-10 pr-4 rounded-xl bg-[#F1F5F9] text-[14px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-bold text-slate-700 mb-1.5">대학교 선택</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    className="w-full h-12 pl-10 pr-4 rounded-xl bg-[#F1F5F9] text-[14px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:bg-white transition-all appearance-none cursor-pointer"
                  >
                    {CAMPUSES.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-bold text-slate-700 mb-1.5">학과 / 학번</label>
                <div className="relative">
                  <BookOpen className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="예: 컴퓨터공학과 24학번"
                    maxLength={60}
                    className="w-full h-12 pl-10 pr-4 rounded-xl bg-[#F1F5F9] text-[14px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="flex items-start gap-2 rounded-xl bg-blue-50/80 px-3.5 py-2.5 text-[12px] text-blue-800">
                <ShieldCheck className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
                <span>
                  별도 이메일 인증 대기 없이 가입 즉시 로그인되며, 기본 매너온도 <strong>98.5°C</strong>가 부여됩니다.
                </span>
              </div>
            </>
          )}

          {errorMsg && (
            <div className="rounded-xl bg-red-50 border border-red-100 p-3 text-[12.5px] text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
              <div className="space-y-1.5">
                <p className="leading-snug">{errorMsg}</p>
                {showEmailEnableGuide && (
                  <p className="text-[11.5px] text-red-600/90 leading-relaxed">
                    Firebase Console → Authentication → Sign-in method → &quot;이메일/비밀번호&quot; 제공업체를 사용 설정하면 바로 이용할 수 있습니다.
                  </p>
                )}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-[0.99] disabled:opacity-60 text-white font-bold text-[15px] flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 transition-all cursor-pointer"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {mode === 'login' ? '이메일로 로그인' : '회원가입 완료하고 시작하기'}
          </button>

          <div className="relative py-1 flex items-center">
            <div className="flex-grow border-t border-slate-100" />
            <span className="px-3 text-[12px] text-slate-400 font-medium">또는 간편 로그인</span>
            <div className="flex-grow border-t border-slate-100" />
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={handleGoogleLogin}
            className="w-full h-12 rounded-xl bg-white hover:bg-slate-50 active:scale-[0.99] border border-slate-200 text-slate-800 font-semibold text-[14px] flex items-center justify-center gap-2.5 transition-all cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google 계정으로 계속하기
          </button>
        </form>
      </div>
    </div>
  );
}
