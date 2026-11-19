# Campus Market Security Specification (Phase 0)

## 1. Data Invariants
1. **Profiles (`/profiles/{userId}`)**:
   - Only the owning authenticated user (`request.auth.uid == userId`) can read, create, or update their own profile.
   - `uid` must strictly match `request.auth.uid` and remain immutable.
   - `mannerTemp` defaults to `98.5` on creation and cannot be arbitrarily escalated by the user on update.
   - Zero PII (`email`, `phone`, `address`) is stored in `/profiles`.
2. **Products (`/products/{productId}`)**:
   - Publicly readable/listable ONLY where `resource.data.isPublic == true`.
   - Only signed-in users can create a listing, with `sellerId == request.auth.uid`, `isPublic == true`, `status == '판매중'`, `likesCount == 0`, `chatsCount == 0`, `viewsCount == 0`, and `createdAt == request.time`.
   - Only the listing owner (`existing().sellerId == request.auth.uid`) can edit listing details or mark it `예약중`/`거래완료` (terminal lock once `거래완료`) or delete it.
   - Signed-in users can adjust `likesCount` by exactly `+1` or `-1` via an explicit Action-Based update branch, preventing tampering with price, title, or seller info.
3. **Wishlists (`/wishlists/{wishlistId}`)**:
   - Document ID must match `{userId}_{productId}` (`isValidId`) and `userId == request.auth.uid`.
   - Strictly private to the owner for `get`, `list`, `create`, and `delete`.
4. **Meetup Requests (`/meetup_requests/{requestId}`)**:
   - Only signed-in users can create requests with `buyerId == request.auth.uid`, initial `status == '요청됨'`, and `createdAt == request.time`.
   - Readable (`get`/`list`) ONLY by the `buyerId` or `sellerId`.
   - Terminal states (`거절됨`, `완료됨`) cannot be mutated further.

## 2. The Dirty Dozen Adversarial Payloads
1. **Identity Spoofing on Profile Create**: Creating `/profiles/victimUid` as `attackerUid`.
2. **Shadow Field Injection on Profile**: Adding `isAdmin: true` or `role: "superadmin"` to `/profiles/{uid}`.
3. **Manner Temperature Escalation**: Updating `mannerTemp` to `999.9` on own profile.
4. **Cross-User Profile Read**: Reading `/profiles/otherUid` as a different signed-in user.
5. **Fake Seller Product Creation**: Creating a product with `sellerId: "victimUid"`.
6. **Oversized Description / Resource Poisoning**: Creating a product with a 5,000-char description or 20 images.
7. **Unauthorized Product Price Tampering**: Non-owner updating `price` to `0` on another user's product.
8. **Product Likes Count Manipulation**: Updating `likesCount` by `+500` in a single request.
9. **Terminal State Bypass on Product**: Re-opening a `거래완료` product back to `판매중`.
10. **Cross-User Wishlist Scraping**: Listing `/wishlists` without filtering to `userId == request.auth.uid`.
11. **Meetup Buyer Spoofing**: Creating a `/meetup_requests` doc with `buyerId != request.auth.uid` or initial `status: "완료됨"`.
12. **Client Timestamp Forgery**: Creating a product or meetup request with a backdated `createdAt != request.time`.
