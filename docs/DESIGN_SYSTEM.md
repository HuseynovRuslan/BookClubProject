# Dizayn sistemi: okprint.az istinadı

> **Tarix:** 2026-10-09
> **Status:** ⛔ **VİZUAL TOKENLƏR ÇIXARILMAYIB.** Canlı sayta giriş bloklanıb ([REFERENCE_ANALYSIS §1](./REFERENCE_ANALYSIS.md#1-giriş-cəhdləri-və-məhdudiyyətlər)).

Bu sənəddə üç şey var:

1. **Doldurulacaq token sxemi.** Bütün dəyərlər `TBD` kimi qalıb.
2. **İndeksdən bilinən qeyri-vizual qaydalar:** kontent, format və mikro-kopiya (§10).
3. **Çıxarış metodologiyası** (§11).

## Qaydalar

- `TBD` dəyəri yalnız ölçülmüş sübutla (computed style, ekran görüntüsü, CSS faylı) əvəz olunur. Hər dəyərin yanında mənbə qeyd olunur: selector və ya fayl, viewport.
- "Prinoz" şablonunun default dəyərləri, Bootstrap və ya Tailwind default-ları, "tipik" print-shop rəngləri istinad **sayılmır**. Canlı sayt fərdiləşdirilmiş ola bilər.
- Eyni xüsusiyyət viewport-a görə dəyişirsə, üç dəyər də (1440 / 768 / 390) ayrıca yazılır.
- Rənglər HEX formatında (alfa varsa, `rgba`) yazılır. Ölçülər `px` ilə yazılır, `rem` ekvivalenti ilə birlikdə (kök font ölçüsü `TBD`).

---

## 1. Rəng tokenləri

| Token | İstifadə yeri | Dəyər | Mənbə |
|---|---|---|---|
| `color.brand.primary` | Loqo, əsas CTA, aktiv menyu | TBD | — |
| `color.brand.secondary` | İkinci dərəcəli vurğular | TBD | — |
| `color.accent` | Qiymət, badge ("Çox satılan") | TBD | — |
| `color.whatsapp` | WhatsApp düyməsi | TBD (saytın öz dəyəri ölçülür; Meta-nın brend rəngi **fərz edilmir**) | — |
| `color.text.primary` | Əsas mətn | TBD | — |
| `color.text.secondary` | Alt başlıq, meta | TBD | — |
| `color.text.inverse` | Tünd fon üzərində mətn | TBD | — |
| `color.link` / `color.link.hover` | Linklər | TBD | — |
| `color.bg.page` | Səhifə fonu | TBD | — |
| `color.bg.alt` | Alternativ bölmə fonu | TBD | — |
| `color.bg.topbar` | Top bar (varsa) | TBD | — |
| `color.bg.header` / `color.bg.header.sticky` | Header | TBD | — |
| `color.bg.dropdown` | Dropdown | TBD | — |
| `color.bg.footer` / `color.bg.footer.bottom` | Footer, copyright zolağı | TBD | — |
| `color.border` | Kart, cədvəl, input | TBD | — |
| `color.table.header` / `color.table.stripe` | Qiymət cədvəli | TBD | — |
| `color.focus` | Fokus halqası | TBD (yoxdursa, a11y üçün əlavə olunur və sənədə qeyd edilir) | — |
| `color.overlay` | Mobil menyu və lightbox overlay-i | TBD | — |

## 2. Tipoqrafiya

### 2.1 Şrift ailələri

| Rol | Ailə | Çəkilər | Mənbə (Google Fonts, self-host, sistem) | Lisenziya |
|---|---|---|---|---|
| Başlıqlar | TBD | TBD | TBD | TBD 🔒 |
| Əsas mətn | TBD | TBD | TBD | TBD 🔒 |
| Naviqasiya və düymələr | TBD | TBD | TBD | TBD 🔒 |
| İkon şrifti (varsa) | TBD | — | TBD | TBD 🔒 |

> **Azərbaycan qlifləri:** seçilən şriftdə `ə Ə ğ Ğ ı İ ş Ş ç Ç ö Ö ü Ü` qlifləri yoxlanmalıdır. İstinad saytında fallback şrift görünürsə, bu da qeyd olunur.

### 2.2 Tip şkalası

Hər xana `ölçü / çəki / sətir hündürlüyü / hərf aralığı / transform` formatında doldurulur.

| Element | 1440 | 768 | 390 |
|---|---|---|---|
| `h1` (səhifə başlığı) | TBD | TBD | TBD |
| `h2` (bölmə başlığı) | TBD | TBD | TBD |
| `h3` (kart başlığı) | TBD | TBD | TBD |
| `h4`–`h6` | TBD | TBD | TBD |
| Əsas mətn | TBD | TBD | TBD |
| Kiçik mətn və meta | TBD | TBD | TBD |
| Üst menyu linki | TBD | TBD | TBD |
| Dropdown linki | TBD | TBD | TBD |
| Düymə | TBD | TBD | TBD |
| Qiymət (kartda) | TBD | TBD | TBD |
| Qiymət başlığı (məhsul səhifəsi) | TBD | TBD | TBD |
| Spesifikasiya etiketi və dəyəri | TBD | TBD | TBD |
| Breadcrumb (varsa) | TBD | TBD | TBD |
| Footer başlığı və linki | TBD | TBD | TBD |

## 3. Boşluq və layout

| Token | 1440 | 768 | 390 | Mənbə |
|---|---|---|---|---|
| Container max-width | TBD | TBD | TBD | — |
| Container yan padding (gutter) | TBD | TBD | TBD | — |
| Bölmələr arası şaquli padding | TBD | TBD | TBD | — |
| Boşluq şkalası (təkrarlanan margin və padding dəyərləri) | TBD | — | — | — |
| Radius şkalası | TBD | — | — | — |
| Kölgə (shadow) şkalası | TBD | — | — | — |

**Breakpoint-lər:** CSS-dəki `@media` siyahısından götürülür: `TBD`. Şablonun Bootstrap əsaslı olduğu **fərz edilmir**.

## 4. Grid sistemləri

| Kontekst | 1440 sütun | 768 sütun | 390 sütun | Gap | Mənbə |
|---|---|---|---|---|---|
| Ana səhifə: kateqoriya kartları | TBD | TBD | TBD | TBD | — |
| Ana səhifə: məhsul kartları (varsa) | TBD | TBD | TBD | TBD | — |
| Kateqoriya: məhsul grid-i | TBD | TBD | TBD | TBD | — |
| Məhsul: "Tövsiyə olunan məhsullar" | TBD | TBD | TBD | TBD | — |
| Məhsul: şəkil və məlumat sütunları | TBD | TBD | TBD | TBD | — |
| Bloq siyahısı | TBD | TBD | TBD | TBD | — |
| Footer sütunları | TBD | TBD | TBD | TBD | — |

## 5. Komponent ölçüləri

| Komponent | Ölçüləcək parametrlər | Dəyər |
|---|---|---|
| Top bar | Varlığı, hündürlük, məzmun (telefon, e-poçt, sosial), mobildə gizlənməsi | TBD |
| Header | Hündürlük (normal və sticky), loqo ölçüsü, nav elementləri arası boşluq, kölgə | TBD |
| Dropdown / mega menyu | Tip, en, padding, element hündürlüyü, radius, kölgə, açılma animasiyası | TBD |
| Mobil menyu | Tip (off-canvas, accordion və ya tam ekran), en, overlay, açılma istiqaməti | TBD |
| Hero / slayder | Varlığı, hündürlük, kitabxana, effekt, interval, ox və nöqtə stilləri | TBD |
| Səhifə başlığı banneri | Varlığı, hündürlük, fon (şəkil və ya rəng), breadcrumb yeri | TBD |
| Kateqoriya kartı | En × hündürlük, şəklin aspect-ratio-su, padding, radius, kölgə, hover | TBD |
| Məhsul kartı | En × hündürlük, şəklin aspect-ratio-su və `object-fit`-i, başlıq sətir limiti, qiymət yeri, hover effekti | TBD |
| Düymələr (primary, secondary, WhatsApp) | Hündürlük, padding, radius, ikon ölçüsü və boşluğu, hover, active, focus | TBD |
| Spesifikasiya sətri (`Etiket · Dəyər`) | Ayırıcı, sütunlu və ya inline olması, aralıq | TBD |
| Qiymət cədvəli | Sərhədlər, başlıq fonu, zebra, hüceyrə padding-i, mobil davranış (scroll və ya stack) | TBD |
| Tab-lar ("Məhsul Haqqında" / "Sifariş Et") | Tab hündürlüyü, aktiv göstərici, keçid | TBD |
| Qalereya / lightbox | Varlığı, thumbnail ölçüsü, naviqasiya | TBD |
| Floating WhatsApp / back-to-top | Varlığı, ölçü, künc, kənardan məsafə, z-index, animasiya | TBD |
| Pagination | Varlığı, element ölçüsü, aktiv stil | TBD |
| Footer | Sütunlar, loqo, əlaqə ikonları, copyright zolağı | TBD |
| Formalar (əlaqə, axtarış) | Input hündürlüyü, sərhəd, radius, placeholder rəngi | TBD |
| Preloader | Varlığı (HTML şablonlarında tez-tez olur, amma fərz edilmir) | TBD |

## 6. Animasiyalar

| Element | Tip | Müddət | Easing | Trigger | Mənbə |
|---|---|---|---|---|---|
| Slayder keçidi | TBD | TBD | TBD | Autoplay və ya klik | — |
| Kart hover | TBD | TBD | TBD | Hover | — |
| Düymə hover | TBD | TBD | TBD | Hover | — |
| Dropdown açılması | TBD | TBD | TBD | Hover və ya klik | — |
| Mobil menyu | TBD | TBD | TBD | Klik | — |
| Scroll-reveal (WOW, AOS və s.) | TBD | TBD | TBD | Scroll | — |
| Sticky header keçidi | TBD | TBD | TBD | Scroll | — |
| `@keyframes` adları | TBD | — | — | — | — |

Klonda bütün animasiyalar `prefers-reduced-motion: reduce` vəziyyətində söndürülür. Bu, vizual default-u dəyişmir.

## 7. İkonlar

| Parametr | Dəyər |
|---|---|
| İkon dəsti (Font Awesome, şablon ikonları, SVG) | TBD 🔒 |
| Ölçülər (nav, düymə, footer, floating) | TBD |
| İstifadə yerləri (telefon, WhatsApp, e-poçt, ünvan, sosial, axtarış, menyu) | TBD |

## 8. Şəkillər

| Parametr | Dəyər |
|---|---|
| Format (JPG, PNG, WebP) | TBD |
| Məhsul şəklinin natural ölçüsü və göstərilmə ölçüsü | TBD |
| Aspect-ratio-lar (kart, qalereya, banner) | TBD |
| Lazy-loading | TBD |
| Fon şəkilləri (banner, bölmə fonları) | TBD 🔒 |

## 9. Responsiv davranış (müşahidə cədvəli)

| Davranış | 1440 | 768 | 390 |
|---|---|---|---|
| Top bar görünür? | TBD | TBD | TBD |
| Nav forması (üfüqi, hamburger) | TBD | TBD | TBD |
| Nav-ın yığıldığı (collapse) breakpoint | TBD | — | — |
| Məhsul grid-də sütun sayı | TBD | TBD | TBD |
| Məhsul səhifəsi: şəkil və məlumat düzülüşü | TBD | TBD | TBD |
| Qiymət cədvəli | TBD | TBD | TBD |
| Footer sütunları | TBD | TBD | TBD |
| Floating düymələr | TBD | TBD | TBD |
| Başlıq ölçülərinin kiçilməsi | TBD | TBD | TBD |

---

## 10. Bilinən qeyri-vizual qaydalar ⚠️

Bunlar axtarış indeksindən götürülüb və klonda **referensə uyğun** təkrarlanmalıdır.

### 10.1 Qiymət formatları (referensdə qarışıqdır)

| Format | Nümunə | Harada |
|---|---|---|
| `{rəqəm} AZN` | `25 AZN`, `165 AZN` | Məhsul səhifələri, cədvəllər |
| `{rəqəm} ₼` | `5 ₼`, `19 ₼` | Dizayn haqqı, çərçivə |
| `₼ {rəqəm}` | `₼ 85`, `₼ 330` | Roll-up kateqoriyası |
| `{rəqəm} qəpik` | `85 qəpik` | Qələm |
| Onluq ayırıcı: nöqtə | `1.20 AZN`, `3.20 AZN` | Çox cədvəllərdə |
| Onluq ayırıcı: vergül | `13,50 AZN`, `4,20 ₼` | Termos, hədiyyə dəsti |
| Minlik ayırıcı: nöqtə | `1.170 AZN`, `1.050 AZN` | Plaket cədvəli |

**Klon qaydası:** hər qiymət datada iki sahə ilə saxlanır: `display` (istinaddakı string olduğu kimi) və `amount` (normallaşdırılmış rəqəm, schema.org və sıralama üçün). UI `display` sahəsini göstərir. Bu, vizual fidelity-ni qoruyur.

### 10.2 Mikro-kopiya

| Kontekst | Mətn |
|---|---|
| Spesifikasiya sətri | `Minimal tiraj · 100 ədəd` (ayırıcı U+00B7 `·`) |
| Qiymət başlığı | `100 ədəd 25 AZN, 1 günə hazır!` |
| Cəm | `Cəmi 25 AZN` |
| Əlavə xidmət | `Asılqan kəsim · 30 AZN (əlavə)` |
| Tab-lar | `Məhsul Haqqında` · `Sifariş Et` |
| Sifariş CTA-sı | `Sifariş Üçün Elə İndi Bizə Yazın!` |
| WhatsApp linki | `WhatsApp Əlaqə` |
| Əlaqəli məhsullar | `Tövsiyə olunan məhsullar` |
| Ana səhifə vurğusu | `Olduğunuz məkanı tərk etmədən whatsapp ilə sürətli sifariş` |
| Kart başlığı formatı | `{Ad} – {qısa təsvir}` (en-dash `–`), məs. `Standart Plus Vizitkart – Çox satılan` |
| Title formatı | `Okprint - {Səhifə} - Vizitka sifarişi, Flayer, Buklet, Reklam və mətbəə işləri` |

### 10.3 Ton

Satış yönümlü, əmr formasında ("Sifariş edin", "Bizə yazın"), nida işarəsi geniş istifadə olunur. Ölçü vahidləri `ədəd`, `gün`, `iş günü`, `qr` / `q`, `sm`, `mm` kimi yazılır.

---

## 11. Çıxarış metodologiyası

### 11.1 Avtomatik: `docs/tools/capture-reference.mjs`

```bash
# Node 18+, Playwright (npm i -D playwright). Bu cloud mühitində Playwright qlobal quraşdırılıb.
node docs/tools/capture-reference.mjs https://okprint.az ../reference-capture
# İstəyə görə xüsusi səhifələr:
node docs/tools/capture-reference.mjs https://okprint.az ../reference-capture / /flayer-sifarisi/
```

Skript hər səhifə və viewport (1440, 768, 390) üçün bunları yaradır:

| Fayl | Məzmun → Token |
|---|---|
| `*__fold.png`, `*__full.png` | Vizual istinad və vizual regressiya baseline-ı |
| `home__*__scrolled-header.png` | Sticky header davranışı |
| `home__desktop-1440__nav-hover-N.png` | Dropdown və mega menyu |
| `home__{tablet,mobile}__nav-open.png` | Mobil menyu |
| `*.json` → `tokens.textColors`, `tokens.backgrounds` | §1 rənglər (tezliyə görə sıralanıb) |
| `*.json` → `tokens.fonts`, `tokens.typeScale` | §2 tipoqrafiya |
| `*.json` → `elements[...]` | h1–h4, p, a, button, header, nav, footer üçün computed style və ölçülər |
| `*.json` → `tokens.radii`, `tokens.shadows`, `tokens.rootVars` | §3 radius, kölgə, CSS dəyişənləri |
| `*.json` → `grids[]` | §4 və §5: təkrarlanan kart grid-ləri (sütunlar, gap, kartın ölçüsü, şəklin `object-fit`-i və natural ölçüsü, nümunə mətn) |
| `*.json` → `css.breakpoints`, `css.fontFaces`, `css.keyframes` | §3 breakpoint-lər, §2.1 şriftlər, §6 animasiya adları |
| `*.json` → `fixedOrSticky[]` | Floating düymə, sticky header |
| `*.json` → `whatsapp[]`, `phones[]` | WhatsApp linkinin formatı və mesaj mətni (REFERENCE_ANALYSIS §8) |
| `*.json` → `seo`, `outline`, `a11y` | SEO və a11y auditi |
| `*.html` | Kataloq datasının çıxarılması üçün DOM |
| `summary.json` | Status kodları, yönləndirmələr (`finalUrl`). okprint.az → okeyprint.az yönləndirməsini göstərir |

> Cross-origin stylesheet-lər (CDN) `css.unreadableSheets`-də siyahılanır. Onları ayrıca yükləyib `@media` və `@font-face` qaydalarını oxumaq lazımdır.

### 11.2 Əl ilə (DevTools) yoxlanacaqlar

- **Hover, focus, active rəngləri:** Elements → `:hov` ilə vəziyyəti məcbur edib computed style oxumaq.
- **Animasiyalar:** Animations paneli. Müddət və easing qeyd olunur.
- **Slayder konfiqurasiyası:** Sources-da `swiper`, `owl`, `slick`, `autoplay` axtarılır.
- **Şrift faylları:** Network → Font: format və mənbə host.
- **Plaginlər:** `wp-content/plugins/*` yolları (məsələn, WhatsApp plagini).

### 11.3 Təsdiq meyarı

Hər `TBD` ölçülmüş dəyər və mənbə ilə əvəz olunanda bu sənəd "tamamlanmış" sayılır. Element istinadda yoxdursa, `N/A — istinadda yoxdur` yazılır və bu, ekran görüntüsü ilə əsaslandırılır.
