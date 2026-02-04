// Türbin veri tipi
export interface Turbine {
  id: string
  brand: string
  model: string
  capacity: number // MW cinsinden
  bladeWidth?: number // metre cinsinden (opsiyonel)
  hubHeight?: number // metre cinsinden (opsiyonel)
}

// Türbin başına filtre ayarları
export interface TurbineFilterSettings {
  turbineId: string
  enabled: boolean // Bu türbin hesaplamaya dahil mi
  efficiency: number // Verimlilik yüzdesi (0-100)
  minCount: number // Minimum adet
  maxCount: number // Maksimum adet
}

// Genel filtre/beklenti ayarları
export interface FilterSettings {
  // Marka ve Model filtreleri
  selectedBrands: string[]
  selectedModels: string[]
  
  // Kapasite filtreleri
  minCapacity: number
  maxCapacity: number
  
  // Hedef ve tolerans
  targetCapacity: number // Hedef toplam kapasite (MW)
  tolerancePercent: number // Tolerans yüzdesi (eksik/fazla MW için)
  
  // Türbin sayısı limitleri
  minTurbineCount: number // Minimum toplam türbin sayısı
  maxTurbineCount: number // Maksimum toplam türbin sayısı
  
  // Türbin başına ayarlar
  turbineSettings: TurbineFilterSettings[]
  
  // Ek seçenekler
  noExceedTarget: boolean // Hedef kapasiteyi aşma (true = sadece hedef altı)
  maxScenarios: number // Maksimum senaryo sayısı (1-100)
}

// Senaryo sonucu - her bir türbinden kaç tane kullanılacağı
export interface ScenarioItem {
  turbine: Turbine
  count: number
  effectiveCapacity: number // Verimlilik uygulanmış kapasite
}

// Hesaplama sonucu senaryosu
export interface Scenario {
  id: string
  items: ScenarioItem[]
  totalCapacity: number // Toplam MW (verimlilik uygulanmış)
  totalTurbines: number // Toplam türbin sayısı
  difference: number // Hedeften fark (+ fazla, - eksik)
  differencePercent: number // Fark yüzdesi
}

// Wizard adımları (artık 2 adım)
export type WizardStep = 'filters' | 'results'
