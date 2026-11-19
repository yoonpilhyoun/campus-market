import { MapPin, ShieldCheck } from 'lucide-react';
import { ASSET_IMAGES } from '../data/sampleData';

interface CampusMapCardProps {
  safeZoneTitle: string;
  safeZoneSubtitle?: string;
  badgeText?: string;
  compact?: boolean;
}

export function CampusMapCard({
  safeZoneTitle,
  safeZoneSubtitle = '스마트 라운지 입구',
  badgeText,
  compact = false,
}: CampusMapCardProps) {
  return (
    <div className={`relative w-full overflow-hidden rounded-2xl border border-blue-100 bg-blue-50/40 ${compact ? 'h-36' : 'h-44'}`}>
      {/* Clean crop onto the crisp Korean campus cartography portion of the generated map */}
      <img
        src={ASSET_IMAGES.campusMap}
        alt={`${safeZoneTitle} 캠퍼스 안심거래존 지도`}
        referrerPolicy="no-referrer"
        className="w-[158%] max-w-none h-full object-cover object-center -ml-[54%] select-none pointer-events-none"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/25 via-transparent to-white/10 pointer-events-none" />

      {/* Center floating safe-zone marker card matching screenshot 1 */}
      {!compact && (
        <div className="absolute inset-0 flex items-center justify-center p-3 pointer-events-none">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl px-4 py-2.5 shadow-[0_8px_24px_rgba(37,99,235,0.18)] border border-blue-100 flex flex-col items-center text-center max-w-[240px]">
            <div className="w-7 h-7 rounded-full bg-blue-50 text-[#2563EB] flex items-center justify-center mb-1">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <p className="text-[13px] font-bold text-slate-900 leading-tight">{safeZoneTitle}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">{safeZoneSubtitle}</p>
          </div>
        </div>
      )}

      {/* Bottom dark translucent badge matching screenshot 2 */}
      {badgeText && (
        <div className="absolute left-3 bottom-3 right-3 flex items-center">
          <span className="inline-flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-sm text-white text-[11px] font-medium px-3 py-1.5 rounded-full max-w-full truncate">
            <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span className="truncate">{badgeText}</span>
          </span>
        </div>
      )}
    </div>
  );
}
