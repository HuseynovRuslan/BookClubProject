# İcra planı: okprint.az istinadlı sayt

> **Tarix:** 2026-10-09
> **Status:** Plan. **Implementasiya başlamayıb.**
> **Əsas sənədlər:** [REFERENCE_ANALYSIS.md](./REFERENCE_ANALYSIS.md) · [PAGE_INVENTORY.md](./PAGE_INVENTORY.md) · [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)

## Prinsiplər

1. **Fidelity birinci gəlir.** Struktur, sıralama, mikro-kopiya, ölçülər və davranış istinaddan götürülür. Redizayn, sadələşdirmə və "yaxşılaşdırma" yoxdur.
2. **Uydurulmuş dəyər olmur.** Vizual dəyərlər yalnız [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)-dəki ölçülmüş tokenlərdən gəlir. `TBD` qalan bir şey koda düşmür.
3. **Varlığı ❓ olan elementlər** (slayder, axtarış, floating WhatsApp, pagination, breadcrumb və s.) yalnız istinadda təsdiqlənəndən sonra qurulur.
4. **Aktivlər 🔒:** loqo, foto, mətn və şablon resursları icazə gələnə qədər placeholder ilə əvəz olunur. Placeholder-in ölçüsü istinadla eynidir.
5. **Kataloq datası** sahibkar təsdiqləyənə qədər `index-unverified` və ya `live-captured` statusunda qalır.
6. **İcazə verilən istisnalar:** a11y, SEO və performans düzəlişləri vizuala təsir etmədən əlavə oluna bilər (semantik HTML, ARIA, `alt`, JSON-LD, lazy-loading).

---

## Gate 0: bloklayıcılar və qərarlar

| ID | Qərar və ya bloklayıcı | Tövsiyə | Kim |
|---|---|---|---|
| **G0.1** | Canlı sayta giriş | Mühitin *Allowed domains* siyahısına `okprint.az`, `www.okprint.az`, `okeyprint.az`, `www.okeyprint.az` və aşkar olunan asset hostları əlavə olunur. Alternativ: skripti lokal işə salmaq ([REFERENCE_ANALYSIS §1.1](./REFERENCE_ANALYSIS.md#11-blokdan-çıxmaq-üçün-variantlar)) | İstifadəçi |
| **G0.2** | İstinad okprint.az-dırmı, yoxsa okeyprint.az? | `capture-reference.mjs` işə salınır və `summary.json → finalUrl` yoxlanılır. Yönləndirmə varsa, istifadəçi təsdiqləyir | İstifadəçi |
| **G0.3** | Kodun yeri | Bu repo BookClub tətbiqidir (React 19, Vite 7, Tailwind 4, .NET 8). Tövsiyə: **ayrı, müstəqil qovluq `okprint-web/`**. Mövcud `Frontend/`, `Backend/`, `docker-compose.yml` və `.github/workflows/deploy.yml`-ə toxunulmur. Qeyd: `deploy.yml` hər `main` push-unda EC2-də `docker-compose up --build` işlədir, amma yeni qovluq compose-a əlavə olunmayınca ona təsir etmir. Uzunmüddətli həll: ayrıca repo | İstifadəçi |
| **G0.4** | Texnologiya | Tövsiyə: **Astro (cari stabil versiya) + Tailwind CSS 4**. Səbəblər: istinad server-render edilən WP saytıdır; ~80 SEO landing səhifəsi var; interaktivlik azdır (menyu, tab, slayder). Astro hər səhifəni statik HTML kimi çıxarır, interaktiv hissələr kiçik JS adaları olur. Tailwind 4 artıq bu repoda istifadə olunur. Alternativ: mövcud Vite + React stack-i ilə prerender (SPA-nın SEO riski var) | İstifadəçi |
| **G0.5** | Aktiv icazələri | Sahibkardan loqo (SVG), məhsul fotoları və mətnlərdən istifadə icazəsi alınır. "Prinoz" şablonunun lisenziyası yoxlanılır | Sahibkar |
| **G0.6** | Kataloq ziddiyyətləri | [REFERENCE_ANALYSIS §12](./REFERENCE_ANALYSIS.md#12-kontent-keyfiyyəti-və-ziddiyyətlər-klon-üçün-vacibdir)-dəki siyahı sahibkara göndərilir | Sahibkar |
| **G0.7** | URL pariteti | Sayt əvəzlənəcəksə, bütün slug-lar trailing slash ilə 1:1 saxlanır (percent-encoded olanlar daxil). Dublikat qruplar üçün canonical seçilir | İstifadəçi |
| **G0.8** | Kontent mənbəyi | İlk mərhələdə repo-da JSON və Markdown (Astro content collections) istifadə olunur. CMS ehtiyacı sonra qiymətləndirilir | İstifadəçi |

**Gate 0-dan çıxış meyarı:**
- Bütün şablonlar (T1–T8) üçün 3 viewport-da ekran görüntüsü var.
- [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)-də `TBD` qalmayıb (və ya əsaslandırılmış `N/A` yazılıb).
- İnventar `sitemap.xml` ilə tamamlanıb.
- G0.2–G0.4 qərarları verilib.

---

## A. Paylaşılan (reusable) komponentlər

**Status sütunu:** ✅ istinadda varlığı məlumdur · ❓ varlığı yoxlanmalıdır (təsdiqlənməzsə qurulmur).

### A1. Layout

| Komponent | Məsuliyyət | Data | Status |
|---|---|---|---|
| `BaseLayout` | `<html lang>`, `SeoHead`, header, footer, slotlar | `site.json` | ✅ |
| `SeoHead` | title, meta description, canonical, OG, robots, hreflang | Səhifə front-matter-i | ✅ |
| `JsonLd` | `LocalBusiness`, `Product`/`Offer`, `BreadcrumbList`, `Article` | Səhifə datası | ✅ (vizuala təsir etmir) |
| `TopBar` | Telefon, e-poçt, sosial linklər | `site.json` | ❓ |
| `SiteHeader` | Loqo, `MainNav`, CTA, sticky davranış | `nav.json` | ✅ (sticky ❓) |
| `Logo` | SVG və ya şəkil; placeholder rejimi | 🔒 | ✅ |
| `MainNav` | Üst səviyyə və alt menyular | `nav.json` | ✅ |
| `NavDropdown` / `MegaMenu` | Alt menyu paneli | `nav.json` | ❓ (tip məlum deyil) |
| `MobileNav` | Hamburger, panel, accordion | `nav.json` | ❓ (tip məlum deyil) |
| `SearchBox` | Axtarış formu və ya overlay | — | ❓ |
| `PageTitleBanner` | Səhifə başlığı zolağı | Səhifə | ❓ |
| `Breadcrumbs` | Yol göstəricisi | Route | ❓ |
| `SiteFooter` | Sütunlar, əlaqə, sosial, copyright | `footer.json`, `site.json` | ✅ |
| `Container` / `Section` | Ölçülmüş container eni və bölmə padding-ləri | Tokenlər | ✅ |

### A2. Kataloq

| Komponent | Məsuliyyət | Data | Status |
|---|---|---|---|
| `CategoryCard` | Ana səhifədəki kateqoriya kartı | `Category` | ✅ |
| `ProductCard` | `{Ad} – {qısa təsvir}`, qiymət, şəkil, link | `Product` | ✅ |
| `ProductGrid` | Ölçülmüş sütun və gap dəyərləri ilə grid | `Product[]` | ✅ |
| `Pagination` | Səhifələmə | Route | ❓ |
| `PriceDisplay` | `Price.display` dəyərini olduğu kimi göstərir | `Price` | ✅ |
| `PriceHeadline` | "100 ədəd 25 AZN, 1 günə hazır!" | `Product.headline` | ✅ |
| `SpecList` | `Etiket · Dəyər` sətirləri | `Product.specs` | ✅ |
| `PriceTierTable` | Tək sütunlu cədvəl və model × tiraj matrisi; əsl `<table>` | `Product.priceTiers` | ✅ |
| `ProductGallery` | Şəkil və thumbnail-lar, lightbox | `Product.images` | ❓ |
| `ProductTabs` | "Məhsul Haqqında" · "Sifariş Et" | `Product` | ✅ |
| `RelatedProducts` | "Tövsiyə olunan məhsullar" | `Product.related` | ✅ |
| `CategoryIntro` | Kateqoriyanın giriş mətni | `Category.intro` | ✅ |
| `Prose` | Uzun SEO və məqalə mətni üçün stil | Markdown | ✅ |

### A3. Konversiya

| Komponent | Məsuliyyət | Data | Status |
|---|---|---|---|
| `WhatsAppCta` | "WhatsApp Əlaqə" linki; URL `buildWhatsAppUrl()` ilə qurulur | `site.whatsapp`, `Product` | ✅ (format ❓) |
| `OrderCta` | "Sifariş Üçün Elə İndi Bizə Yazın!" bloku | `site.json` | ✅ |
| `WhatsAppFloat` | Üzən düymə | `site.whatsapp` | ❓ |
| `PhoneLink` | `tel:` linki | `site.phones` | ✅ |
| `ContactBlock` | 2 telefon, e-poçt, ünvan, veb ünvanlar | `site.json` | ✅ |
| `RequiredDocsNotice` | Qəbz məhsulları üçün tələb olunan sənədlər | `Product.requiredDocuments` | ✅ (vizual forması ❓) |

### A4. Kontent

| Komponent | Məsuliyyət | Status |
|---|---|---|
| `HeroSlider` | Ana səhifə slayderi | ❓ |
| `AboutBlock` | "Haqqımızda" (2015, reklam xidmətləri) | ✅ (yeri ❓) |
| `ArticleCard` | Bloq siyahısında kart | ❓ (bloq siyahısı ❓) |
| `ArticleLayout` | Məqalə səhifəsi | ✅ |
| `TagList` | Teqlər | ❓ |
| `MapEmbed` | Əlaqə səhifəsində xəritə | ❓ |
| `ContactForm` | Əlaqə forması | ❓ |

### A5. Utilitlər

| Utilit | Məsuliyyət |
|---|---|
| `ResponsiveImage` | `width`/`height` atributları, lazy-loading, `placeholder` rejimi (🔒 aktivlər üçün) |
| `Icon` | Ölçülmüş ikon dəsti (lisenziyası yoxlanmış) |
| `buildWhatsAppUrl(product?)` | İstinaddakı format və mesaj şablonu ilə dəqiq eyni URL qurur |
| `formatTitle(page)` | Title formatlarını istinadda olduğu kimi qurur |

---

## B. Səhifələr

| Səhifə | Route | Şablon | Əsas komponentlər | Data | Status |
|---|---|---|---|---|---|
| Ana səhifə | `/` | T1 | `HeroSlider`❓, `CategoryCard`, `ProductGrid`, `AboutBlock`, `ContactBlock` | `site`, `categories`, `products` | ✅ (bölmə sırası ❓) |
| Kateqoriya | `/category/[slug]/` | T2 | `PageTitleBanner`❓, `CategoryIntro`, `ProductGrid`, `Pagination`❓ | `categories`, `products` | ✅ |
| Kateqoriya səhifələməsi | `/category/[slug]/page/[n]/` | T2 | — | — | ❓ |
| Məhsul | `/[slug]/` | T3 | `ProductGallery`❓, `PriceHeadline`, `SpecList`, `PriceTierTable`, `ProductTabs`, `OrderCta`, `WhatsAppCta`, `ContactBlock`, `RelatedProducts`, `Prose` | `products` | ✅ |
| Məqalə | `/[slug]/` | T4 | `ArticleLayout`, `Prose` | `articles` | ✅ |
| Bloq siyahısı | ❓ | T4-list | `ArticleCard` | `articles` | ❓ |
| Tag arxivi | `/tag/[slug]/` | T5 | `ProductGrid` və ya `ArticleCard` | `tags` | ✅ (indeksləmə G0.7-də qərarlaşır) |
| Əlaqə | `/bizimle-elaqe/` | T6 | `ContactBlock`, `MapEmbed`❓, `ContactForm`❓ | `site` | ✅ |
| Haqqımızda | ❓ | T6 | `AboutBlock` | `site` | ❓ |
| Dizayn xidmətləri | `/dizayn-xidmetleri/` | T6 | `Prose`, `OrderCta` | Səhifə | ✅ |
| Promo məhsullar | `/promo-mehsullar/` | T6 | `Prose`, `ProductGrid`❓ | Səhifə | ✅ |
| Kserekopiya | `/kserekopiya-xidmeti/` | T6 | `Prose` | Səhifə | ✅ |
| EN landing | `/print-services-in-baku-azerbaijan/` | T6 (`lang="en"`) | `Prose`, `ContactBlock` | Səhifə | ✅ |
| OkeyPrint elanı | `/okeyprint-az/` | T4 | `ArticleLayout` | `articles` | ✅ |
| Axtarış | `/?s=` | T7 | `SearchBox`, nəticə siyahısı | Axtarış indeksi | ❓ |
| 404 | `*` | T8 | — | — | ❓ (dizaynı ölçülməlidir) |

**Routing qeydi:** məhsullar (T3) və məqalələr (T4) eyni kök slug məkanını paylaşır. Build zamanı vahid `slug → {type, id}` reyestri qurulur. Toqquşma olarsa, build xəta verir. Percent-encoded slug-lar (`/m%C9%99xm%C9%99ri-vizitkart/`) və trailing slash istinaddakı kimi saxlanır.

---

## C. Kataloq datası

### C1. Fayl strukturu (təklif)

```
okprint-web/src/content/
  categories/<slug>.json
  products/<slug>.json        # uzun mətn body sahəsində və ya yanındakı .md faylında
  articles/<slug>.md
  pages/<slug>.md             # statik səhifələr
okprint-web/src/data/
  site.json                   # brend, telefonlar, WhatsApp, e-poçt, ünvanlar, sosial
  nav.json  footer.json  redirects.json
  conflicts.json              # sahibkara gedən ziddiyyətlər (G0.6)
```

### C2. Sxem (validasiya Zod ilə)

```ts
type VerificationStatus = 'index-unverified' | 'live-captured' | 'owner-verified';

interface Price {
  display: string;            // istinaddakı string olduğu kimi: "₼ 85", "13,50 AZN"
  amount: number | null;      // normallaşdırılmış rəqəm (schema.org və sıralama üçün)
  currency: 'AZN';
  unit: 'total' | 'per_item' | 'per_m2';
}

interface Product {
  slug: string;               // istinadla 1:1
  title: string;              // H1
  seoTitle: string;           // <title> olduğu kimi
  metaDescription?: string;
  cardTitle?: string;         // "{Ad} – {qısa təsvir}"
  categories: string[];
  tags: string[];
  headline?: string;          // "100 ədəd 25 AZN, 1 günə hazır!"
  priceFrom?: Price;          // kartda göstərilən qiymət
  priceTiers?: { qty: number; variant?: string; price: Price }[];  // variant: plaket modeli
  specs: { label: string; value: string }[];                       // "Minimal tiraj" · "100 ədəd"
  addOns?: { label: string; price: Price }[];                      // "Asılqan kəsim"
  requiredDocuments?: string[];
  images: { src: string; alt: string; width: number; height: number;
            permission: 'granted' | 'pending' | 'placeholder' }[];
  related: string[];
  body?: string;
  whatsappMessage?: string | null;  // yalnız istinadda varsa
  source: { url: string; capturedAt: string; status: VerificationStatus; notes?: string };
}

interface Category {
  slug: string; name: string; seoTitle: string; intro?: string;
  order: number; parent?: string; productOrder: string[];
  source: Product['source'];
}
```

### C3. Nümunə (indeks datası, təsdiqlənməyib)

```json
{
  "slug": "mat-laminasiyali-vizitkart",
  "title": "Mat Laminasiyalı Vizitkart",
  "seoTitle": "Okprint - Mat Laminasiyalı Vizitkart",
  "categories": ["vizitka-sifarisi"],
  "headline": "100 ədəd 25 AZN, 1 günə hazır!",
  "specs": [
    { "label": "Minimal tiraj", "value": "100 ədəd" },
    { "label": "Təhvil müddəti", "value": "1 gün" },
    { "label": "Dizayn", "value": "5 ₼" }
  ],
  "priceTiers": [{ "qty": 100, "price": { "display": "25 AZN", "amount": 25, "currency": "AZN", "unit": "total" } }],
  "images": [],
  "related": [],
  "source": { "url": "https://okprint.az/mat-laminasiyali-vizitkart/", "capturedAt": "2026-10-09", "status": "index-unverified" }
}
```

### C4. Data axını

1. **`index-unverified`:** [PAGE_INVENTORY §H](./PAGE_INVENTORY.md#h-nümunəvi-məhsul-datası-)-dəki dəyərlər (indi mövcuddur).
2. **`live-captured`:** `reference-capture/*.html`-dən skriptlə çıxarılır. Spesifikasiya sətirləri, cədvəllər, title, meta, şəkil URL-ləri və əlaqəli məhsullar götürülür. Fərqlər (diff) əl ilə nəzərdən keçirilir.
3. **`owner-verified`:** sahibkar `conflicts.json`-u həll edir və qiymətləri təsdiqləyir.
4. **Build qaydası:** `permission !== 'granted'` olan şəkil yalnız placeholder kimi göstərilir. Production build-də `index-unverified` qiymət olarsa, xəbərdarlıq çıxır.

---

## D. İnteraksiyalar

| İnteraksiya | İstinad davranışı | İmplementasiya | a11y | Status |
|---|---|---|---|---|
| Desktop dropdown | Hover (tip ❓) | CSS və ya kiçik JS; hover ilə yanaşı focus və klik ilə də açılır | `aria-expanded`, `Esc`, ox düymələri | ✅ (davranış ❓) |
| Mobil menyu | ❓ | Toggle, body scroll lock, `Esc` ilə bağlanma | Focus trap, `aria-controls` | ✅ (tip ❓) |
| Sticky header | ❓ | `position: sticky` və ya scroll class | — | ❓ |
| Hero slayder | ❓ | İstinaddakı kitabxana və effektlə eyni davranış | Pauza, `prefers-reduced-motion` | ❓ |
| Məhsul tab-ları | "Məhsul Haqqında" / "Sifariş Et" | Kiçik JS adası | `role="tablist"`, ox düymələri | ✅ |
| Qalereya və lightbox | ❓ | — | Fokus idarəsi | ❓ |
| WhatsApp sifarişi | `wa.me` / `api.whatsapp.com` ❓, mesaj ❓, `target` ❓ | `buildWhatsAppUrl()` ölçülmüş formatı **dəqiq** təkrarlayır. İstinadda hazır mesaj yoxdursa, klonda da olmur (fidelity). Əlavə etmək ayrıca qərardır | Ad: "WhatsApp Əlaqə"; yeni tabda açılırsa, bu barədə bildiriş | ✅ (format ❓) |
| Telefon | `tel:` | `PhoneLink` | — | ✅ |
| Floating WhatsApp / back-to-top | ❓ | Fixed element | `aria-label` | ❓ |
| Axtarış | ❓ | İstinadda varsa: statik indeks (məs. Pagefind) və `/?s=` route-una uyğunlaşma | Label, nəticə sayının elanı | ❓ |
| Pagination | ❓ | Statik `/page/n/` səhifələri | `aria-current` | ❓ |
| Scroll animasiyaları | ❓ | Ölçülmüş müddət və easing ilə | Reduced-motion | ❓ |
| Analytics (WhatsApp klikləri) | ❓ | İstifadəçi qərarı | — | Qərar |

---

## Fazalar və tapşırıqlar

**Ölçü:** S ≤ 0.5 gün · M ≈ 1–2 gün · L ≈ 3–5 gün

| ID | Tapşırıq | Asılılıq | Ölçü |
|---|---|---|---|
| **F0: Sübut** | | | |
| F0.1 | Şəbəkə icazəsi (G0.1), `capture-reference.mjs` işə salınır | — | S |
| F0.2 | DESIGN_SYSTEM-dəki `TBD`-lər doldurulur (JSON + DevTools) | F0.1 | L |
| F0.3 | İnventar `sitemap.xml` ilə tamamlanır, ❓ URL-lər tapılır | F0.1 | M |
| F0.4 | WhatsApp axını sənədləşdirilir (link formatı, mesaj, floating düymə) | F0.1 | S |
| F0.5 | G0.2–G0.8 qərarları | F0.1 | — |
| **F1: Təməl** | | | |
| F1.1 | `okprint-web/` scaffold (Astro + Tailwind 4, lint, format) | G0.3, G0.4 | S |
| F1.2 | Tokenlər → Tailwind `@theme` (yalnız ölçülmüş dəyərlər) | F0.2 | M |
| F1.3 | Şriftlər (lisenziyası yoxlanmış), `BaseLayout`, `SeoHead`, `JsonLd` | F1.1, F0.2 | M |
| F1.4 | Vizual regressiya qurğusu: Playwright, istinad baseline-ları, 3 viewport | F0.1, F1.1 | M |
| **F2: Komponentlər (A)** | | | |
| F2.1 | Header, nav, dropdown, mobil nav, footer | F1.2 | L |
| F2.2 | Kataloq komponentləri (A2) | F1.2 | L |
| F2.3 | Konversiya komponentləri (A3) | F1.2, F0.4 | M |
| F2.4 | Kontent komponentləri (A4), yalnız ✅ olanlar | F1.2 | M |
| **F3: Data (C)** | | | |
| F3.1 | Zod sxemləri, content collections, slug reyestri | F1.1 | M |
| F3.2 | İndeks datasının importu (`index-unverified`) | F3.1 | M |
| F3.3 | Capture HTML-dən import (`live-captured`) və diff | F0.1, F3.1 | L |
| F3.4 | `conflicts.json` sahibkara göndərilir | F3.3 | S |
| **F4: Səhifələr (B)** | | | |
| F4.1 | Ana səhifə | F2.*, F3.2 | M |
| F4.2 | Kateqoriya və tag arxivləri | F2.2, F3.2 | M |
| F4.3 | Məhsul şablonu (48+ səhifə) | F2.2, F2.3, F3.2 | L |
| F4.4 | Məqalə, statik, EN, əlaqə, 404 | F2.4 | M |
| **F5: İnteraksiyalar (D)** | | | |
| F5.1 | Menyu, tab-lar, WhatsApp | F2.1, F2.3 | M |
| F5.2 | Şərti interaksiyalar (slayder, axtarış, lightbox), yalnız təsdiqlənənlər | F0.2 | M |
| **F6: QA və buraxılış** | | | |
| F6.1 | Vizual regressiya, hər şablon × 3 viewport | F4.*, F5.* | M |
| F6.2 | SEO pariteti (title, H1, canonical, sitemap), JSON-LD validasiyası | F4.* | S |
| F6.3 | a11y (axe-core, klaviatura), performans (Lighthouse) | F4.* | S |
| F6.4 | Aktiv auditi: build-də icazəsiz 🔒 aktiv olmamalıdır | F3.* | S |

**Gate 0-dan asılı olmayan işlər** (implementasiyaya icazə veriləndən sonra paralel gedə bilər): F3.1, F3.2, routing və slug reyestri, `SeoHead` və `JsonLd` əsasları. Bunların heç biri vizual dəyər tələb etmir.

---

## Qəbul meyarları

1. **Vizual:** hər şablon (T1–T8) 1440, 768 və 390 px-də istinad baseline-ı ilə müqayisə olunur. Şəkillər və slayder kontenti maskalanır. Hədəf (təklif): `maxDiffPixelRatio ≤ 0.03`, üstəgəl yan-yana əl ilə nəzərdən keçirmə. Hər fərq ya düzəldilir, ya da əsaslandırılıb sənədləşdirilir.
2. **Struktur:** inventardakı hər URL `200` qaytarır. H1 və title istinadla eynidir (və ya fərq təsdiqlənib).
3. **Davranış:** D cədvəlindəki ✅ interaksiyalar istinadla eynidir. ❓ olanlar ya təsdiqlənib qurulub, ya da `N/A` qeyd olunub.
4. **SEO:** canonical, sitemap və robots var. JSON-LD validasiyadan keçir. URL pariteti 100%-dir (G0.7).
5. **a11y:** axe-core ilə 0 "critical" və 0 "serious" xəta. Menyu və tab-lar klaviatura ilə tam idarə olunur.
6. **Aktivlər:** `permission !== 'granted'` olan heç bir şəkil, loqo və ya mətn real formada build-ə düşmür.
7. **Data:** production-da `index-unverified` qiymət yoxdur.

## Risklər

| Risk | Təsir | Azaltma |
|---|---|---|
| Şəbəkə icazəsi verilmir | Vizual fidelity mümkün deyil | Lokal capture (variant B) və ya əl ilə çəkilmiş ekran görüntüləri |
| okprint.az okeyprint.az-a yönləndirir | İstinad dəyişir | G0.2 qərarı, capture-un okeyprint.az üçün təkrarı |
| Şablon lisenziyası ("Prinoz") | Hüquqi risk | Kod kopyalanmır; görünüş ölçülərə əsasən sıfırdan qurulur |
| Qiymət ziddiyyətləri | Yanlış qiymət nümayişi | `verification_status`, sahibkar təsdiqi |
| Dublikat səhifələr | SEO kannibalizasiyası | Canonical strategiyası (G0.7) |
| Sayt dəyişir (canlı) | Baseline köhnəlir | Capture tarixi qeyd olunur, buraxılışdan əvvəl yenidən capture |
