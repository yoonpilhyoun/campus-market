import React, { useState } from 'react';
import {
  BadgeCheck,
  Calendar,
  Clock,
  Edit3,
  GraduationCap,
  Handshake,
  Heart,
  LogOut,
  MapPin,
  Package,
  Thermometer,
  Trash2,
  X,
} from 'lucide-react';
import { ASSET_IMAGES, CAMPUSES, formatKRW } from '../data/sampleData';
import {
  deleteProductListing,
  updateMeetupRequestStatus,
  updateProductStatus,
  updateUserProfile,
} from '../lib/supabaseService';
import {
  MeetupRequestRecord,
  MeetupStatus,
  ProductItem,
  ProductStatus,
  UserProfile,
  WishlistRecord,
} from '../types';

interface MyPageScreenProps {
  profile: UserProfile;
  myProducts: ProductItem[];
  allProducts: ProductItem[];
  wishlists: WishlistRecord[];
  meetupRequests: MeetupRequestRecord[];
  onSelectProduct: (product: ProductItem) => void;
  onRemoveWishlist: (wishlist: WishlistRecord) => void;
  onProfileUpdated: (profile: UserProfile) => void;
  onRefreshData: () => void;
  onGoSell: () => void;
  onLogout: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error') => void;
}

type MyTab = 'selling' | 'wishlist' | 'meetups';

export function MyPageScreen({
  profile,
  myProducts,
  allProducts,
  wishlists,
  meetupRequests,
  onSelectProduct,
  onRemoveWishlist,
  onProfileUpdated,
  onRefreshData,
  onGoSell,
  onLogout,
  onShowToast,
}: MyPageScreenProps) {
  const [activeTab, setActiveTab] = useState<MyTab>('selling');
  const [editingProfile, setEditingProfile] = useState(false);
  const [editNickname, setEditNickname] = useState(profile.nickname);
  const [editUniversity, setEditUniversity] = useState(profile.university);
  const [editDepartment, setEditDepartment] = useState(profile.department);
  const [savingProfile, setSavingProfile] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editNickname.trim() || !editDepartment.trim()) {
      onShowToast('닉네임과 학과/학번을 입력해 주세요.', 'error');
      return;
    }
    setSavingProfile(true);
    try {
      const updated = await updateUserProfile(profile.uid, {
        nickname: editNickname,
        university: editUniversity,
        department: editDepartment,
      });
      onProfileUpdated(updated);
      setEditingProfile(false);
      onShowToast('프로필 정보가 수정되었습니다.');
    } catch {
      onShowToast('프로필 수정 중 오류가 발생했습니다.', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangeProductStatus = async (product: ProductItem, nextStatus: ProductStatus) => {
    try {
      await updateProductStatus(product.id, nextStatus, profile);
      onRefreshData();
      onShowToast(`상품 상태가 '${nextStatus}'으로 변경되었습니다.`);
    } catch {
      onShowToast('상태 변경 중 오류가 발생했습니다.', 'error');
    }
  };

  const handleDeleteProduct = async (product: ProductItem) => {
    try {
      await deleteProductListing(product.id, profile);
      onRefreshData();
      onShowToast('판매글이 삭제되었습니다.');
    } catch {
      onShowToast('삭제 중 오류가 발생했습니다.', 'error');
    }
  };

  const handleMeetupAction = async (req: MeetupRequestRecord, nextStatus: MeetupStatus) => {
    try {
      await updateMeetupRequestStatus(req.id, nextStatus);
      onRefreshData();
      const label =
        nextStatus === '수락됨'
          ? '직거래 약속을 수락했습니다!'
          : nextStatus === '완료됨'
            ? '직거래가 완료 처리되었습니다!'
            : '직거래 약속이 취소되었습니다.';
      onShowToast(label);
    } catch {
      onShowToast('약속 상태 변경 중 오류가 발생했습니다.', 'error');
    }
  };

  const statusBadgeStyle = (status: MeetupStatus) => {
    switch (status) {
      case '수락됨':
        return 'bg-blue-100 text-[#1D4ED8]';
      case '완료됨':
        return 'bg-emerald-100 text-emerald-700';
      case '거절됨':
        return 'bg-slate-200 text-slate-600';
      default:
        return 'bg-amber-100 text-amber-800';
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-28">
      {/* Sticky Top Header */}
      <header className="sticky top-0 z-30 h-14 bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 flex items-center justify-between">
        <span className="text-[17px] font-extrabold text-slate-900">마이페이지</span>
        <button
          type="button"
          onClick={onLogout}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12.5px] font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          로그아웃
        </button>
      </header>

      <div className="px-4 pt-4 space-y-4">
        {/* Profile Card */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_4px_20px_rgba(15,23,42,0.04)]">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="relative shrink-0">
                <img
                  src={profile.avatarUrl || ASSET_IMAGES.studentAvatar}
                  alt={profile.nickname}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-full object-cover border-2 border-blue-100"
                />
                <span className="w-6 h-6 rounded-full bg-[#2563EB] text-white flex items-center justify-center absolute -bottom-0.5 -right-0.5 ring-2 ring-white">
                  <BadgeCheck className="w-3.5 h-3.5" />
                </span>
              </div>

              <div className="min-w-0">
                <h2 className="text-[18px] font-extrabold text-slate-900 truncate">
                  {profile.nickname}
                </h2>
                <p className="text-[12.5px] font-semibold text-slate-600 truncate mt-0.5">
                  {profile.university}
                </p>
                <p className="text-[12px] text-[#2563EB] font-bold flex items-center gap-1 mt-0.5">
                  <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{profile.department}</span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setEditNickname(profile.nickname);
                setEditUniversity(profile.university);
                setEditDepartment(profile.department);
                setEditingProfile(true);
              }}
              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center shrink-0 transition-colors cursor-pointer"
              aria-label="프로필 수정"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>

          {/* Manner Temperature Card */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between text-[13px] mb-2">
              <span className="inline-flex items-center gap-1.5 font-bold text-slate-700">
                <Thermometer className="w-4 h-4 text-[#2563EB]" />
                매너온도
              </span>
              <span className="text-[17px] font-extrabold text-[#2563EB] tabular-nums">
                {profile.mannerTemp.toFixed(1)}°C
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#2563EB] to-[#38BDF8]"
                style={{ width: `${Math.min(100, profile.mannerTemp)}%` }}
              />
            </div>

            {/* Summary Stats */}
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-2xl bg-[#F8FAFC] py-2.5">
                <p className="text-[11px] text-slate-500 font-medium">내 판매글</p>
                <p className="text-[16px] font-extrabold text-slate-900 mt-0.5 tabular-nums">
                  {myProducts.length}
                </p>
              </div>
              <div className="rounded-2xl bg-[#F8FAFC] py-2.5">
                <p className="text-[11px] text-slate-500 font-medium">찜한 상품</p>
                <p className="text-[16px] font-extrabold text-slate-900 mt-0.5 tabular-nums">
                  {wishlists.length}
                </p>
              </div>
              <div className="rounded-2xl bg-[#EFF6FF] py-2.5">
                <p className="text-[11px] text-[#2563EB] font-semibold">직거래 약속</p>
                <p className="text-[16px] font-extrabold text-[#2563EB] mt-0.5 tabular-nums">
                  {meetupRequests.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 3-Tab Switcher */}
        <div className="grid grid-cols-3 bg-white p-1 rounded-2xl border border-slate-100 shadow-xs">
          {(
            [
              { id: 'selling', label: '내 판매글' },
              { id: 'wishlist', label: '찜한 상품' },
              { id: 'meetups', label: '직거래 약속 내역' },
            ] as { id: MyTab; label: string }[]
          ).map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`h-10 rounded-xl text-[12.5px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                  active
                    ? 'bg-[#2563EB] text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab 1: My Selling Products */}
        {activeTab === 'selling' && (
          <div className="space-y-3">
            {myProducts.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-100 p-8 text-center">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center mx-auto mb-3">
                  <Package className="w-6 h-6" />
                </div>
                <p className="text-[15px] font-bold text-slate-900">아직 등록한 판매글이 없어요</p>
                <p className="text-[12.5px] text-slate-500 mt-1">
                  안 쓰는 전공서적이나 자취템을 학우들에게 판매해 보세요!
                </p>
                <button
                  type="button"
                  onClick={onGoSell}
                  className="mt-4 px-5 h-11 rounded-xl bg-[#2563EB] text-white text-[13.5px] font-bold hover:bg-[#1D4ED8] transition-colors cursor-pointer"
                >
                  첫 상품 등록하기
                </button>
              </div>
            ) : (
              myProducts.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-100 p-3.5 shadow-[0_2px_10px_rgba(15,23,42,0.03)] space-y-3"
                >
                  <div
                    onClick={() => onSelectProduct(item)}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <img
                      src={item.imageUrls[0]}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className="w-18 h-18 rounded-xl object-cover shrink-0 bg-slate-100"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span
                          className={`px-2 py-0.5 rounded text-[10.5px] font-bold ${
                            item.status === '거래완료'
                              ? 'bg-slate-200 text-slate-600'
                              : item.status === '예약중'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-50 text-[#2563EB]'
                          }`}
                        >
                          {item.status}
                        </span>
                        <span className="text-[11px] text-slate-400 truncate">
                          {item.safeZone}
                        </span>
                      </div>
                      <p className="text-[14px] font-bold text-slate-900 truncate">{item.title}</p>
                      <p className="text-[15px] font-extrabold text-slate-900 mt-0.5 tabular-nums">
                        {formatKRW(item.price, item.isFree)}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                    {item.status !== '거래완료' ? (
                      <div className="flex items-center gap-1.5">
                        {item.status !== '예약중' && (
                          <button
                            type="button"
                            onClick={() => handleChangeProductStatus(item, '예약중')}
                            className="px-2.5 h-8 rounded-lg bg-amber-50 text-amber-700 text-[11.5px] font-bold hover:bg-amber-100 cursor-pointer"
                          >
                            예약중 변경
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleChangeProductStatus(item, '거래완료')}
                          className="px-2.5 h-8 rounded-lg bg-blue-50 text-[#2563EB] text-[11.5px] font-bold hover:bg-blue-100 cursor-pointer"
                        >
                          거래완료
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11.5px] font-semibold text-slate-400">
                        거래 완료된 상품입니다
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeleteProduct(item)}
                      className="inline-flex items-center gap-1 px-2.5 h-8 rounded-lg text-red-500 hover:bg-red-50 text-[11.5px] font-bold cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      삭제
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Wishlisted Items */}
        {activeTab === 'wishlist' && (
          <div className="space-y-3">
            {wishlists.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-100 p-8 text-center">
                <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-3">
                  <Heart className="w-6 h-6" />
                </div>
                <p className="text-[15px] font-bold text-slate-900">찜한 상품이 아직 없어요</p>
                <p className="text-[12.5px] text-slate-500 mt-1">
                  마음에 드는 상품의 하트 아이콘을 눌러 모아보세요!
                </p>
              </div>
            ) : (
              wishlists.map((w) => {
                const matchedProduct = allProducts.find((p) => p.id === w.productId);
                return (
                  <div
                    key={w.id}
                    className="bg-white rounded-2xl border border-slate-100 p-3.5 flex items-center gap-3 shadow-[0_2px_10px_rgba(15,23,42,0.03)]"
                  >
                    <img
                      src={w.productImageUrl}
                      alt={w.productTitle}
                      referrerPolicy="no-referrer"
                      onClick={() => matchedProduct && onSelectProduct(matchedProduct)}
                      className="w-16 h-16 rounded-xl object-cover shrink-0 bg-slate-100 cursor-pointer"
                    />
                    <div
                      onClick={() => matchedProduct && onSelectProduct(matchedProduct)}
                      className="min-w-0 flex-1 cursor-pointer"
                    >
                      <span className="text-[11px] font-bold text-[#2563EB] flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {w.productSafeZone}
                      </span>
                      <p className="text-[14px] font-bold text-slate-900 truncate mt-0.5">
                        {w.productTitle}
                      </p>
                      <p className="text-[15px] font-extrabold text-slate-900 tabular-nums mt-0.5">
                        {formatKRW(w.productPrice, w.productPrice === 0)}
                      </p>
                    </div>
                    <button
                      type="button"
                      aria-label="찜 해제"
                      onClick={() => onRemoveWishlist(w)}
                      className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0 hover:bg-red-100 transition-colors cursor-pointer"
                    >
                      <Heart className="w-4.5 h-4.5 fill-red-500 text-red-500" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab 3: Meetup Requests */}
        {activeTab === 'meetups' && (
          <div className="space-y-3">
            {meetupRequests.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-100 p-8 text-center">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center mx-auto mb-3">
                  <Handshake className="w-6 h-6" />
                </div>
                <p className="text-[15px] font-bold text-slate-900">직거래 약속 내역이 없어요</p>
                <p className="text-[12.5px] text-slate-500 mt-1">
                  상품 상세에서 &quot;직거래 약속 잡기&quot;로 안전하게 약속을 제안해 보세요!
                </p>
              </div>
            ) : (
              meetupRequests.map((req) => {
                const isSeller = req.sellerId === profile.uid;
                const canMutate = req.status === '요청됨' || req.status === '수락됨';
                return (
                  <div
                    key={req.id}
                    className="bg-white rounded-2xl border border-slate-100 p-4 shadow-[0_2px_10px_rgba(15,23,42,0.03)] space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11.5px] font-bold text-slate-500">
                        {isSeller
                          ? `받은 요청 · ${req.buyerNickname} (${req.buyerDepartment})`
                          : `보낸 요청 · ${req.sellerNickname}`}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${statusBadgeStyle(
                          req.status
                        )}`}
                      >
                        {req.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <img
                        src={req.productImageUrl}
                        alt={req.productTitle}
                        referrerPolicy="no-referrer"
                        className="w-14 h-14 rounded-xl object-cover shrink-0 bg-slate-100"
                      />
                      <div className="min-w-0">
                        <p className="text-[14px] font-bold text-slate-900 truncate">
                          {req.productTitle}
                        </p>
                        <p className="text-[14px] font-extrabold text-[#2563EB] tabular-nums mt-0.5">
                          {formatKRW(req.productPrice, req.productPrice === 0)}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-xl bg-[#F8FAFC] p-3 space-y-1.5 text-[12px] text-slate-700">
                      <p className="flex items-center gap-1.5 font-semibold">
                        <MapPin className="w-3.5 h-3.5 text-[#2563EB]" />
                        {req.safeZone}
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{req.preferredDate}</span>
                        <Clock className="w-3.5 h-3.5 text-slate-400 ml-2" />
                        <span>{req.preferredTime}</span>
                      </p>
                      {req.note && (
                        <p className="text-[11.5px] text-slate-500 pt-1 border-t border-slate-200/70">
                          &quot;{req.note}&quot;
                        </p>
                      )}
                    </div>

                    {canMutate && (
                      <div className="flex items-center gap-2">
                        {isSeller && req.status === '요청됨' && (
                          <button
                            type="button"
                            onClick={() => handleMeetupAction(req, '수락됨')}
                            className="flex-1 h-9 rounded-xl bg-[#2563EB] text-white text-[12.5px] font-bold hover:bg-[#1D4ED8] cursor-pointer"
                          >
                            약속 수락
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleMeetupAction(req, '완료됨')}
                          className="flex-1 h-9 rounded-xl bg-blue-50 text-[#2563EB] text-[12.5px] font-bold hover:bg-blue-100 cursor-pointer"
                        >
                          거래 완료
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMeetupAction(req, '거절됨')}
                          className="px-3.5 h-9 rounded-xl bg-slate-100 text-slate-600 text-[12.5px] font-bold hover:bg-slate-200 cursor-pointer"
                        >
                          취소
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {editingProfile && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-[2px] flex items-center justify-center p-4"
          onClick={() => setEditingProfile(false)}
        >
          <form
            onSubmit={handleSaveProfile}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[360px] bg-white rounded-3xl p-5 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-[16px] font-extrabold text-slate-900">프로필 수정</h3>
              <button
                type="button"
                onClick={() => setEditingProfile(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-[12.5px] font-bold text-slate-700 mb-1">닉네임</label>
              <input
                type="text"
                value={editNickname}
                onChange={(e) => setEditNickname(e.target.value)}
                maxLength={30}
                className="w-full h-11 px-3.5 rounded-xl bg-[#F1F5F9] text-[14px] text-slate-900"
              />
            </div>

            <div>
              <label className="block text-[12.5px] font-bold text-slate-700 mb-1">대학교</label>
              <select
                value={editUniversity}
                onChange={(e) => setEditUniversity(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl bg-[#F1F5F9] text-[14px] text-slate-900"
              >
                {CAMPUSES.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[12.5px] font-bold text-slate-700 mb-1">학과 / 학번</label>
              <input
                type="text"
                value={editDepartment}
                onChange={(e) => setEditDepartment(e.target.value)}
                maxLength={60}
                className="w-full h-11 px-3.5 rounded-xl bg-[#F1F5F9] text-[14px] text-slate-900"
              />
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="w-full h-11 rounded-xl bg-[#2563EB] text-white font-bold text-[14px] hover:bg-[#1D4ED8] disabled:opacity-60 cursor-pointer"
            >
              {savingProfile ? '저장 중...' : '저장하기'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
