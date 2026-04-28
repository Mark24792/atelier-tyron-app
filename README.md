# Atelier — Virtual Try-On Shopify App

A luxury AR virtual try-on app built with Remix, Shopify App Bridge, Prisma and MediaPipe.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Remix + Vite |
| Shopify | shopify-app-remix, App Bridge, Polaris |
| Database | SQLite via Prisma (swap to Postgres for production) |
| AR Engine | MediaPipe FaceMesh |
| Storefront | Shopify Theme App Extension (Liquid) |

---

## Project Structure

```
atelier-tryon-app/
├── app/
│   ├── routes/
│   │   ├── app._index.tsx      ← Dashboard (KPIs, top products)
│   │   ├── app.products.tsx    ← Enable/disable AR per product
│   │   ├── app.settings.tsx    ← Widget customisation + plan
│   │   └── api.tryon.tsx       ← Public API for storefront
│   ├── lib/
│   │   ├── db.server.ts        ← Prisma client singleton
│   │   └── analytics.server.ts ← Try-on + cart tracking
│   ├── shopify.server.ts       ← Shopify auth + session setup
│   └── root.tsx                ← App root with AppProvider
├── extensions/
│   └── tryon-block/
│       └── blocks/tryon.liquid ← Theme extension (injected on product pages)
├── prisma/
│   └── schema.prisma           ← DB models: Session, TryOnProduct, Analytics
├── .env.example
├── package.json
└── shopify.app.toml
```

---

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Fill in your Shopify API keys
```

### 3. Set up database
```bash
npx prisma migrate dev --name init
```

### 4. Start development server
```bash
npm run dev
# Opens Shopify CLI tunnel + Remix dev server
```

### 5. Install in test store
The Shopify CLI will print an install URL — open it in your development store.

---

## How It Works

### Admin Side (Embedded App)
1. Merchant installs the app
2. Goes to **Products** → enables AR for specific products + sets category
3. Goes to **Settings** → customises button colour and text
4. **Dashboard** shows try-on counts, conversion rate, return reduction

### Storefront Side (Theme Extension)
1. The `tryon.liquid` block is auto-injected onto product pages
2. On page load it calls `GET /api/tryon?shop=...&productId=...`
3. If AR is enabled → a "Try On" button appears
4. Customer clicks → camera modal opens → AR overlay renders via MediaPipe
5. Customer clicks "Add to Cart" → tracked as a conversion

### Data Flow
```
Customer visits product page
    → tryon.liquid calls /api/tryon (GET)
    → Returns: { enabled, category, arEmoji, buttonColor, buttonText }
    → Button renders

Customer clicks "Try On"
    → POST /api/tryon { event: "tryon_start" }  ← analytics
    → Camera opens, MediaPipe loads, emoji overlaid on face

Customer clicks "Add to Cart"
    → POST /api/tryon { event: "add_to_cart" }  ← analytics
    → Shopify /cart/add.js called
```

---

## Deployment

### Recommended: Railway / Render / Fly.io
```bash
# Build
npm run build

# Set environment variables in your hosting dashboard
# Then:
npm run start
```

### Database (production)
Swap SQLite for PostgreSQL in `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

---

## Roadmap

- [ ] 3D GLTF product models via Three.js (replace emoji)
- [ ] Full MediaPipe body pose for clothing try-on
- [ ] Stripe billing integration for plan upgrades
- [ ] Multi-language widget (i18n)
- [ ] Shopify Markets support (currency / locale)
