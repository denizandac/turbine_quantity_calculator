# TurbineCalc - Enerji Santrali Türbin Hesaplayıcı

## Proje Hakkında

TurbineCalc, enerji santralleri için optimal türbin kombinasyonlarını hesaplayan modern bir web uygulamasıdır. Güçlü algoritmalar kullanarak binlerce senaryoyu analiz eder ve en uygun türbin kombinasyonlarını sunar.

## Özellikler

### 🚀 Temel Özellikler
- **Hızlı Hesaplama**: Binlerce senaryoyu saniyeler içinde analiz edin
- **Akıllı Filtreleme**: Hub yüksekliği, kapasite, verimlilik ve daha fazlasına göre gelişmiş filtreleme
- **Detaylı Raporlama**: Hesaplama sonuçlarını detaylı raporlar ve görselleştirmelerle görüntüleyin
- **Excel İçe Aktarma**: Türbin verilerinizi Excel dosyasından kolayca içe aktarın
- **Güvenli Veri**: Verileriniz şifrelenmiş ve güvenli bir şekilde saklanır

### 📊 Hesaplama Özellikleri
- Çok bilinmeyenli denklem çözümü ile senaryo üretimi
- Verimlilik ve hata payı hesaplamaları
- Minimum/maksimum türbin sayısı limitleri
- Hub yüksekliği ve toplam sayı filtreleri
- Eksik/fazla MW filtreleme seçenekleri

### 🎨 Kullanıcı Arayüzü
- Modern SaaS tasarımı
- Responsive ve mobil uyumlu
- Scroll animasyonları
- Smooth transitions ve hover efektleri
- Glassmorphism ve gradient tasarım

## Teknolojiler

- **Frontend Framework**: React 19 + TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 4 + Sass
- **Database**: Supabase (Serverless)
- **Deployment**: Vercel
- **File Processing**: XLSX (Excel dosya işleme)

## Proje Yapısı

```
turbine_quantity_calculator/
├── src/
│   ├── components/          # React bileşenleri
│   ├── lib/                 # Kütüphane yapılandırmaları
│   ├── utils/               # Yardımcı fonksiyonlar
│   ├── App.tsx              # Ana uygulama bileşeni
│   ├── main.tsx             # Uygulama giriş noktası
│   └── style.scss           # Global stiller (Sass)
├── public/                  # Statik dosyalar
├── dist/                    # Build çıktısı
├── package.json             # Bağımlılıklar
├── vite.config.ts           # Vite yapılandırması
├── tailwind.config.js       # Tailwind yapılandırması
├── postcss.config.js        # PostCSS yapılandırması
└── README.md                # Bu dosya
```

## Kurulum

### Gereksinimler
- Node.js 18+ 
- npm veya yarn

### Adımlar

1. **Bağımlılıkları yükleyin:**
```bash
npm install
```

2. **Environment variables oluşturun:**
`.env` dosyası oluşturun ve Supabase bilgilerinizi ekleyin:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. **Geliştirme sunucusunu başlatın:**
```bash
npm run dev
```
Uygulama `http://localhost:7777` adresinde çalışacaktır.

4. **Production build:**
```bash
npm run build
```

## Kullanım

### Temel İş Akışı

1. **Türbin Verilerini Yükleyin**
   - Excel dosyası yükleyerek türbin verilerinizi içe aktarın
   - Veya manuel olarak türbin bilgilerini girin

2. **Parametreleri Ayarlayın**
   - Hedef kapasiteyi belirleyin (örn: 10 MW)
   - Verimlilik yüzdesini ayarlayın (varsayılan: 100%)
   - Türbin sayı limitlerini belirleyin (min/max)

3. **Gelişmiş Filtreler**
   - Hub yüksekliği aralığı
   - Toplam türbin sayısı aralığı
   - İzin verilen türbin modelleri
   - Eksik/fazla MW filtreleme

4. **Hesaplama ve Sonuçlar**
   - Hesapla butonuna tıklayın
   - Senaryoları analiz edin
   - En uygun kombinasyonu seçin

## Supabase Kurulumu

### Veritabanı Tablosu

```sql
create table turbines (
  id uuid default gen_random_uuid() primary key,
  brand text not null,
  model text not null,
  capacity numeric not null,
  blade_width numeric not null,
  hub_height numeric not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

### Row Level Security (RLS)

```sql
alter table turbines enable row level security;

create policy "Herkes turbines tablosunu okuyabilir" on turbines
  for select using (true);

create policy "Herkes turbines tablosuna yazabilir" on turbines
  for insert with check (true);

create policy "Herkes turbines tablosunu güncelleyebilir" on turbines
  for update using (true);

create policy "Herkes turbines tablosundan silebilir" on turbines
  for delete using (true);
```

## Deployment

### Vercel'e Deploy

1. Projeyi GitHub'a push edin
2. Vercel'e giriş yapın ve projeyi import edin
3. Environment variables ekleyin:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy edin!

Vercel otomatik olarak:
- Build komutunu çalıştırır (`npm run build`)
- `dist` klasörünü deploy eder
- Framework'ü otomatik algılar (Vite)

## Geliştirme

### Port Yapılandırması
Uygulama varsayılan olarak `7777` portunda çalışır. `vite.config.ts` dosyasından değiştirilebilir.

### Stil Geliştirme
- Sass kullanılıyor (`src/style.scss`)
- Tailwind CSS utility classes
- Custom mixins ve variables

### Kod Yapısı
- TypeScript ile tip güvenliği
- Component-based architecture
- Utility functions ayrı dosyalarda
- Type definitions merkezi olarak yönetiliyor

## Lisans

Bu proje özel bir projedir.

## İletişim

Sorularınız veya önerileriniz için lütfen iletişime geçin.
