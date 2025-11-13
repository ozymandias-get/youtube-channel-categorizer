# YouTube Channel Categorizer - Project Summary

Bir Express.js + React uygulaması olarak YouTube kanallarını kategorize etmek için oluşturulmuş kapsamlı bir sistem.

## 🎯 Proje Özellikleri

### Backend (Express.js)
- **Veritabanı**: SQLite (in-memory)
- **Kategoriler**: Custom kategori oluşturma
- **Kanallar**: YouTube kanalları ekleme ve yönetme
- **YouTube API**: OAuth 2.0 entegrasyonu
- **REST API**: Tüm CRUD işlemleri

### Frontend (HTML/JavaScript)
- **Responsive Design**: Mobile-friendly arayüz
- **Real-time Updates**: 5 saniyelik otomatik yenileme
- **Kategori Yönetimi**: Kolay kategori ekleme
- **Kanal Filtreleme**: Kategori bazlı filtreleme
- **Kronolojik Sıralama**: Ekleme tarihi bazlı listeleme

## 📁 Dosya Yapısı

```
youtube-channel-categorizer/
├── server.js                 # Express server ve API endpoints
├── auth-utils.js            # YouTube API utility fonksiyonları
├── package.json             # NPM dependencies
├── .env                     # Ortam değişkenleri
├── .gitignore              # Git ignore rules
├── public/
│   ├── index.html          # Frontend arayüzü
│   └── (static files)
├── src/                     # React component placeholder
├── SETUP_GUIDE.md          # Kurulum kılavuzu
└── PROJECT_SUMMARY.md      # Bu dosya
```

## 🔌 API Endpoints

### Kategoriler
- `GET /api/categories` - Tüm kategorileri listele
- `POST /api/categories` - Yeni kategori oluştur

### Kanallar
- `GET /api/channels/:category_id` - Kategoriye göre kanalları listele
- `POST /api/channels` - Yeni kanal ekle
- `GET /api/all-channels` - Tüm kanalları kronolojik sırada listele

### OAuth
- `GET /auth/google` - Google OAuth akışını başlat
- `GET /auth/google/callback` - OAuth callback
- `GET /api/youtube/my-channels` - Kullanıcının YouTube kanallarını getir

## 🚀 Kurulum ve Çalıştırma

### 1. Gereksinimler
- Node.js 14+
- npm veya yarn
- YouTube Data API v3 (Google Cloud Console'dan)

### 2. Kurulum
```bash
git clone https://github.com/ozymandias-get/youtube-channel-categorizer
cd youtube-channel-categorizer
npm install
```

### 3. Ortam Yapılandırması
```bash
cp .env.example .env
# .env dosyasını YouTube API credentials ile düzenle
```

### 4. Başlatma
```bash
npm start
# http://localhost:3000 adresinde aç
```

## �� YouTube OAuth Setup

1. **Google Cloud Console**'a git
2. Yeni project oluştur
3. YouTube Data API v3'ü enable et
4. OAuth 2.0 credentials (Web application) oluştur
5. Authorized redirect URIs ekle:
   - `http://localhost:3000/auth/google/callback`
   - `https://your-production-domain/auth/google/callback`

## 💾 Veri Depolama

### Categories Table
- `id` (INTEGER PRIMARY KEY)
- `name` (TEXT UNIQUE)
- `created_at` (DATETIME)

### Channels Table
- `id` (INTEGER PRIMARY KEY)
- `channel_id` (TEXT UNIQUE)
- `channel_name` (TEXT)
- `category_id` (INTEGER FK)
- `user_email` (TEXT)
- `added_at` (DATETIME)

## 🎨 Kullanıcı Arayüzü

- **Purple Gradient Tasarımı**: Modern ve kullanıcı dostu
- **Sol Panel**: Kategori ve kanal ekleme
- **Sağ Panel**: Kanalların listelenmesi
- **Responsive Grid**: Mobil ve desktop uyumlu

## 🔧 Teknoloji Stack

- **Runtime**: Node.js
- **Web Framework**: Express.js
- **Database**: SQLite3
- **Authentication**: Passport.js + Google OAuth
- **API Client**: Axios
- **Frontend**: Vanilla JavaScript (React ready)

## 📦 Dependencies

- express
- axios
- cors
- body-parser
- sqlite3
- dotenv
- passport
- passport-google-oauth20
- express-session

## 🎯 Sonraki Adımlar

1. ✅ Backend API yapısı
2. ✅ Frontend arayüzü
3. ✅ OAuth entegrasyonu
4. ⏳ Video listing (category başına)
5. ⏳ Search ve filter
6. ⏳ Export (CSV/JSON)
7. ⏳ User dashboard

## 📝 Notlar

- Database in-memory olarak saklanıyor (production için dosya tabanlı veya cloud DB kullan)
- CORS açık - production'da kısıtla
- Rate limiting eklenmedi - production'da ekle

