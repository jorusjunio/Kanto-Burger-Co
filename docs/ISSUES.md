# Known Issues — Kanto Burger Co.

Audit date: **2026-09-11** (after the PayMongo QR Ph payment-gateway integration).

Static checks at the time of this audit — all green:

| Check | Command | Result |
| --- | --- | --- |
| Types | `npx tsc --noEmit` | 0 errors |
| Lint | `npm run lint` | 0 problems |
| Unit tests | `npm test` | 50 / 50 passing |

Severity key: **P0** = do not go live without fixing · **P1** = fix soon, real
user impact · **P2** = worth fixing, limited blast radius · **P3** = polish.

---

## P0 — Critical

### 1. Walang paraan para bayaran ulit ang isang PENDING na order
**Files:** `src/features/checkout/actions.ts:256-289`, `src/app/(customer)/order/[orderNumber]/page.tsx`

Kapag nag-fail ang `createSession` (PayMongo down, network error, expired QR),
naka-catch at naka-log lang ito, at ang customer ay diretso sa order tracker
**na walang redirect at walang "Pay now" button**. Ganoon din kapag sinara ng
customer ang QR page o nag-expire ang QR (30 min default).

Ang comment sa `actions.ts:259` ay nagsasabing *"leaves a valid PENDING order
the customer can still pay from their tracker"* — **hindi ito totoo**; walang
ganoong path sa tracker page. Ang order ay permanenteng na-stuck: bayad na ang
stock, walang mababayaran ang customer, at kailangang manual na i-cancel ng
admin.

**Status: ✅ FIXED (2026-09-11)**
- `resumePayment` server action (`src/features/payments/resume-actions.ts`) na
  may DI core `resumePaymentWithDeps` (`resume.ts`). **Ginagamit ulit ang
  existing session kung buhay pa**, at gagawa lang ng bago kapag patay na —
  kung basta gagawa ng bago, maiiwang orphan ang lumang QR at hindi na
  matutugma sa order ang bayad dito.
- Bagong `resumeSession()` sa `PaymentProvider` interface. PayMongo: bago lang
  kapag `awaiting_payment_method` (expired) o 404 (ibang test/live mode); ibang
  error ay ibinabato para hindi maka-orphan ng buhay na QR habang may outage.
- "Pay via GCash" banner sa tracker, naka-gate sa shared na
  `canResumePayment()` — nakatago sa PAID, CANCELLED, hindi-GCash, at sa mga
  legacy order na may manual `gcashReference` (proteksyon laban sa dobleng
  singil).
- Rate limit: 5 kada 10 minuto bawat order.
- Na-verify sa browser: abandoned na sandbox order → button → bumalik sa
  parehong source (resumed, hindi bago); walang button sa paid at legacy
  orders. 10 unit tests sa `resume.test.ts`.

---

### 2. Mahina/predictable ang `PAYMENT_SIGNING_SECRET`
**File:** `.env:30`

**Status: ⚠️ Na-rotate, pero na-overwrite** — Napalitan ng random na 256-bit
value noong 2026-09-11, pero bumalik ang lumang value nang ma-save ang isang
lumang editor buffer ng `.env`. Kailangang i-rotate ulit (tingnan ang Fix sa
ibaba). Ligtas itong gawin anumang oras: kinukwenta ang signature sa bawat
render ng pay page, walang naka-imbak.

Ang kasalukuyang value ay `"kantoBurgerCoSecretKey9876543210UsingHmac"` — isang
human-written, nahuhulaang string. Ito ang HMAC secret na nagpo-protekta sa
`/api/payments/callback` (mock gateway settlement). Kung ang parehong value ay
madala sa production **at** naka-`PAYMENT_PROVIDER="mock"`, kayang mag-forge ng
kahit sino ng valid signature at i-mark na **PAID** ang kahit anong order nang
walang bayad.

`.env.example` ay tamang nagsasabi ng `"generate-a-long-random-string"` — ang
aktwal na dev value lang ang mahina.

**Fix:** Palitan ng cryptographically random na value
(`openssl rand -hex 32` o `crypto.randomBytes(32).toString("hex")`), at iba
para sa production.

---

### 3. Live production secret naka-imbak sa `.env`
**File:** `.env:42` — `PAYMONGO_LIVE_SECRET_KEY="sk_live_..."`

Hindi ito binabasa ng app (ang `PAYMONGO_SECRET_KEY` lang ang ginagamit), pero
ito ay **live production credential** na kayang mag-charge ng totoong pera,
nakatambay sa isang local file para lang sa mga diagnostic script natin.

Naka-gitignore naman ang `.env` (`.gitignore:30` — `.env*`), kaya hindi ito
maco-commit. Pero:
- Naka-plaintext pa rin sa disk
- Nakita natin ito sa mga screenshot habang nagde-develop
- Walang dahilan para manatili ito dito

**Fix:** Tanggalin ang linyang ito. Kapag kailangan ulit para sa live testing,
kunin muna sa dashboard. Sa production (Vercel), env vars lang ang gamitin.
Kung may pag-aalinlangan na na-expose na ito, i-regenerate ang key sa
dashboard (Developers → API Keys → Regenerate).

---

## P1 — High

### 4. Na-lock na stock sa mga inabandonang GCash order
**File:** `src/features/checkout/actions.ts:202-228`

Ang stock ay ibinabawas **agad** sa loob ng checkout transaction, bago pa man
magbayad. Ibinabalik lang ito kapag **manual na kinansela ng admin**
(`src/features/admin/orders/action-handlers.ts:189-190`).

Walang automatic cleanup para sa mga inabandonang order. Bawat hindi natapos na
GCash checkout ay permanenteng kumakain ng stock hanggang may makapansing tao.
Sa isang mabentang araw, puwedeng lumabas na "out of stock" ang isang produkto
gayong may stock pa naman talaga.

**Fix (pumili):**
- Isang scheduled job (Vercel Cron) na nagka-cancel ng mga `PENDING` GCash order
  na lumagpas na sa QR expiry (30 min), kasama ang stock restore; o
- Huwag munang bawasan ang stock hanggang `PAID` (pero mas mataas ang panganib
  ng oversell); o
- Mag-subscribe sa `qrph.expired` webhook event at doon i-trigger ang cleanup.

---

### 5. Hindi hinahawakan ang pag-expire ng QR code
**Files:** `src/features/payments/qrph-gateway.tsx`, `src/app/(customer)/checkout/pay/[intentId]/page.tsx:29`

Nag-e-expire ang QR Ph code pagkatapos ng **30 minuto**. Kinukuha ng
`getQrPhStatus()` ang `status` ng Payment Intent, pero **binabalewala ito ng
page** — `qrImageUrl` lang ang ipinapasa sa component.

Resulta: pagkatapos mag-expire, patuloy pa ring nakikita ng customer ang patay
na QR at ang "Naghihintay ng bayad..." habang buhay. Kung may mag-scan, mabibigo
sila nang walang paliwanag.

Hindi rin naka-subscribe ang webhook natin sa `qrph.expired` event, kaya
walang nakakaalam ang server na patay na ang session.

**Fix:** I-handle ang `status` mula sa `getQrPhStatus()` (`awaiting_next_action`
= buhay; iba = expired/tapos). Magpakita ng countdown at "Generate new QR"
button. Idagdag ang `qrph.expired` sa webhook subscription.

---

### 6. Walang rate limiting ang PayMongo webhook route
**File:** `src/app/api/payments/webhooks/paymongo/route.ts`

May `paymentCallbackRateLimiter` ang mock callback route
(`src/app/api/payments/callback/route.ts:40`), pero **wala** ang bagong PayMongo
webhook route. Bawat request ay nagti-trigger ng HMAC computation at, kapag
pumasa, ng DB write.

Totoo namang naka-protekta ito ng signature verification, pero ang isang
unauthenticated flood ay puwede pa ring mag-ubos ng compute/DB connections
bago pa man ma-reject.

**Fix:** Idagdag ang parehong rate limiter, naka-key sa intent id o source IP.

---

### 7. Nilulunok ang error kapag nabigo ang `chargeSource` — mawawala ang bayad
**File:** `src/app/api/payments/webhooks/paymongo/route.ts:56-63`

```ts
try {
  await chargeSource(source.id, source.amountCentavos);
} catch (error) {
  logger.error("Failed to charge PayMongo source", error, { sourceId: source.id });
}
return NextResponse.json({ ok: true });
```

Kapag nabigo ang `chargeSource`, nagba-`200 OK` pa rin tayo. Ituturing ito ni
PayMongo na successful na delivery at **hindi na ito uulitin** — kaya ang isang
source na binayaran na ng customer ay hindi na kailanman magiging Payment.
Nagbayad ang customer, hindi na-settle ang order.

Hindi pa ito aktibo sa kasalukuyang QR Ph flow (walang `source.chargeable`
events), pero magiging live agad ito kapag na-enable na ang direct GCash channel.

**Fix:** Magbalik ng 5xx kapag nabigo ang charge para mag-retry si PayMongo.

---

## P2 — Medium

### 8. Nasisira ang pay page kapag mismatch ang PayMongo mode
**File:** `src/app/(customer)/checkout/pay/[intentId]/page.tsx:29`

Ginagamit ng `getQrPhStatus()` ang **kasalukuyang** `PAYMONGO_SECRET_KEY`. Ang
mga payment intent ay nakatali sa mode kung saan sila ginawa (test o live).

Kaya kapag nagpalit ng keys (gaya ng ginawa natin ngayon — live test tapos balik
sa sandbox), ang mga order na ginawa sa kabilang mode ay **hindi na mabubuksan**
ang pay page — mag-e-error (404 mula PayMongo) papunta sa error boundary, nang
walang malinaw na paliwanag.

Aktwal na apektado ngayon: ang totoong ₱1 na live order (`KBC-260911-044541-XGKG`).

**Fix:** I-catch ang `PaymongoApiError` sa page at magpakita ng malinaw na
mensahe ("Hindi na available ang payment session na ito") sa halip na
mag-crash.

---

### 9. Walang katapusan ang polling sa QR page
**File:** `src/features/payments/qrph-gateway.tsx:31-58`

Ang polling interval (bawat 4 segundo) ay tumatakbo hangga't nakabukas ang page.
Kapag iniwan ng customer ang tab nang ilang oras, patuloy ang pag-hit sa
`/api/payments/session/[intentId]` — **900 DB query kada oras, kada tab**.

**Fix:** Maglagay ng max attempts (hal. huminto pagkatapos ng QR expiry window),
o dagdagan ang interval sa paglipas ng oras (backoff), o huminto kapag
`document.hidden`.

---

### 10. Walang rate limit at walang token check ang status endpoint
**File:** `src/app/api/payments/session/[intentId]/route.ts`

Bukas ang endpoint sa kahit sino na may hawak ng intent id — walang tracking
token check (hindi tulad ng order tracker, `src/features/orders/queries.ts`),
walang rate limiting.

Hindi ito kritikal dahil ang mga intent id ay random at hindi nahuhulaan
(`pi_` + 24 random chars), at `paymentStatus` lang ang ibinabalik nito. Pero
hindi ito tugma sa pattern ng natitirang bahagi ng app.

**Fix:** Hingin din ang tracking token bilang query param, at idagdag ang rate
limiter.

---

### 11. 500 error sa halip na malinis na rejection sa mga hindi inaasahang webhook payload
**File:** `src/app/api/payments/webhooks/paymongo/route.ts:70-72`

Dalawang throw ang hindi naka-catch:
- `parseCallback()` — nagta-throw ng `ZodError` kapag kulang ang payload ng
  `payment_intent_id` **at** `source.id`
- `settlePaymentWithDeps()` → `assertCanSettleToPaid()` — nagta-throw ng
  `PaymentSettlementError` kapag ang order ay CASH/COD o final na ang status

Parehong magiging unhandled 500 — na ituturing ni PayMongo bilang retryable
failure, kaya paulit-ulit nitong ipapadala ang parehong hindi mapoprosesong
event.

**Fix:** I-wrap sa try/catch; magbalik ng 200 na may error body para sa mga
payload na talagang hindi natin kayang iproseso (para huminto ang retry), at
5xx lang para sa mga totoong transient failure.

---

### 12. Hindi naka-configure ang Pusher at Upstash Redis
**File:** `.env:19-24` (Pusher), walang Upstash vars

- **Pusher blangko** → tahimik na naka-skip ang lahat ng realtime event
  (`"Pusher not configured, skipping event trigger"` sa logs). Hindi
  nag-a-auto-update ang admin dashboard at customer tracker; kailangang
  mag-refresh manually.
- **Walang Upstash** → in-memory na rate limiter
  (`src/lib/rate-limiter.ts:114-129`). Sa Vercel serverless, bawat instance ay
  may sariling counter, kaya epektibong **walang bisa** ang rate limiting sa
  production.

Parehong may tamang fallback at warning — hindi ito bug, kundi hindi pa tapos
na configuration. Pero P0 ang Upstash kapag deploy na sa production.

**Fix:** I-set ang mga env vars bago mag-production deploy.

---

### 13. Ang `/api/payments/callback` (mock) ay live sa production
**File:** `src/app/api/payments/callback/route.ts`

Naka-register ang mock settlement route kahit `PAYMENT_PROVIDER="paymongo"`.
Kasalukuyan itong nagfe-fail-closed (mag-t-throw ang `parseCallback` ng
PayMongo sa mock payload shape), kaya hindi ito exploitable ngayon — pero ito
ay attack surface na walang silbi sa production, at ang seguridad nito ay
nakasalalay lang sa detalye ng ibang provider.

**Fix:** I-guard ang route: agad mag-404 kapag hindi `mock` ang aktibong provider.

---

## P3 — Low / polish

### 14. Hindi pa naka-commit ang lahat ng payment-gateway work
Walo (8) na bagong file at apat (4) na binagong file ang nasa working tree
lang. Isang aksidenteng `git checkout` o `git reset --hard` ay tatanggalin ang
lahat ng ginawa natin ngayon.

**Fix:** I-commit na.

### 15. Naka-log ang phone number ng customer (PII)
**File:** `src/features/checkout/actions.ts:59`

`logger.warn("Rate limit exceeded for checkout", { customerPhone })` — pumapasok
ang raw phone number sa production logs. Mas mabuti ang hashed o partially
masked (`09XX***5853`).

### 16. Madaling lusutan ang checkout rate limiter
**File:** `src/features/checkout/actions.ts:57`

Naka-key ito sa `customerPhone`, na galing mismo sa user — sapat na ang magbago
ng isang digit para makaiwas. Mas matibay kung IP-based, o kombinasyon ng
pareho.

### 17. Hindi constant-time ang paghahambing ng tracking token
**File:** `src/features/orders/queries.ts:18`

`order.trackingToken !== trackingToken` — teoretikal na timing attack.
Praktikal na hindi mapapakinabangan sa isang 32-char random hex sa ibabaw ng
network latency, pero may `crypto.timingSafeEqual` na tayong ginagamit sa
`signing.ts` kung gusto nating pare-pareho ang pattern.

### 18. Dead code habang naka-gate pa ang GCash channel
**File:** `src/features/payments/providers/paymongo.ts:206-233`

Hindi kailanman tumatakbo ang `getChargeableSource()` at `chargeSource()` sa
kasalukuyang QR Ph flow. Sinasadya ito (handa na sila kapag na-verify na ang
business at na-enable ang direct GCash) at may komento na nagpapaliwanag —
pero hindi pa nasusubukan ang code path na iyon.

### 19. Luma na ang komento tungkol sa `PAYMENT_PROVIDER` sa `.env`
**File:** `.env:32-33`

Sabi ng komento na panatilihing `"mock"` hanggang masubukan ang provider —
pero `"paymongo"` na ang naka-set at nasubukan na natin nang buo. Maling
gabay na para sa susunod na babasa.

---

## Hindi issue — maayos na bahagi

Para malinaw kung ano ang hindi kailangang galawin:

- **Auth / RBAC** — tama ang pagkakabahagi. Ang `proxy.ts` ang humahadlang sa
  mga hindi naka-sign-in; ang mga page ay gumagamit ng `requireManagerPage()`;
  ang mga server action ay `requireAdminRoleSession()`. Naka-gate din ang
  Google sign-in sa `User` table.
- **Security headers** — kumpletong CSP, `frame-ancestors: none`, nosniff,
  Permissions-Policy (`next.config.ts`).
- **Server-side trust** — muling binabasa ang presyo at availability mula sa DB
  sa loob ng checkout transaction; hindi pinagkakatiwalaan ang client.
- **Stock concurrency** — conditional na `updateMany` na may `gte` guard —
  tamang paraan para maiwasan ang oversell sa magkasabay na order.
- **Idempotent settlement** — naka-key sa unique na `paymentIntentId`, may
  state-machine guard. Ligtas ang paulit-ulit na webhook.
- **Webhook signature verification** — HMAC sa raw body bago mag-parse,
  `timingSafeEqual`, tumatanggap ng test at live digest.
- **Rate limiter** — maayos na Redis/memory backend split, fail-open na may
  logging.
- **Error boundaries** — kumpleto ang `error.tsx` / `not-found.tsx` /
  `loading.tsx` sa lahat ng route group.
- **Walang `any`, walang stray `console.log`, walang TODO/FIXME** sa buong
  `src/`.

---

## Iminumungkahing pagkakasunod-sunod

1. I-commit ang kasalukuyang payment-gateway work (#14)
2. Ayusin ang retry-payment path (#1) — ito ang may pinakamalinaw na epekto sa customer
3. I-rotate ang `PAYMENT_SIGNING_SECRET` at tanggalin ang live key sa `.env` (#2, #3)
4. QR expiry handling + stock cleanup job (#4, #5)
5. Webhook hardening — rate limit, retry semantics (#6, #7, #11)
6. Bago mag-production deploy: Upstash + Pusher env vars (#12), i-guard ang mock route (#13)
