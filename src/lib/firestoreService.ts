import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  Unsubscribe,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { ASSET_IMAGES } from '../data/sampleData';
import {
  MeetupRequestRecord,
  MeetupStatus,
  ProductCategory,
  ProductItem,
  ProductStatus,
  UserProfile,
  WishlistRecord,
} from '../types';

function makeId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10).replace(/[^a-zA-Z0-9]/g, 'x');
  return `${prefix}_${Date.now()}_${rand}`;
}

function toMillis(ts: unknown): number {
  if (ts instanceof Timestamp) return ts.toMillis();
  if (ts && typeof ts === 'object' && 'seconds' in ts && typeof (ts as { seconds: number }).seconds === 'number') {
    return (ts as { seconds: number }).seconds * 1000;
  }
  return Date.now();
}

export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  const path = `profiles/${uid}`;
  try {
    const snap = await getDoc(doc(db, 'profiles', uid));
    if (!snap.exists()) return null;
    return snap.data() as UserProfile;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export function subscribeUserProfile(
  uid: string,
  onData: (profile: UserProfile | null) => void
): Unsubscribe {
  const path = `profiles/${uid}`;
  return onSnapshot(
    doc(db, 'profiles', uid),
    (snap) => {
      onData(snap.exists() ? (snap.data() as UserProfile) : null);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export async function createUserProfile(
  uid: string,
  input: {
    nickname: string;
    university: string;
    department: string;
    avatarUrl?: string;
  }
): Promise<UserProfile> {
  const path = `profiles/${uid}`;
  const cleanNickname = input.nickname.trim().slice(0, 30) || '캠퍼스학우';
  const cleanUniversity = input.university.trim().slice(0, 60) || '연세대학교 신촌캠퍼스';
  const cleanDepartment = input.department.trim().slice(0, 60) || '컴퓨터공학과 24학번';
  const avatarUrl = (input.avatarUrl || ASSET_IMAGES.studentAvatar).slice(0, 1000);

  const payload = {
    uid,
    nickname: cleanNickname,
    university: cleanUniversity,
    department: cleanDepartment,
    mannerTemp: 98.5,
    sellingCount: 0,
    completedCount: 0,
    reviewCount: 0,
    avatarUrl,
    isStudentVerified: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(doc(db, 'profiles', uid), payload);
    return {
      ...payload,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateUserProfile(
  uid: string,
  input: {
    nickname: string;
    university: string;
    department: string;
  }
): Promise<void> {
  const path = `profiles/${uid}`;
  try {
    await updateDoc(doc(db, 'profiles', uid), {
      nickname: input.nickname.trim().slice(0, 30),
      university: input.university.trim().slice(0, 60),
      department: input.department.trim().slice(0, 60),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export function subscribePublicProducts(onData: (products: ProductItem[]) => void): Unsubscribe {
  const path = 'products';
  const q = query(collection(db, 'products'), where('isPublic', '==', true));
  return onSnapshot(
    q,
    (snapshot) => {
      const items: ProductItem[] = snapshot.docs.map((docSnap) => {
        const d = docSnap.data();
        const createdAtMs = toMillis(d.createdAt);
        return {
          id: docSnap.id,
          isSample: false,
          sellerId: String(d.sellerId || ''),
          sellerNickname: String(d.sellerNickname || '캠퍼스학우'),
          sellerDepartment: String(d.sellerDepartment || '재학생'),
          sellerUniversity: String(d.sellerUniversity || '연세대학교 신촌캠퍼스'),
          sellerMannerTemp: Number(d.sellerMannerTemp ?? 98.5),
          sellerAvatarUrl: d.sellerAvatarUrl ? String(d.sellerAvatarUrl) : ASSET_IMAGES.studentAvatar,
          sellerVerified: Boolean(d.sellerVerified ?? true),
          title: String(d.title || ''),
          category: (d.category as ProductCategory) || '전공서적',
          price: Number(d.price ?? 0),
          originalPrice: typeof d.originalPrice === 'number' ? d.originalPrice : undefined,
          isFree: Boolean(d.isFree),
          allowPriceOffer: Boolean(d.allowPriceOffer),
          safeZone: String(d.safeZone || '중앙도서관 1층 로비'),
          safeZoneDetail: d.safeZoneDetail ? String(d.safeZoneDetail) : undefined,
          description: String(d.description || ''),
          imageUrls: Array.isArray(d.imageUrls) && d.imageUrls.length > 0 ? d.imageUrls : [ASSET_IMAGES.stewartCalc],
          status: (d.status as ProductStatus) || '판매중',
          badge: d.badge ? String(d.badge) : d.isFree ? '무료나눔' : '새 등록',
          badgeColor: d.isFree ? 'emerald' : 'blue',
          hashtags: Array.isArray(d.hashtags) ? d.hashtags : [],
          likesCount: Number(d.likesCount ?? 0),
          chatsCount: Number(d.chatsCount ?? 0),
          viewsCount: Number(d.viewsCount ?? 0),
          createdAtMs,
        };
      });
      items.sort((a, b) => b.createdAtMs - a.createdAtMs);
      onData(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
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
): Promise<string> {
  const productId = makeId('prod');
  const path = `products/${productId}`;

  const cleanTitle = input.title.trim().slice(0, 100);
  const cleanDescription = input.description.trim().slice(0, 1000);
  const cleanImages = input.imageUrls
    .filter((u) => typeof u === 'string' && u.length > 0)
    .slice(0, 10)
    .map((u) => u.slice(0, 1000));

  const autoTags = [
    input.category.replace('/', ''),
    input.safeZone.split(' ')[0],
    input.isFree ? '무료나눔' : '캠퍼스직거래',
  ]
    .filter(Boolean)
    .slice(0, 5);

  const payload = {
    sellerId: profile.uid,
    sellerNickname: profile.nickname.slice(0, 30),
    sellerDepartment: profile.department.slice(0, 60),
    sellerUniversity: profile.university.slice(0, 60),
    sellerMannerTemp: profile.mannerTemp,
    sellerAvatarUrl: (profile.avatarUrl || ASSET_IMAGES.studentAvatar).slice(0, 1000),
    sellerVerified: profile.isStudentVerified,
    title: cleanTitle,
    category: input.category,
    price: input.isFree ? 0 : Math.min(100000000, Math.max(0, Math.round(input.price))),
    isFree: input.isFree,
    allowPriceOffer: input.allowPriceOffer,
    safeZone: input.safeZone.slice(0, 60),
    safeZoneDetail: input.safeZoneDetail.slice(0, 120),
    description: cleanDescription,
    imageUrls: cleanImages.length > 0 ? cleanImages : [ASSET_IMAGES.stewartCalc],
    status: '판매중' as const,
    badge: input.isFree ? '나눔' : '새 등록',
    hashtags: autoTags,
    likesCount: 0,
    chatsCount: 0,
    viewsCount: 0,
    isPublic: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(doc(db, 'products', productId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }

  // Update seller's selling count cleanly
  try {
    await updateDoc(doc(db, 'profiles', profile.uid), {
      sellingCount: Math.min(10000, (profile.sellingCount || 0) + 1),
      updatedAt: serverTimestamp(),
    });
  } catch {
    // Non-blocking stat update
  }

  return productId;
}

export async function updateProductStatus(
  productId: string,
  status: ProductStatus,
  sellerProfile?: UserProfile | null
): Promise<void> {
  const path = `products/${productId}`;
  try {
    await updateDoc(doc(db, 'products', productId), {
      status,
      updatedAt: serverTimestamp(),
    });
    if (status === '거래완료' && sellerProfile) {
      await updateDoc(doc(db, 'profiles', sellerProfile.uid), {
        sellingCount: Math.max(0, (sellerProfile.sellingCount || 1) - 1),
        completedCount: Math.min(10000, (sellerProfile.completedCount || 0) + 1),
        updatedAt: serverTimestamp(),
      }).catch(() => undefined);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteProductListing(productId: string, sellerProfile?: UserProfile | null): Promise<void> {
  const path = `products/${productId}`;
  try {
    await deleteDoc(doc(db, 'products', productId));
    if (sellerProfile) {
      await updateDoc(doc(db, 'profiles', sellerProfile.uid), {
        sellingCount: Math.max(0, (sellerProfile.sellingCount || 1) - 1),
        updatedAt: serverTimestamp(),
      }).catch(() => undefined);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeUserWishlists(
  uid: string,
  onData: (items: WishlistRecord[]) => void
): Unsubscribe {
  const path = 'wishlists';
  const q = query(collection(db, 'wishlists'), where('userId', '==', uid));
  return onSnapshot(
    q,
    (snapshot) => {
      const items: WishlistRecord[] = snapshot.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          id: docSnap.id,
          userId: String(d.userId || uid),
          productId: String(d.productId || ''),
          productTitle: String(d.productTitle || ''),
          productPrice: Number(d.productPrice ?? 0),
          productImageUrl: String(d.productImageUrl || ASSET_IMAGES.stewartCalc),
          productSafeZone: String(d.productSafeZone || ''),
          productCategory: String(d.productCategory || '전공서적'),
          isSample: Boolean(d.isSample),
          createdAtMs: toMillis(d.createdAt),
        };
      });
      items.sort((a, b) => b.createdAtMs - a.createdAtMs);
      onData(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function toggleUserWishlist(
  uid: string,
  product: ProductItem,
  currentlyLiked: boolean
): Promise<boolean> {
  const wishlistId = `${uid}_${product.id}`;
  const path = `wishlists/${wishlistId}`;

  try {
    if (currentlyLiked) {
      await deleteDoc(doc(db, 'wishlists', wishlistId));
      if (!product.isSample && product.status !== '거래완료' && product.likesCount > 0) {
        await updateDoc(doc(db, 'products', product.id), {
          likesCount: Math.max(0, product.likesCount - 1),
          updatedAt: serverTimestamp(),
        }).catch(() => undefined);
      }
      return false;
    } else {
      await setDoc(doc(db, 'wishlists', wishlistId), {
        userId: uid,
        productId: product.id,
        productTitle: product.title.slice(0, 100),
        productPrice: product.price,
        productImageUrl: (product.imageUrls[0] || ASSET_IMAGES.stewartCalc).slice(0, 1000),
        productSafeZone: product.safeZone.slice(0, 60),
        productCategory: product.category.slice(0, 30),
        isSample: Boolean(product.isSample),
        createdAt: serverTimestamp(),
      });
      if (!product.isSample && product.status !== '거래완료') {
        await updateDoc(doc(db, 'products', product.id), {
          likesCount: product.likesCount + 1,
          updatedAt: serverTimestamp(),
        }).catch(() => undefined);
      }
      return true;
    }
  } catch (error) {
    handleFirestoreError(error, currentlyLiked ? OperationType.DELETE : OperationType.CREATE, path);
  }
}

export function subscribeUserMeetupRequests(
  uid: string,
  onData: (items: MeetupRequestRecord[]) => void
): Unsubscribe {
  const path = 'meetup_requests';
  const buyerMap = new Map<string, MeetupRequestRecord>();
  const sellerMap = new Map<string, MeetupRequestRecord>();

  const emitMerged = () => {
    const merged = new Map<string, MeetupRequestRecord>([...buyerMap, ...sellerMap]);
    const list = Array.from(merged.values()).sort((a, b) => b.createdAtMs - a.createdAtMs);
    onData(list);
  };

  const mapDoc = (docSnap: { id: string; data: () => Record<string, unknown> }): MeetupRequestRecord => {
    const d = docSnap.data();
    return {
      id: docSnap.id,
      productId: String(d.productId || ''),
      productTitle: String(d.productTitle || ''),
      productPrice: Number(d.productPrice ?? 0),
      productImageUrl: String(d.productImageUrl || ASSET_IMAGES.stewartCalc),
      buyerId: String(d.buyerId || ''),
      buyerNickname: String(d.buyerNickname || '캠퍼스학우'),
      buyerDepartment: String(d.buyerDepartment || ''),
      sellerId: String(d.sellerId || ''),
      sellerNickname: String(d.sellerNickname || '판매자'),
      university: String(d.university || '연세대학교 신촌캠퍼스'),
      safeZone: String(d.safeZone || '중앙도서관 1층 로비'),
      preferredDate: String(d.preferredDate || ''),
      preferredTime: String(d.preferredTime || ''),
      note: d.note ? String(d.note) : undefined,
      status: (d.status as MeetupStatus) || '요청됨',
      createdAtMs: toMillis(d.createdAt),
    };
  };

  const unsubBuyer = onSnapshot(
    query(collection(db, 'meetup_requests'), where('buyerId', '==', uid)),
    (snap) => {
      buyerMap.clear();
      snap.docs.forEach((docSnap) => buyerMap.set(docSnap.id, mapDoc(docSnap)));
      emitMerged();
    },
    (error) => handleFirestoreError(error, OperationType.LIST, path)
  );

  const unsubSeller = onSnapshot(
    query(collection(db, 'meetup_requests'), where('sellerId', '==', uid)),
    (snap) => {
      sellerMap.clear();
      snap.docs.forEach((docSnap) => sellerMap.set(docSnap.id, mapDoc(docSnap)));
      emitMerged();
    },
    (error) => handleFirestoreError(error, OperationType.LIST, path)
  );

  return () => {
    unsubBuyer();
    unsubSeller();
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
): Promise<string> {
  const requestId = makeId('mr');
  const path = `meetup_requests/${requestId}`;

  const cleanNote = input.note?.trim().slice(0, 300);
  const payload: Record<string, unknown> = {
    productId: product.id,
    productTitle: product.title.slice(0, 100),
    productPrice: product.price,
    productImageUrl: (product.imageUrls[0] || ASSET_IMAGES.stewartCalc).slice(0, 1000),
    buyerId: buyerProfile.uid,
    buyerNickname: buyerProfile.nickname.slice(0, 30),
    buyerDepartment: buyerProfile.department.slice(0, 60),
    sellerId: product.sellerId,
    sellerNickname: product.sellerNickname.slice(0, 30),
    university: buyerProfile.university.slice(0, 60),
    safeZone: input.safeZone.slice(0, 60),
    preferredDate: input.preferredDate.slice(0, 30),
    preferredTime: input.preferredTime.slice(0, 30),
    status: '요청됨',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  if (cleanNote) {
    payload.note = cleanNote;
  }

  try {
    await setDoc(doc(db, 'meetup_requests', requestId), payload);
    if (!product.isSample && product.status !== '거래완료') {
      await updateDoc(doc(db, 'products', product.id), {
        chatsCount: product.chatsCount + 1,
        updatedAt: serverTimestamp(),
      }).catch(() => undefined);
    }
    return requestId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateMeetupRequestStatus(
  requestId: string,
  status: MeetupStatus
): Promise<void> {
  const path = `meetup_requests/${requestId}`;
  try {
    await updateDoc(doc(db, 'meetup_requests', requestId), {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}
