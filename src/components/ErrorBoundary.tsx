import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      message: error?.message || '알 수 없는 오류가 발생했습니다.',
    };
  }

  componentDidCatch(error: Error) {
    console.error('CampusMarket ErrorBoundary caught:', error);
  }

  render() {
    if (this.state.hasError) {
      let displayText = '일시적인 오류가 발생했습니다. 다시 시도해 주세요.';
      if (this.state.message.includes('Missing or insufficient permissions')) {
        displayText = '데이터 접근 권한을 확인하는 중 문제가 발생했습니다. 로그인 상태를 확인한 뒤 다시 시도해 주세요.';
      } else if (this.state.message.includes('Quota exceeded')) {
        displayText = '일일 데이터베이스 사용 한도를 초과했습니다. 내일 다시 시도해 주세요.';
      }

      return (
        <div className="min-h-screen bg-[#EEF2F7] flex items-center justify-center p-4">
          <div className="w-full max-w-[390px] bg-white rounded-3xl p-6 shadow-lg border border-slate-100 text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">화면을 불러오지 못했어요</h2>
            <p className="text-sm text-slate-600 leading-relaxed mb-5">{displayText}</p>
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false, message: '' });
                window.location.reload();
              }}
              className="w-full h-12 rounded-xl bg-[#2563EB] text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#1D4ED8] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              새로고침하기
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
