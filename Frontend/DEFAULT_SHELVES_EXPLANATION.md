# Default Shelves İzahı / Explanation

## 📚 Default Shelf-lər Nədir?

Backend-də **3 default shelf** avtomatik yaradılır:

1. **"Want to Read"** - Oxumaq istədiyiniz kitablar
2. **"Currently Reading"** - Hal-hazırda oxuduğunuz kitablar  
3. **"Read"** - Oxuduğunuz kitablar

## 🔄 Necə İşləyir?

### **1. Avtomatik Yaradılma:**
- İlk dəfə `UpdateBookStatus` endpoint-i çağırılanda
- Backend avtomatik olaraq 3 default shelf yaradır
- Hər istifadəçi üçün ayrı-ayrı

### **2. İdarəetmə:**
- ❌ **"Add to Shelf" button-u ilə əlavə edilə bilməz**
- ✅ **Yalnız `UpdateBookStatus` endpoint-i ilə idarə olunur**
- Endpoint: `POST /api/books/{bookId}/status?targetShelfName=Read`

### **3. Məntiq:**
```csharp
// Backend kodundan:
if (shelf.IsDefault)
    return Result.Fail(ShelfErrors.DefaultShelfAddDenied(shelf.Name));
```

**Səbəb:** Default shelf-lər kitabın **status**-unu təmsil edir, sadə kolleksiya deyil.

## 🎯 Fərq Nədir?

### **Default Shelf-lər:**
- ✅ Avtomatik yaradılır
- ✅ Kitabın statusunu göstərir
- ✅ Yalnız `UpdateBookStatus` ilə dəyişilir
- ✅ Hər kitab yalnız bir default shelf-də ola bilər
- ✅ "Add to Shelf" ilə əlavə edilə bilməz

### **Custom Shelf-lər:**
- ✅ İstifadəçi yaradır
- ✅ İstənilən ad verilə bilər
- ✅ "Add to Shelf" button-u ilə əlavə edilir
- ✅ Bir kitab bir neçə custom shelf-də ola bilər
- ✅ Məqsəd: Kolleksiya, mövzu, və s.

## 💡 Niyə Belə?

**Goodreads modeli:**
- Default shelf-lər = Kitabın **statusu** (oxuyuram, oxudum, oxumaq istəyirəm)
- Custom shelf-lər = **Kolleksiyalar** (Favorilər, Fantastika, və s.)

**Məsələn:**
- Bir kitab yalnız **bir status** ola bilər: "Read" VƏ ya "Want to Read"
- Amma bir kitab **bir neçə kolleksiyada** ola bilər: "Favorilər" + "Fantastika" + "Qış oxu"

## 🔧 Frontend-də Nə Etdik?

### **1. Default Shelf-ləri Gizlətdik:**
```javascript
shelves.filter((shelf) => !shelf.isDefault)
// Yalnız custom shelf-lər dropdown-da görünür
```

### **2. İzahat Mesajı:**
```jsx
💡 Default shelves (Read, Want to Read, etc.) 
   are managed through book status updates, 
   not manual addition.
```

### **3. Error Handling:**
```javascript
if (status === 409 && errorCode === 'Shelf.DefaultShelfAddDenied') {
  errorMessage = 'Cannot add books to default shelves. 
                 Use "Update Book Status" instead.';
}
```

## 📋 İstifadə Nümunələri

### **Default Shelf-lərə Kitab Əlavə Etmək:**
```javascript
// ❌ Bu işləməz:
await addBookToShelf(shelfId, bookId); // 409 error

// ✅ Bu işləyir:
await axiosClient.post(`/books/${bookId}/status`, null, {
  params: { targetShelfName: 'Read' }
});
```

### **Custom Shelf-ə Kitab Əlavə Etmək:**
```javascript
// ✅ Bu işləyir:
await addBookToShelf(customShelfId, bookId);
```

## 🎨 UI-da Görünüş

### **"Add to Shelf" Dropdown:**
```
┌─────────────────────────────┐
│ Choose a shelf              │
├─────────────────────────────┤
│ My Favorites       12 books │ ← Custom shelf ✅
│ Sci-Fi Collection   5 books │ ← Custom shelf ✅
│ Fantasy Reads       8 books │ ← Custom shelf ✅
├─────────────────────────────┤
│ 💡 About Default Shelves    │
│ Default shelves like "Read",│
│ "Want to Read" are managed │
│ through book status updates │
└─────────────────────────────┘
```

**Görünməyən:**
- ❌ "Read" (default)
- ❌ "Want to Read" (default)
- ❌ "Currently Reading" (default)

## 🔮 Gələcək Təkmilləşdirmələr

### **1. Book Status Update UI:**
```jsx
// BookDetailsPage-də əlavə edilə bilər:
<button onClick={() => updateBookStatus('Read')}>
  Mark as Read
</button>
<button onClick={() => updateBookStatus('Want to Read')}>
  Want to Read
</button>
```

### **2. Status Indicator:**
```jsx
// BookCard-da göstərilə bilər:
{shelf.isDefault && (
  <span className="badge">Status: {shelf.name}</span>
)}
```

## ✅ Nəticə

**Default shelf-lər:**
- 📊 Kitabın **statusu**nu təmsil edir
- 🔄 Avtomatik idarə olunur
- 🚫 "Add to Shelf" ilə əlavə edilə bilməz
- ✅ `UpdateBookStatus` endpoint-i ilə idarə olunur

**Custom shelf-lər:**
- 📚 İstifadəçinin **kolleksiyaları**dır
- ✏️ İstifadəçi yaradır və idarə edir
- ✅ "Add to Shelf" ilə əlavə edilir
- 🎯 Məqsəd: Kitabları təşkil etmək

---

**İndi anladınız? Default shelf-lər status, custom shelf-lər kolleksiyadır!** 📖✨
