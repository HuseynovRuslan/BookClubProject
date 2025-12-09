# Problem Diaqnostikası - Məlumat Toplama

Komanda yoldaşları, aşağıdakı məlumatları toplayın və paylaşın:

## 1. `.env` faylının məzmunu

**Terminal-da:**
```bash
cd C:\Users\HP\Desktop\BookDemo
type .env
```

Və ya `.env` faylını açın və **tam məzmununu** kopyalayın (bütün sətirləri, boşluqları daxil olmaqla).

---

## 2. Browser Console-da environment variable dəyəri

1. Frontend-i işə salın (`npm run dev`)
2. Browser-da açın: `http://localhost:5173`
3. **F12** basın (Developer Tools)
4. **Console** tab-ına keçin
5. Aşağıdakı kodu yazın və **Enter** basın:

```javascript
console.log("API_BASE_URL:", import.meta.env.VITE_API_BASE_URL);
console.log("USE_API_MOCKS:", import.meta.env.VITE_USE_API_MOCKS);
console.log("All env vars:", import.meta.env);
```

6. Nəticəni screenshot və ya kopyalayın

---

## 3. Network Tab-da Request URL-ləri

1. Browser-da **F12** basın
2. **Network** tab-ına keçin
3. Səhifəni yeniləyin (F5)
4. Xəta verən request-ləri tapın (qırmızı olanlar)
5. Onların **Request URL**-lərini kopyalayın

Məsələn:
- `:7050/api/Users/me/shelves` ❌ (yanlış - protokol yoxdur)
- `https://localhost:7050/api/Users/me/shelves` ✅ (düzgün)

---

## 4. Backend Status

Backend işləyir?

1. Browser-da açın: `https://localhost:7050/swagger`
2. Swagger UI açılır? (Bəli/Xeyr)
3. Əgər açılmır, backend console-da xəta var?

---

## 5. `config.js` faylının məzmunu

**Terminal-da:**
```bash
cd C:\Users\HP\Desktop\BookDemo
type src\api\config.js
```

Və ya `src/api/config.js` faylını açın və **ilk 10 sətiri** kopyalayın (API_BASE_URL-in təyin olunduğu hissəni).

---

## 6. Frontend Console Xətaları

Browser Console-da (F12) **bütün qırmızı xətaları** kopyalayın və paylaşın.

Xüsusilə:
- `ERR_CONNECTION_REFUSED` xətaları
- `Failed to fetch` xətaları
- URL-lərdə protokol (`https://`) olub-olmadığı

---

## 7. Vite Server Log-ları

Frontend terminal-da (npm run dev) **ilk 5-10 sətiri** kopyalayın.

---

## 8. `.env` faylının yeri

`.env` faylı harada yerləşir?

```bash
cd C:\Users\HP\Desktop\BookDemo
dir .env
```

Faylın tam path-ini paylaşın.

---

## 9. Frontend-i yenidən başlatdınızmı?

`.env` faylını yaratdıqdan/dəyişdirdikdən sonra:
- Frontend-i **tamamilə** bağladınızmı? (Ctrl+C)
- Yenidən başlatdınızmı? (`npm run dev`)

**Qeyd:** Vite environment variables-ı yalnız server başladıqda yüklənir!

---

## 10. Package.json və Node Version

```bash
node --version
npm --version
```

Və `package.json` faylının məzmununu paylaşın.

---

## Paylaşmaq üçün format

Aşağıdakı formatda paylaşın:

```
1. .env məzmunu:
[buraya .env məzmunu]

2. Browser console nəticəsi:
[buraya console.log nəticəsi]

3. Network request URL-ləri:
[buraya URL-lər]

4. Backend status:
[Swagger açılır? Bəli/Xeyr]

5. config.js (ilk 10 sətir):
[buraya kod]

6. Console xətaları:
[buraya xətalar]

7. Vite server log:
[buraya log]

8. .env faylının yeri:
[buraya path]

9. Yenidən başlatdınızmı?
[Bəli/Xeyr]

10. Node version:
[buraya version]
```

---

**Qeyd:** Bu məlumatlar yalnız problemi anlamaq üçündür. Heç bir faylı dəyişdirməyin!





