# OkPrint (okprint.az): istinad analizi

> **Tarix:** 2026-10-09
> **Status:** QİSMƏN. Canlı sayta giriş bu mühitdə bloklanıb. Analiz yalnız axtarış indeksindən (WebSearch) toplanmış mətn sübutlarına əsaslanır.
> **Əlaqəli sənədlər:** [PAGE_INVENTORY.md](./PAGE_INVENTORY.md) · [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) · [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) · [tools/capture-reference.mjs](./tools/capture-reference.mjs)

## Sübut işarələri

| İşarə | Mənası |
|---|---|
| ✅ | Axtarış indeksində URL və başlıq ilə təsdiqlənib |
| ⚠️ | Axtarış nəticəsinin mətn fraqmentindən götürülüb. Köhnə ola bilər (indeks metadata-sına görə səhifələr 150–1900 gün əvvəl indekslənib), canlı saytda yoxlanmalıdır |
| ❓ | Naməlumdur, canlı yoxlama tələb olunur. **Təxmin edilməyib** |
| 🔒 | Müəllif hüququ və ya lisenziya icazəsi tələb olunur |

---

## 0. Qısa xülasə

1. **Vizual sübut yoxdur.** Ekran görüntüsü, DOM, CSS, şrift, rəng, ölçü və animasiya əldə edilməyib (§1). Dizayn tokenlərinin hamısı [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)-də `TBD` kimi saxlanılıb, heç biri uydurulmayıb.
2. **Struktur sübutu var.** İndeksdən ~80 URL toplanıb: 7 əsas səhifə, 13 kateqoriya, 6 tag arxivi, 48 məhsul səhifəsi, 7 məqalə. Məhsul səhifələrinin anatomiyası da (spesifikasiya sətirləri, tiraj–qiymət cədvəlləri, WhatsApp CTA) müəyyənləşib.
3. **Platforma, yüksək ehtimalla, WordPress-dir.** Məhsullar WooCommerce məhsulu deyil, adi WP "post"-larıdır (`/%postname%/`). Kateqoriyalar `/category/<slug>/` altındadır. Səbət və checkout yoxdur: sifariş WhatsApp və telefonla verilir.
4. **Şablon izi.** Bəzi səhifələrin header mətnində *"Prinoz - Printing company & Service Html Template"* görünür ⚠️. Bu, üçüncü tərəf HTML şablonunun WP-yə köçürüldüyünü göstərir 🔒.
5. **Kritik açıq sual.** 2024-03-24 tarixli elanda yeni sayt, **OkeyPrint.az**, təqdim olunub ("onlayn sifariş", "100-dən çox çap məhsulu"). okprint.az hazırda okeyprint.az-a yönləndirirsə, faktiki istinad okeyprint.az olacaq. Bu məsələ Gate 0-da həll olunmalıdır.
6. **Kontentdə ziddiyyətlər var:** qiymətlər, ünvan, dublikat səhifələr (§12). Kataloq datası sahibkar təsdiqləyənə qədər "təsdiqlənməmiş" statusunda qalır.

---

## 1. Giriş cəhdləri və məhdudiyyətlər

| Üsul | Nəticə |
|---|---|
| `curl` (mühitin HTTPS proxy-si ilə) → `https://okprint.az/` | `CONNECT tunnel failed, response 403`. Mühitin şəbəkə siyasəti hostu rədd edir |
| Headless Chromium (Playwright, proxy ilə) | `net::ERR_TUNNEL_CONNECTION_FAILED` |
| WebFetch aləti | `getaddrinfo ENOTFOUND`. Alət bu sessiyada heç bir domeni həll edə bilmir (`example.com` daxil) |
| `web.archive.org` (Wayback Machine) | Proxy tərəfindən rədd edildi |
| WebSearch (axtarış indeksi) | ✅ İşləyir: başlıqlar, URL-lər, mətn fraqmentləri |

**Nəticə:** 1440 / 768 / 390 px ekran görüntüləri, computed style, şəkil, şrift faylları və animasiya davranışı **toplanmayıb**.

### 1.1 Blokdan çıxmaq üçün variantlar

- **A. Tövsiyə olunan variant.** Cloud mühitinin *Network access* ayarlarında *Allowed domains* siyahısına bu hostlar əlavə olunur: `okprint.az`, `www.okprint.az`, `okeyprint.az`, `www.okeyprint.az`. Saytın yüklədiyi xarici resurs hostları da əlavə olunmalıdır (məs. şrift və CDN hostları). Onların dəqiq siyahısı ilk yükləmədə məlum olacaq. Təlimat: <https://code.claude.com/docs/en/cloud-environments#network-access>. Sonra bu əmr işə salınır:
  ```bash
  node docs/tools/capture-reference.mjs https://okprint.az ../reference-capture
  ```
- **B.** Skript istifadəçinin öz kompüterində işə salınır (Node 18+ və `npm i -D playwright` lazımdır). Nəticə qovluğu (`reference-capture/`) sessiyaya ötürülür.
- **C. Minimal variant.** §1.2-dəki ekran görüntüləri əl ilə çəkilib göndərilir.

> `reference-capture/` qovluğunda üçüncü tərəfin müəllif hüququ ilə qorunan şəkilləri olacaq. Onu repo-ya commit etməyin; repo-dan kənarda və ya `.gitignore` altında saxlayın.

### 1.2 Tələb olunan ekran görüntüləri

Hər sətir üçün **1440, 768 və 390 px**-də həm *fold* (ilk ekran), həm də *full-page* görüntü lazımdır.

| # | Səhifə | URL | Əlavə vəziyyətlər |
|---|---|---|---|
| 1 | Ana səhifə | `/` | 700 px scroll (sticky header); hər üst menyu elementinin hover vəziyyəti (desktop); mobil menyu açıq; slayder varsa, hər slayd |
| 2 | Kateqoriya (çox məhsullu) | `/category/vizitka-sifarisi/` | Kart hover |
| 3 | Kateqoriya (qarışıq) | `/category/other-products/` | Pagination varsa, 2-ci səhifə |
| 4 | Məhsul (tiraj cədvəli ilə) | `/flayer-sifarisi/` | "Məhsul Haqqında" / "Sifariş Et" tab-larının hər biri; qalereya və ya lightbox |
| 5 | Məhsul (sadə) | `/mat-laminasiyali-vizitkart/` | — |
| 6 | Məhsul (model × tiraj matrisi) | `/plaket-sifarisi-ve-capi/` | Mobil cədvəl davranışı |
| 7 | Əlaqə | `/bizimle-elaqe/` | Xəritə və forma (varsa) |
| 8 | Məqalə | `/blog-flayer/` | — |
| 9 | Bloq siyahısı | URL ❓ (menyudan tapılmalı) | — |
| 10 | Haqqımızda | URL ❓ | — |
| 11 | Axtarış | `/?s=vizitka` | Axtarış panelinin açıq vəziyyəti |
| 12 | Tag arxivi | `/tag/banner/` | — |
| 13 | 404 | `/bu-sehife-yoxdur/` | — |
| 14 | İngiliscə səhifə | `/print-services-in-baku-azerbaijan/` | Dil keçidi (varsa) |
| 15 | WhatsApp axını | Məhsul səhifəsindən | CTA kliki: açılan `wa.me`/`api.whatsapp.com` URL-i ünvan sətri ilə birlikdə, mobil və desktop |
| 16 | OkeyPrint.az ana səhifəsi | `https://okeyprint.az/` | Müqayisə üçün (Gate 0 qərarı) |

Ekran görüntülərindən başqa bunlar da lazımdır: hər şablon üçün yadda saxlanmış HTML, computed-style JSON və HAR faylı (şriftləri, skriptləri, slayder kitabxanasını və WP plaginlərini müəyyən etmək üçün). `capture-reference.mjs` HAR-dan başqa hamısını avtomatik toplayır.

---

## 2. Sayt kimliyi ⚠️

| Sahə | Dəyər |
|---|---|
| Brend adları | "Okprint", "OK Print", "OkPrint.az". Başlıqlar "Okprint - …" ilə başlayır |
| Tagline (title suffix) | "Vizitka sifarişi, Flayer, Buklet, Reklam və mətbəə işləri" |
| Mövqeləndirmə | "Poliqrafiya şirkətləri sırasında ilk sıralarda yer alan OkPrint reklam şirkəti sizə hər növ çap xidmətləri təklif edir." |
| Təcrübə | "Haqqımızda": 2015-dən fəaliyyət göstərir. Ana səhifə: "10 il təcrübə" |
| Ünvan | 8-ci mikrorayon, Nizami Nərimanov 23B (3 saylı uşaq dəri-zöhrəvi dispanserinin yanı), Bakı |
| Alternativ ünvan (ziddiyyət) | İbrahimpaşa Dadaşov 52 (`/dizayn-xidmetleri/`) |
| Telefon | +994 55 358 36 63 (zəng) |
| WhatsApp | +994 55 974 85 54, "24/7 əlçatandır" |
| E-poçt | info@okprint.az |
| Veb ünvanlar (məhsul səhifəsində) | www.okprint.az, www.okeyprint.az |
| Sosial | Axtarışda tapılıb: Facebook `facebook.com/OkPrint.az`, YouTube "OkeyPrint" kanalı. Saytdan bu hesablara link verilib-verilmədiyi ❓; Instagram ❓ |
| Çatdırılma | Azərbaycan daxilində çatdırılma ⚠️ |

---

## 3. Platforma və texniki müşahidələr

- **CMS: WordPress (yüksək ehtimal, çıxarış).** Bunu göstərən əlamətlər: `/category/<slug>/` və `/tag/<slug>/` URL-ləri, "… Archives" başlıq formatı (WP-nin default arxiv başlığı), kök səviyyədə `/%postname%/` permalink-ləri. Canlı HTML-də `meta[name=generator]`, `wp-content` və `wp-json` ilə təsdiqlənməlidir.
- **WooCommerce yoxdur (çıxarış).** İndeksdə `/product/`, `/shop/`, `/cart/`, `/product-category/` görünmür. Məhsullar adi post-lardır və "Sifariş Et" WhatsApp-a aparır.
- **Şablon:** "Prinoz - Printing company & Service Html Template" mətni bəzi səhifələrin header-ində qalıb ⚠️. Bəzi səhifələrdə şablonun placeholder mətnləri də var ⚠️. 🔒 Bu şablonun CSS, JS, ikon və illüstrasiyaları lisenziyasız kopyalanmamalıdır.
- **Dil:** əsas dil Azərbaycan dilidir. Bir ingiliscə landing var (`/print-services-in-baku-azerbaijan/`). Dil keçidi ❓.
- **Slug-lar:** transliterasiya olunub (ə→e, ş→s, ç→c, ı→i, ğ→g, ö→o, ü→u). İstisnalar percent-encoded saxlanır: `/m%C9%99xm%C9%99ri-vizitkart/`, `/medaxil-q%C9%99bzi-2/`.
- **Qardaş sayt:** OkeyPrint.az. Elan: `/okeyprint-az/` (2024-03-24) ⚠️. Elana görə orada onlayn sifariş və "məhsulun real görünüşü" var.

---

## 4. İnformasiya arxitekturası

### 4.1 Naviqasiya ⚠️ (sıra, iyerarxiya və menyu tipi ❓)

- **Üst menyuda görünən bölmələr:** Vizitkartlar · Flayer · Buklet · Çərçivələr · Hədiyyə dəstləri · İşçi geyimləri · Promo məhsullar
- **Promo alt bölməsi:** plastik qələmlər, metal qələmlər, termoslar, fincanlar, foreks, roll-up, vinil çapı
- **Digər bölmələr:** "Bloq", "Haqqımızda", "Bizimlə əlaqə" (`/bizimle-elaqe/`)
- **Dropdown və ya mega menyu, mobil menyu, top bar:** formaları ❓

### 4.2 Səhifə şablonları (tipləri)

| Kod | Şablon | Nümunə |
|---|---|---|
| T1 | Ana səhifə | `/` |
| T2 | Kateqoriya arxivi | `/category/vizitka-sifarisi/` |
| T3 | Məhsul (WP post) | `/mat-laminasiyali-vizitkart/` |
| T4 | Məqalə (WP post) | `/blog-flayer/` |
| T5 | Tag arxivi | `/tag/banner/` |
| T6 | Statik səhifə | `/bizimle-elaqe/`, `/dizayn-xidmetleri/` |
| T7 | Axtarış nəticələri | `/?s=` ❓ |
| T8 | 404 | ❓ |

> T3 və T4 eyni kök slug məkanını paylaşır. Ayrı prefiks yoxdur. Routing bunu nəzərə almalıdır (bax: IMPLEMENTATION_PLAN §B).

Tam URL siyahısı: [PAGE_INVENTORY.md](./PAGE_INVENTORY.md).

---

## 5. Ana səhifə ⚠️ (bölmələrin sırası ❓)

İndeksdə görünən məzmun blokları:

1. **WhatsApp vurğusu:** "Olduğunuz məkanı tərk etmədən whatsapp ilə sürətli sifariş"
2. **Şirkət təqdimatı:** poliqrafiya mətni; "Çap xidmətlərimizə hər növ vizitka çapı, qaimə çapı və sifarişi, resepturnik və firma blankları, flayer, buklet, poster, kataloq və sayrə kimi məhsullar daxildir."
3. **Məhsul kateqoriyaları və məhsullar:** vizitka, flayer, buklet və s.; promo: qələm, foreks, fincan, vinil
4. **Qiymət vurğusu:** "1000 flayer cəmi 55 AZN" (ana səhifədə və bloqda)
5. **"Haqqımızda" bölməsi:** 2015-dən; daxili və xarici reklamın hazırlanması və quraşdırılması, vinil və banner çapı
6. **"10 il təcrübə"**
7. **Əlaqə bloku:** 2 telefon, e-poçt, ünvan

Bunların varlığı ❓: hero slayder, statistika sayğacları, müştəri rəyləri, partnyor loqoları, bloq teaser-ləri, floating WhatsApp düyməsi, preloader.

---

## 6. Kateqoriya səhifəsinin anatomiyası ⚠️

- **Giriş mətni.** Vizitka nümunəsi: "350 qr, 600 qr və 700 qr materiallarda, mat, parlaq və məxməri variantlarda".
- **Məhsul kartları:** `{Ad} – {qısa təsvir}` formatında başlıq və qiymət. Nümunələr:
  - "Ekonom Vizitkart – Sadə və Münasib" (~15 AZN)
  - "Standart Plus Vizitkart – Çox satılan" (~20 AZN)
  - "Naxışlı Vizitkart – 350 qr. qalınlıq, zövqlü təqdimat" (~30 AZN)
  - "VIP Karton Vizitkart – 700 qr. qalınlığında prestijli təqdimat"
  - "VIP Zərif Məxməri Vizitkart – İpəksi Toxunuşlu, Fərqli Material" (~75 AZN)
- **Qiymət formatı:** roll-up kateqoriyasında "₼ 85" (simvol önündə), başqa yerlərdə "25 AZN" və "5 ₼".
- **Pagination ❓.** İndeksdə `/page/N/` URL-i yoxdur.
- **Kateqoriya altındakı SEO mətni ❓**

---

## 7. Məhsul səhifəsinin anatomiyası ⚠️ (elementlərin sırası ❓)

1. **H1:** məs. "Mat Laminasiyalı Vizitkart"
2. **Qiymət başlığı:** "100 ədəd 25 AZN, 1 günə hazır!"
3. **`Etiket · Dəyər` formatında spesifikasiya sətirləri:**
   - `Minimal tiraj · 100 ədəd`
   - `Təhvil müddəti · 1 gün`
   - `Dizayn · 5 ₼`
   - `Asılqan kəsim · 30 AZN (əlavə)`
4. **Tiraj–qiymət cədvəli:**
   - Tək sütunlu: "100 ədəd · 80 AZN / 1000 ədəd · 165 AZN / …"
   - Model × tiraj matrisi: plaket (P01/PC03/P02/PC06 × 1/10/30 ədəd)
5. **Texniki xüsusiyyətlər:** kağız qramajı, ölçü (85×55 mm), forma ("bank kartı forması, kənarları oval"), çap texnologiyası (lazer, ofset, UV), "Cəmi 25 AZN"
6. **Tab-lar:** "Məhsul Haqqında" · "Sifariş Et"
7. **CTA:** "Sifariş Üçün Elə İndi Bizə Yazın!" + "WhatsApp Əlaqə"
8. **Əlaqə bloku:** 2 telefon, e-poçt, www.okprint.az / www.okeyprint.az
9. **"Tövsiyə olunan məhsullar"** (əlaqəli məhsullar)
10. **Uzun SEO mətni** (məqalə formatında)

Bunlar ❓: şəkil və qalereya sayı, lightbox, breadcrumb, sidebar, paylaşma düymələri.

---

## 8. WhatsApp sifariş axını

**Məlum olanlar ⚠️**

- Əsas sifariş kanalı WhatsApp-dır: +994 55 974 85 54 (24/7). okprint.az-da səbət, checkout və onlayn ödəniş yoxdur.
- Giriş nöqtələri: ana səhifədəki vurğu, məhsul səhifəsində "WhatsApp Əlaqə" və "Sifariş Et".
- Bəzi məhsullar (qəbz və mədaxil qəbzi) üçün sənəd tələb olunur: reyestrdən çıxarış, şəxsiyyət vəsiqəsi və VÖEN WhatsApp nömrəsinə göndərilməlidir.

**Məlum olmayanlar ❓**

- Link formatı: `wa.me`, `api.whatsapp.com/send` və ya `web.whatsapp.com`
- Əvvəlcədən doldurulmuş mesaj mətnidirmi? Məhsul adı və ya URL ötürülürmü?
- Floating düymə var? Varsa, hansı küncdədir və hansı ölçüdədir?
- Desktopda yeni tabda açılırmı (`target=_blank`)?
- Kliklər analytics hadisəsi kimi izlənirmi?

**Mövcud axın (çıxarış):**

```
Məhsul/Kateqoriya səhifəsi
  └─ "Sifariş Et" / "WhatsApp Əlaqə" klik
       └─ WhatsApp söhbəti (+994 55 974 85 54)
            ├─ Menecer tiraj, qiymət, dizayn haqqını dəqiqləşdirir
            ├─ (qəbz məhsulları) sənədlər göndərilir
            └─ Hazırlanma (1–30 gün, məhsula görə) → təhvil/çatdırılma
```

---

## 9. Axtarış ❓

İndeksdə axtarış nəticəsi səhifəsi yoxdur. WordPress-də `/?s=` default olaraq mövcuddur, amma UI-da axtarış qutusunun olub-olmadığı bilinmir. Canlı yoxlamaya qədər axtarış "şərti komponent" sayılır.

---

## 10. Bloq ⚠️

- Saytda "Bloq" bölməsinin olduğu qeyd olunur. Bloq siyahısının URL-i ❓.
- Məqalə tipli post-lar: `/blog-flayer/`, `/qaime-capi-blog/`, `/cap-metbee-xidmetleri/`, `/bloq-etiket-capi/`, `/kataloq-haqqinda/`, `/cap-isi/`, `/poliqrafiya-sirket/`.
- Məqalələr SEO landing kimi də işləyir. Məsələn, `/cap-metbee-xidmetleri/` niyə ucuz çap etdiklərini A3 vərəqə 6 flayer yerləşdirmə nümunəsi ilə izah edir.

---

## 11. Əlaqə və Haqqımızda ⚠️

- `/bizimle-elaqe/`: ünvan, 2 telefon, e-poçt. Xəritə embed-i və əlaqə forması ❓.
- "Haqqımızda": URL ❓. Ana səhifədə bölmə kimi də ola bilər.

---

## 12. Kontent keyfiyyəti və ziddiyyətlər (klon üçün vacibdir)

| Məsələ | Sübut |
|---|---|
| Flayer 5000 ədəd | 125 AZN (`/flayer-sifarisi/`, `/category/flayer/`) vs 95 AZN (`/cap-metbee-xidmetleri/`) |
| Naxışlı vizitka | Kateqoriyada "350 qr", ~30 AZN. Məhsul səhifəsində 500 q, həm 40 AZN, həm 60 AZN |
| Fincan | 1 ədəd 10 AZN vs "2.90 AZN-dən". Dizayn 5–10 ₼ vs "pulsuz" |
| Ünvan | Nizami Nərimanov 23B vs İbrahimpaşa Dadaşov 52 |
| Məxməri vizitka | Üç səhifə (`/barxad-vizitkart/` ~75 AZN, `/karton-mexmeri-vizitkart/` 99 AZN, `/m%C9%99xm%C9%99ri-vizitkart/` ❓). Fərqli məhsullar ola bilər |
| Dublikat və oxşar səhifələr | Bax: [PAGE_INVENTORY §G](./PAGE_INVENTORY.md#g-dublikat-və-oxşar-səhifə-qrupları) |
| Başlıq formatı | Üç fərqli suffix var, bəzi başlıqlarda "Okprint - Okprint - …" təkrarı (bax: §13) |
| Şablon qalığı | "Prinoz - Printing company & Service Html Template" |

**Qərar:** Klon strukturu və təqdimatı dəqiq təkrarlayır. Kataloq datası isə `verification_status: "index-unverified"` ilə saxlanır və sahibkar təsdiqləyənə qədər belə qalır. Ziddiyyətlər klonda "düzəldilmir", sahibkara sual kimi göndərilir.

---

## 13. SEO müşahidələri

**Müşahidə olunanlar ⚠️**

- **Başlıq formatları:**
  - `Okprint - {Səhifə} - Vizitka sifarişi, Flayer, Buklet, Reklam və mətbəə işləri`
  - `Okprint - {Səhifə} - Ok Print` / `… - OK Print` / `… - OkPrint.az`
  - Suffix-siz: `Okprint - {Səhifə}`
- **Açar sözlərlə zəngin başlıqlar:** "Vizitkart Sifarişi, Karton Vizitkart Çapı, Vizitka Çapı"
- **Slug lüğəti:** `-sifarisi`, `-capi`, `-uzerine-cap`
- **İndekslənmiş tag arxivləri:** zəif (thin) kontentdir. Dublikat səhifələrlə birlikdə açar söz "kannibalizasiyası" riski yaradır.
- **İngiliscə landing:** "Print Services in Baku, Azerbaijan"

**Naməlum olanlar ❓:** meta description, canonical, robots, schema.org JSON-LD, `sitemap.xml` (`/wp-sitemap.xml` və ya `/sitemap_index.xml`), hreflang, OG teqləri, SEO plagini (Yoast və ya RankMath).

**Klon üçün tövsiyələr** (vizuala təsir etmir):

1. **URL pariteti:** sayt əvəz olunacaqsa, bütün slug-lar trailing slash ilə 1:1 saxlanır. Dəyişən URL-lər üçün 301 xəritəsi hazırlanır.
2. Hər səhifədə `canonical` olur. Dublikat qruplar üçün canonical hədəfi sahibkarla seçilir.
3. **JSON-LD:**
   - `LocalBusiness` (ünvan, telefon, iş saatı)
   - `Product` + `Offer` / `AggregateOffer` (tiraj qiymətləri)
   - `BreadcrumbList`
   - `Article`
   - axtarış varsa, `WebSite` + `SearchAction`
4. `sitemap.xml` və `robots.txt` olur. Tag arxivlərinə `noindex` tətbiq etmək təklifdir, qərarı sahibkar verir.
5. Azərbaycanca səhifələrdə `lang="az"`, ingiliscə səhifədə `lang="en"` olur.
6. Şəkillərə alt mətn, sabit `width`/`height` (CLS-in qarşısını almaq üçün) və müasir formatlar (WebP/AVIF) verilir.

---

## 14. Əlçatanlıq (a11y): yoxlama siyahısı

Sayt yoxlanmadığı üçün bunlar yalnız *yoxlanılacaq* bəndlərdir:

- [ ] `<html lang>` dəyəri
- [ ] Mətn və düymə kontrastı (xüsusən qiymət, CTA, footer)
- [ ] Hover ilə açılan dropdown klaviatura və toxunma ilə də açılır (`aria-expanded`)
- [ ] Mobil menyu: fokus tələsi (focus trap), `Esc` ilə bağlanma, `aria-controls`
- [ ] Yalnız ikondan ibarət WhatsApp və telefon düymələrində `aria-label` var
- [ ] Qiymət cədvəlləri əsl `<table>`-dır, `<th scope>` istifadə olunur
- [ ] Şəkillərdə `alt` var
- [ ] Səhifədə bir H1 var, başlıq iyerarxiyası düzgündür
- [ ] Slayder: pauza imkanı var, `prefers-reduced-motion` nəzərə alınır
- [ ] Toxunma hədəfləri WCAG 2.5.8 (≥24×24 px) tələbinə uyğundur
- [ ] Fokus göstəricisi görünür
- [ ] Telefon nömrələri `tel:` linkidir

**Klon siyasəti:** vizual görünüş istinadla eyni qalır. Semantik və ARIA düzəlişləri vizuala təsir etmədən əlavə olunur.

---

## 15. Aktivlər və icazələr 🔒

| Aktiv | Sahibi | Status |
|---|---|---|
| OkPrint loqosu | Sahibkar | 🔒 Fayl və icazə sahibkardan alınmalıdır |
| Məhsul fotoları, banner və slayder şəkilləri | Sahibkar və ya üçüncü tərəf | 🔒 |
| Məhsul təsvirləri və məqalə mətnləri | Sahibkar | 🔒 İcazə ilə istifadə olunur |
| "Prinoz" şablonunun CSS/JS/ikon/illüstrasiyaları | Üçüncü tərəf şablon müəllifi | 🔒 Lisenziya tələb olunur. Kod kopyalanmır, görünüş ölçülərə əsasən yenidən qurulur |
| Şriftlər | ❓ | Google Fonts (OFL) isə istifadəsi sərbəstdir; kommersiya şriftidirsə, lisenziya lazımdır |
| İkon dəsti | ❓ | Font Awesome Free isə CC BY 4.0, OFL və MIT lisenziyaları altındadır; Pro versiya lisenziya tələb edir |
| WhatsApp loqosu | Meta | Meta-nın brend qaydalarına uyğun istifadə olunmalıdır |
| Xəritə embed-i | Google və ya Yandex | Xidmət şərtlərinə (ToS) əsasən |

**Placeholder siyasəti:** icazə gələnə qədər 🔒 şəkillərin yerinə neytral placeholder qoyulur. Onun ölçüsü və aspect-ratio-su istinaddan götürülür.

---

## 16. Analizin növbəti addımları

1. Şəbəkə icazəsi verilir (§1.1) → `capture-reference.mjs` işə salınır.
2. [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)-dəki `TBD` dəyərləri JSON və ekran görüntülərindən doldurulur.
3. [PAGE_INVENTORY.md](./PAGE_INVENTORY.md) `sitemap.xml` ilə tamamlanır (indeks natamamdır).
4. Sahibkardan bunlar alınır: aktivlərə icazə, okprint.az və okeyprint.az arasında seçim, qiymət ziddiyyətlərinin həlli.

---

## Mənbələr (axtarış indeksi, 2026-10-09)

- <https://okprint.az/>
- <https://okprint.az/bizimle-elaqe/>
- <https://okprint.az/okeyprint-az/>
- <https://okprint.az/print-services-in-baku-azerbaijan/>
- <https://okprint.az/dizayn-xidmetleri/>
- <https://okprint.az/promo-mehsullar/>
- <https://okprint.az/category/vizitka-sifarisi/>
- <https://okprint.az/category/flayer/>
- <https://okprint.az/category/buklet-capi/>
- <https://okprint.az/category/other-products/>
- <https://okprint.az/category/rollup/>
- <https://okprint.az/mat-laminasiyali-vizitkart/>
- <https://okprint.az/flayer-sifarisi/>
- <https://okprint.az/buklet-capi/>
- <https://okprint.az/kataloq-capi/>
- <https://okprint.az/plaket-sifarisi-ve-capi/>
- <https://okprint.az/seffaf-stiker/>
- <https://okprint.az/zerf-sifarisi/>
- <https://okprint.az/qovluq-capi-okprint/>
- <https://okprint.az/teqvim-capi/>
- <https://okprint.az/bloknot-bc-m2/>
- <https://okprint.az/fincan-capi/>
- <https://okprint.az/fincan-termos-uzerine-cap-sifarisi/>
- <https://okprint.az/qelem-plastik-5982/>
- <https://okprint.az/medaxil-q%C9%99bzi-2/>
- <https://okprint.az/cap-metbee-xidmetleri/>
- <https://okprint.az/blog-flayer/>
- <https://www.facebook.com/OkPrint.az/>
- <https://www.youtube.com/channel/UCaBGGnULt0IhVArropBOsXw/about>

Tam URL siyahısı: [PAGE_INVENTORY.md](./PAGE_INVENTORY.md).
