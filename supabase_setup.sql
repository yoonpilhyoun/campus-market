-- ============================================================
-- 캠퍼스마켓 (Campus Market) Supabase SQL Setup Script
-- Supabase Dashboard > SQL Editor에 그대로 붙여넣고 Run 하세요.
-- ============================================================

-- 1. profiles 테이블 (회원가입 시 닉네임, 대학교, 학과/학번, 기본 매너온도 98.5°C 저장)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null default '캠퍼스학우',
  university text not null default '연세대학교 신촌캠퍼스',
  department text not null default '컴퓨터공학과 24학번',
  manner_temp numeric(4,1) not null default 98.5,
  selling_count integer not null default 0,
  completed_count integer not null default 0,
  review_count integer not null default 0,
  avatar_url text,
  is_student_verified boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. products 테이블 (실시간 공유 판매글 피드)
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references auth.users(id) on delete cascade,
  seller_name text not null,
  seller_major text not null,
  seller_university text not null default '연세대학교 신촌캠퍼스',
  seller_manner_temp numeric(4,1) not null default 98.5,
  seller_avatar_url text,
  seller_verified boolean not null default true,
  title text not null,
  price integer not null default 0,
  original_price integer,
  is_free boolean not null default false,
  allow_price_offer boolean not null default true,
  category text not null default '전공서적',
  safe_zone text not null default '중앙도서관 1층 로비',
  safe_zone_detail text,
  description text not null,
  image_url text not null,
  image_urls text[] not null default '{}',
  status text not null default '판매중',
  badge text default '새 등록',
  hashtags text[] not null default '{}',
  likes_count integer not null default 0,
  chats_count integer not null default 0,
  views_count integer not null default 0,
  created_at timestamptz not null default now()
);

-- 3. wishlists 테이블 (찜한 상품 실시간 저장)
create table if not exists public.wishlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id text not null,
  product_title text not null,
  product_price integer not null default 0,
  product_image_url text not null,
  product_safe_zone text not null default '',
  product_category text not null default '전공서적',
  is_sample boolean not null default false,
  created_at timestamptz not null default now(),
  unique(user_id, product_id)
);

-- 4. meetup_requests 테이블 (직거래 약속 요청 내역)
create table if not exists public.meetup_requests (
  id uuid primary key default gen_random_uuid(),
  product_id text not null,
  product_title text not null,
  product_price integer not null default 0,
  product_image_url text not null,
  buyer_id uuid not null references auth.users(id) on delete cascade,
  buyer_nickname text not null,
  buyer_department text not null default '',
  seller_id text not null,
  seller_nickname text not null,
  university text not null default '연세대학교 신촌캠퍼스',
  safe_zone text not null,
  preferred_date text not null,
  preferred_time text not null,
  note text,
  status text not null default '요청됨',
  created_at timestamptz not null default now()
);

-- 5. 회원가입 시 profiles 자동 생성 트리거
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, nickname, university, department, manner_temp)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nickname', split_part(new.email, '@', 1), '캠퍼스학우'),
    coalesce(new.raw_user_meta_data->>'university', '연세대학교 신촌캠퍼스'),
    coalesce(new.raw_user_meta_data->>'department', '컴퓨터공학과 24학번'),
    98.5
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 6. RLS (Row Level Security) 활성화 및 정책 설정
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.wishlists enable row level security;
alter table public.meetup_requests enable row level security;

-- profiles 정책
drop policy if exists "Profiles are viewable by authenticated users" on public.profiles;
create policy "Profiles are viewable by authenticated users"
  on public.profiles for select
  using (true);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- products 정책 (누구나 실시간 조회 가능, 로그인 사용자는 등록/찜 카운트 업데이트, 작성자는 삭제 가능)
drop policy if exists "Products are viewable by everyone" on public.products;
create policy "Products are viewable by everyone"
  on public.products for select
  using (true);

drop policy if exists "Authenticated users can create products" on public.products;
create policy "Authenticated users can create products"
  on public.products for insert
  with check (auth.uid() = seller_id);

drop policy if exists "Authenticated users can update products" on public.products;
create policy "Authenticated users can update products"
  on public.products for update
  using (auth.role() = 'authenticated');

drop policy if exists "Sellers can delete their own products" on public.products;
create policy "Sellers can delete their own products"
  on public.products for delete
  using (auth.uid() = seller_id);

-- wishlists 정책 (본인 찜 목록만 조회/추가/삭제)
drop policy if exists "Users can view own wishlists" on public.wishlists;
create policy "Users can view own wishlists"
  on public.wishlists for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own wishlists" on public.wishlists;
create policy "Users can insert own wishlists"
  on public.wishlists for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own wishlists" on public.wishlists;
create policy "Users can delete own wishlists"
  on public.wishlists for delete
  using (auth.uid() = user_id);

-- meetup_requests 정책 (구매자/판매자 조회 및 상태 변경 가능)
drop policy if exists "Participants can view meetup requests" on public.meetup_requests;
create policy "Participants can view meetup requests"
  on public.meetup_requests for select
  using (auth.uid() = buyer_id or auth.uid()::text = seller_id);

drop policy if exists "Buyers can create meetup requests" on public.meetup_requests;
create policy "Buyers can create meetup requests"
  on public.meetup_requests for insert
  with check (auth.uid() = buyer_id);

drop policy if exists "Participants can update meetup requests" on public.meetup_requests;
create policy "Participants can update meetup requests"
  on public.meetup_requests for update
  using (auth.uid() = buyer_id or auth.uid()::text = seller_id);

-- 7. Supabase Storage 공개 버킷 'product-images' 생성 및 정책 설정
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

drop policy if exists "Public read access for product-images" on storage.objects;
create policy "Public read access for product-images"
  on storage.objects for select
  using (bucket_id = 'product-images');

drop policy if exists "Authenticated users can upload to product-images" on storage.objects;
create policy "Authenticated users can upload to product-images"
  on storage.objects for insert
  with check (bucket_id = 'product-images' and auth.role() = 'authenticated');

drop policy if exists "Users can delete own product images" on storage.objects;
create policy "Users can delete own product images"
  on storage.objects for delete
  using (bucket_id = 'product-images' and auth.uid()::text = (storage.foldername(name))[1]);

-- 8. Supabase Realtime 실시간 동기화 활성화
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'products'
  ) then
    alter publication supabase_realtime add table public.products;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'wishlists'
  ) then
    alter publication supabase_realtime add table public.wishlists;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'meetup_requests'
  ) then
    alter publication supabase_realtime add table public.meetup_requests;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'profiles'
  ) then
    alter publication supabase_realtime add table public.profiles;
  end if;
end $$;

-- 9. PostgREST 스키마 캐시 즉시 새로고침 (PGRST205 방지)
notify pgrst, 'reload schema';

