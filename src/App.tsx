import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import {
  createMeetupProposal,
  fetchPublicProducts,
  fetchUserMeetupRequests,
  fetchUserProfile,
  fetchUserWishlists,
  subscribePublicProducts,
  subscribeUserMeetupRequests,
  subscribeUserProfile,
  subscribeUserWishlists,
  toggleUserWishlist,
  upsertUserProfile,
} from './lib/supabaseService';
import { CAMPUSES, SAMPLE_PRODUCTS } from './data/sampleData';
import {
  ActiveTab,
  CategoryType,
  MeetupRequestRecord,
  ProductItem,
  SortOption,
  UserProfile,
  WishlistRecord,
} from './types';
import { HomeScreen } from './components/HomeScreen';
import { ProductDetailScreen } from './components/ProductDetailScreen';
import { MeetupModal } from './components/MeetupModal';
import { SellScreen } from './components/SellScreen';
import { MyPageScreen } from './components/MyPageScreen';
import { AuthScreen } from './components/AuthScreen';
import { BottomNav } from './components/BottomNav';
import { Toast } from './components/Toast';

export default function App() {
  // Supabase Auth & Profile state
  const [authReady, setAuthReady] = useState(false);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Navigation state
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [authPromptReason, setAuthPromptReason] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<
    { type: 'sell' } | { type: 'meetup'; product: ProductItem } | { type: 'like'; product: ProductItem } | null
  >(null);

  // Home filter state
  const [selectedCampus, setSelectedCampus] = useState<string>(CAMPUSES[0].name);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('전체');
  const [sortBy, setSortBy] = useState<SortOption>('최신순');
  const [verifiedOnly, setVerifiedOnly] = useState(true);

  // Real-time Supabase tables
  const [dbProducts, setDbProducts] = useState<ProductItem[]>([]);
  const [wishlists, setWishlists] = useState<WishlistRecord[]>([]);
  const [meetupRequests, setMeetupRequests] = useState<MeetupRequestRecord[]>([]);

  // Modal & Toast state
  const [meetupTarget, setMeetupTarget] = useState<ProductItem | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    setToast({ message, type });
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
    }, 3000);
  }, []);

  const refreshAllData = useCallback(
    async (uid?: string) => {
      const prods = await fetchPublicProducts();
      setDbProducts(prods);
      const targetUid = uid || authUser?.id;
      if (targetUid) {
        const [prof, wishes, meetups] = await Promise.all([
          fetchUserProfile(targetUid),
          fetchUserWishlists(targetUid),
          fetchUserMeetupRequests(targetUid),
        ]);
        if (prof) setUserProfile(prof);
        setWishlists(wishes);
        setMeetupRequests(meetups);
      }
    },
    [authUser?.id]
  );

  // Initialize & listen to Supabase Auth state
  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setAuthUser(data.session?.user ?? null);
      setAuthReady(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      setAuthUser(user);
      if (!user) {
        setUserProfile(null);
        setWishlists([]);
        setMeetupRequests([]);
      }
      setAuthReady(true);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Subscribe to public Supabase `products` table in real time
  useEffect(() => {
    const unsub = subscribePublicProducts((items) => {
      setDbProducts(items);
    });
    return () => unsub();
  }, []);

  // Subscribe to authenticated user's profile, wishlists, and meetup_requests in real time
  useEffect(() => {
    if (!authUser) return;
    const uid = authUser.id;

    const unsubProfile = subscribeUserProfile(uid, async (prof) => {
      if (prof) {
        setUserProfile(prof);
      } else {
        const meta = authUser.user_metadata || {};
        try {
          const created = await upsertUserProfile(uid, {
            nickname: meta.nickname || authUser.email?.split('@')[0] || '김민준',
            university: meta.university || CAMPUSES[0].name,
            department: meta.department || '컴퓨터공학과 24학번',
          });
          setUserProfile(created);
        } catch {
          // Fallback local profile object if profiles table isn't created yet
          setUserProfile({
            uid,
            nickname: meta.nickname || authUser.email?.split('@')[0] || '김민준',
            university: meta.university || CAMPUSES[0].name,
            department: meta.department || '컴퓨터공학과 24학번',
            mannerTemp: 98.5,
            sellingCount: 0,
            completedCount: 0,
            reviewCount: 0,
            isStudentVerified: true,
          });
        }
      }
    });

    const unsubWish = subscribeUserWishlists(uid, (items) => {
      setWishlists(items);
    });

    const unsubMeetups = subscribeUserMeetupRequests(uid, (items) => {
      setMeetupRequests(items);
    });

    return () => {
      unsubProfile();
      unsubWish();
      unsubMeetups();
    };
  }, [authUser]);

  // Combine real Supabase products (always at the top) + Korean sample products
  const allProducts = useMemo(() => {
    return [...dbProducts, ...SAMPLE_PRODUCTS];
  }, [dbProducts]);

  const selectedProduct = useMemo(() => {
    if (!selectedProductId) return null;
    return allProducts.find((p) => p.id === selectedProductId) || null;
  }, [allProducts, selectedProductId]);

  const likedProductIds = useMemo(() => {
    return new Set(wishlists.map((w) => w.productId));
  }, [wishlists]);

  const myProducts = useMemo(() => {
    if (!authUser) return [];
    return dbProducts.filter((p) => p.sellerId === authUser.id);
  }, [dbProducts, authUser]);

  const relatedProducts = useMemo(() => {
    if (!selectedProduct) return [];
    const sameCat = allProducts.filter(
      (p) => p.id !== selectedProduct.id && p.category === selectedProduct.category
    );
    const others = allProducts.filter(
      (p) => p.id !== selectedProduct.id && p.category !== selectedProduct.category
    );
    return [...sameCat, ...others].slice(0, 6);
  }, [allProducts, selectedProduct]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  };

  const handleSelectTab = (tab: ActiveTab) => {
    setSelectedProductId(null);
    setAuthPromptReason(null);
    setPendingAction(null);
    if (tab === 'sell' && !authUser) {
      setAuthPromptReason('상품을 등록하려면 먼저 재학생 로그인을 해주세요');
      setPendingAction({ type: 'sell' });
    }
    setActiveTab(tab);
    scrollToTop();
  };

  const handleSelectProduct = (product: ProductItem) => {
    setSelectedProductId(product.id);
    scrollToTop();
  };

  const ensureProfileReady = async (): Promise<UserProfile | null> => {
    if (!authUser) return null;
    if (userProfile) return userProfile;
    const fetched = await fetchUserProfile(authUser.id);
    if (fetched) {
      setUserProfile(fetched);
      return fetched;
    }
    const meta = authUser.user_metadata || {};
    const created = await upsertUserProfile(authUser.id, {
      nickname: meta.nickname || authUser.email?.split('@')[0] || '캠퍼스학우',
      university: meta.university || selectedCampus,
      department: meta.department || '컴퓨터공학과 24학번',
    });
    setUserProfile(created);
    return created;
  };

  const handleToggleLike = async (product: ProductItem) => {
    if (!authUser) {
      setPendingAction({ type: 'like', product });
      setAuthPromptReason('관심 상품을 찜하려면 먼저 로그인해 주세요');
      setSelectedProductId(null);
      setActiveTab('mypage');
      showToast('로그인 후 찜하기 기능을 이용할 수 있어요.');
      return;
    }

    const currentlyLiked = likedProductIds.has(product.id);
    try {
      const nowLiked = await toggleUserWishlist(authUser.id, product, currentlyLiked);
      await refreshAllData(authUser.id);
      showToast(nowLiked ? '찜한 상품에 추가되었습니다!' : '찜 목록에서 해제되었습니다.');
    } catch {
      showToast('찜 상태 저장 중 오류가 발생했습니다.', 'error');
    }
  };

  const handleRemoveWishlist = async (wishlist: WishlistRecord) => {
    if (!authUser) return;
    const matched = allProducts.find((p) => p.id === wishlist.productId) || {
      id: wishlist.productId,
      isSample: wishlist.isSample,
      sellerId: '',
      sellerNickname: '',
      sellerDepartment: '',
      sellerUniversity: selectedCampus,
      sellerMannerTemp: 98.5,
      sellerVerified: true,
      title: wishlist.productTitle,
      category: '전공서적' as const,
      price: wishlist.productPrice,
      isFree: wishlist.productPrice === 0,
      allowPriceOffer: false,
      safeZone: wishlist.productSafeZone,
      description: '',
      imageUrls: [wishlist.productImageUrl],
      status: '판매중' as const,
      likesCount: 1,
      chatsCount: 0,
      viewsCount: 0,
      createdAtMs: wishlist.createdAtMs,
    };

    try {
      await toggleUserWishlist(authUser.id, matched, true);
      await refreshAllData(authUser.id);
      showToast('찜 목록에서 해제되었습니다.');
    } catch {
      showToast('찜 해제 중 오류가 발생했습니다.', 'error');
    }
  };

  const handleOpenMeetup = (product: ProductItem) => {
    if (!authUser) {
      setPendingAction({ type: 'meetup', product });
      setAuthPromptReason('직거래 약속을 제안하려면 먼저 로그인해 주세요');
      setSelectedProductId(null);
      setActiveTab('mypage');
      return;
    }
    setMeetupTarget(product);
  };

  const handleSubmitMeetup = async (payload: {
    safeZone: string;
    preferredDate: string;
    preferredTime: string;
    note: string;
  }) => {
    if (!meetupTarget || !authUser) return;
    const profile = await ensureProfileReady();
    if (!profile) return;

    try {
      const created = await createMeetupProposal(profile, meetupTarget, payload);
      setMeetupRequests((prev) => [created, ...prev.filter((r) => r.id !== created.id)]);
      setMeetupTarget(null);
      void refreshAllData(authUser.id);
      showToast('직거래 약속 요청이 전송되었습니다!');
    } catch (err) {
      const msg = err instanceof Error ? err.message : '약속 요청 전송 중 오류가 발생했습니다.';
      showToast(msg, 'error');
    }
  };

  const handleAuthSuccess = async (profile: UserProfile) => {
    setUserProfile(profile);
    setSelectedCampus(profile.university);
    setAuthPromptReason(null);

    const action = pendingAction;
    setPendingAction(null);

    if (action?.type === 'sell') {
      setActiveTab('sell');
      scrollToTop();
    } else if (action?.type === 'meetup') {
      setActiveTab('home');
      setSelectedProductId(action.product.id);
      setMeetupTarget(action.product);
    } else if (action?.type === 'like') {
      setActiveTab('home');
      await toggleUserWishlist(profile.uid, action.product, false).catch(() => undefined);
      await refreshAllData(profile.uid);
      showToast('찜한 상품에 추가되었습니다!');
    } else {
      setActiveTab('mypage');
      scrollToTop();
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setAuthUser(null);
    setUserProfile(null);
    setSelectedProductId(null);
    setActiveTab('home');
    showToast('안전하게 로그아웃되었습니다.');
  };

  const handleSearchTag = (tag: string) => {
    setSelectedProductId(null);
    setActiveTab('home');
    setSelectedCategory('전체');
    setSearchQuery(tag);
    scrollToTop();
  };

  const showBottomNav = !selectedProduct;

  return (
    <div className="min-h-screen bg-[#EEF2F7] flex justify-center">
      {/* Centered Mobile App Frame (max-width 430px on desktop, full width on mobile) */}
      <div className="w-full max-w-[430px] min-h-screen bg-[#F8FAFC] relative md:shadow-[0_0_48px_rgba(15,23,42,0.09)] md:border-x md:border-slate-200/80 overflow-x-clip">
        {!authReady ? (
          <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-white">
            <div className="w-10 h-10 rounded-full border-3 border-blue-100 border-t-[#2563EB] animate-spin" />
            <p className="text-[13px] font-semibold text-slate-500">캠퍼스마켓 불러오는 중...</p>
          </div>
        ) : selectedProduct ? (
          <ProductDetailScreen
            product={selectedProduct}
            relatedProducts={relatedProducts}
            isLiked={likedProductIds.has(selectedProduct.id)}
            onBack={() => {
              setSelectedProductId(null);
              scrollToTop();
            }}
            onToggleLike={handleToggleLike}
            onOpenMeetup={handleOpenMeetup}
            onSelectProduct={handleSelectProduct}
            onSearchTag={handleSearchTag}
            onShowToast={showToast}
          />
        ) : activeTab === 'home' ? (
          <HomeScreen
            products={allProducts}
            selectedCampus={selectedCampus}
            onSelectCampus={(campus) => {
              setSelectedCampus(campus);
              showToast(`${campus} 캠퍼스로 변경되었습니다.`);
            }}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            sortBy={sortBy}
            onSortChange={setSortBy}
            verifiedOnly={verifiedOnly}
            onToggleVerifiedOnly={() => setVerifiedOnly((v) => !v)}
            likedProductIds={likedProductIds}
            onToggleLike={handleToggleLike}
            onSelectProduct={handleSelectProduct}
            onOpenMyPage={() => handleSelectTab('mypage')}
            userProfile={userProfile}
            meetupRequests={meetupRequests}
          />
        ) : activeTab === 'sell' ? (
          authUser ? (
            userProfile ? (
              <SellScreen
                profile={userProfile}
                onBack={() => handleSelectTab('home')}
                onSuccess={(created) => {
                  setDbProducts((prev) => [created, ...prev.filter((p) => p.id !== created.id)]);
                  void refreshAllData(authUser.id);
                  setSelectedCategory('전체');
                  setSearchQuery('');
                  setSortBy('최신순');
                  setActiveTab('home');
                  scrollToTop();
                }}
                onShowToast={showToast}
              />
            ) : (
              <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-white">
                <div className="w-9 h-9 rounded-full border-3 border-blue-100 border-t-[#2563EB] animate-spin" />
                <p className="text-[13px] font-semibold text-slate-500">학우 프로필 불러오는 중...</p>
              </div>
            )
          ) : (
            <AuthScreen
              reasonMessage={authPromptReason || '상품을 등록하려면 먼저 로그인해 주세요'}
              onSuccess={handleAuthSuccess}
              onBack={() => handleSelectTab('home')}
              onShowToast={showToast}
            />
          )
        ) : authUser ? (
          userProfile ? (
            <MyPageScreen
              profile={userProfile}
              myProducts={myProducts}
              allProducts={allProducts}
              wishlists={wishlists}
              meetupRequests={meetupRequests}
              onSelectProduct={handleSelectProduct}
              onRemoveWishlist={handleRemoveWishlist}
              onProfileUpdated={(updated) => {
                setUserProfile(updated);
                setSelectedCampus(updated.university);
              }}
              onRefreshData={() => void refreshAllData(authUser.id)}
              onGoSell={() => handleSelectTab('sell')}
              onLogout={handleLogout}
              onShowToast={showToast}
            />
          ) : (
            <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-white">
              <div className="w-9 h-9 rounded-full border-3 border-blue-100 border-t-[#2563EB] animate-spin" />
              <p className="text-[13px] font-semibold text-slate-500">학우 프로필 불러오는 중...</p>
            </div>
          )
        ) : (
          <AuthScreen
            reasonMessage={authPromptReason || '교내 재학생 인증 후 안전한 직거래를 시작하세요'}
            onSuccess={handleAuthSuccess}
            onBack={() => handleSelectTab('home')}
            onShowToast={showToast}
          />
        )}

        {/* Fixed 3-Tab Bottom Navigation Bar */}
        {showBottomNav && (
          <BottomNav activeTab={activeTab} onSelectTab={handleSelectTab} />
        )}

        {/* Centered Meetup Proposal Modal */}
        {meetupTarget && (
          <MeetupModal
            product={meetupTarget}
            onClose={() => setMeetupTarget(null)}
            onSubmit={handleSubmitMeetup}
          />
        )}

        {/* Korean Toast Notification */}
        <Toast message={toast?.message || null} type={toast?.type} />
      </div>
    </div>
  );
}
