export type CategoryType = '전체' | '전공서적' | '전자기기' | '자취/기숙사' | '의류/잡화';
export type ProductCategory = Exclude<CategoryType, '전체'>;
export type ProductStatus = '판매중' | '예약중' | '거래완료';
export type MeetupStatus = '요청됨' | '수락됨' | '거절됨' | '완료됨';
export type SortOption = '최신순' | '낮은가격순';
export type ActiveTab = 'home' | 'sell' | 'mypage';

export interface UserProfile {
  uid: string;
  nickname: string;
  university: string;
  department: string;
  mannerTemp: number;
  sellingCount: number;
  completedCount: number;
  reviewCount: number;
  avatarUrl?: string;
  isStudentVerified: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface ProductItem {
  id: string;
  isSample?: boolean;
  sellerId: string;
  sellerNickname: string;
  sellerDepartment: string;
  sellerUniversity: string;
  sellerMannerTemp: number;
  sellerReviewCount?: number;
  sellerAvatarUrl?: string;
  sellerVerified: boolean;
  title: string;
  category: ProductCategory;
  price: number;
  originalPrice?: number;
  isFree: boolean;
  allowPriceOffer: boolean;
  safeZone: string;
  safeZoneDetail?: string;
  description: string;
  summaryLine?: string;
  bullets?: string[];
  imageUrls: string[];
  status: ProductStatus;
  badge?: string;
  badgeColor?: 'blue' | 'teal' | 'emerald' | 'amber';
  hashtags?: string[];
  likesCount: number;
  chatsCount: number;
  viewsCount: number;
  timeAgo?: string;
  createdAtMs: number;
}

export interface WishlistRecord {
  id: string;
  userId: string;
  productId: string;
  productTitle: string;
  productPrice: number;
  productImageUrl: string;
  productSafeZone: string;
  productCategory: string;
  isSample: boolean;
  createdAtMs: number;
}

export interface MeetupRequestRecord {
  id: string;
  productId: string;
  productTitle: string;
  productPrice: number;
  productImageUrl: string;
  buyerId: string;
  buyerNickname: string;
  buyerDepartment: string;
  sellerId: string;
  sellerNickname: string;
  university: string;
  safeZone: string;
  preferredDate: string;
  preferredTime: string;
  note?: string;
  status: MeetupStatus;
  createdAtMs: number;
}

export interface CampusInfo {
  name: string;
  shortName: string;
  safeZones: {
    name: string;
    detail: string;
    badge: string;
  }[];
}
