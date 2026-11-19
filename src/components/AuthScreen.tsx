import React, { useState } from 'react';
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
import { supabase } from '../lib/supabase';
import { fetchUserProfile, upsertUserProfile } from '../lib/supabaseService';
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

  const mapSupabaseAuthError = (message?: string): string => {
    const lower = (message || '').toLowerCase();
    if (lower.includes('already registered') || lower.includes('user already exists')) {
      return '이미 가입된 이메일 주소입니다. 로그인 탭에서 로그인해 주세요.';
    }
    if (lower.includes('invalid login credentials')) {
      return '이메일 또는 비밀번호가 올바르지 않습니다.';
    }
    if (lower.includes('email not confirmed')) {
      return '이메일 인증이 필요합니다. Supabase Dashboard → Authentication → Providers → Email에서 "Confirm email"을 꺼두시면 가입 즉시 로그인할 수 있습니다.';
    }
    if (lower.includes('password should be at least') || lower.includes('weak password')) {
      return '비밀번호는 6자 이상으로 입력해 주세요.';
    }
    if (lower.includes('invalid email') || lower.includes('unable to validate email')) {
      return '올바른 이메일 형식을 입력해 주세요.';
    }
    if (lower.includes('rate limit') || lower.includes('too many')) {
      return '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.';
    }
    return message || '인증 처리 중 오류가 발생했습니다. 입력 정보를 확인해 주세요.';
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

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
        const { data, error } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
          options: {
            data: {
              nickname: nickname.trim(),
              university,
              department: department.trim(),
            },
          },
        });

        if (error) {
          setErrorMsg(mapSupabaseAuthError(error.message));
          return;
        }

        if (!data.user) {
          setErrorMsg('회원가입 처리 중 사용자 정보를 확인할 수 없습니다.');
          return;
        }

        // If Confirm Email is still enabled in Supabase, session will be null
        if (!data.session) {
          setErrorMsg(
            '가입 요청이 완료되었습니다! 바로 로그인하려면 Supabase Dashboard → Authentication → Providers → Email에서 "Confirm email" 옵션을 비활성화하거나 이메일 인증 링크를 클릭해 주세요.'
          );
          return;
        }

        const profile = await upsertUserProfile(data.user.id, {
          nickname: nickname.trim(),
          university,
          department: department.trim(),
        });

        onShowToast('회원가입 및 재학생 인증이 완료되었습니다!');
        onSuccess(profile);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        });

        if (error) {
          setErrorMsg(mapSupabaseAuthError(error.message));
          return;
        }

        if (!data.user) {
          setErrorMsg('로그인 정보를 확인할 수 없습니다.');
          return;
        }

        let profile = await fetchUserProfile(data.user.id);
        if (!profile) {
          const meta = data.user.user_metadata || {};
          profile = await upsertUserProfile(data.user.id, {
            nickname: meta.nickname || trimmedEmail.split('@')[0] || '캠퍼스학우',
            university: meta.university || CAMPUSES[0].name,
            department: meta.department || '컴퓨터공학과 24학번',
          });
        }

        onShowToast(`${profile.nickname}님, 환영합니다!`);
        onSuccess(profile);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : undefined;
      setErrorMsg(mapSupabaseAuthError(msg));
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
                <label className="block text-[13px] font-bold text-slate-700 mb-1.5">대학교</label>
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
                  가입 즉시 프로필이 저장되며, 기본 매너온도 <strong>98.5°C</strong>가 부여됩니다.
                </span>
              </div>
            </>
          )}

          {errorMsg && (
            <div className="rounded-xl bg-red-50 border border-red-100 p-3 text-[12.5px] text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
              <p className="leading-snug">{errorMsg}</p>
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

          <p className="text-center text-[12px] text-slate-400 pt-1">
            {mode === 'login' ? (
              <>
                아직 캠퍼스마켓 회원이 아니신가요?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setErrorMsg(null);
                  }}
                  className="text-[#2563EB] font-bold hover:underline cursor-pointer"
                >
                  회원가입
                </button>
              </>
            ) : (
              <>
                이미 계정이 있으신가요?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMsg(null);
                  }}
                  className="text-[#2563EB] font-bold hover:underline cursor-pointer"
                >
                  로그인
                </button>
              </>
            )}
          </p>
        </form>
      </div>
    </div>
  );
}
