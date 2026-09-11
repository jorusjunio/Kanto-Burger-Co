# Known Issues: Kanto Burger Co.

Audit date: **2026-09-11** (after the PayMongo QR Ph payment-gateway integration).

Static checks at the time of this audit, all green:

| Check | Command | Result |
| --- | --- | --- |
| Types | `npx tsc --noEmit` | 0 errors |
| Lint | `npm run lint` | 0 problems |
| Unit tests | `npm test` | 50 / 50 passing |

Severity key: **P0** = do not go live without fixing · **P1** = fix soon, real
user impact · **P2** = worth fixing, limited blast radius · **P3** = polish.

---

## Progress

Patakaran: bawat natapos na issue ay idinodokumento sa sariling entry nito,
kasama kung ano ang binago at ang ebidensya ng double-check. ✅ lang kapag
na-verify talaga; ⚠️ kapag bahagya pa lang.

| # | Issue | Status | Na-verify | Commit |
| --- | --- | --- | --- | --- |
| 1 | Walang retry-payment path | ✅ Fixed | 2026-09-11 | `3f12430` |
| 2 | Mahinang `PAYMENT_SIGNING_SECRET` | ✅ Fixed (local at production) | 2026-09-11 | wala (env vars) |
| 3 | Live secret sa `.env` | ✅ Fixed | 2026-09-11 | wala (`.env`) |
| 5 | Hindi hinahawakan ang pag-expire ng QR | ⚠️ Bahagya (UI tapos, kailangang makita sa live) | 2026-09-11 | hindi pa naka-commit |
| 8 | Nasisira ang pay page kapag mismatch ang mode | ✅ Fixed | 2026-09-11 | hindi pa naka-commit |
| 9 | Walang katapusang polling sa QR page | ✅ Fixed | 2026-09-11 | hindi pa naka-commit |
| 14 | Hindi naka-commit ang payment work | ✅ Fixed | 2026-09-11 | `3f12430`, `beac845`, `ec9c47f` |
| 20 | Hindi pa kumpleto ang PayMongo sa production | ⚠️ Kumpleto ang setup, hinihintay ang ₱1 test | 2026-09-11 | wala (Vercel env vars) |
| 21 | Walang paraan pabalik mula sa QR page | ✅ Fixed | 2026-09-11 | hindi pa naka-commit |
| 4, 6, 7, 10 to 13, 15 to 19 | | Open | | |

Kasalukuyang estado (2026-09-11, pagkatapos ng mga fix): `npm test` 70 / 70,
`npx tsc --noEmit` 0 errors, `npm run build` pasado.

---

## P0: Critical

### 1. Walang paraan para bayaran ulit ang isang PENDING na order
**Files:** `src/features/checkout/actions.ts:256-289`, `src/app/(customer)/order/[orderNumber]/page.tsx`

Kapag nag-fail ang `createSession` (PayMongo down, network error, expired QR),
naka-catch at naka-log lang ito, at ang customer ay diretso sa order tracker
**na walang redirect at walang "Pay now" button**. Ganoon din kapag sinara ng
customer ang QR page o nag-expire ang QR (30 min default).

Ang comment sa `actions.ts:259` ay nagsasabing *"leaves a valid PENDING order
the customer can still pay from their tracker"*, pero **hindi ito totoo**:
walang ganoong path sa tracker page. Ang order ay permanenteng na-stuck: bawas
na ang stock, walang mababayaran ang customer, at kailangang manual na
i-cancel ng admin.

**Status: ✅ FIXED (2026-09-11, commit `3f12430`)**
- `resumePayment` server action (`src/features/payments/resume-actions.ts`) na
  may DI core `resumePaymentWithDeps` (`resume.ts`). **Ginagamit ulit ang
  existing session kung buhay pa**, at gagawa lang ng bago kapag patay na. Kung
  basta gagawa ng bago, maiiwang orphan ang lumang QR at hindi na matutugma sa
  order ang bayad dito.
- Bagong `resumeSession()` sa `PaymentProvider` interface. PayMongo: bago lang
  kapag `awaiting_payment_method` (expired) o 404 (ibang test/live mode); ibang
  error ay ibinabato para hindi maka-orphan ng buhay na QR habang may outage.
- "Pay via GCash" banner sa tracker, naka-gate sa shared na
  `canResumePayment()`. Nakatago ito sa PAID, CANCELLED, hindi-GCash, at sa mga
  legacy order na may manual `gcashReference` (proteksyon laban sa dobleng
  singil).
- Rate limit: 5 kada 10 minuto bawat order.
- Naitama na ang comment sa `actions.ts:259`.
- **Double-check:** sa browser, abandoned na sandbox order → button → bumalik
  sa parehong source (resumed, hindi bago), at hindi nagbago ang
  `paymentIntentId` sa DB; walang button sa paid at legacy orders. 10 unit
  tests sa `resume.test.ts`; `tsc` 0 errors; lint clean.

---

### 2. Mahina/predictable ang `PAYMENT_SIGNING_SECRET`
**File:** `.env` (`PAYMENT_SIGNING_SECRET`), at Vercel env vars (Production)

**Status: ✅ FIXED sa local at production (2026-09-11, na-double check)**
- **Local:** pinalitan ng random na 256-bit value (`crypto.randomBytes(32)`).
  Hindi ipinakita ang value kahit saan. Na-overwrite ang unang rotation nang
  ma-save ang isang lumang editor buffer ng `.env`; inulit ito at na-verify
  pagkatapos.
- **Double-check (local)**, direktang basa sa `.env` sa disk, hindi
  screenshot: may value, **hindi** ito ang lumang `kantoBurgerCo...` string, at
  64 hex chars ito. `npm test` 60 / 60.
- **Production:** inilagay sa Vercel ang hiwalay na random value (mula sa
  `.env.vercel-production`, iba sa local), tapos nag-redeploy.
- **Double-check (production)**, sa live site nang walang ipinapakitang value:
  ang signature na gawa sa bagong secret ay **tinanggap** ng
  `/api/payments/callback`, at ang gawa sa lumang `kantoBurgerCo...` string ay
  **tinanggihan** (401). Ang unang probe ay nagpakita pa ng lumang value dahil
  tumakbo ito bago naging live ang redeploy; inulit pagkatapos ng redeploy.
- Ligtas itong i-rotate anumang oras: kinukwenta ang signature sa bawat render
  ng pay page, walang naka-imbak.

Ang dating value ay `"kantoBurgerCoSecretKey9876543210UsingHmac"`, isang
human-written, nahuhulaang string. Ito ang HMAC secret na nagpo-protekta sa
`/api/payments/callback` (mock gateway settlement). Kung madala ang parehong
value sa production **at** naka-`PAYMENT_PROVIDER="mock"`, kayang mag-forge ng
kahit sino ng valid signature at i-mark na **PAID** ang kahit anong order nang
walang bayad.

Tama ang sinasabi ng `.env.example` (`"generate-a-long-random-string"`); ang
aktwal na dev value lang ang mahina.

**Fix:** Palitan ng cryptographically random na value
(`openssl rand -hex 32` o `crypto.randomBytes(32).toString("hex")`), at iba
para sa production.

---

### 3. Live production secret naka-imbak sa `.env`
**File:** `.env` (dating `PAYMONGO_LIVE_SECRET_KEY="sk_live_..."`)

**Status: ✅ FIXED (2026-09-11, na-double check)**
- Tinanggal ang 3 linya: `PAYMONGO_LIVE_SECRET_KEY`, at ang mga naka-comment
  out na live `PAYMONGO_SECRET_KEY` at live `PAYMONGO_WEBHOOK_SECRET`.
- **Double-check:** 0 na `sk_live_` at 0 na live webhook secret sa `.env`;
  `sk_test_` ang active na `PAYMONGO_SECRET_KEY`; naka-ignore pa rin ang
  `.env` (`git check-ignore .env`).
- **Na-regenerate ang live key** sa PayMongo dashboard (2026-09-11, ginawa ng
  user; hindi ito makikita mula sa labas). Patay na ang lumang key na lumabas
  sa mga screenshot, at ang bago ay nasa Vercel (Production) lang, wala sa
  anumang local file.

Hindi ito binabasa ng app (ang `PAYMONGO_SECRET_KEY` lang ang ginagamit), pero
ito ay **live production credential** na kayang mag-charge ng totoong pera,
nakatambay sa isang local file para lang sa mga diagnostic script natin.

Naka-gitignore naman ang `.env` (`.gitignore:34`, `.env*`), kaya hindi ito
maco-commit. Pero:
- Naka-plaintext pa rin sa disk
- Nakita natin ito sa mga screenshot habang nagde-develop
- Walang dahilan para manatili ito dito

**Fix:** Tanggalin ang linyang ito. Kapag kailangan ulit para sa live testing,
kunin muna sa dashboard. Sa production (Vercel), env vars lang ang gamitin.
Kung may pag-aalinlangan na na-expose na ito, i-regenerate ang key sa
dashboard (Developers → API Keys → Regenerate).

---

### 20. Hindi pa kumpleto ang PayMongo setup sa production
**Saan:** Vercel env vars (Production) at PayMongo dashboard

Dati, walang laman ang `PAYMENT_PROVIDER` sa production, kaya `mock` ang
default. Sa mock gateway, **kahit sino ay puwedeng pumindot ng "Pay now" at
maging PAID ang GCash order nang walang bayad**, dahil ang pay page mismo ang
gumagawa ng valid na signature para sa browser. Naisara na ito, at inilagay na
rin ang totoong PayMongo setup:
- `PAYMONGO_SECRET_KEY`: ang bagong live key (na-regenerate, tingnan ang #3)
- `PAYMONGO_WEBHOOK_SECRET`: mula sa isang **live** webhook na nakaturo sa
  `https://kanto-burger-co.vercel.app/api/payments/webhooks/paymongo`

**Status: ⚠️ Kumpleto ang setup, hinihintay ang ₱1 end-to-end test (2026-09-11)**
- ✅ `PAYMENT_PROVIDER="paymongo"` na sa production. **Double-check:** ang live
  `/api/payments/callback` ay tumanggi (500 mula sa PayMongo parser) sa
  mock-style payload na may valid na bagong signature, na mangyayari lang
  kapag hindi mock ang provider.
- ✅ `NEXTAUTH_URL`: ang live `/api/auth/providers` ay nagpapakita ng
  `https://kanto-burger-co.vercel.app/...` na callback URLs, at naka-enable
  ang Google sign-in.
- ✅ `PAYMONGO_WEBHOOK_SECRET`: **Double-check:** pagkatapos ng redeploy
  (05:49:41 UTC), ang live webhook route ay sumasagot na ng 401 "Invalid
  signature" imbes na 500, kaya may secret na sa production.
- ✅ Ginawa ng user sa PayMongo dashboard ang bagong live webhook papunta sa
  production URL (events: `source.chargeable`, `payment.paid`,
  `payment.failed`), at na-disable ang lumang webhook na nakaturo sa ngrok.
  Walang delete sa PayMongo; disable ang katumbas, dahil wala nang ipinapadala
  ang naka-disable na webhook.
- ✅ `PAYMONGO_SECRET_KEY` (bagong live key): **Double-check:** ang ₱1 test
  order sa live site (`KBC-260911-142545-KEFZ`) ay nakakuha ng live PayMongo
  intent at ng totoong QR (hindi sandbox simulator), kaya gumagana ang key sa
  production.
- ⏳ **Natitirang patunay:** ang 401 ay nagsasabing *may* webhook secret, hindi
  na *tugma* ito sa webhook. Kailangan ng ₱1 na totoong bayad sa live site:
  dapat maging PAID ang order, at may successful na delivery sa Event
  Deliveries ng bagong webhook. Noong unang subok (2026-09-11, mga 10:25 PM),
  "QRPH will be back soon" ang sinabi ng GCash: down ang QR Ph service sa
  panig ng GCash, hindi ng app.

**Fix:** Tapos na ang setup. Ang natitira ay ang ₱1 end-to-end test.

---

## P1: High

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
page**: `qrImageUrl` lang ang ipinapasa sa component.

Resulta: pagkatapos mag-expire, patuloy pa ring nakikita ng customer ang patay
na QR at ang "Naghihintay ng bayad..." habang buhay. Kung may mag-scan, mabibigo
sila nang walang paliwanag.

Hindi rin naka-subscribe ang webhook natin sa `qrph.expired` event, kaya
walang nakakaalam ang server na patay na ang session.

**Status: ⚠️ Bahagya (2026-09-11, hindi pa naka-commit)**
- ✅ Kinukuha na ng `getQrPhStatus()` ang `expires_at` ng QR, at may countdown
  ang QR page ("Waiting for payment · expires in m:ss").
- ✅ Kapag expired (PayMongo `awaiting_payment_method`, o lampas na sa
  `expires_at` at 10 segundong palugit), papalitan ang patay na QR ng "This QR
  code has expired" at "Generate a new QR" button. Ginagamit nito ang parehong
  `resumePayment` ng tracker, na gagawa ng bagong QR dahil patay na ang luma.
- ✅ Bagong "Confirming your payment" state kapag nagbayad na pero hindi pa
  dumarating ang webhook, para hindi ito maipakitang expired.
- Nasa pure function ang pagpapasya ng state (`src/features/payments/qrph-view.ts`).
- **Double-check:** 10 unit tests sa `qrph-view.test.ts` para sa lahat ng
  state, sa palugit, at sa countdown; `tsc` 0 errors; build pasado.
- ⏳ Hindi pa nakikita sa browser ang countdown at expired screens: sa live
  mode lang sila lumalabas (sa sandbox, dumidiretso ang page sa PayMongo
  simulator), kaya kailangan munang ma-deploy.
- ❌ Hindi pa naka-subscribe sa `qrph.expired` webhook event. Ang epekto nito
  sa stock ay nasa #4.

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

### 7. Nilulunok ang error kapag nabigo ang `chargeSource`, kaya mawawala ang bayad
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
PayMongo na successful na delivery at **hindi na ito uulitin**, kaya ang isang
source na binayaran na ng customer ay hindi na kailanman magiging Payment.
Nagbayad ang customer, hindi na-settle ang order.

Hindi pa ito aktibo sa kasalukuyang QR Ph flow (walang `source.chargeable`
events), pero magiging live agad ito kapag na-enable na ang direct GCash channel.

**Fix:** Magbalik ng 5xx kapag nabigo ang charge para mag-retry si PayMongo.

---

### 21. Walang paraan pabalik mula sa QR page
**File:** `src/features/payments/qrph-gateway.tsx`

Kapag napunta ang customer sa QR page at hindi makabayad (hal. down ang QR Ph
ng GCash, gaya noong 2026-09-11 ng gabi), wala siyang paraan para umalis o
bumalik sa order niya. Walang link sa page, at ang "Pay via GCash" retry button
(#1) ay nasa order tracker, na hindi niya mapupuntahan kung hindi niya na-save
ang link (kailangan ng tracking token).

**Status: ✅ FIXED (2026-09-11, hindi pa naka-commit)**
- May "Pay later / view my order" link na sa lahat ng state ng QR page
  (active, confirming, expired, unavailable), papunta sa tracker na may token.
- **Double-check (browser):** mula sa pay page ng `KBC-260911-142545-KEFZ`,
  dinala ng link sa tracker, at lumabas ang "Payment still pending" banner at
  ang "Pay via GCash" button.

---

## P2: Medium

### 8. Nasisira ang pay page kapag mismatch ang PayMongo mode
**File:** `src/app/(customer)/checkout/pay/[intentId]/page.tsx:29`

Ginagamit ng `getQrPhStatus()` ang **kasalukuyang** `PAYMONGO_SECRET_KEY`. Ang
mga payment intent ay nakatali sa mode kung saan sila ginawa (test o live).

Kaya kapag nagpalit ng keys (gaya ng ginawa natin: live test tapos balik sa
sandbox), ang mga order na ginawa sa kabilang mode ay **hindi na mabubuksan**
ang pay page. Mag-e-error ito (404 mula PayMongo) papunta sa error boundary,
nang walang malinaw na paliwanag.

**Status: ✅ FIXED (2026-09-11, hindi pa naka-commit)**
- Nasa try/catch na ang `getQrPhStatus()` sa pay page. Kapag pumalya
  (PayMongo outage, o intent mula sa ibang test/live mode), "We couldn't load
  the QR code" ang lalabas, may "Try again" at "Pay later / view my order",
  imbes na error boundary. Nasa labas pa rin ng try ang `redirect()` papunta
  sa sandbox simulator, dahil throw ang paraan ng paggana nito.
- **Double-check (browser):** binuksan ang pay page ng live na ₱1 order
  (`KBC-260911-142545-KEFZ`) gamit ang local na test key (404 sa PayMongo):
  lumabas ang "unavailable" state, walang error boundary, at gumana ang link
  papunta sa tracker. Ang tanging console issue ay ang sinasadyang
  `Failed to load PayMongo QR status` log.
- Hindi rin naaapektuhan ang **tracker button** (#1), dahil tinatrato ng
  `resumeSession()` ang 404 bilang "patay na session" at gumagawa ng bago.

**Fix:** I-catch ang `PaymongoApiError` sa page at magpakita ng malinaw na
mensahe ("Hindi na available ang payment session na ito") sa halip na
mag-crash.

---

### 9. Walang katapusan ang polling sa QR page
**File:** `src/features/payments/qrph-gateway.tsx:31-58`

Ang polling interval (bawat 4 segundo) ay tumatakbo hangga't nakabukas ang page.
Kapag iniwan ng customer ang tab nang ilang oras, patuloy ang pag-hit sa
`/api/payments/session/[intentId]`: **900 DB query kada oras, kada tab**.

**Status: ✅ FIXED (2026-09-11, hindi pa naka-commit)**
- Tumatakbo lang ang polling habang puwede pang bayaran ang QR (active) o
  habang kinukumpirma ang bayad (confirming). Titigil ito kapag expired o
  unavailable, kaya natatapos ito kasabay ng buhay ng QR (mga 30 minuto).
- **Double-check (browser):** 12 segundo sa "unavailable" state: 0 request sa
  `/api/payments/session` (sa lumang code, 3 sana, isa kada 4 segundo).
  Unit-tested ang pagpapasya ng state sa `qrph-view.test.ts`.

**Fix:** Maglagay ng max attempts (hal. huminto pagkatapos ng QR expiry window),
o dagdagan ang interval sa paglipas ng oras (backoff), o huminto kapag
`document.hidden`.

---

### 10. Walang rate limit at walang token check ang status endpoint
**File:** `src/app/api/payments/session/[intentId]/route.ts`

Bukas ang endpoint sa kahit sino na may hawak ng intent id: walang tracking
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
- `parseCallback()`: nagta-throw ng `ZodError` kapag kulang ang payload ng
  `payment_intent_id` **at** `source.id`
- `settlePaymentWithDeps()` → `assertCanSettleToPaid()`: nagta-throw ng
  `PaymentSettlementError` kapag ang order ay CASH/COD o final na ang status

Parehong magiging unhandled 500, na ituturing ni PayMongo bilang retryable
failure, kaya paulit-ulit nitong ipapadala ang parehong hindi mapoprosesong
event.

**Fix:** I-wrap sa try/catch; magbalik ng 200 na may error body para sa mga
payload na talagang hindi natin kayang iproseso (para huminto ang retry), at
5xx lang para sa mga totoong transient failure.

---

### 12. Hindi naka-configure ang Pusher at Upstash Redis
**File:** `.env` (blangko ang Pusher vars, walang Upstash vars)

- **Blangko ang Pusher**: tahimik na naka-skip ang lahat ng realtime event
  (`"Pusher not configured, skipping event trigger"` sa logs). Hindi
  nag-a-auto-update ang admin dashboard at customer tracker; kailangang
  mag-refresh manually.
- **Walang Upstash**: in-memory na rate limiter
  (`src/lib/rate-limiter.ts:114-129`). Sa Vercel serverless, bawat instance ay
  may sariling counter, kaya epektibong **walang bisa** ang rate limiting sa
  production.

Parehong may tamang fallback at warning. Hindi ito bug, kundi hindi pa tapos
na configuration. Pero P0 ang Upstash kapag deploy na sa production.

Update (2026-09-11): may Pusher vars na sa local `.env`. Sa production, wala
pa: sa live JavaScript, nandoon ang Pusher library pero wala ang setup code
(`/api/presence/auth`), na tinatanggal lang ng build kapag walang
`NEXT_PUBLIC_PUSHER_KEY`. Kaya lahat ay OFFLINE sa Staff page ng live site at
walang realtime updates doon. Nasa `.env.vercel-pusher` ang 6 na variable na
ilalagay sa Vercel.

**Fix:** I-set ang mga env vars bago mag-production deploy.

---

### 13. Ang `/api/payments/callback` (mock) ay live sa production
**File:** `src/app/api/payments/callback/route.ts`

Naka-register ang mock settlement route kahit `PAYMENT_PROVIDER="paymongo"`.
Kasalukuyan itong nagfe-fail-closed (mag-t-throw ang `parseCallback` ng
PayMongo sa mock payload shape), kaya hindi ito exploitable ngayon. Pero ito
ay attack surface na walang silbi sa production, at ang seguridad nito ay
nakasalalay lang sa detalye ng ibang provider.

Nakumpirma ito sa live site noong 2026-09-11: ang valid na signature ay
umaabot sa PayMongo parser at nagba-500 (tingnan ang #20).

**Fix:** I-guard ang route: agad mag-404 kapag hindi `mock` ang aktibong provider.

---

## P3: Low / polish

### 14. Hindi pa naka-commit ang lahat ng payment-gateway work
Walo (8) na bagong file at apat (4) na binagong file ang nasa working tree
lang. Isang aksidenteng `git checkout` o `git reset --hard` ay tatanggalin ang
lahat ng ginawa natin.

**Status: ✅ FIXED (2026-09-11, na-double check)**
- `3f12430` feat: 21 files, payment code at tests.
- `beac845` docs: itong `ISSUES.md`.
- `ec9c47f` chore: sinama na sa repo ang `.env.example` (dati ay naka-ignore
  dahil tinatamaan ng `.env*` pattern) at itinama ang komento nito tungkol sa
  pag-register ng test-mode webhook.
- **Double-check:** `git status` sa lahat ng payment paths ay walang natitira;
  `git show --stat 3f12430` ay payment files lang (walang admin o online-staff
  file ng ibang ginagawa); naka-ignore pa rin ang `.env`.
- Naka-push na sa GitHub at na-deploy sa Vercel (`cb6437a`, deploy success).
- Paalala: may em dash ang commit message ng `3f12430` (naisulat bago ko
  nalaman ang no-em-dash rule). Nasa GitHub na ito, kaya kailangan ng history
  rewrite para mapalitan.

### 15. Naka-log ang phone number ng customer (PII)
**File:** `src/features/checkout/actions.ts:59`

Pumapasok ang raw phone number sa production logs dahil sa
`logger.warn("Rate limit exceeded for checkout", { customerPhone })`. Mas
mabuti ang hashed o partially masked (`09XX***5853`).

### 16. Madaling lusutan ang checkout rate limiter
**File:** `src/features/checkout/actions.ts:57`

Naka-key ito sa `customerPhone`, na galing mismo sa user. Sapat na ang magbago
ng isang digit para makaiwas. Mas matibay kung IP-based, o kombinasyon ng
pareho.

### 17. Hindi constant-time ang paghahambing ng tracking token
**File:** `src/features/orders/queries.ts:18`

Teoretikal na timing attack ang `order.trackingToken !== trackingToken`.
Praktikal na hindi mapapakinabangan sa isang 32-char random hex sa ibabaw ng
network latency, pero may `crypto.timingSafeEqual` na tayong ginagamit sa
`signing.ts` kung gusto nating pare-pareho ang pattern.

### 18. Dead code habang naka-gate pa ang GCash channel
**File:** `src/features/payments/providers/paymongo.ts` (`getChargeableSource`, `chargeSource`)

Hindi kailanman tumatakbo ang `getChargeableSource()` at `chargeSource()` sa
kasalukuyang QR Ph flow. Sinasadya ito (handa na sila kapag na-verify na ang
business at na-enable ang direct GCash) at may komento na nagpapaliwanag. Pero
hindi pa nasusubukan ang code path na iyon.

### 19. Luma na ang komento tungkol sa `PAYMENT_PROVIDER` sa `.env`
**File:** `.env` (komento sa itaas ng `PAYMONGO_PUBLIC_KEY`)

Sabi ng komento na panatilihing `"mock"` hanggang masubukan ang provider, pero
`"paymongo"` na ang naka-set at nasubukan na natin nang buo. Maling gabay na
para sa susunod na babasa.

---

## Hindi issue: maayos na bahagi

Para malinaw kung ano ang hindi kailangang galawin:

- **Auth / RBAC**: tama ang pagkakabahagi. Ang `proxy.ts` ang humahadlang sa
  mga hindi naka-sign-in; ang mga page ay gumagamit ng `requireManagerPage()`;
  ang mga server action ay `requireAdminRoleSession()`. Naka-gate din ang
  Google sign-in sa `User` table.
- **Security headers**: kumpletong CSP, `frame-ancestors: none`, nosniff,
  Permissions-Policy (`next.config.ts`).
- **Server-side trust**: muling binabasa ang presyo at availability mula sa DB
  sa loob ng checkout transaction; hindi pinagkakatiwalaan ang client.
- **Stock concurrency**: conditional na `updateMany` na may `gte` guard, ang
  tamang paraan para maiwasan ang oversell sa magkasabay na order.
- **Idempotent settlement**: naka-key sa unique na `paymentIntentId`, may
  state-machine guard. Ligtas ang paulit-ulit na webhook.
- **Webhook signature verification**: HMAC sa raw body bago mag-parse,
  `timingSafeEqual`, tumatanggap ng test at live digest.
- **Rate limiter**: maayos na Redis/memory backend split, fail-open na may
  logging.
- **Error boundaries**: kumpleto ang `error.tsx` / `not-found.tsx` /
  `loading.tsx` sa lahat ng route group.
- **Walang `any`, walang stray `console.log`, walang TODO/FIXME** sa buong
  `src/`.

---

## Iminumungkahing pagkakasunod-sunod

1. ~~I-commit ang kasalukuyang payment-gateway work (#14)~~ ✅
2. ~~Ayusin ang retry-payment path (#1)~~ ✅
3. ~~I-rotate ang `PAYMENT_SIGNING_SECRET` at tanggalin ang live key sa `.env` (#2, #3)~~ ✅
4. Tapusin ang PayMongo sa production (#20): setup ✅, ₱1 end-to-end test na lang
5. QR page: daan pabalik, expiry UI at polling (#21, #5, #8, #9) ✅, kailangan pang makita sa live; stock cleanup (#4) at `qrph.expired` na lang
6. Webhook hardening: rate limit, retry semantics (#6, #7, #11)
7. Bago lumaki ang traffic: Upstash at Pusher env vars (#12), i-guard ang mock route (#13)
