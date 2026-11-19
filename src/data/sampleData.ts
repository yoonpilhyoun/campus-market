import { CampusInfo, ProductItem } from '../types';

export const ASSET_IMAGES = {
  compArch: '/src/assets/images/prod_comp_arch_1795048242345.jpg',
  applePencil: '/src/assets/images/prod_apple_pencil_1795048241242.jpg',
  stewartCalc: '/src/assets/images/prod_stewart_calc_1795048241004.jpg',
  deskFan: '/src/assets/images/prod_desk_fan_1795048241787.jpg',
  casioCalc: '/src/assets/images/prod_casio_calc_1795048241790.jpg',
  logitechK380: '/src/assets/images/prod_logitech_k380_1795048241366.jpg',
  linearAlgebra: '/src/assets/images/prod_linear_algebra_1795048241366.jpg',
  modernPhysics: '/src/assets/images/prod_modern_physics_1795048240455.jpg',
  studentAvatar: '/src/assets/images/avatar_student_male_1795048240269.jpg',
  campusMap: '/src/assets/images/campus_safezone_map_1795048241360.jpg',
};

export const CAMPUSES: CampusInfo[] = [
  {
    name: '연세대학교 신촌캠퍼스',
    shortName: '연세대학교',
    safeZones: [
      {
        name: '중앙도서관 1층 로비',
        detail: '중앙도서관 1층 로비 스마트 라운지 (CCTV 안심구역)',
        badge: '연세대 중앙도서관 정문 앞 안전거래 추천',
      },
      {
        name: '학생회관 1층 앞',
        detail: '학생회관 1층 정문 로비 안내데스크 옆',
        badge: '연세대 학생회관 1층 유동인구 최다 구역',
      },
      {
        name: '공학관 1층 카페 앞',
        detail: '제1공학관 1층 라운지 카페 앞 보안 구역',
        badge: '공학관 1층 밝은 실내 안심존',
      },
      {
        name: '기숙사 정문',
        detail: '무악학사 기숙사 정문 경비실 앞',
        badge: '24시간 경비원 상주 안심거래 구역',
      },
    ],
  },
  {
    name: '인하공업전문대학',
    shortName: '인하공전',
    safeZones: [
      {
        name: '중앙도서관 1층 로비',
        detail: '학술정보관 1층 로비 학생 라운지 (CCTV 안심구역)',
        badge: '인하공전 학술정보관 정문 앞 안전거래 추천',
      },
      {
        name: '학생회관 1층 앞',
        detail: '종합실습관·학생회관 1층 중앙 통로',
        badge: '학생회관 1층 유동인구 밀집 안심존',
      },
      {
        name: '공학관 1층 카페 앞',
        detail: '5호관 공학관 1층 카페테리아 앞',
        badge: '공학관 1층 밝은 실내 안심존',
      },
      {
        name: '기숙사 정문',
        detail: '인하공전 기숙사 정문 경비실 앞',
        badge: '24시간 CCTV 상시 녹화 구역',
      },
    ],
  },
  {
    name: '중앙대학교',
    shortName: '중앙대학교',
    safeZones: [
      {
        name: '중앙도서관 1층 로비',
        detail: '중앙도서관(204관) 1층 로비 스마트 라운지',
        badge: '중앙대 204관 중앙도서관 앞 안전거래 추천',
      },
      {
        name: '학생회관 1층 앞',
        detail: '310관 100주년기념관 1층 로비 앞',
        badge: '중앙대 310관 1층 로비 안심거래존',
      },
      {
        name: '공학관 1층 카페 앞',
        detail: '제2공학관(208관) 1층 카페 앞',
        badge: '공학관 1층 밝은 실내 안심존',
      },
      {
        name: '기숙사 정문',
        detail: '블루미르홀 308관 기숙사 정문 앞',
        badge: '기숙사 경비실 앞 24시간 안심존',
      },
    ],
  },
  {
    name: '한양대학교',
    shortName: '한양대학교',
    safeZones: [
      {
        name: '중앙도서관 1층 로비',
        detail: '백남학술정보관 1층 로비 스마트 라운지',
        badge: '한양대 백남학술정보관 정문 앞 안전거래 추천',
      },
      {
        name: '학생회관 1층 앞',
        detail: '한양플라자 1층 광장 및 학생회관 앞',
        badge: '한양플라자 유동인구 최다 안심존',
      },
      {
        name: '공학관 1층 카페 앞',
        detail: '제1공학관 1층 로비 카페 앞',
        badge: '공학관 1층 CCTV 안심구역',
      },
      {
        name: '기숙사 정문',
        detail: '제2생활관 기숙사 정문 경비실 앞',
        badge: '24시간 보안요원 상주 안심존',
      },
    ],
  },
];

export const CATEGORIES = ['전체', '전공서적', '전자기기', '자취/기숙사', '의류/잡화'] as const;

export const HERO_SLIDES = [
  {
    id: 'slide-1',
    tag: '새학기 개강 특가전',
    title: '새학기 전공서적 50% 반값 장터',
    subtitle: '선배들의 깨끗한 필기 서적을 교내에서 안전하게 직거래!',
    filterCategory: '전공서적' as const,
    gradient: 'from-[#1D4ED8] via-[#2563EB] to-[#3B82F6]',
    icon: 'book' as const,
  },
  {
    id: 'slide-2',
    tag: '안전 직거래 캠페인',
    title: '캠퍼스 세이프존 안전 직거래 안내',
    subtitle: '도서관 로비·학생회관 CCTV 안심구역에서 안심하고 만나세요!',
    filterCategory: '전체' as const,
    gradient: 'from-[#1E40AF] via-[#2563EB] to-[#0284C7]',
    icon: 'shield' as const,
  },
  {
    id: 'slide-3',
    tag: '기숙사 퇴사 특집',
    title: '기숙사 퇴사 기념 자취템 나눔전',
    subtitle: '선풍기·스탠드·수납함까지 학우들과 알뜰하게 나눠요!',
    filterCategory: '자취/기숙사' as const,
    gradient: 'from-[#0F4C81] via-[#1D4ED8] to-[#2563EB]',
    icon: 'home' as const,
  },
];

const NOW = Date.now();
const MIN = 60 * 1000;
const HOUR = 60 * MIN;

export const SAMPLE_PRODUCTS: ProductItem[] = [
  {
    id: 'sample-comp-arch',
    isSample: true,
    sellerId: 'sample-seller-1',
    sellerNickname: '알고리즘장인',
    sellerDepartment: '컴퓨터과학과 23학번',
    sellerUniversity: '연세대학교 신촌캠퍼스',
    sellerMannerTemp: 98.8,
    sellerReviewCount: 24,
    sellerAvatarUrl: ASSET_IMAGES.studentAvatar,
    sellerVerified: true,
    title: '컴퓨터 구조 및 설계 6판 (필기 없음)',
    category: '전공서적',
    price: 24000,
    originalPrice: 45000,
    isFree: false,
    allowPriceOffer: true,
    safeZone: '학생회관 앞',
    safeZoneDetail: '학생회관 1층 로비 안내데스크 앞',
    summaryLine: '이번 학기 컴퓨터구조 전공필수 수업에서 사용한 6판 원서/번역본 교재입니다!',
    bullets: [
      '아이패드 PDF로 공부해서 책 내부 필기 및 밑줄 전혀 없습니다.',
      '겉표지 모서리 구김 없이 A급 상태 유지 중입니다.',
      '학생회관이나 중앙도서관 앞에서 쉬는 시간에 바로 직거래 가능합니다.',
    ],
    description:
      '이번 학기 컴퓨터구조 전공필수 수업에서 사용한 6판 교재입니다.\n아이패드 PDF로 공부해서 책 내부 필기 및 밑줄이 전혀 없고, 겉표지 모서리 구김 없이 A급 상태입니다.\n학생회관 앞이나 중앙도서관 1층에서 바로 직거래 가능합니다.',
    imageUrls: [ASSET_IMAGES.compArch, ASSET_IMAGES.stewartCalc, ASSET_IMAGES.linearAlgebra],
    status: '판매중',
    badge: 'A급 상태',
    badgeColor: 'blue',
    hashtags: ['컴퓨터구조', '전공필수', 'A급상태', '필기없음'],
    likesCount: 8,
    chatsCount: 3,
    viewsCount: 168,
    timeAgo: '10분 전',
    createdAtMs: NOW - 10 * MIN,
  },
  {
    id: 'sample-apple-pencil',
    isSample: true,
    sellerId: 'sample-seller-2',
    sellerNickname: '아이패드필기왕',
    sellerDepartment: '전기전자공학부 22학번',
    sellerUniversity: '연세대학교 신촌캠퍼스',
    sellerMannerTemp: 99.1,
    sellerReviewCount: 31,
    sellerAvatarUrl: ASSET_IMAGES.studentAvatar,
    sellerVerified: true,
    title: '애플펜슬 2세대 풀박스 급처',
    category: '전자기기',
    price: 65000,
    originalPrice: 195000,
    isFree: false,
    allowPriceOffer: false,
    safeZone: '중앙도서관 1층',
    safeZoneDetail: '중앙도서관 1층 로비 스마트 라운지',
    summaryLine: '아이패드 프로 기변으로 애플펜슬 2세대 풀박스 급처합니다!',
    bullets: [
      '박스, 설명서 모두 보관 중이며 자석 부착면 찍힘 없이 깔끔합니다.',
      '정품 여분 펜촉 1개 함께 챙겨드립니다.',
      '현장에서 본인 아이패드에 바로 연결 및 필압 테스트 후 거래 가능해요.',
    ],
    description:
      '아이패드 프로 기변으로 애플펜슬 2세대 풀박스 급처합니다.\n박스 및 구성품 그대로 있으며, 현장에서 아이패드 연결 및 필압 테스트 해보시고 편하게 가져가세요.',
    imageUrls: [ASSET_IMAGES.applePencil, ASSET_IMAGES.logitechK380],
    status: '판매중',
    badge: '급처',
    badgeColor: 'teal',
    hashtags: ['애플펜슬2세대', '풀박스', '급처', '아이패드'],
    likesCount: 14,
    chatsCount: 5,
    viewsCount: 284,
    timeAgo: '25분 전',
    createdAtMs: NOW - 25 * MIN,
  },
  {
    id: 'sample-stewart-calc',
    isSample: true,
    sellerId: 'sample-seller-3',
    sellerNickname: '코딩하는쿼카',
    sellerDepartment: '컴퓨터공학과 24학번',
    sellerUniversity: '연세대학교 신촌캠퍼스',
    sellerMannerTemp: 98.5,
    sellerReviewCount: 18,
    sellerAvatarUrl: ASSET_IMAGES.studentAvatar,
    sellerVerified: true,
    title: '스튜어트 미분적분학 9판 (깔끔한 필기 수록, 스프링 제본)',
    category: '전공서적',
    price: 12000,
    originalPrice: 42000,
    isFree: false,
    allowPriceOffer: true,
    safeZone: '중앙도서관 1층',
    safeZoneDetail: '중앙도서관 1층 로비 스마트 라운지',
    summaryLine: '지난 학기 전공 수업 들을 때 사용했던 미분적분학 9판 교재입니다!',
    bullets: [
      '앞쪽 1~3장에만 연필로 가벼운 개념 필기 있고, 뒤쪽은 거의 새 책 수준으로 깨끗합니다.',
      '공부하기 편하게 대형 스프링 분철 완료된 상태입니다. 펼쳐두고 과제하기 정말 편리해요!',
      '캠퍼스 내 직거래 선호하며 학생회관이나 중도 앞에서 바로 전해드릴 수 있어요.',
    ],
    description:
      '지난 학기 전공 수업 들을 때 사용했던 미분적분학 9판 교재입니다!\n앞쪽 1~3장에만 연필로 가벼운 개념 필기가 있고, 뒤쪽은 거의 새 책 수준으로 깨끗합니다.\n대형 스프링 분철 완료되어 펼쳐두고 과제하기 정말 편리해요.',
    imageUrls: [
      ASSET_IMAGES.stewartCalc,
      ASSET_IMAGES.linearAlgebra,
      ASSET_IMAGES.compArch,
      ASSET_IMAGES.modernPhysics,
    ],
    status: '판매중',
    hashtags: ['미적분학', '스튜어트', '스프링분철', '전공서적'],
    likesCount: 12,
    chatsCount: 3,
    viewsCount: 142,
    timeAgo: '1시간 전',
    createdAtMs: NOW - 1 * HOUR,
  },
  {
    id: 'sample-desk-fan',
    isSample: true,
    sellerId: 'sample-seller-4',
    sellerNickname: '무악기숙사요정',
    sellerDepartment: '경영학과 24학번',
    sellerUniversity: '연세대학교 신촌캠퍼스',
    sellerMannerTemp: 97.9,
    sellerReviewCount: 9,
    sellerAvatarUrl: ASSET_IMAGES.studentAvatar,
    sellerVerified: true,
    title: '기숙사용 무소음 탁상 선풍기',
    category: '자취/기숙사',
    price: 8000,
    originalPrice: 22000,
    isFree: false,
    allowPriceOffer: true,
    safeZone: '기숙사 정문',
    safeZoneDetail: '무악학사 기숙사 정문 경비실 앞',
    summaryLine: '기숙사 룸메이트 눈치 안 보고 쓰기 좋은 저소음 USB 탁상 선풍기입니다!',
    bullets: [
      '4단계 풍속 조절 가능하고 1~2단은 도서관에서도 들리지 않을 정도로 조용합니다.',
      'C타입 충전 케이블 포함이며 안전망 분리 세척 완료했습니다.',
      '무악학사 기숙사 정문이나 학생회관 앞에서 편하게 직거래해요.',
    ],
    description:
      '기숙사 퇴사 정리하면서 무소음 탁상 선풍기 판매합니다.\n안전망 분리 세척까지 깔끔하게 해두었고 C타입 충전선 같이 드려요.',
    imageUrls: [ASSET_IMAGES.deskFan],
    status: '판매중',
    hashtags: ['기숙사템', '무소음선풍기', '자취필수템', '퇴사정리'],
    likesCount: 11,
    chatsCount: 2,
    viewsCount: 119,
    timeAgo: '2시간 전',
    createdAtMs: NOW - 2 * HOUR,
  },
  {
    id: 'sample-casio-calc',
    isSample: true,
    sellerId: 'sample-seller-5',
    sellerNickname: '기계과21학번',
    sellerDepartment: '기계공학부 21학번',
    sellerUniversity: '연세대학교 신촌캠퍼스',
    sellerMannerTemp: 98.7,
    sellerReviewCount: 15,
    sellerAvatarUrl: ASSET_IMAGES.studentAvatar,
    sellerVerified: true,
    title: '카시오 공학용 계산기 fx-991EX',
    category: '전자기기',
    price: 15000,
    originalPrice: 34000,
    isFree: false,
    allowPriceOffer: false,
    safeZone: '공학관 1층 카페 앞',
    safeZoneDetail: '제1공학관 1층 라운지 카페 앞',
    summaryLine: '공대 필수 공학용 계산기 fx-991EX 정품, 액정 기스 없이 완벽 작동합니다!',
    bullets: [
      '행렬·적분·방정식 풀이 모두 정상 작동하며 태양광+배터리 상태 최상입니다.',
      '하드 슬라이드 커버 포함이며 버튼 지워짐 전혀 없습니다.',
      '공학관 1층 카페 앞이나 중앙도서관에서 바로 전달해드려요.',
    ],
    description:
      '공대 필수템 카시오 공학용 계산기 fx-991EX 정품입니다.\n슬라이드 하드 커버 포함이고 버튼 인쇄 지워짐이나 액정 기스 없이 깨끗합니다.',
    imageUrls: [ASSET_IMAGES.casioCalc],
    status: '판매중',
    hashtags: ['공학용계산기', '카시오', 'fx991ex', '공대필수'],
    likesCount: 9,
    chatsCount: 4,
    viewsCount: 136,
    timeAgo: '3시간 전',
    createdAtMs: NOW - 3 * HOUR,
  },
  {
    id: 'sample-logitech-k380',
    isSample: true,
    sellerId: 'sample-seller-6',
    sellerNickname: '카공족민지',
    sellerDepartment: '심리학과 23학번',
    sellerUniversity: '연세대학교 신촌캠퍼스',
    sellerMannerTemp: 99.0,
    sellerReviewCount: 21,
    sellerAvatarUrl: ASSET_IMAGES.studentAvatar,
    sellerVerified: true,
    title: '로지텍 K380 블루투스 키보드',
    category: '전자기기',
    price: 19000,
    originalPrice: 44900,
    isFree: false,
    allowPriceOffer: true,
    safeZone: '학생회관 앞',
    safeZoneDetail: '백양누리·학생회관 1층 앞 로비',
    summaryLine: '아이패드·맥북 멀티페어링 3대 지원 로지텍 K380 차콜 컬러입니다!',
    bullets: [
      '도서관이나 카페에서 타이핑 소음이 적어 팀플·과제용으로 최고입니다.',
      'AAA 새 건전지 넣어두었고 키감 및 페어링 버튼 모두 정상입니다.',
      '전용 펠트 파우치도 서비스로 함께 드립니다.',
    ],
    description:
      '아이패드·맥북 멀티페어링 3대 지원하는 로지텍 K380 차콜 컬러 판매합니다.\n새 건전지 교체 완료했고 전용 펠트 파우치까지 함께 드립니다.',
    imageUrls: [ASSET_IMAGES.logitechK380],
    status: '판매중',
    hashtags: ['로지텍K380', '블루투스키보드', '카공필수템', '아이패드키보드'],
    likesCount: 6,
    chatsCount: 1,
    viewsCount: 98,
    timeAgo: '4시간 전',
    createdAtMs: NOW - 4 * HOUR,
  },
  {
    id: 'sample-linear-algebra',
    isSample: true,
    sellerId: 'sample-seller-7',
    sellerNickname: '선형대수A플러스',
    sellerDepartment: '수학과 23학번',
    sellerUniversity: '연세대학교 신촌캠퍼스',
    sellerMannerTemp: 98.9,
    sellerReviewCount: 14,
    sellerAvatarUrl: ASSET_IMAGES.studentAvatar,
    sellerVerified: true,
    title: '알기 쉬운 선형대수 11판',
    category: '전공서적',
    price: 15000,
    originalPrice: 38000,
    isFree: false,
    allowPriceOffer: true,
    safeZone: '공학관 1층 카페 앞',
    safeZoneDetail: '제2공학관 1층 로비',
    summaryLine: '공대·이과대 선형대수학 기본 교재, 연습문제 풀이 흔적 없이 깨끗해요!',
    bullets: [
      '책등 갈라짐 없고 속지 변색 없이 깔끔한 상태입니다.',
      '중간·기말 대비 중요 정리 포스트잇만 살짝 붙여두었습니다 (쉽게 제거 가능).',
      '공학관 앞이나 중앙도서관 로비에서 직거래 가능합니다.',
    ],
    description:
      '공대 2호관 직거래 가능한 알기 쉬운 선형대수 11판입니다.\n연습문제 풀이 흔적 없이 깔끔하고 책등 상태 좋습니다.',
    imageUrls: [ASSET_IMAGES.linearAlgebra],
    status: '판매중',
    hashtags: ['선형대수학', '전공서적', '공대교재'],
    likesCount: 7,
    chatsCount: 2,
    viewsCount: 84,
    timeAgo: '5시간 전',
    createdAtMs: NOW - 5 * HOUR,
  },
  {
    id: 'sample-modern-physics',
    isSample: true,
    sellerId: 'sample-seller-8',
    sellerNickname: '물리학도준호',
    sellerDepartment: '물리학과 22학번',
    sellerUniversity: '연세대학교 신촌캠퍼스',
    sellerMannerTemp: 98.4,
    sellerReviewCount: 12,
    sellerAvatarUrl: ASSET_IMAGES.studentAvatar,
    sellerVerified: true,
    title: '할리데이 일반물리학 개정판',
    category: '전공서적',
    price: 18000,
    originalPrice: 46000,
    isFree: false,
    allowPriceOffer: true,
    safeZone: '학생회관 앞',
    safeZoneDetail: '학생회관 1층 앞 로비',
    summaryLine: '1학년 일반물리학 필수 교재, 새책 구매 후 한 학기만 깨끗하게 사용했습니다!',
    bullets: [
      '겉표지 투명 커버 씌워 사용해서 모서리까지 깨끗합니다.',
      '필기 거의 없으며 물얼룩·찢어짐 전혀 없습니다.',
      '학생회관이나 중앙도서관에서 편하신 시간에 전달 가능해요.',
    ],
    description:
      '할리데이 일반물리학 개정판 판매합니다.\n한 학기 동안 투명 커버 씌워서 깨끗하게 사용했습니다.',
    imageUrls: [ASSET_IMAGES.modernPhysics],
    status: '판매중',
    hashtags: ['일반물리학', '할리데이', '전공서적'],
    likesCount: 5,
    chatsCount: 1,
    viewsCount: 73,
    timeAgo: '6시간 전',
    createdAtMs: NOW - 6 * HOUR,
  },
];

export function formatKRW(price: number, isFree?: boolean): string {
  if (isFree || price === 0) return '무료나눔';
  return `${price.toLocaleString('ko-KR')}원`;
}

export function formatRelativeTime(createdAtMs: number, fallback?: string): string {
  if (fallback && createdAtMs < Date.now() - 8 * 60 * 1000 && fallback.includes('전')) {
    return fallback;
  }
  const diffSec = Math.max(0, Math.floor((Date.now() - createdAtMs) / 1000));
  if (diffSec < 60) return '방금 전';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}시간 전`;
  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay}일 전`;
}

export function getDiscountPercent(price: number, originalPrice?: number): number | null {
  if (!originalPrice || originalPrice <= price || price <= 0) return null;
  const pct = Math.round(((originalPrice - price) / originalPrice) * 100);
  return pct >= 5 ? pct : null;
}
