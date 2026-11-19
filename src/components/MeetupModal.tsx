import React, { useState } from 'react';
import { Calendar, Clock, Handshake, Loader2, MapPin, ShieldCheck, X } from 'lucide-react';
import { formatKRW } from '../data/sampleData';
import { ProductItem } from '../types';

const SAFE_ZONE_OPTIONS = [
  '중앙도서관 1층 로비',
  '학생회관 1층 앞',
  '공학관 1층 카페 앞',
  '기숙사 정문',
];

const TIME_SLOTS = [
  '오전 10:30',
  '오후 12:30',
  '오후 2:00',
  '오후 4:30',
  '오후 6:00',
];

interface MeetupModalProps {
  product: ProductItem;
  onClose: () => void;
  onSubmit: (payload: {
    safeZone: string;
    preferredDate: string;
    preferredTime: string;
    note: string;
  }) => Promise<void>;
}

export function MeetupModal({ product, onClose, onSubmit }: MeetupModalProps) {
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const tomorrowStr = tomorrowDate.toISOString().split('T')[0];

  const [safeZone, setSafeZone] = useState(
    SAFE_ZONE_OPTIONS.find((z) => product.safeZone.includes(z.split(' ')[0])) ||
      SAFE_ZONE_OPTIONS[0]
  );
  const [dateMode, setDateMode] = useState<'today' | 'tomorrow' | 'custom'>('today');
  const [customDate, setCustomDate] = useState(todayStr);
  const [preferredTime, setPreferredTime] = useState(TIME_SLOTS[1]);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const resolvedDateLabel =
    dateMode === 'today'
      ? `오늘 (${todayStr})`
      : dateMode === 'tomorrow'
        ? `내일 (${tomorrowStr})`
        : customDate;

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({
        safeZone,
        preferredDate: resolvedDateLabel,
        preferredTime,
        note,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/55 backdrop-blur-[2px] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="meetup-modal-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[390px] bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="px-5 pt-5 pb-3.5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center">
              <Handshake className="w-4 h-4" />
            </div>
            <h3 id="meetup-modal-title" className="text-[16px] font-extrabold text-slate-900">
              직거래 약속 제안
            </h3>
          </div>
          <button
            type="button"
            aria-label="모달 닫기"
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleConfirm} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Product Mini Preview */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#F8FAFC] border border-slate-100">
            <img
              src={product.imageUrls[0]}
              alt={product.title}
              referrerPolicy="no-referrer"
              className="w-12 h-12 rounded-xl object-cover shrink-0"
            />
            <div className="min-w-0">
              <p className="text-[13px] font-bold text-slate-900 truncate">{product.title}</p>
              <p className="text-[13.5px] font-extrabold text-[#2563EB] tabular-nums mt-0.5">
                {formatKRW(product.price, product.isFree)}
              </p>
            </div>
          </div>

          {/* Safe Zone Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[13px] font-bold text-slate-800 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#2563EB]" />
                캠퍼스 안심거래존 선택
              </label>
              <span className="text-[11px] font-semibold text-[#2563EB]">CCTV 안심구역</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {SAFE_ZONE_OPTIONS.map((zone) => {
                const active = safeZone === zone;
                return (
                  <button
                    key={zone}
                    type="button"
                    onClick={() => setSafeZone(zone)}
                    className={`min-h-[42px] px-3 py-2 rounded-xl text-[12px] font-bold text-left flex items-center gap-1.5 border transition-all cursor-pointer ${
                      active
                        ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-sm shadow-blue-600/20'
                        : 'bg-[#F8FAFC] text-slate-700 border-slate-200/80 hover:border-blue-300'
                    }`}
                  >
                    <ShieldCheck
                      className={`w-3.5 h-3.5 shrink-0 ${
                        active ? 'text-white' : 'text-slate-400'
                      }`}
                    />
                    <span className="truncate">{zone}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date Selector */}
          <div>
            <label className="text-[13px] font-bold text-slate-800 flex items-center gap-1 mb-2">
              <Calendar className="w-3.5 h-3.5 text-[#2563EB]" />
              희망 날짜
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDateMode('today')}
                className={`h-10 rounded-xl text-[12.5px] font-bold border transition-colors cursor-pointer ${
                  dateMode === 'today'
                    ? 'bg-blue-50 text-[#2563EB] border-[#2563EB]'
                    : 'bg-white text-slate-600 border-slate-200'
                }`}
              >
                오늘
              </button>
              <button
                type="button"
                onClick={() => setDateMode('tomorrow')}
                className={`h-10 rounded-xl text-[12.5px] font-bold border transition-colors cursor-pointer ${
                  dateMode === 'tomorrow'
                    ? 'bg-blue-50 text-[#2563EB] border-[#2563EB]'
                    : 'bg-white text-slate-600 border-slate-200'
                }`}
              >
                내일
              </button>
              <button
                type="button"
                onClick={() => setDateMode('custom')}
                className={`h-10 rounded-xl text-[12.5px] font-bold border transition-colors cursor-pointer ${
                  dateMode === 'custom'
                    ? 'bg-blue-50 text-[#2563EB] border-[#2563EB]'
                    : 'bg-white text-slate-600 border-slate-200'
                }`}
              >
                날짜 선택
              </button>
            </div>
            {dateMode === 'custom' && (
              <input
                type="date"
                min={todayStr}
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="mt-2 w-full h-10 px-3 rounded-xl bg-[#F1F5F9] text-[13px] font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30"
              />
            )}
          </div>

          {/* Time Selector */}
          <div>
            <label className="text-[13px] font-bold text-slate-800 flex items-center gap-1 mb-2">
              <Clock className="w-3.5 h-3.5 text-[#2563EB]" />
              희망 시간
            </label>
            <div className="flex flex-wrap gap-2">
              {TIME_SLOTS.map((slot) => {
                const active = preferredTime === slot;
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setPreferredTime(slot)}
                    className={`h-9 px-3 rounded-xl text-[12px] font-bold border transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#2563EB] text-white border-[#2563EB]'
                        : 'bg-[#F8FAFC] text-slate-600 border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Note */}
          <div>
            <label className="text-[13px] font-bold text-slate-800 block mb-1.5">
              학우에게 전할 메시지 <span className="text-slate-400 font-normal">(선택)</span>
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={200}
              placeholder="예: 수업 끝나고 로비 입구 앞에서 뵙겠습니다!"
              className="w-full h-11 px-3.5 rounded-xl bg-[#F1F5F9] text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:bg-white"
            />
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full h-12 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-[0.99] disabled:opacity-60 text-white font-bold text-[15px] flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            직거래 약속 보내기
          </button>
        </form>
      </div>
    </div>
  );
}
