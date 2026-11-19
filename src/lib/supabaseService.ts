import { supabase } from './supabase';
import { ASSET_IMAGES, CAMPUSES } from '../data/sampleData';
import {
  MeetupRequestRecord,
  MeetupStatus,
  ProductCategory,
  ProductItem,
  ProductStatus,
  UserProfile,
  WishlistRecord,
} from '../types';

type Unsubscribe = () => void;

interface ProfileRow {
  id: string;
  nickname: string;
  university: string;
  department: string;
  manner_temp: number;
  selling_count: number;
  completed_count: number;
  review_count: number;
  avatar_url: string | null;
  is_student_verified: boolean;
  created_at: string;
  updated_at: string;
}

interface ProductRow {
  id: string;
  seller_id: string;
  seller_name: string;
  seller_major: string;
  seller_university: string;
  seller_manner_temp: number;
  seller_avatar_url: string | null;
  seller_verified: boolean;
  title: string;
  category: string;
  price: number;
  original_price: number | null;
  is_free: boolean;
  allow_price_offer: boolean;
  safe_zone: string;
  safe_zone_detail: string | null;
  description: string;
  image_url: string;
  image_urls: string[] | null;
  status: string;
  badge: string | null;
  hashtags: string[] | null;
  likes_count: number;
  chats_count: number;
  views_count: number;
  created_at: string;
}

interface WishlistRow {
  id: string;
  user_id: string;
  product_id: string;
  product_title: string;
  product_price: number;
  product_image_url: string;
  product_safe_zone: string;
  product_category: string;
  is_sample: boolean;
  created_at: string;
}

interface MeetupRequestRow {
  id: string;
  product_id: string;
  product_title: string;
  product_price: number;
  product_image_url: string;
  buyer_id: string;
  buyer_nickname: string;
  buyer_department: string;
  seller_id: string;
  seller_nickname: string;
  university: string;
  safe_zone: string;
  preferred_date: string;
  preferred_time: string;
  note: string | null;
  status: string;
  created_at: string;
}

function mapProfile(row: ProfileRow): UserProfile {
  return {
    uid: row.id,
    nickname: row.nickname || '캠퍼스학우',
    university: row.university || CAMPUSES[0].name,
    department: row.department || '컴퓨터공학과 24학번',
    mannerTemp: Number(row.manner_temp ?? 98.5),
    sellingCount: Number(row.selling_count ?? 0),
    completedCount: Number(row.completed_count ?? 0),
    reviewCount: Number(row.review_count ?? 0),
    avatarUrl: row.avatar_url || ASSET_IMAGES.studentAvatar,
    isStudentVerified: row.is_student_verified ?? true,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapProduct(row: ProductRow): ProductItem {
  const urls =
    Array.isArray(row.image_urls) && row.image_urls.length > 0
      ? row.image_urls
      : row.image_url
        ? [row.image_url]
        : [ASSET_IMAGES.stewartCalc];

  return {
    id: row.id,
    isSample: false,
    sellerId: row.seller_id,
    sellerNickname: row.seller_name || '캠퍼스학우',
    sellerDepartment: row.seller_major || '재학생',
    sellerUniversity: row.seller_university || CAMPUSES[0].name,
    sellerMannerTemp: Number(row.seller_manner_temp ?? 98.5),
    sellerAvatarUrl: row.seller_avatar_url || ASSET_IMAGES.studentAvatar,
    sellerVerified: row.seller_verified ?? true,
    title: row.title,
    category: (row.category as ProductCategory) || '전공서적',
    price: Number(row.price ?? 0),
    originalPrice: row.original_price != null ? Number(row.original_price) : undefined,
    isFree: Boolean(row.is_free),
    allowPriceOffer: Boolean(row.allow_price_offer),
    safeZone: row.safe_zone || '중앙도서관 1층 로비',
    safeZoneDetail: row.safe_zone_detail || undefined,
    description: row.description || '',
    imageUrls: urls,
    status: (row.status as ProductStatus) || '판매중',
    badge: row.badge || (row.is_free ? '나눔' : '새 등록'),
    badgeColor: row.is_free ? 'emerald' : 'blue',
    hashtags: Array.isArray(row.hashtags) ? row.hashtags : [],
    likesCount: Number(row.likes_count ?? 0),
    chatsCount: Number(row.chats_count ?? 0),
    viewsCount: Number(row.views_count ?? 0),
    createdAtMs: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
  };
}

function mapWishlist(row: WishlistRow): WishlistRecord {
  return {
    id: row.id,
    userId: row.user_id,
    productId: row.product_id,
    productTitle: row.product_title,
    productPrice: Number(row.product_price ?? 0),
    productImageUrl: row.product_image_url || ASSET_IMAGES.stewartCalc,
    productSafeZone: row.product_safe_zone || '',
    productCategory: row.product_category || '전공서적',
    isSample: Boolean(row.is_sample),
    createdAtMs: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
  };
}

function mapMeetup(row: MeetupRequestRow): MeetupRequestRecord {
  return {
    id: row.id,
    productId: row.product_id,
    productTitle: row.product_title,
    productPrice: Number(row.product_price ?? 0),
    productImageUrl: row.product_image_url || ASSET_IMAGES.stewartCalc,
    buyerId: row.buyer_id,
    buyerNickname: row.buyer_nickname,
    buyerDepartment: row.buyer_department || '',
    sellerId: row.seller_id,
    sellerNickname: row.seller_nickname,
    university: row.university || CAMPUSES[0].name,
    safeZone: row.safe_zone,
    preferredDate: row.preferred_date,
    preferredTime: row.preferred_time,
    note: row.note || undefined,
    status: (row.status as MeetupStatus) || '요청됨',
    createdAtMs: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
  };
}

function isSchemaMissingError(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  return (
    error.code === 'PGRST205' ||
    error.code === '42P01' ||
    Boolean(error.message?.includes('schema cache'))
  );
}

function formatSupabaseError(error: { code?: string; message?: string }, fallback: string): Error {
  if (isSchemaMissingError(error)) {
    return new Error(
      'Supabase 테이블이 아직 생성되지 않았습니다. Supabase SQL Editor에서 설정 SQL을 실행한 뒤 새로고침해 주세요.'
    );
  }
  return new Error(error.message || fallback);
}

/* ==================== PROFILES ==================== */

export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', uid)
    .maybeSingle();

  if (error) {
    if (!isSchemaMissingError(error)) {
      console.warn('fetchUserProfile warning:', error.message);
    }
    return null;
  }
  return data ? mapProfile(data as ProfileRow) : null;
}

export async function upsertUserProfile(
  uid: string,
  input: {
    nickname: string;
    university: string;
    department: string;
    avatarUrl?: string;
  }
): Promise<UserProfile> {
  const payload = {
    id: uid,
    nickname: input.nickname.trim().slice(0, 30) || '캠퍼스학우',
    university: input.university.trim().slice(0, 60) || CAMPUSES[0].name,
    department: input.department.trim().slice(0, 60) || '컴퓨터공학과 24학번',
    manner_temp: 98.5,
    avatar_url: input.avatarUrl || ASSET_IMAGES.studentAvatar,
    is_student_verified: true,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('profiles')
    .upsert(payload, { onConflict: 'id' })
    .select('*')
    .single();

  if (error) {
    if (isSchemaMissingError(error)) {
      return {
        uid,
        nickname: payload.nickname,
        university: payload.university,
        department: payload.department,
        mannerTemp: 98.5,
        sellingCount: 0,
        completedCount: 0,
        reviewCount: 0,
        avatarUrl: payload.avatar_url,
        isStudentVerified: true,
      };
    }
    throw formatSupabaseError(error, '프로필 저장 중 오류가 발생했습니다.');
  }
  return mapProfile(data as ProfileRow);
}

export async function updateUserProfile(
  uid: string,
  input: {
    nickname: string;
    university: string;
    department: string;
  }
): Promise<UserProfile> {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      nickname: input.nickname.trim().slice(0, 30),
      university: input.university.trim().slice(0, 60),
      department: input.department.trim().slice(0, 60),
      updated_at: new Date().toISOString(),
    })
    .eq('id', uid)
    .select('*')
    .single();

  if (error) {
    throw formatSupabaseError(error, '프로필 수정 중 오류가 발생했습니다.');
  }
  return mapProfile(data as ProfileRow);
}

export function subscribeUserProfile(
  uid: string,
  onData: (profile: UserProfile | null) => void
): Unsubscribe {
  void fetchUserProfile(uid).then(onData);

  const channel = supabase
    .channel(`profile:${uid}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${uid}` },
      () => {
        void fetchUserProfile(uid).then(onData);
      }
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}

/* ==================== PRODUCTS ==================== */

export async function fetchPublicProducts(): Promise<ProductItem[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    if (!isSchemaMissingError(error)) {
      console.warn('fetchPublicProducts warning:', error.message);
    }
    return [];
  }
  return ((data || []) as ProductRow[]).map(mapProduct);
}

export function subscribePublicProducts(onData: (products: ProductItem[]) => void): Unsubscribe {
  void fetchPublicProducts().then(onData);

  const channel = supabase
    .channel('public:products')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'products' },
      () => {
        void fetchPublicProducts().then(onData);
      }
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}

export async function createProductListing(
  profile: UserProfile,
  input: {
    title: string;
    category: ProductCategory;
    price: number;
    isFree: boolean;
    allowPriceOffer: boolean;
    safeZone: string;
    safeZoneDetail: string;
    description: string;
    imageUrls: string[];
  }
): Promise<ProductItem> {
  const cleanImages = input.imageUrls.filter(Boolean).slice(0, 10);
  const primaryImage = cleanImages[0] || ASSET_IMAGES.stewartCalc;
  const autoTags = [
    input.category.replace('/', ''),
    input.safeZone.split(' ')[0],
    input.isFree ? '무료나눔' : '캠퍼스직거래',
  ].filter(Boolean);

  const insertPayload = {
    seller_id: profile.uid,
    seller_name: profile.nickname.slice(0, 30),
    seller_major: profile.department.slice(0, 60),
    seller_university: profile.university.slice(0, 60),
    seller_manner_temp: profile.mannerTemp,
    seller_avatar_url: profile.avatarUrl || ASSET_IMAGES.studentAvatar,
    seller_verified: profile.isStudentVerified,
    title: input.title.trim().slice(0, 100),
    category: input.category,
    price: input.isFree ? 0 : Math.min(100000000, Math.max(0, Math.round(input.price))),
    is_free: input.isFree,
    allow_price_offer: input.allowPriceOffer,
    safe_zone: input.safeZone.slice(0, 60),
    safe_zone_detail: input.safeZoneDetail.slice(0, 120),
    description: input.description.trim().slice(0, 1000),
    image_url: primaryImage,
    image_urls: cleanImages.length > 0 ? cleanImages : [primaryImage],
    status: '판매중',
    badge: input.isFree ? '나눔' : '새 등록',
    hashtags: autoTags,
    likes_count: 0,
    chats_count: 0,
    views_count: 0,
  };

  const { data, error } = await supabase
    .from('products')
    .insert(insertPayload)
    .select('*')
    .single();

  if (error) {
    throw formatSupabaseError(error, '상품 등록 중 오류가 발생했습니다.');
  }

  // Increment seller selling_count
  await supabase
    .from('profiles')
    .update({
      selling_count: (profile.sellingCount || 0) + 1,
      updated_at: new Date().toISOString(),
    })
    .eq('id', profile.uid);

  return mapProduct(data as ProductRow);
}

export async function updateProductStatus(
  productId: string,
  status: ProductStatus,
  sellerProfile?: UserProfile | null
): Promise<void> {
  const { error } = await supabase
    .from('products')
    .update({ status })
    .eq('id', productId);

  if (error) {
    throw formatSupabaseError(error, '상태 변경 중 오류가 발생했습니다.');
  }

  if (status === '거래완료' && sellerProfile) {
    await supabase
      .from('profiles')
      .update({
        selling_count: Math.max(0, (sellerProfile.sellingCount || 1) - 1),
        completed_count: (sellerProfile.completedCount || 0) + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', sellerProfile.uid);
  }
}

export async function deleteProductListing(
  productId: string,
  sellerProfile?: UserProfile | null
): Promise<void> {
  const { error } = await supabase.from('products').delete().eq('id', productId);
  if (error) {
    throw formatSupabaseError(error, '판매글 삭제 중 오류가 발생했습니다.');
  }

  if (sellerProfile) {
    await supabase
      .from('profiles')
      .update({
        selling_count: Math.max(0, (sellerProfile.sellingCount || 1) - 1),
        updated_at: new Date().toISOString(),
      })
      .eq('id', sellerProfile.uid);
  }
}

/* ==================== WISHLISTS ==================== */

export async function fetchUserWishlists(uid: string): Promise<WishlistRecord[]> {
  const { data, error } = await supabase
    .from('wishlists')
    .select('*')
    .eq('user_id', uid)
    .order('created_at', { ascending: false });

  if (error) {
    if (!isSchemaMissingError(error)) {
      console.warn('fetchUserWishlists warning:', error.message);
    }
    return [];
  }
  return ((data || []) as WishlistRow[]).map(mapWishlist);
}

export function subscribeUserWishlists(
  uid: string,
  onData: (items: WishlistRecord[]) => void
): Unsubscribe {
  void fetchUserWishlists(uid).then(onData);

  const channel = supabase
    .channel(`wishlists:${uid}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'wishlists', filter: `user_id=eq.${uid}` },
      () => {
        void fetchUserWishlists(uid).then(onData);
      }
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}

export async function toggleUserWishlist(
  uid: string,
  product: ProductItem,
  currentlyLiked: boolean
): Promise<boolean> {
  if (currentlyLiked) {
    const { error } = await supabase
      .from('wishlists')
      .delete()
      .eq('user_id', uid)
      .eq('product_id', product.id);
    if (error) {
      throw formatSupabaseError(error, '찜 해제 중 오류가 발생했습니다.');
    }
    if (!product.isSample && product.likesCount > 0) {
      await supabase
        .from('products')
        .update({ likes_count: Math.max(0, product.likesCount - 1) })
        .eq('id', product.id);
    }
    return false;
  } else {
    const { error } = await supabase.from('wishlists').upsert(
      {
        user_id: uid,
        product_id: product.id,
        product_title: product.title.slice(0, 100),
        product_price: product.price,
        product_image_url: product.imageUrls[0] || ASSET_IMAGES.stewartCalc,
        product_safe_zone: product.safeZone.slice(0, 60),
        product_category: product.category.slice(0, 30),
        is_sample: Boolean(product.isSample),
      },
      { onConflict: 'user_id,product_id' }
    );
    if (error) {
      throw formatSupabaseError(error, '찜 추가 중 오류가 발생했습니다.');
    }
    if (!product.isSample) {
      await supabase
        .from('products')
        .update({ likes_count: product.likesCount + 1 })
        .eq('id', product.id);
    }
    return true;
  }
}

/* ==================== MEETUP REQUESTS ==================== */

export async function fetchUserMeetupRequests(uid: string): Promise<MeetupRequestRecord[]> {
  const { data, error } = await supabase
    .from('meetup_requests')
    .select('*')
    .or(`buyer_id.eq.${uid},seller_id.eq.${uid}`)
    .order('created_at', { ascending: false });

  if (error) {
    if (!isSchemaMissingError(error)) {
      console.warn('fetchUserMeetupRequests warning:', error.message);
    }
    return [];
  }
  return ((data || []) as MeetupRequestRow[]).map(mapMeetup);
}

export function subscribeUserMeetupRequests(
  uid: string,
  onData: (items: MeetupRequestRecord[]) => void
): Unsubscribe {
  void fetchUserMeetupRequests(uid).then(onData);

  const channel = supabase
    .channel(`meetup_requests:${uid}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'meetup_requests' },
      () => {
        void fetchUserMeetupRequests(uid).then(onData);
      }
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}

export async function createMeetupProposal(
  buyerProfile: UserProfile,
  product: ProductItem,
  input: {
    safeZone: string;
    preferredDate: string;
    preferredTime: string;
    note?: string;
  }
): Promise<MeetupRequestRecord> {
  const { data, error } = await supabase
    .from('meetup_requests')
    .insert({
      product_id: product.id,
      product_title: product.title.slice(0, 100),
      product_price: product.price,
      product_image_url: product.imageUrls[0] || ASSET_IMAGES.stewartCalc,
      buyer_id: buyerProfile.uid,
      buyer_nickname: buyerProfile.nickname.slice(0, 30),
      buyer_department: buyerProfile.department.slice(0, 60),
      seller_id: product.sellerId,
      seller_nickname: product.sellerNickname.slice(0, 30),
      university: buyerProfile.university.slice(0, 60),
      safe_zone: input.safeZone.slice(0, 60),
      preferred_date: input.preferredDate.slice(0, 30),
      preferred_time: input.preferredTime.slice(0, 30),
      note: input.note?.trim().slice(0, 300) || null,
      status: '요청됨',
    })
    .select('*')
    .single();

  if (error) {
    throw formatSupabaseError(error, '직거래 약속 전송 중 오류가 발생했습니다.');
  }

  if (!product.isSample) {
    await supabase
      .from('products')
      .update({ chats_count: product.chatsCount + 1 })
      .eq('id', product.id);
  }

  return mapMeetup(data as MeetupRequestRow);
}

export async function updateMeetupRequestStatus(
  requestId: string,
  status: MeetupStatus
): Promise<void> {
  const { error } = await supabase
    .from('meetup_requests')
    .update({ status })
    .eq('id', requestId);

  if (error) {
    throw formatSupabaseError(error, '약속 상태 변경 중 오류가 발생했습니다.');
  }
}
