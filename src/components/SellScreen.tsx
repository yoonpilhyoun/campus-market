import React, { useRef, useState } from 'react';
import {
  ArrowLeft,
  BadgeCheck,
  BookOpen,
  Camera,
  CheckCircle2,
  GraduationCap,
  Home as HomeIcon,
  ImagePlus,
  Info,
  Laptop,
  Loader2,
  MapPin,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  X,
} from 'lucide-react';
import { ASSET_IMAGES, CAMPUSES } from '../data/sampleData';
import { uploadProductImage } from '../lib/firebase';
import { createProductListing } from '../lib/firestoreService';
import { ProductCategory, UserProfile } from '../types';
import { CampusMapCard } from './CampusMapCard';

interface UploadedPhoto {
  id: string;
  previewUrl: string;
  remoteUrl?: string;
  uploading: boolean;
  error?: string;
}

interface SellScreenProps {
  profile: UserProfile;
  onBack: () => void;
  onSuccess: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error') => void;
}

const SELL_CATEGORIES: { id: ProductCategory; label: string; icon: React.ReactNode }[] = [
  { id: '전공서적', label: '전공서적', icon: <BookOpen className="w-3.5 h-3.5" /> },
  { id: '전자기기', label: '전자기기', icon: <Laptop className="w-3.5 h-3.5" /> },
  { id: '자취/기숙사', label: '자취/기숙사', icon: <HomeIcon className="w-3.5 h-3.5" /> },
  { id: '의류/잡화', label: '의류/잡화', icon: <ShoppingBag className="w-3.5 h-3.5" /> },
];

export function SellScreen({ profile, onBack, onSuccess, onShowToast }: SellScreenProps) {
  const campusInfo =
    CAMPUSES.find((c) => c.name === profile.university) || CAMPUSES[0];

  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ProductCategory>('전공서적');
  const [priceText, setPriceText] = useState('');
  const [isFree, setIsFree] = useState(false);
  const [allowPriceOffer, setAllowPriceOffer] = useState(true);
  const [selectedSafeZoneIdx, setSelectedSafeZoneIdx] = useState(0);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeSafeZone = campusInfo.safeZones[selectedSafeZoneIdx] || campusInfo.safeZones[0];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const remainingSlots = Math.max(0, 10 - photos.length);
    const filesToUpload = Array.from(fileList).slice(0, remainingSlots);
    e.target.value = '';

    if (filesToUpload.length === 0) {
      onShowToast('사진은 최대 10장까지 등록할 수 있어요.', 'error');
      return;
    }

    const placeholders: UploadedPhoto[] = filesToUpload.map((file, idx) => ({
      id: `${Date.now()}_${idx}_${Math.random().toString(36).slice(2, 6)}`,
      previewUrl: URL.createObjectURL(file),
      uploading: true,
    }));

    setPhotos((prev) => [...prev, ...placeholders]);

    await Promise.all(
      filesToUpload.map(async (file, idx) => {
        const targetId = placeholders[idx].id;
        try {
          const uploadedUrl = await uploadProductImage(file, profile.uid);
          setPhotos((prev) =>
            prev.map((item) =>
              item.id === targetId
                ? { ...item, remoteUrl: uploadedUrl, uploading: false }
                : item
            )
          );
        } catch (err) {
          const msg = err instanceof Error ? err.message : '업로드 실패';
          setPhotos((prev) =>
            prev.map((item) =>
              item.id === targetId
                ? { ...item, uploading: false, error: msg }
                : item
            )
          );
          onShowToast('일부 사진 업로드에 실패했습니다. 다시 시도해 주세요.', 'error');
        }
      })
    );
  };

  const handleRemovePhoto = (id: string) => {
    setPhotos((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target?.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((p) => p.id !== id);
    });
  };

  const handlePriceInput = (raw: string) => {
    const digits = raw.replace(/[^0-9]/g, '').slice(0, 8);
    if (!digits) {
      setPriceText('');
      return;
    }
    setPriceText(Number(digits).toLocaleString('ko-KR'));
  };

  const numericPrice = isFree ? 0 : Number(priceText.replace(/[^0-9]/g, '') || '0');
  const isUploadingAny = photos.some((p) => p.uploading);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isUploadingAny) {
      onShowToast('사진 업로드가 완료될 때까지 잠시만 기다려 주세요.', 'error');
      return;
    }

    const validUrls = photos
      .map((p) => p.remoteUrl)
      .filter((u): u is string => Boolean(u));

    if (validUrls.length === 0) {
      onShowToast('상품 사진을 1장 이상 등록해 주세요.', 'error');
      return;
    }

    if (title.trim().length < 2) {
      onShowToast('상품 제목을 2자 이상 입력해 주세요.', 'error');
      return;
    }

    if (!isFree && numericPrice <= 0) {
      onShowToast('판매 가격을 입력하거나 무료나눔을 선택해 주세요.', 'error');
      return;
    }

    if (description.trim().length < 5) {
      onShowToast('자세한 상품 설명을 5자 이상 작성해 주세요.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await createProductListing(profile, {
        title: title.trim(),
        category,
        price: numericPrice,
        isFree,
        allowPriceOffer,
        safeZone: activeSafeZone.name,
        safeZoneDetail: activeSafeZone.detail,
        description: description.trim(),
        imageUrls: validUrls,
      });

      onShowToast('상품이 캠퍼스마켓에 등록되었습니다!');
      onSuccess();
    } catch (err) {
      console.error(err);
      onShowToast('상품 등록 중 오류가 발생했습니다. 다시 시도해 주세요.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

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
          <h1 className="text-[16px] font-bold text-slate-900">판매하기</h1>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="공유하기"
            onClick={() => onShowToast('캠퍼스마켓 판매 페이지 링크가 복사되었습니다!')}
            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            <Share2 className="w-5 h-5" />
          </button>
          <div className="w-8 h-8 rounded-full bg-blue-50 text-[#2563EB] flex items-center justify-center">
            <GraduationCap className="w-4 h-4" />
          </div>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="px-4 pt-4 space-y-4">
        {/* Seller Profile Summary Card */}
        <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-[0_2px_14px_rgba(15,23,42,0.04)]">
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <img
                src={profile.avatarUrl || ASSET_IMAGES.studentAvatar}
                alt={profile.nickname}
                referrerPolicy="no-referrer"
                className="w-13 h-13 rounded-full object-cover border border-slate-200"
              />
              <span className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center absolute -bottom-0.5 -right-0.5 ring-2 ring-white">
                <BadgeCheck className="w-3.5 h-3.5" />
              </span>
            </div>

            <div className="min-w-0">
              <p className="text-[14.5px] font-extrabold text-slate-900 truncate flex items-center gap-1">
                <span>
                  {profile.department} {profile.nickname} 학우
                </span>
                <GraduationCap className="w-4 h-4 text-slate-700 shrink-0" />
              </p>
              <span className="mt-1 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#EFF6FF] text-[#2563EB] text-[11px] font-bold">
                <GraduationCap className="w-3 h-3" />
                {campusInfo.shortName} 학생증 인증 완료 (재학생)
              </span>
            </div>
          </div>

          <div className="mt-3.5 grid grid-cols-3 rounded-2xl bg-[#F8FAFC] py-3 divide-x divide-slate-200/70 text-center">
            <div>
              <p className="text-[11px] text-slate-500 font-medium">판매중</p>
              <p className="text-[15px] font-extrabold text-slate-900 mt-0.5 tabular-nums">
                {profile.sellingCount}건
              </p>
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-medium">거래완료</p>
              <p className="text-[15px] font-extrabold text-slate-900 mt-0.5 tabular-nums">
                {profile.completedCount}건
              </p>
            </div>
            <div>
              <p className="text-[11px] text-[#2563EB] font-semibold">매너온도</p>
              <p className="text-[15px] font-extrabold text-[#2563EB] mt-0.5 tabular-nums">
                {profile.mannerTemp.toFixed(1)}°C
              </p>
            </div>
          </div>
        </div>

        {/* Heading */}
        <div className="pt-1">
          <p className="text-[11px] font-extrabold tracking-wider text-[#2563EB] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
            CAMPUS SAFE TRADE
          </p>
          <h2 className="text-[22px] font-extrabold text-slate-900 tracking-tight mt-0.5">
            새 상품 등록하기
          </h2>
          <p className="text-[13px] text-slate-500 mt-0.5">
            캠퍼스 학우에게 안전하고 빠른 직거래로 판매해보세요
          </p>
        </div>

        {/* Photo Upload Card */}
        <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-[0_2px_12px_rgba(15,23,42,0.03)]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[14.5px] font-bold text-slate-900">
              상품 사진{' '}
              <span className="text-[#2563EB] tabular-nums">({photos.length}/10)</span>
            </h3>
            <span className="text-[11.5px] text-slate-400">실제 상태가 잘 보이도록 촬영</span>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-1">
            {/* Add Photo Trigger */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-22 h-22 shrink-0 rounded-2xl bg-[#EFF6FF] border border-dashed border-[#2563EB]/40 hover:bg-blue-100/70 flex flex-col items-center justify-center gap-1 text-[#2563EB] transition-colors cursor-pointer"
            >
              <Camera className="w-6 h-6" />
              <span className="text-[11.5px] font-bold">사진 추가</span>
            </button>

            {/* Uploaded Thumbnails */}
            {photos.map((photo, index) => (
              <div
                key={photo.id}
                className="relative w-22 h-22 shrink-0 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80"
              >
                <img
                  src={photo.previewUrl}
                  alt={`업로드된 상품 사진 ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {index === 0 && (
                  <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-slate-900/75 text-white text-[10px] font-bold">
                    대표
                  </span>
                )}
                {photo.uploading && (
                  <div className="absolute inset-0 bg-slate-900/45 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  </div>
                )}
                {photo.error && (
                  <div className="absolute inset-0 bg-red-600/80 flex items-center justify-center text-white text-[10px] font-bold p-1 text-center">
                    업로드 오류
                  </div>
                )}
                <button
                  type="button"
                  aria-label="사진 삭제"
                  onClick={() => handleRemovePhoto(photo.id)}
                  className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-slate-900/75 text-white flex items-center justify-center hover:bg-slate-900 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}

            {photos.length < 10 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-22 h-22 shrink-0 rounded-2xl bg-[#F8FAFC] border border-slate-200/70 flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <ImagePlus className="w-5 h-5" />
                <span className="text-[11px] font-medium">최대 10장</span>
              </button>
            )}
          </div>

          <div className="mt-3 flex items-start gap-1.5 text-[11.5px] text-slate-500">
            <Info className="w-3.5 h-3.5 text-[#2563EB] shrink-0 mt-0.5" />
            <span>책 표지, 본문 필기 흔적, 모서리 손상 여부를 보여주면 더 빨리 판매돼요.</span>
          </div>
        </div>

        {/* Title Input Card */}
        <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-[0_2px_12px_rgba(15,23,42,0.03)]">
          <label htmlFor="sell-title" className="block text-[14.5px] font-bold text-slate-900 mb-2.5">
            제목
          </label>
          <input
            id="sell-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            placeholder="자료구조와 알고리즘 (개정 4판) 새책급 팝니다"
            className="w-full h-12 px-4 rounded-2xl bg-[#F1F5F9] text-[14px] font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:bg-white transition-all"
          />
        </div>

        {/* Category Selection Card */}
        <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-[0_2px_12px_rgba(15,23,42,0.03)]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[14.5px] font-bold text-slate-900">카테고리 선택</span>
            <span className="text-[12px] font-bold text-[#2563EB]">선택됨: {category}</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {SELL_CATEGORIES.map((item) => {
              const active = category === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCategory(item.id)}
                  className={`h-10 px-3.5 rounded-full text-[13px] font-bold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                    active
                      ? 'bg-[#2563EB] text-white shadow-sm shadow-blue-600/25'
                      : 'bg-[#F1F5F9] text-slate-600 hover:bg-slate-200/80'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Price Input Card */}
        <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-[0_2px_12px_rgba(15,23,42,0.03)]">
          <label htmlFor="sell-price" className="block text-[14.5px] font-bold text-slate-900 mb-2.5">
            판매 가격
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-4 text-[18px] font-extrabold text-slate-900">₩</span>
            <input
              id="sell-price"
              type="text"
              inputMode="numeric"
              disabled={isFree}
              value={isFree ? '0' : priceText}
              onChange={(e) => handlePriceInput(e.target.value)}
              placeholder="15,000"
              className="w-full h-13 pl-10 pr-10 rounded-2xl bg-[#F1F5F9] text-[18px] font-extrabold text-slate-900 tabular-nums placeholder:text-slate-400 disabled:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:bg-white transition-all"
            />
            <span className="absolute right-4 text-[14px] font-semibold text-slate-500">원</span>
          </div>

          <div className="mt-3.5 flex items-center justify-between">
            <label className="inline-flex items-center gap-2 text-[13px] font-semibold text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isFree}
                onChange={(e) => setIsFree(e.target.checked)}
                className="w-4.5 h-4.5 rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB]"
              />
              <span>무료나눔 하기</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            </label>

            <div className="flex items-center gap-2">
              <span className="text-[13px] font-medium text-slate-500">가격 제안 받기</span>
              <button
                type="button"
                role="switch"
                aria-checked={allowPriceOffer}
                onClick={() => setAllowPriceOffer((v) => !v)}
                className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                  allowPriceOffer ? 'bg-[#2563EB]' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`block w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                    allowPriceOffer ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Safe Zone Selection Card with Live Map Preview */}
        <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-[0_2px_12px_rgba(15,23,42,0.03)] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[14.5px] font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4.5 h-4.5 text-[#2563EB]" />
              캠퍼스 내 안심거래존 희망 장소
            </span>
            <span className="text-[11.5px] font-bold text-[#2563EB]">안전보장존</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {campusInfo.safeZones.map((zone, idx) => {
              const active = idx === selectedSafeZoneIdx;
              return (
                <button
                  key={zone.name}
                  type="button"
                  onClick={() => setSelectedSafeZoneIdx(idx)}
                  className={`min-h-[42px] px-3 py-2 rounded-xl text-[12px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    active
                      ? 'bg-[#2563EB] text-white shadow-sm shadow-blue-600/25'
                      : 'bg-[#F1F5F9] text-slate-700 hover:bg-slate-200/70'
                  }`}
                >
                  {active ? (
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  ) : (
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  )}
                  <span className="truncate">{zone.name}</span>
                </button>
              );
            })}
          </div>

          {/* Live Map Preview Box */}
          <div className="rounded-2xl bg-[#EFF6FF] border border-blue-100/80 p-3 space-y-2.5">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white text-[#2563EB] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[12.5px] font-extrabold text-slate-900 leading-snug">
                  {activeSafeZone.detail}
                </p>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  경비원 상주 및 24시간 보안카메라 구역으로 가장 안전합니다.
                </p>
              </div>
            </div>
            <CampusMapCard
              safeZoneTitle={activeSafeZone.name}
              badgeText={activeSafeZone.badge}
              compact
            />
          </div>
        </div>

        {/* Detailed Description Card */}
        <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-[0_2px_12px_rgba(15,23,42,0.03)] space-y-3">
          <div className="flex items-center justify-between">
            <label htmlFor="sell-desc" className="text-[14.5px] font-bold text-slate-900">
              자세한 상품 설명
            </label>
            <span className="text-[12px] text-slate-400 font-semibold tabular-nums">
              {description.length.toLocaleString('ko-KR')} / 1,000자
            </span>
          </div>

          <textarea
            id="sell-desc"
            rows={5}
            maxLength={1000}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={`학수번호, 교수님 성함, 필기 유무, 제본 상태 등 학우들에게 도움되는 상세 정보를 입력해주세요.\n예시:\n- 과목: 자료구조 (CSI2101)\n- 앞 3장 연필 밑줄 약간 외에는 깨끗합니다.\n- 오늘 오후 공학관이나 중앙도서관 직거래 가능해요!`}
            className="w-full p-4 rounded-2xl bg-[#F1F5F9] text-[13.5px] text-slate-900 placeholder:text-slate-400 leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:bg-white transition-all"
          />

          <div className="rounded-2xl bg-[#EFF6FF]/80 p-3 flex items-start gap-2 text-[11.5px] text-slate-600">
            <ShieldCheck className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
            <span>
              캠퍼스마켓은 재학생 전용 커뮤니티입니다. 학생증 인증 학우와의 안전 결제 및 교내 대면 직거래를 권장합니다.
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-1 pb-2 space-y-2">
          <button
            type="submit"
            disabled={submitting || isUploadingAny}
            className="w-full h-13 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-[0.99] disabled:opacity-60 text-white font-extrabold text-[15.5px] flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                상품 등록 중...
              </>
            ) : isUploadingAny ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                사진 업로드 중...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                캠퍼스마켓 상품 등록하기
              </>
            )}
          </button>
          <p className="text-center text-[11.5px] text-slate-400">
            등록 시 {campusInfo.shortName} 캠퍼스 피드에 즉시 노출됩니다.
          </p>
        </div>
      </form>
    </div>
  );
}
