import React, { useRef, useState } from 'react';
import {
  ArrowLeft,
  Camera,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  GraduationCap,
  Handshake,
  Heart,
  MapPin,
  MessageCircle,
  Share2,
  ShieldCheck,
  Tag,
  Thermometer,
  X,
  ZoomIn,
} from 'lucide-react';
import {
  ASSET_IMAGES,
  formatKRW,
  formatRelativeTime,
  getDiscountPercent,
} from '../data/sampleData';
import { ProductItem } from '../types';
import { CampusMapCard } from './CampusMapCard';

interface ProductDetailScreenProps {
  product: ProductItem;
  relatedProducts: ProductItem[];
  isLiked: boolean;
  onBack: () => void;
  onToggleLike: (product: ProductItem) => void;
  onOpenMeetup: (product: ProductItem) => void;
  onSelectProduct: (product: ProductItem) => void;
  onSearchTag: (tag: string) => void;
  onShowToast: (msg: string, type?: 'success' | 'error') => void;
}

export function ProductDetailScreen({
  product,
  relatedProducts,
  isLiked,
  onBack,
  onToggleLike,
  onOpenMeetup,
  onSelectProduct,
  onSearchTag,
  onShowToast,
}: ProductDetailScreenProps) {
  const [imgIndex, setImgIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [sellerModalOpen, setSellerModalOpen] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const images = product.imageUrls.length > 0 ? product.imageUrls : [ASSET_IMAGES.stewartCalc];
  const discountPct = getDiscountPercent(product.price, product.originalPrice);
  const displayLikes = product.likesCount + (product.isSample && isLiked ? 1 : 0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || images.length <= 1) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 35) {
      if (delta < 0) {
        setImgIndex((prev) => (prev + 1) % images.length);
      } else {
        setImgIndex((prev) => (prev - 1 + images.length) % images.length);
      }
    }
    touchStartX.current = null;
  };

  const handleShare = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
      }
      onShowToast('상품 링크가 복사되었습니다!');
    } catch {
      onShowToast('상품 링크가 복사되었습니다!');
    }
  };

  const descriptionLines = product.bullets
    ? product.bullets
    : product.description
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

  const safeZoneTitle = product.safeZoneDetail || `${product.safeZone} 스마트 라운지`;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-28">
      {/* Sticky Top Header */}
      <header className="sticky top-0 z-30 h-14 bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            aria-label="뒤로 가기"
            onClick={onBack}
            className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-[16px] font-bold text-slate-900">상품 상세</h1>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="상품 공유하기"
            onClick={handleShare}
            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <Share2 className="w-5 h-5" />
          </button>
          <div className="w-8 h-8 rounded-full bg-blue-50 text-[#2563EB] flex items-center justify-center">
            <GraduationCap className="w-4 h-4" />
          </div>
        </div>
      </header>

      {/* Swipeable Image Gallery */}
      <div
        className="relative w-full aspect-[4/3.6] bg-slate-200 overflow-hidden select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex h-full transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${imgIndex * 100}%)` }}
        >
          {images.map((src, idx) => (
            <img
              key={`${src}-${idx}`}
              src={src}
              alt={`${product.title} 사진 ${idx + 1}`}
              referrerPolicy="no-referrer"
              className="w-full h-full shrink-0 object-cover"
            />
          ))}
        </div>

        {/* Top-left Verified Student Badge */}
        {product.sellerVerified && (
          <div className="absolute top-3.5 left-3.5 inline-flex items-center gap-1.5 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
            <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
            <span className="text-[12px] font-bold text-slate-800">학생증 인증 완료</span>
          </div>
        )}

        {/* Top-right Zoom Button */}
        <button
          type="button"
          aria-label="사진 확대 보기"
          onClick={() => setLightboxOpen(true)}
          className="absolute top-3.5 right-3.5 w-9 h-9 rounded-full bg-white/95 backdrop-blur-sm shadow-sm flex items-center justify-center text-slate-700 hover:bg-white cursor-pointer"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        {/* Left/Right Navigation Arrows for desktop/tap */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              aria-label="이전 사진"
              onClick={() => setImgIndex((prev) => (prev - 1 + images.length) % images.length)}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-900/40 text-white flex items-center justify-center hover:bg-slate-900/60 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              aria-label="다음 사진"
              onClick={() => setImgIndex((prev) => (prev + 1) % images.length)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-900/40 text-white flex items-center justify-center hover:bg-slate-900/60 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Bottom-left Photo Counter */}
        <div className="absolute bottom-3.5 left-3.5 inline-flex items-center gap-1.5 bg-slate-900/75 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-[11.5px] font-bold tabular-nums">
          <Camera className="w-3.5 h-3.5" />
          <span>
            {imgIndex + 1} / {images.length}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 pt-4 space-y-4">
        {/* Campus Safe Trade Verified Banner */}
        <div className="rounded-2xl bg-[#EFF6FF] border border-blue-100 p-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#2563EB] text-white flex items-center justify-center shrink-0 shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[13.5px] font-bold text-slate-900">
                  캠퍼스 안심거래 인증존
                </span>
                <span className="px-1.5 py-0.5 rounded bg-blue-100 text-[#2563EB] text-[10px] font-bold">
                  안전 거래
                </span>
              </div>
              <p className="text-[11.5px] text-slate-600 mt-0.5">
                교내 인증 재학생 간 100% 실명 확인
              </p>
            </div>
          </div>
          <CheckCircle2 className="w-5 h-5 text-slate-500 shrink-0" />
        </div>

        {/* Category + Title + Meta */}
        <div>
          <div className="flex items-center gap-2 text-[12px] text-slate-500 mb-2">
            <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-[#2563EB] font-bold">
              {product.category}
            </span>
            <span>
              {product.sellerDepartment.split(' ')[0]} ·{' '}
              {formatRelativeTime(product.createdAtMs, product.timeAgo)} 등록
            </span>
          </div>

          <h2 className="text-[20px] font-extrabold text-slate-900 leading-[1.35] tracking-tight">
            {product.title}
          </h2>

          <div className="mt-2.5 flex items-center gap-4 text-[12px] text-slate-500 tabular-nums">
            <span className="inline-flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" /> 조회 {product.viewsCount}
            </span>
            <span className="inline-flex items-center gap-1">
              <Heart className="w-3.5 h-3.5" /> 찜 {displayLikes}
            </span>
            <span className="inline-flex items-center gap-1">
              <MessageCircle className="w-3.5 h-3.5" /> 채팅 {product.chatsCount}
            </span>
          </div>
        </div>

        {/* Price Box */}
        <div className="rounded-2xl bg-[#F1F5F9] px-4 py-3.5 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-baseline gap-2">
            <span className="text-[24px] font-extrabold text-[#2563EB] tabular-nums tracking-tight">
              {formatKRW(product.price, product.isFree)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-[13px] text-slate-400 line-through tabular-nums">
                {product.originalPrice.toLocaleString('ko-KR')}원
              </span>
            )}
          </div>

          {discountPct ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-100/90 text-[#1D4ED8] text-[11.5px] font-bold">
              <Tag className="w-3 h-3" />
              정가 대비 {discountPct}% 저렴
            </span>
          ) : product.allowPriceOffer ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-100/90 text-[#1D4ED8] text-[11.5px] font-bold">
              가격 제안 가능
            </span>
          ) : null}
        </div>

        {/* Seller Profile Card */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-[0_2px_12px_rgba(15,23,42,0.03)]">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative shrink-0">
                <img
                  src={product.sellerAvatarUrl || ASSET_IMAGES.studentAvatar}
                  alt={product.sellerNickname}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-full object-cover border border-slate-200"
                />
                <span className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center absolute -bottom-0.5 -right-0.5 ring-2 ring-white">
                  <GraduationCap className="w-3 h-3" />
                </span>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[14.5px] font-extrabold text-slate-900 truncate">
                    {product.sellerNickname}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[11px] font-semibold truncate">
                    {product.sellerDepartment}
                  </span>
                </div>
                <p className="text-[12px] font-bold text-[#2563EB] mt-0.5 flex items-center gap-1">
                  캠퍼스 학우 인증 완료
                  <GraduationCap className="w-3.5 h-3.5" />
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSellerModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[12px] font-bold shrink-0 transition-colors cursor-pointer"
            >
              프로필
            </button>
          </div>

          {/* Manner Temperature Progress */}
          <div className="mt-4 pt-3.5 border-t border-slate-100">
            <div className="flex items-center justify-between text-[12.5px] mb-2">
              <span className="inline-flex items-center gap-1 text-slate-600 font-semibold">
                <Thermometer className="w-3.5 h-3.5 text-[#2563EB]" />
                매너온수 지수
              </span>
              <span className="font-extrabold text-[#2563EB] tabular-nums">
                {product.sellerMannerTemp.toFixed(1)}°C{' '}
                <span className="font-semibold text-blue-600/80">
                  (거래후기 {product.sellerReviewCount ?? 18}개)
                </span>
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#2563EB] to-[#3B82F6]"
                style={{ width: `${Math.min(100, Math.max(40, product.sellerMannerTemp))}%` }}
              />
            </div>
            <p className="mt-2.5 text-[12px] text-slate-600 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
              <span>
                주 거래장소: <strong className="text-slate-800">{product.safeZone}</strong>
              </span>
            </p>
          </div>
        </div>

        {/* Detailed Description Section */}
        <section>
          <h3 className="text-[16px] font-extrabold text-slate-900 mb-2.5">상품 설명</h3>
          <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3 shadow-[0_2px_12px_rgba(15,23,42,0.03)]">
            {product.summaryLine && (
              <p className="text-[14px] font-bold text-[#1D4ED8] leading-snug">
                {product.summaryLine}
              </p>
            )}

            <ul className="space-y-2.5">
              {descriptionLines.map((line, i) => (
                <li key={i} className="flex items-start gap-2 text-[13.5px] text-slate-700 leading-relaxed">
                  <Check className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>

            {product.hashtags && product.hashtags.length > 0 && (
              <div className="pt-2 flex flex-wrap gap-1.5">
                {product.hashtags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => onSearchTag(tag)}
                    className="px-2.5 py-1 rounded-lg bg-[#EFF6FF] hover:bg-blue-100 text-[#1D4ED8] text-[12px] font-semibold transition-colors cursor-pointer"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Recommended Safe Zone Map Card */}
        <section>
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-[16px] font-extrabold text-slate-900">추천 직거래 안심 장소</h3>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#2563EB] text-[11px] font-bold">
              CCTV 안심존
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-[0_2px_12px_rgba(15,23,42,0.03)]">
            <div className="p-2.5 pb-0">
              <CampusMapCard
                safeZoneTitle={product.safeZone}
                safeZoneSubtitle="스마트 라운지 입구"
              />
            </div>
            <div className="p-4 pt-3">
              <p className="text-[14px] font-bold text-slate-900 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#2563EB] shrink-0" />
                {safeZoneTitle}
              </p>
              <p className="text-[12px] text-slate-500 mt-1 leading-relaxed">
                교내 학생증 태그 후 입장 가능한 보안 구역으로, 24시간 실시간 모니터링 안전 거래가 가능합니다.
              </p>
            </div>
          </div>
        </section>

        {/* Horizontal Recommendation List */}
        {relatedProducts.length > 0 && (
          <section className="pt-1">
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-[16px] font-extrabold text-slate-900">
                이 학과 다른 학우의 서적
              </h3>
              <button
                type="button"
                onClick={onBack}
                className="text-[12.5px] font-bold text-[#2563EB] hover:underline cursor-pointer"
              >
                더보기
              </button>
            </div>

            <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 pb-2">
              {relatedProducts.map((rel) => (
                <button
                  key={rel.id}
                  type="button"
                  onClick={() => onSelectProduct(rel)}
                  className="w-[172px] shrink-0 bg-white rounded-2xl border border-slate-100 overflow-hidden text-left shadow-[0_2px_10px_rgba(15,23,42,0.04)] active:scale-[0.98] transition-transform cursor-pointer"
                >
                  <div className="relative aspect-[4/3.3] bg-slate-100">
                    <img
                      src={rel.imageUrls[0]}
                      alt={rel.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-white/92 backdrop-blur-sm text-slate-800 text-[10.5px] font-bold">
                      {rel.hashtags?.[0] || rel.category}
                    </span>
                  </div>
                  <div className="p-3">
                    <p className="text-[13px] font-bold text-slate-900 truncate">{rel.title}</p>
                    <p className="text-[14.5px] font-extrabold text-[#2563EB] mt-1 tabular-nums">
                      {formatKRW(rel.price, rel.isFree)}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                      {rel.safeZone} 직거래
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40 bg-white/95 backdrop-blur-md border-t border-slate-100 px-4 py-3 flex items-center gap-2.5 shadow-[0_-4px_20px_rgba(15,23,42,0.06)]">
        <button
          type="button"
          aria-label={isLiked ? '찜 취소' : '찜하기'}
          onClick={() => onToggleLike(product)}
          className="w-14 h-12 rounded-xl bg-slate-100 hover:bg-slate-200/80 flex flex-col items-center justify-center shrink-0 transition-colors cursor-pointer"
        >
          <Heart
            className={`w-4 h-4 ${
              isLiked ? 'fill-red-500 text-red-500' : 'text-slate-700'
            }`}
          />
          <span className="text-[10.5px] font-bold text-slate-700 tabular-nums mt-0.5">
            {displayLikes}
          </span>
        </button>

        <button
          type="button"
          aria-label="직거래 문의"
          onClick={() => onOpenMeetup(product)}
          className="w-12 h-12 rounded-xl bg-slate-100 hover:bg-slate-200/80 flex items-center justify-center shrink-0 text-slate-700 transition-colors cursor-pointer"
        >
          <MessageCircle className="w-5 h-5" />
        </button>

        <button
          type="button"
          disabled={product.status === '거래완료'}
          onClick={() => onOpenMeetup(product)}
          className="flex-1 h-12 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-[0.99] disabled:bg-slate-300 text-white font-bold text-[15px] flex items-center justify-center gap-2 shadow-md shadow-blue-600/25 transition-all cursor-pointer"
        >
          <Handshake className="w-5 h-5" />
          {product.status === '거래완료' ? '거래가 완료된 상품' : '직거래 약속 잡기'}
        </button>
      </div>

      {/* Fullscreen Image Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            aria-label="닫기"
            onClick={() => setLightboxOpen(false)}
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/15 text-white flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={images[imgIndex]}
            alt={product.title}
            referrerPolicy="no-referrer"
            className="max-w-full max-h-[82vh] rounded-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Seller Quick Profile Sheet */}
      {sellerModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-[2px] flex items-center justify-center p-4"
          onClick={() => setSellerModalOpen(false)}
        >
          <div
            className="w-full max-w-[360px] bg-white rounded-3xl p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-[16px] font-extrabold text-slate-900">판매자 학우 정보</h4>
              <button
                type="button"
                onClick={() => setSellerModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <img
                src={product.sellerAvatarUrl || ASSET_IMAGES.studentAvatar}
                alt={product.sellerNickname}
                referrerPolicy="no-referrer"
                className="w-14 h-14 rounded-full object-cover border border-slate-200"
              />
              <div>
                <p className="text-[16px] font-extrabold text-slate-900">{product.sellerNickname}</p>
                <p className="text-[12.5px] text-slate-500">{product.sellerUniversity}</p>
                <p className="text-[12px] font-semibold text-[#2563EB] mt-0.5">
                  {product.sellerDepartment} · 재학생 인증됨
                </p>
              </div>
            </div>
            <div className="rounded-2xl bg-blue-50/70 p-3.5 text-[12.5px] text-slate-700 space-y-1.5">
              <div className="flex justify-between">
                <span>매너온수 지수</span>
                <strong className="text-[#2563EB] tabular-nums">{product.sellerMannerTemp.toFixed(1)}°C</strong>
              </div>
              <div className="flex justify-between">
                <span>주 직거래 안심존</span>
                <strong>{product.safeZone}</strong>
              </div>
              <div className="flex justify-between">
                <span>응답 속도</span>
                <strong>보통 10분 이내</strong>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setSellerModalOpen(false);
                onOpenMeetup(product);
              }}
              className="mt-4 w-full h-11 rounded-xl bg-[#2563EB] text-white font-bold text-[14px] hover:bg-[#1D4ED8] transition-colors cursor-pointer"
            >
              직거래 약속 제안하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
