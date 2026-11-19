import React, { useEffect, useRef, useState } from 'react';
import {
  BadgeCheck,
  Bell,
  BookOpen,
  ChevronDown,
  GraduationCap,
  Heart,
  Home as HomeIcon,
  MapPin,
  MessageCircle,
  Search,
  Shield,
  ShieldCheck,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import {
  CAMPUSES,
  CATEGORIES,
  HERO_SLIDES,
  formatKRW,
  formatRelativeTime,
} from '../data/sampleData';
import {
  CategoryType,
  MeetupRequestRecord,
  ProductItem,
  SortOption,
  UserProfile,
} from '../types';

interface HomeScreenProps {
  products: ProductItem[];
  selectedCampus: string;
  onSelectCampus: (campus: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: CategoryType;
  onSelectCategory: (cat: CategoryType) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  verifiedOnly: boolean;
  onToggleVerifiedOnly: () => void;
  likedProductIds: Set<string>;
  onToggleLike: (product: ProductItem) => void;
  onSelectProduct: (product: ProductItem) => void;
  onOpenMyPage: () => void;
  userProfile: UserProfile | null;
  meetupRequests: MeetupRequestRecord[];
}

export function HomeScreen({
  products,
  selectedCampus,
  onSelectCampus,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  sortBy,
  onSortChange,
  verifiedOnly,
  onToggleVerifiedOnly,
  likedProductIds,
  onToggleLike,
  onSelectProduct,
  onOpenMyPage,
  userProfile,
  meetupRequests,
}: HomeScreenProps) {
  const [campusDropdownOpen, setCampusDropdownOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const touchStartX = useRef<number | null>(null);

  // Auto-play hero banner carousel every 4.5s
  useEffect(() => {
    if (isPaused) return;
    const timer = window.setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, [isPaused]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 40) {
      if (delta < 0) {
        setSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length);
      } else {
        setSlideIndex((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
      }
    }
    touchStartX.current = null;
    setIsPaused(false);
  };

  const filteredProducts = products
    .filter((item) => {
      if (selectedCategory !== '전체' && item.category !== selectedCategory) {
        return false;
      }
      if (verifiedOnly && !item.sellerVerified) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const inTitle = item.title.toLowerCase().includes(q);
        const inDesc = item.description.toLowerCase().includes(q);
        const inSafeZone = item.safeZone.toLowerCase().includes(q);
        const inCat = item.category.toLowerCase().includes(q);
        const inTags = (item.hashtags || []).some((t) => t.toLowerCase().includes(q));
        if (!inTitle && !inDesc && !inSafeZone && !inCat && !inTags) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === '낮은가격순') {
        return a.price - b.price;
      }
      // Keep real user-posted items prioritized by recency at the top
      return b.createdAtMs - a.createdAtMs;
    });

  return (
    <div className="pb-28 bg-[#F8FAFC] min-h-screen">
      {/* Sticky Top Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center">
            <GraduationCap className="w-5 h-5" />
          </div>
          <span className="text-[19px] font-extrabold tracking-tight text-slate-900">
            캠퍼스마켓
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="검색창으로 이동"
            onClick={() => searchInputRef.current?.focus()}
            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <Search className="w-5 h-5" />
          </button>

          <div className="relative">
            <button
              type="button"
              aria-label="알림 보기"
              onClick={() => setNotifOpen((o) => !o)}
              className="w-10 h-10 rounded-full flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors relative cursor-pointer"
            >
              <Bell className="w-5 h-5" />
              <span className="w-2 h-2 rounded-full bg-red-500 ring-2 ring-white absolute top-2.5 right-2.5" />
            </button>

            {notifOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setNotifOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 p-3.5 z-50">
                  <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100">
                    <span className="text-[13px] font-bold text-slate-900">캠퍼스 알림</span>
                    <button
                      type="button"
                      onClick={() => setNotifOpen(false)}
                      className="text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-2.5 max-h-60 overflow-y-auto">
                    {meetupRequests.slice(0, 3).map((req) => (
                      <button
                        key={req.id}
                        type="button"
                        onClick={() => {
                          setNotifOpen(false);
                          onOpenMyPage();
                        }}
                        className="w-full text-left p-2.5 rounded-xl bg-blue-50/60 hover:bg-blue-50 transition-colors cursor-pointer"
                      >
                        <p className="text-[12px] font-bold text-slate-900 truncate">
                          직거래 약속 ({req.status}) · {req.productTitle}
                        </p>
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          {req.safeZone} · {req.preferredDate} {req.preferredTime}
                        </p>
                      </button>
                    ))}
                    <div className="p-2.5 rounded-xl bg-slate-50">
                      <p className="text-[12px] font-semibold text-slate-800">
                        {selectedCampus} 세이프존 안내
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        중앙도서관 1층 로비·학생회관 앞에서 24시간 안심 직거래가 가능합니다.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <button
            type="button"
            aria-label="마이페이지"
            onClick={onOpenMyPage}
            className="w-9 h-9 ml-0.5 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center overflow-hidden hover:ring-2 hover:ring-[#2563EB]/30 transition-all cursor-pointer"
          >
            {userProfile?.avatarUrl ? (
              <img
                src={userProfile.avatarUrl}
                alt={userProfile.nickname}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            ) : (
              <GraduationCap className="w-4 h-4 text-[#2563EB]" />
            )}
          </button>
        </div>
      </header>

      <div className="px-4 pt-3 space-y-3.5">
        {/* Campus Selector + Verified Badge Row */}
        <div className="flex items-center justify-between gap-2 relative">
          <div className="relative">
            <button
              type="button"
              onClick={() => setCampusDropdownOpen((o) => !o)}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-full bg-[#EFF6FF] hover:bg-blue-100/80 text-slate-900 text-[13px] font-bold transition-colors cursor-pointer"
            >
              <BadgeCheck className="w-4 h-4 text-[#2563EB] shrink-0" />
              <span className="truncate max-w-[185px]">{selectedCampus}</span>
              <ChevronDown
                className={`w-4 h-4 text-slate-500 transition-transform ${
                  campusDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {campusDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setCampusDropdownOpen(false)}
                />
                <div className="absolute left-0 mt-1.5 w-60 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-40">
                  <p className="px-3.5 py-1.5 text-[11px] font-semibold text-slate-400">
                    캠퍼스 선택
                  </p>
                  {CAMPUSES.map((campus) => {
                    const active = campus.name === selectedCampus;
                    return (
                      <button
                        key={campus.name}
                        type="button"
                        onClick={() => {
                          onSelectCampus(campus.name);
                          setCampusDropdownOpen(false);
                        }}
                        className={`w-full px-3.5 py-2.5 text-left text-[13px] flex items-center justify-between transition-colors cursor-pointer ${
                          active
                            ? 'bg-blue-50 text-[#2563EB] font-bold'
                            : 'text-slate-700 hover:bg-slate-50 font-medium'
                        }`}
                      >
                        <span>{campus.name}</span>
                        {active && <BadgeCheck className="w-4 h-4 text-[#2563EB]" />}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          <span className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full bg-[#E0F2FE] text-[#0284C7] text-[11px] font-bold whitespace-nowrap shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0284C7]" />
            교내 학생 인증됨
          </span>
        </div>

        {/* Real-time Search Input */}
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="전공서적, 전자기기 검색"
            className="w-full h-11 pl-10 pr-20 rounded-2xl bg-[#EEF2F6] text-[14px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/25 focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              aria-label="검색어 지우기"
              onClick={() => onSearchChange('')}
              className="absolute right-11 w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            aria-label="인증 필터 전환"
            onClick={onToggleVerifiedOnly}
            className={`absolute right-2 w-8 h-8 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
              verifiedOnly
                ? 'bg-blue-100 text-[#2563EB]'
                : 'text-slate-500 hover:bg-slate-200/70'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Interactive 3-Slide Hero Banner Carousel */}
        <div
          className="relative overflow-hidden rounded-2xl shadow-[0_8px_24px_rgba(37,99,235,0.2)] select-none"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${slideIndex * 100}%)` }}
          >
            {HERO_SLIDES.map((slide) => (
              <div
                key={slide.id}
                onClick={() => onSelectCategory(slide.filterCategory)}
                className={`w-full shrink-0 bg-gradient-to-br ${slide.gradient} p-5 text-white relative overflow-hidden cursor-pointer`}
              >
                {/* Decorative translucent outline icon on right */}
                <div className="absolute right-3 top-4 opacity-20 pointer-events-none">
                  {slide.icon === 'book' && <BookOpen className="w-24 h-24 stroke-[1.4]" />}
                  {slide.icon === 'shield' && <ShieldCheck className="w-24 h-24 stroke-[1.4]" />}
                  {slide.icon === 'home' && <HomeIcon className="w-24 h-24 stroke-[1.4]" />}
                </div>

                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/18 backdrop-blur-sm text-[11px] font-semibold text-white mb-2.5">
                  {slide.tag}
                </span>

                <h2 className="text-[20px] font-extrabold leading-[1.3] tracking-tight max-w-[265px] relative z-10">
                  {slide.title}
                </h2>
                <p className="text-[12.5px] text-blue-100 mt-1.5 leading-relaxed max-w-[260px] relative z-10">
                  {slide.subtitle}
                </p>

                <div className="mt-4 flex items-center gap-2 relative z-10">
                  <div className="flex items-center gap-1.5">
                    {HERO_SLIDES.map((s, idx) => (
                      <button
                        key={s.id}
                        type="button"
                        aria-label={`${idx + 1}번 배너 보기`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSlideIndex(idx);
                        }}
                        className={`h-1.5 rounded-full transition-all cursor-pointer ${
                          idx === slideIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/45'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] font-bold text-white/90 ml-1 tabular-nums">
                    {slideIndex + 1} / {HERO_SLIDES.length}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Horizontal Scrollable Category Chips */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 -mx-4 px-4">
          {CATEGORIES.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => onSelectCategory(cat)}
                className={`h-9 px-4 rounded-full text-[13px] font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                  active
                    ? 'bg-[#2563EB] text-white shadow-sm shadow-blue-600/25'
                    : 'bg-[#EEF2F6] text-slate-600 hover:bg-slate-200/80'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Sort Dropdown & Verified Toggle Row */}
        <div className="flex items-center justify-between pt-0.5">
          <div className="relative">
            <button
              type="button"
              onClick={() => setSortDropdownOpen((o) => !o)}
              className="inline-flex items-center gap-1 text-[13px] font-bold text-slate-800 py-1.5 pr-2 cursor-pointer"
            >
              <span>{sortBy}</span>
              <ChevronDown className="w-4 h-4 text-slate-500" />
            </button>

            {sortDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setSortDropdownOpen(false)}
                />
                <div className="absolute left-0 mt-1 w-32 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-40">
                  {(['최신순', '낮은가격순'] as SortOption[]).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        onSortChange(opt);
                        setSortDropdownOpen(false);
                      }}
                      className={`w-full px-3.5 py-2 text-left text-[13px] cursor-pointer ${
                        sortBy === opt
                          ? 'text-[#2563EB] font-bold bg-blue-50/70'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[12.5px] font-medium text-slate-500">인증 학생 거래만</span>
            <button
              type="button"
              role="switch"
              aria-checked={verifiedOnly}
              aria-label="인증 학생 거래만 보기"
              onClick={onToggleVerifiedOnly}
              className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                verifiedOnly ? 'bg-[#2563EB]' : 'bg-slate-300'
              }`}
            >
              <span
                className={`block w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                  verifiedOnly ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* 2-Column Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center my-4">
            <p className="text-[15px] font-bold text-slate-800">조건에 맞는 상품이 없어요</p>
            <p className="text-[13px] text-slate-500 mt-1">
              다른 검색어나 카테고리를 선택해 보세요.
            </p>
            <button
              type="button"
              onClick={() => {
                onSearchChange('');
                onSelectCategory('전체');
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-blue-50 text-[#2563EB] text-[13px] font-bold hover:bg-blue-100 transition-colors cursor-pointer"
            >
              필터 초기화
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredProducts.map((product) => {
              const isLiked = likedProductIds.has(product.id);
              const displayLikes =
                product.likesCount +
                (product.isSample && isLiked ? 1 : 0);

              const badgeBg =
                product.badgeColor === 'teal'
                  ? 'bg-[#0F766E]'
                  : product.badgeColor === 'emerald'
                    ? 'bg-emerald-600'
                    : 'bg-[#2563EB]';

              return (
                <article
                  key={product.id}
                  onClick={() => onSelectProduct(product)}
                  className="bg-white rounded-2xl overflow-hidden border border-slate-100/90 shadow-[0_2px_12px_rgba(15,23,42,0.04)] active:scale-[0.985] transition-transform cursor-pointer flex flex-col"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-[4/3.6] bg-slate-100 overflow-hidden">
                    <img
                      src={product.imageUrls[0]}
                      alt={product.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />

                    {/* Status / Feature Badge */}
                    {product.status === '거래완료' ? (
                      <div className="absolute inset-0 bg-slate-900/45 flex items-center justify-center">
                        <span className="px-3 py-1 rounded-full bg-slate-900/80 text-white text-[12px] font-bold">
                          거래완료
                        </span>
                      </div>
                    ) : product.status === '예약중' ? (
                      <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-md bg-amber-500 text-white text-[10.5px] font-bold shadow-sm">
                        예약중
                      </span>
                    ) : (
                      product.badge && (
                        <span
                          className={`absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-md ${badgeBg} text-white text-[10.5px] font-bold shadow-sm`}
                        >
                          {product.badge}
                        </span>
                      )
                    )}

                    {/* Heart Wishlist Button */}
                    <button
                      type="button"
                      aria-label={isLiked ? '찜 해제' : '상품 찜하기'}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleLike(product);
                      }}
                      className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-white/92 backdrop-blur-sm shadow-md flex items-center justify-center active:scale-90 transition-transform cursor-pointer"
                    >
                      <Heart
                        className={`w-4 h-4 transition-colors ${
                          isLiked
                            ? 'fill-red-500 text-red-500'
                            : 'text-slate-600'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Card Body */}
                  <div className="p-3 flex flex-col flex-1">
                    <span className="inline-flex items-center gap-1 self-start px-2 py-0.5 rounded-md bg-[#EFF6FF] text-[#2563EB] text-[10.5px] font-bold mb-1.5 max-w-full">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="truncate">{product.safeZone}</span>
                    </span>

                    <h3 className="text-[13.5px] font-bold text-slate-900 leading-[1.35] line-clamp-2 min-h-[36px]">
                      {product.title}
                    </h3>

                    <div className="mt-2 flex items-baseline gap-1.5 flex-wrap">
                      <span className="text-[16px] font-extrabold text-slate-900 tabular-nums tracking-tight">
                        {formatKRW(product.price, product.isFree)}
                      </span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-[11px] text-slate-400 line-through tabular-nums">
                          {product.originalPrice.toLocaleString('ko-KR')}원
                        </span>
                      )}
                    </div>

                    <div className="mt-auto pt-2.5 flex items-center justify-between text-[11px] text-slate-400">
                      <span>{formatRelativeTime(product.createdAtMs, product.timeAgo)}</span>
                      <div className="flex items-center gap-2 tabular-nums">
                        <span className="inline-flex items-center gap-0.5 text-slate-500 font-medium">
                          <Heart className="w-3 h-3 fill-red-500 text-red-500" />
                          {displayLikes}
                        </span>
                        {product.chatsCount > 0 && (
                          <span className="inline-flex items-center gap-0.5 text-slate-500 font-medium">
                            <MessageCircle className="w-3 h-3" />
                            {product.chatsCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Bottom Safe-Zone Guidance Card */}
        <div className="mt-2 rounded-2xl bg-[#EFF6FF] border border-blue-100/80 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white text-[#2563EB] flex items-center justify-center shrink-0 shadow-xs">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[13px] font-bold text-slate-900">캠퍼스 안심존 직거래 권장</p>
            <p className="text-[11.5px] text-slate-600 mt-0.5">
              학생회관, 도서관 로비 등 밝고 유동인구 많은 곳에서 거래해요
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
