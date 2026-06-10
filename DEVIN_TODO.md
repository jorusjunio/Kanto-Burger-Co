# Kanto Burger Co. - Development Improvement Plan

**Last Updated:** June 11, 2026  
**Purpose:** Master checklist for improving security, performance, and code quality

---

## Current Architecture Analysis

### Tech Stack
- **Frontend:** Next.js 16.2.6 (App Router), React 19.2.4, TypeScript
- **Styling:** Tailwind CSS 4, shadcn/ui components
- **Database:** PostgreSQL via Neon, Prisma 7.8.0 ORM
- **Authentication:** NextAuth 4.24.14 (Credentials provider)
- **State Management:** Zustand for cart
- **File Storage:** Cloudinary
- **Real-time:** Pusher
- **Charts:** Recharts

### Architecture Pattern
- **Feature-based structure:** `src/features/` (admin, cart, checkout, menu, orders)
- **App Router:** `src/app/` with route groups `(customer)`, `admin`, `api`
- **Server-side:** `src/server/` (auth config, Prisma client, external services)
- **Generated code:** `src/generated/prisma/` (excluded from git)

### Database Models
- User (ADMIN/STAFF roles)
- Category (with sortOrder)
- Product (stock tracking, add-ons, featured flag)
- AddOn (optional product extras)
- Order (PICKUP/DELIVERY, payment methods, status workflow)
- OrderItem (JSON for selected add-ons)

---

## Security Issues Identified

### 🔴 Critical Issues
1. **No rate limiting on API routes** - Vulnerable to brute force attacks
2. **No account lockout mechanism** - Failed login attempts not tracked
3. **No password complexity requirements** - Users can set weak passwords
4. **No environment variable validation at startup** - App may fail silently
5. **No security headers configured** - Missing CSP, HSTS, X-Frame-Options
6. **No CORS configuration** - Default Next.js CORS may be too permissive
7. **No request size limits** - Vulnerable to DoS attacks via large payloads
8. **Auth secret not validated** - `process.env.AUTH_SECRET` could be undefined

### 🟡 Medium Priority
9. **No CSRF protection visible** - Though Next.js has some built-in protection
10. **Cloudinary/Pusher configs not validated at startup** - May fail at runtime
11. **No API key rotation strategy** - Keys hardcoded in environment
12. **No input sanitization** - Relying solely on Zod validation
13. **No audit logging** - No tracking of admin actions
14. **No session timeout configuration** - Using default NextAuth settings

### 🟢 Low Priority
15. **No SQL injection protection visible** - Though Prisma ORM provides some protection
16. **No content security policy** - XSS vulnerabilities possible
17. **No HTTPS enforcement** - Assuming Vercel handles this

---

## Performance Issues Identified

### 🔴 Critical Issues
1. **No caching strategy** - Every request hits database
2. **No database connection pooling configuration** - Default Prisma settings
3. **No CDN configuration for static assets** - Serving from Next.js server
4. **No image optimization beyond defaults** - Could use more aggressive optimization

### 🟡 Medium Priority
5. **No lazy loading for components** - All components loaded upfront
6. **No code splitting strategy** - Large bundles likely
7. **No database query optimization** - No indexes on frequently queried fields
8. **No API response caching** - Repeated queries for same data
9. **No static generation where possible** - All pages are dynamic

### 🟢 Low Priority
10. **No bundle size monitoring** - Don't know current bundle sizes
11. **No performance monitoring** - No APM or error tracking
12. **No CDN for images** - Cloudinary not configured for CDN delivery

---

## Code Quality Issues

### 🔴 Critical Issues
1. **No error boundary components** - App crashes on unhandled errors
2. **No global error handling** - Errors not logged consistently
3. **No logging strategy** - Using console.log only
4. **No test coverage for critical paths** - Only some unit tests exist

### 🟡 Medium Priority
5. **No TypeScript strict mode violations checked** - Some any types possible
6. **No ESLint rules for security** - Basic config only
7. **No code formatting automation** - Prettier not configured
8. **No pre-commit hooks** - No automated checks before commits

### 🟢 Low Priority
9. **No API documentation** - No OpenAPI/Swagger docs
10. **No component documentation** - No Storybook or similar
11. **No CI/CD pipeline visible** - Manual deployments likely

---

## Improvement Plan

### Phase 1: Critical Security Fixes (Week 1-2)
- [ ] Add rate limiting to API routes
- [ ] Implement account lockout for failed logins
- [ ] Add password complexity requirements
- [ ] Add environment variable validation at startup
- [ ] Configure security headers in next.config.ts
- [ ] Add CORS configuration
- [ ] Add request size limits
- [ ] Validate AUTH_SECRET at startup

### Phase 2: Performance Optimization (Week 3-4)
- [ ] Implement Redis caching for frequently accessed data
- [ ] Configure database connection pooling
- [ ] Add CDN configuration for static assets
- [ ] Optimize image loading with Next.js Image component
- [ ] Add lazy loading for heavy components
- [ ] Implement code splitting
- [ ] Add database indexes for common queries
- [ ] Implement API response caching

### Phase 3: Code Quality & Testing (Week 5-6)
- [ ] Add error boundary components
- [ ] Implement global error handling
- [ ] Set up structured logging (Winston/Pino)
- [ ] Increase test coverage to 80%+
- [ ] Add TypeScript strict mode checks
- [ ] Configure ESLint security rules
- [ ] Set up Prettier for code formatting
- [ ] Add pre-commit hooks (Husky)

### Phase 4: Monitoring & Documentation (Week 7-8)
- [ ] Set up performance monitoring (Vercel Analytics/Sentry)
- [ ] Add bundle size monitoring
- [ ] Create API documentation (OpenAPI/Swagger)
- [ ] Set up component documentation (Storybook)
- [ ] Configure CI/CD pipeline
- [ ] Add audit logging for admin actions
- [ ] Implement session timeout configuration

---

## Progress Log

### June 11, 2026 - UI/UX Enhancements Implementation
- **Status:** Completed
- **Changes Made:** Implemented three major UI/UX enhancements for checkout and order completion flow
- **Files Modified:**
  - `src/features/checkout/checkout-page.tsx` - Redesigned Order Type and Payment Method sections as interactive radio tiles/cards with icons, hover effects, and active states. Fixed Confirmation Modal positioning to center screen with dark overlay and backdrop-blur.
  - `src/app/order/[orderNumber]/page.tsx` - Redesigned as modern digital receipt with dynamic status badges (pulsing dots), dashed borders, card shadows, and improved visual hierarchy.
  - `src/components/customer/active-order-widget.tsx` - Created new floating widget component for tracking active orders.
  - `src/app/layout.tsx` - Added ActiveOrderWidget to root layout for global visibility.
- **Notes:** 
  - Order Type and Payment Method now use interactive cards with smooth transitions, brand colors (red-600 for active), and checkmark indicators
  - Confirmation Modal now uses fixed inset-0 positioning with backdrop-blur for better focus
  - Order receipt features status badges with pulsing animations, payment icons, and receipt-style dashed borders
  - LocalStorage integration saves order data when users click "Order More" or "Back Home"
  - Floating widget appears in bottom-right corner when active order exists in LocalStorage

### June 11, 2026 - Confirmation Modal Positioning Fix
- **Status:** Completed
- **Changes Made:** Fixed confirmation modal positioning issue where modal appeared on far left edge instead of centered
- **Files Modified:**
  - `src/features/checkout/checkout-page.tsx` - Replaced custom positioning classes with proper shadcn/ui Dialog structure using DialogOverlay component for backdrop
- **Notes:**
  - Issue was caused by applying `fixed inset-0 z-50 flex items-center justify-center` to DialogContent, which conflicted with shadcn/ui's built-in positioning
  - Fix: Used DialogOverlay component with `bg-black/60 backdrop-blur-sm` for proper overlay styling
  - Removed custom positioning divs and let DialogContent use its native centering logic (`top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2`)
  - Added DialogOverlay to imports

### June 11, 2026 - Confirmation Modal Premium Redesign
- **Status:** Completed
- **Changes Made:** Enhanced confirmation modal interior with premium styling, increased spacing, card tiles, prominent total section, and modern button design
- **Files Modified:**
  - `src/features/checkout/checkout-page.tsx` - Redesigned modal content sections with improved visual hierarchy
- **Notes:**
  - Increased vertical gaps from `space-y-3` to `space-y-4` for better breathing room
  - Each section (Contact, Order Type, Payment) now uses card tile design with gradient backgrounds (`from-stone-50 to-amber-50/40`), borders, and shadows
  - Icon containers enlarged from `size-4` to `size-10` with rounded-xl styling and shadow-sm
  - Labels updated to `text-[10px] font-black uppercase tracking-widest` for premium feel
  - Total/Items section made prominent with `border-2 border-red-600/20`, gradient background, larger icon container (`size-12`), and `text-2xl` font for price
  - Buttons modernized with `h-12` height, `border-2`, gradient background for confirm button, enhanced shadows, and smoother `duration-300` transitions
  - Cancel button now has `border-2` with hover shadow effects
  - Confirm button uses `bg-gradient-to-br from-red-600 to-red-700` with shadow-red-600/30

### June 11, 2026 - Runtime Error Fixes
- **Status:** Completed
- **Changes Made:** Fixed Radix UI accessibility error and Next.js event handler error
- **Files Modified:**
  - `src/features/menu/product-card.tsx` - Added DialogTitle to DialogContent for Radix UI accessibility compliance
  - `src/app/order/[orderNumber]/page.tsx` - Added "use client" directive to enable onClick handlers for localStorage
- **Notes:**
  - Radix UI Error: DialogContent must have a DialogTitle for accessibility. Added `<DialogTitle className="sr-only">{product.name}</DialogTitle>` to satisfy screen reader requirements without changing visual design
  - Next.js Event Handler Error: Order receipt page had onClick handlers on Link components but was a Server Component. Added "use client" directive at top of file to enable client-side interactivity
  - Both errors resolved, application now runs without runtime logs

### June 11, 2026 - Order Receipt Architecture Restructure
- **Status:** Completed
- **Changes Made:** Separated Server and Client components to fix Prisma build error
- **Files Modified:**
  - `src/app/order/[orderNumber]/page.tsx` - Removed "use client" directive, converted back to Server Component, imported and used OrderReceiptClient
  - `src/features/orders/components/order-receipt-client.tsx` - Created new Client Component to handle localStorage logic and onClick handlers
- **Notes:**
  - Build Error: Server Component was importing Prisma DB queries but had "use client" directive, causing Turbopack chunk error
  - Fix: Removed "use client" from page to allow Prisma queries on server, created separate OrderReceiptClient component for client-side logic
  - Data passed from Server Page to Client Component via props (orderNumber, token)
  - localStorage logic moved to OrderReceiptClient component with proper "use client" directive
  - Application now builds cleanly without Prisma/browser conflicts

### June 11, 2026 - Confirmation Modal Scrollable Layout Fix
- **Status:** Completed
- **Changes Made:** Fixed modal bottom cut-off by implementing scrollable content area with proper flex layout
- **Files Modified:**
  - `src/features/checkout/checkout-page.tsx` - Added max-h-[90vh] constraint, flex layout, and overflow-y-auto to content area
- **Notes:**
  - Issue: Modal content exceeded viewport height with overflow-hidden, causing bottom buttons to be cut off
  - Fix: Added `max-h-[90vh]` to DialogContent to constrain height to 90% of viewport
  - Added `flex flex-col` to DialogContent for proper flex layout
  - Content area now has `flex-1 overflow-y-auto` to enable scrolling when content is long
  - DialogHeader and DialogFooter have `shrink-0` to prevent shrinking and keep them visible
  - Buttons now always visible and clickable regardless of content length
  - Clean scrollbar appears inside modal when content exceeds available space

### June 11, 2026 - UI/UX Adjustments (Receipt, Sidebar Tracker, Toast Position)
- **Status:** Completed
- **Changes Made:** Three major UI/UX improvements for better user experience
- **Files Modified:**
  - `src/app/order/[orderNumber]/page.tsx` - Reduced font sizes and spacing for compact receipt layout, removed ActiveOrderWidget
  - `src/components/customer/mobile-nav.tsx` - Added ActiveOrderTracker component to sidebar with LocalStorage integration
  - `src/app/layout.tsx` - Changed Toaster position from top-right to top-left
- **Notes:**
  - Receipt Page: Reduced all font sizes (header from text-4xl to text-xl, labels from text-[11px] to text-[9px], etc.) and spacing (padding from p-6 to p-3) to fit viewport without scrolling for single-item orders
  - Sidebar Tracker: Created ActiveOrderTracker component that checks LocalStorage for active order, displays "🍔 Track Active Order" with order number and Track button, integrated into MobileNav sidebar between navigation and cart sections
  - Floating Banner Removed: Removed ActiveOrderWidget from order receipt page since tracker now lives in sidebar
  - Toast Position: Changed Toaster position from "top-right" to "top-left" to avoid covering layout
  - All changes improve UX by reducing clutter, improving accessibility, and preventing UI overlap

---

## Next Steps

**Immediate Priority:** Start with Phase 1 - Critical Security Fixes

**First Task:** Add rate limiting to API routes using `upstash/ratelimit` or similar solution

---

## Notes

- This is a living document - update as progress is made
- Prioritize security fixes before performance optimizations
- Test thoroughly after each phase
- Document any deviations from this plan
