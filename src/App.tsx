import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth } from './lib/firebase';
import {
  createMeetupProposal,
  createUserProfile,
  fetchUserProfile,
  subscribePublicProducts,
  subscribeUserMeetupRequests,
  subscribeUserProfile,
  subscribeUserWishlists,
  toggleUserWishlist,
} from './lib/firestoreService';
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
  // Auth & Profile state
  const [authReady, setAuthReady] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
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

  // Real-time Firestore collections
  const [firestoreProducts, setFirestoreProducts] = useState<ProductItem[]>([]);
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

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (!user) {
        setUserProfile(null);
        setWishlists([]);
        setMeetupRequests([]);
      }
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  // Subscribe to public Firestore products in real time
  useEffect(() => {
    const unsub = subscribePublicProducts((items) => {
      setFirestoreProducts(items);
    });
    return () => unsub();
  }, []);

  // Subscribe to authenticated user's profile, wishlists, and meetup_requests
  useEffect(() => {
    if (!firebaseUser) return;
    const uid = firebaseUser.uid;

    const unsubProfile = subscribeUserProfile(uid, async (prof) => {
      if (prof) {
        setUserProfile(prof);
      } else {
        const existing = await fetchUserProfile(uid);
        if (existing) {
          setUserProfile(existing);
        } else {
          const created = await createUserProfile(uid, {
            nickname: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || '김민준',
            university: CAMPUSES[0].name,
            department: '컴퓨터공학과 24학번',
            avatarUrl: firebaseUser.photoURL || undefined,
          });
          setUserProfile(created);
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
  }, [firebaseUser]);

  // Combine user-posted Firestore products (always on top) + Korean sample items
  const allProducts = useMemo(() => {
    return [...firestoreProducts, ...SAMPLE_PRODUCTS];
  }, [firestoreProducts]);

  const selectedProduct = useMemo(() => {
    if (!selectedProductId) return null;
    return allProducts.find((p) => p.id === selectedProductId) || null;
  }, [allProducts, selectedProductId]);

  const likedProductIds = useMemo(() => {
    return new Set(wishlists.map((w) => w.productId));
  }, [wishlists]);

  const myProducts = useMemo(() => {
    if (!firebaseUser) return [];
    return firestoreProducts.filter((p) => p.sellerId === firebaseUser.uid);
  }, [firestoreProducts, firebaseUser]);

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
    if (tab === 'sell' && !firebaseUser) {
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
    if (!firebaseUser) return null;
    if (userProfile) return userProfile;
    const fetched = await fetchUserProfile(firebaseUser.uid);
    if (fetched) {
      setUserProfile(fetched);
      return fetched;
    }
    const created = await createUserProfile(firebaseUser.uid, {
      nickname: firebaseUser.displayName || '캠퍼스학우',
      university: selectedCampus,
      department: '컴퓨터공학과 24학번',
      avatarUrl: firebaseUser.photoURL || undefined,
    });
    setUserProfile(created);
    return created;
  };

  const handleToggleLike = async (product: ProductItem) => {
    if (!firebaseUser) {
      setPendingAction({ type: 'like', product });
      setAuthPromptReason('관심 상품을 찜하려면 먼저 로그인해 주세요');
      setSelectedProductId(null);
      setActiveTab('mypage');
      showToast('로그인 후 찜하기 기능을 이용할 수 있어요.');
      return;
    }

    const currentlyLiked = likedProductIds.has(product.id);
    try {
      const nowLiked = await toggleUserWishlist(firebaseUser.uid, product, currentlyLiked);
      showToast(nowLiked ? '찜한 상품에 추가되었습니다!' : '찜 목록에서 해제되었습니다.');
    } catch {
      showToast('찜 상태 저장 중 오류가 발생했습니다.', 'error');
    }
  };

  const handleRemoveWishlist = async (wishlist: WishlistRecord) => {
    if (!firebaseUser) return;
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
      await toggleUserWishlist(firebaseUser.uid, matched, true);
      showToast('찜 목록에서 해제되었습니다.');
    } catch {
      showToast('찜 해제 중 오류가 발생했습니다.', 'error');
    }
  };

  const handleOpenMeetup = (product: ProductItem) => {
    if (!firebaseUser) {
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
    if (!meetupTarget || !firebaseUser) return;
    const profile = await ensureProfileReady();
    if (!profile) return;

    try {
      await createMeetupProposal(profile, meetupTarget, payload);
      setMeetupTarget(null);
      showToast('직거래 약속 요청이 전송되었습니다!');
    } catch {
      showToast('약속 요청 전송 중 오류가 발생했습니다.', 'error');
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
      showToast('찜한 상품에 추가되었습니다!');
    } else {
      setActiveTab('mypage');
      scrollToTop();
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
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
          firebaseUser ? (
            userProfile ? (
              <SellScreen
                profile={userProfile}
                onBack={() => handleSelectTab('home')}
                onSuccess={() => {
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
        ) : firebaseUser ? (
          userProfile ? (
            <MyPageScreen
              profile={userProfile}
              myProducts={myProducts}
              allProducts={allProducts}
              wishlists={wishlists}
              meetupRequests={meetupRequests}
              onSelectProduct={handleSelectProduct}
              onRemoveWishlist={handleRemoveWishlist}
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
