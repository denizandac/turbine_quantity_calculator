import { useState, useEffect } from 'react'

// ===== Icons =====
const Icons = {
  Zap: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
  BarChart: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/>
    </svg>
  ),
  Shield: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  Upload: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
  ),
  Settings: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  ),
  Layers: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>
    </svg>
  ),
  ArrowRight: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
    </svg>
  ),
  Wind: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/>
    </svg>
  ),
  Check: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  Play: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5 3 19 12 5 21 5 3"/>
    </svg>
  ),
  Menu: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  ),
  X: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
}

// ===== Navbar Component =====
function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'glass py-3' : 'py-5'
      }`}
    >
      <div className="container flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)] flex items-center justify-center text-black transition-transform group-hover:scale-110">
            <Icons.Wind />
          </div>
          <span className="text-xl font-bold tracking-tight">
            Turbine<span className="text-gradient">Calc</span>
          </span>
        </a>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="nav-link">Özellikler</a>
          <a href="#how-it-works" className="nav-link">Nasıl Çalışır</a>
          <a href="#pricing" className="nav-link">Fiyatlandırma</a>
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-4">
          <button className="btn btn-ghost">Giriş Yap</button>
          <button className="btn btn-primary">
            Ücretsiz Başla
            <Icons.ArrowRight />
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <Icons.X /> : <Icons.Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden glass mt-2 mx-4 rounded-2xl p-6 animate-fade-in">
          <div className="flex flex-col gap-4">
            <a href="#features" className="nav-link text-lg">Özellikler</a>
            <a href="#how-it-works" className="nav-link text-lg">Nasıl Çalışır</a>
            <a href="#pricing" className="nav-link text-lg">Fiyatlandırma</a>
            <div className="divider my-2" />
            <button className="btn btn-secondary w-full">Giriş Yap</button>
            <button className="btn btn-primary w-full">Ücretsiz Başla</button>
          </div>
        </div>
      )}
    </nav>
  )
}

// ===== Hero Section =====
function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center pt-24 pb-16 overflow-hidden bg-noise">
      {/* Background Effects */}
      <div className="glow-orb glow-orb-cyan w-[600px] h-[600px] -top-40 -right-40 animate-float" />
      <div className="glow-orb glow-orb-purple w-[500px] h-[500px] top-1/2 -left-60 animate-float" style={{ animationDelay: '2s' }} />
      <div className="glow-orb glow-orb-pink w-[400px] h-[400px] bottom-0 right-1/4 animate-float" style={{ animationDelay: '4s' }} />
      
      {/* Grid Background */}
      <div className="absolute inset-0 bg-grid opacity-50" />

      <div className="container relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex animate-fade-in-up opacity-0" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
            <span className="badge">
              <span className="w-2 h-2 rounded-full bg-[var(--color-accent-primary)] animate-pulse" />
              Yeni: AI Destekli Optimizasyon
            </span>
          </div>

          {/* Headline */}
          <h1 className="mt-8 text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight animate-fade-in-up opacity-0" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
            Türbin Hesaplamaları<br />
            <span className="text-gradient animate-gradient">Artık Çok Kolay</span>
          </h1>

          {/* Subheadline */}
          <p className="mt-6 text-xl sm:text-2xl text-[var(--color-text-secondary)] max-w-2xl mx-auto animate-fade-in-up opacity-0" style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}>
            Enerji santralleriniz için optimal türbin kombinasyonlarını 
            saniyeler içinde hesaplayın. Binlerce senaryo, tek tıkla.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up opacity-0" style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}>
            <button className="btn btn-primary text-lg px-8 py-4">
              Hemen Başla - Ücretsiz
              <Icons.ArrowRight />
            </button>
            <button className="btn btn-secondary text-lg px-8 py-4 group">
              <span className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mr-2 group-hover:bg-[var(--color-accent-primary)]/20 transition-colors">
                <Icons.Play />
              </span>
              Demo İzle
            </button>
          </div>

          {/* Social Proof */}
          <div className="mt-16 animate-fade-in-up opacity-0" style={{ animationDelay: '500ms', animationFillMode: 'forwards' }}>
            <p className="text-sm text-[var(--color-text-muted)] mb-4">
              Türkiye'nin önde gelen enerji şirketleri tarafından tercih ediliyor
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 opacity-40">
              {['EÜAŞ', 'AYDEM', 'AKSA', 'ZORLU', 'BORUSAN'].map((company, i) => (
                <span 
                  key={company} 
                  className="text-lg font-semibold tracking-wider"
                  style={{ animationDelay: `${600 + i * 100}ms` }}
                >
                  {company}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Hero Visual */}
        <div className="mt-20 relative animate-fade-in-up opacity-0" style={{ animationDelay: '700ms', animationFillMode: 'forwards' }}>
          <div className="glass-card px-4 py-4 sm:px-5 sm:py-5 max-w-5xl mx-auto">
            <div className="relative rounded-[1rem] overflow-hidden bg-[var(--color-bg-secondary)]">
              {/* Mock Dashboard */}
              <div className="px-5 py-6 sm:px-8 sm:py-8">
                {/* Top Bar */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <div className="text-sm font-mono text-[var(--color-text-muted)]">
                    turbinecalc.app/dashboard
                  </div>
                </div>

                {/* Dashboard Content */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Stats Cards */}
                  {[
                    { label: 'Toplam Senaryo', value: '12,847', change: '+23%' },
                    { label: 'Optimal Kombinasyon', value: '156', change: '+12%' },
                    { label: 'Verimlilik', value: '98.7%', change: '+5%' },
                  ].map((stat, i) => (
                    <div key={i} className="px-5 py-4 rounded-xl bg-white/[0.02] border border-white/5">
                      <p className="text-sm text-[var(--color-text-muted)]">{stat.label}</p>
                      <div className="flex items-end justify-between mt-2">
                        <span className="text-2xl font-bold">{stat.value}</span>
                        <span className="text-sm text-green-400">{stat.change}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chart Placeholder */}
                <div className="mt-5 px-5 py-4 rounded-xl bg-white/[0.02] border border-white/5 h-48 flex items-end justify-around gap-2">
                  {[40, 65, 45, 80, 55, 70, 90, 60, 75, 85, 50, 95].map((h, i) => (
                    <div 
                      key={i}
                      className="flex-1 rounded-t bg-gradient-to-t from-[var(--color-accent-primary)]/50 to-[var(--color-accent-secondary)]/50"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Floating Elements */}
          <div className="absolute left-0 lg:left-8 xl:-left-8 top-1/3 glass-card px-5 py-4 animate-float hidden lg:block" style={{ animationDelay: '1s' }}>
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-green-500/20 flex items-center justify-center text-green-400">
                <Icons.Check />
              </div>
              <div>
                <p className="text-sm font-medium">Hesaplama Tamamlandı</p>
                <p className="text-xs text-[var(--color-text-muted)]">847 senaryo analiz edildi</p>
              </div>
            </div>
          </div>

          <div className="absolute right-0 lg:right-8 xl:-right-8 top-2/3 glass-card px-5 py-4 animate-float hidden lg:block" style={{ animationDelay: '2s' }}>
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-[var(--color-accent-primary)]/20 flex items-center justify-center text-[var(--color-accent-primary)]">
                <Icons.Zap />
              </div>
              <div>
                <p className="text-sm font-medium">%23 Daha Verimli</p>
                <p className="text-xs text-[var(--color-text-muted)]">Optimal kombinasyon bulundu</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ===== Features Section =====
function FeaturesSection() {
  const features = [
    {
      icon: <Icons.Zap />,
      title: 'Ultra Hızlı Hesaplama',
      description: 'Binlerce türbin kombinasyonunu saniyeler içinde analiz edin. Güçlü algoritmalarımız en uygun senaryoları anında bulur.',
    },
    {
      icon: <Icons.BarChart />,
      title: 'Detaylı Raporlama',
      description: 'Hesaplama sonuçlarını interaktif grafikler ve görselleştirmelerle inceleyin. Excel\'e kolayca export edin.',
    },
    {
      icon: <Icons.Shield />,
      title: 'Güvenli & Şifreli',
      description: 'Verileriniz end-to-end şifreleme ile korunur. KVKK uyumlu altyapı ile tam güvenlik.',
    },
    {
      icon: <Icons.Upload />,
      title: 'Kolay Veri İçe Aktarma',
      description: 'Excel dosyalarınızı sürükle-bırak ile yükleyin. Türbin verileriniz anında sisteme aktarılsın.',
    },
    {
      icon: <Icons.Settings />,
      title: 'Gelişmiş Filtreler',
      description: 'Hub yüksekliği, kapasite, verimlilik ve daha fazlası için özelleştirilebilir filtreleme seçenekleri.',
    },
    {
      icon: <Icons.Layers />,
      title: 'Çoklu Senaryo',
      description: 'Farklı parametrelerle birden fazla senaryo oluşturun ve karşılaştırmalı analiz yapın.',
    },
  ]

  return (
    <section id="features" className="section bg-noise">
      <div className="glow-orb glow-orb-purple w-[400px] h-[400px] top-0 left-1/4" />
      
      <div className="container relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="badge mb-4">Özellikler</span>
          <h2 className="text-4xl sm:text-5xl font-bold">
            Her Şey <span className="text-gradient">Tek Platformda</span>
          </h2>
          <p className="mt-4 text-lg text-[var(--color-text-secondary)]">
            Türbin hesaplamalarınız için ihtiyacınız olan tüm araçlar, 
            modern ve kullanımı kolay bir arayüzde.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="glass-card px-7 py-8 group"
            >
              <div className="feature-icon">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-[var(--color-text-secondary)] leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ===== Stats Section =====
function StatsSection() {
  const stats = [
    { value: '10M+', label: 'Hesaplanan Senaryo' },
    { value: '500+', label: 'Aktif Kullanıcı' },
    { value: '99.9%', label: 'Uptime' },
    { value: '<1s', label: 'Ortalama Hesaplama' },
  ]

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-accent-primary)]/10 via-[var(--color-accent-secondary)]/10 to-[var(--color-accent-tertiary)]/10" />
      
      <div className="container relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="stat-value">{stat.value}</div>
              <p className="mt-2 text-[var(--color-text-secondary)]">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ===== How It Works Section =====
function HowItWorksSection() {
  const steps = [
    {
      number: '01',
      title: 'Verilerinizi Yükleyin',
      description: 'Excel dosyanızı sürükle-bırak ile yükleyin veya manuel olarak türbin bilgilerini girin.',
    },
    {
      number: '02',
      title: 'Parametreleri Ayarlayın',
      description: 'Hedef kapasite, verimlilik yüzdesi ve türbin sayı limitlerini belirleyin.',
    },
    {
      number: '03',
      title: 'Hesapla & Analiz Et',
      description: 'Tek tıkla binlerce senaryoyu analiz edin ve en uygun kombinasyonu bulun.',
    },
  ]

  return (
    <section id="how-it-works" className="section bg-noise">
      <div className="glow-orb glow-orb-cyan w-[500px] h-[500px] bottom-0 right-0" />
      
      <div className="container relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="badge mb-4">Nasıl Çalışır?</span>
          <h2 className="text-4xl sm:text-5xl font-bold">
            3 Adımda <span className="text-gradient">Optimal Sonuç</span>
          </h2>
          <p className="mt-4 text-lg text-[var(--color-text-secondary)]">
            Karmaşık hesaplamaları basitleştirdik. Birkaç dakikada sonuçlarınıza ulaşın.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--color-border)] to-transparent -translate-y-1/2" />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="glass-card px-7 py-8 text-center lg:text-left">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)] text-2xl font-bold text-black mb-6">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-[var(--color-text-secondary)]">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ===== Pricing Section =====
function PricingSection() {
  const plans = [
    {
      name: 'Başlangıç',
      price: 'Ücretsiz',
      description: 'Bireysel kullanıcılar için',
      features: [
        '100 hesaplama/ay',
        '5 türbin modeli',
        'Temel raporlama',
        'Email desteği',
      ],
      cta: 'Ücretsiz Başla',
      highlighted: false,
    },
    {
      name: 'Profesyonel',
      price: '₺499',
      period: '/ay',
      description: 'Büyüyen ekipler için',
      features: [
        'Sınırsız hesaplama',
        'Sınırsız türbin modeli',
        'Gelişmiş raporlama',
        'Excel export',
        'API erişimi',
        'Öncelikli destek',
      ],
      cta: '14 Gün Ücretsiz Dene',
      highlighted: true,
    },
    {
      name: 'Kurumsal',
      price: 'Özel',
      description: 'Büyük organizasyonlar için',
      features: [
        'Her şey Profesyonel\'de',
        'Özel entegrasyonlar',
        'SLA garantisi',
        'Dedicated hesap yöneticisi',
        'On-premise kurulum',
      ],
      cta: 'İletişime Geç',
      highlighted: false,
    },
  ]

  return (
    <section id="pricing" className="section bg-noise">
      <div className="glow-orb glow-orb-pink w-[400px] h-[400px] top-1/4 left-0" />
      
      <div className="container relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="badge mb-4">Fiyatlandırma</span>
          <h2 className="text-4xl sm:text-5xl font-bold">
            Her Bütçeye <span className="text-gradient">Uygun Plan</span>
          </h2>
          <p className="mt-4 text-lg text-[var(--color-text-secondary)]">
            İhtiyaçlarınıza en uygun planı seçin. İstediğiniz zaman yükseltin veya iptal edin.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`glass-card px-7 py-8 lg:px-8 lg:py-10 relative ${
                plan.highlighted 
                  ? 'border-[var(--color-accent-primary)]/50 scale-105 lg:scale-105' 
                  : ''
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 text-sm font-medium bg-gradient-to-r from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)] text-black rounded-full">
                    En Popüler
                  </span>
                </div>
              )}
              
              <h3 className="text-xl font-semibold">{plan.name}</h3>
              <p className="text-[var(--color-text-muted)] text-sm mt-1">{plan.description}</p>
              
              <div className="mt-6 mb-8">
                <span className="text-4xl font-bold">{plan.price}</span>
                {plan.period && <span className="text-[var(--color-text-muted)]">{plan.period}</span>}
              </div>
              
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-[var(--color-text-secondary)]">
                    <span className="text-[var(--color-accent-primary)]"><Icons.Check /></span>
                    {feature}
                  </li>
                ))}
              </ul>
              
              <button className={`btn w-full ${plan.highlighted ? 'btn-primary' : 'btn-secondary'}`}>
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ===== CTA Section =====
function CTASection() {
  return (
    <section className="section">
      <div className="container">
        <div className="glass-card px-8 py-12 lg:px-16 lg:py-16 text-center relative overflow-hidden">
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-accent-primary)]/20 via-transparent to-[var(--color-accent-secondary)]/20" />
          
          {/* Animated Orb */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[var(--color-accent-primary)]/10 to-[var(--color-accent-secondary)]/10 animate-morph" />
          
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              Türbin Hesaplamalarınızı<br />
              <span className="text-gradient">Hemen Optimize Edin</span>
            </h2>
            <p className="text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto mb-8">
              14 gün ücretsiz deneyin. Kredi kartı gerekmez.
              İstediğiniz zaman iptal edebilirsiniz.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="btn btn-primary text-lg px-8 py-4">
                Ücretsiz Denemeyi Başlat
                <Icons.ArrowRight />
              </button>
              <button className="btn btn-secondary text-lg px-8 py-4">
                Satış Ekibiyle Konuş
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ===== Footer =====
function Footer() {
  return (
    <footer className="py-12 border-t border-[var(--color-border)]">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <a href="#" className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)] flex items-center justify-center text-black">
                <Icons.Wind />
              </div>
              <span className="text-xl font-bold">TurbineCalc</span>
            </a>
            <p className="text-sm text-[var(--color-text-muted)]">
              Enerji santralleri için akıllı türbin hesaplama platformu.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">Ürün</h4>
            <ul className="space-y-2 text-sm text-[var(--color-text-muted)]">
              <li><a href="#" className="hover:text-[var(--color-accent-primary)] transition-colors">Özellikler</a></li>
              <li><a href="#" className="hover:text-[var(--color-accent-primary)] transition-colors">Fiyatlandırma</a></li>
              <li><a href="#" className="hover:text-[var(--color-accent-primary)] transition-colors">API</a></li>
              <li><a href="#" className="hover:text-[var(--color-accent-primary)] transition-colors">Entegrasyonlar</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Şirket</h4>
            <ul className="space-y-2 text-sm text-[var(--color-text-muted)]">
              <li><a href="#" className="hover:text-[var(--color-accent-primary)] transition-colors">Hakkımızda</a></li>
              <li><a href="#" className="hover:text-[var(--color-accent-primary)] transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-[var(--color-accent-primary)] transition-colors">Kariyer</a></li>
              <li><a href="#" className="hover:text-[var(--color-accent-primary)] transition-colors">İletişim</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Yasal</h4>
            <ul className="space-y-2 text-sm text-[var(--color-text-muted)]">
              <li><a href="#" className="hover:text-[var(--color-accent-primary)] transition-colors">Gizlilik Politikası</a></li>
              <li><a href="#" className="hover:text-[var(--color-accent-primary)] transition-colors">Kullanım Şartları</a></li>
              <li><a href="#" className="hover:text-[var(--color-accent-primary)] transition-colors">KVKK</a></li>
            </ul>
          </div>
        </div>

        <div className="divider mb-8" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-[var(--color-text-muted)]">
          <p>© 2026 TurbineCalc. Tüm hakları saklıdır.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-[var(--color-accent-primary)] transition-colors">Twitter</a>
            <a href="#" className="hover:text-[var(--color-accent-primary)] transition-colors">LinkedIn</a>
            <a href="#" className="hover:text-[var(--color-accent-primary)] transition-colors">GitHub</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

// ===== Main Landing Page Component =====
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)]">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <StatsSection />
      <HowItWorksSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </div>
  )
}

