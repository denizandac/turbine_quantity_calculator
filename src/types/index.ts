// Türbin veri tipi
export interface Turbine {
  id: string
  brand: string
  model: string
  capacity: number // MW cinsinden
  bladeWidth: number // metre cinsinden
  hubHeight: number // metre cinsinden
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
  targetCapacity: number // Hedef toplam kapasite (MW)
  tolerancePercent: number // Tolerans yüzdesi (eksik/fazla MW için)
  minTurbineCount: number // Minimum toplam türbin sayısı
  maxTurbineCount: number // Maksimum toplam türbin sayısı
  minHubHeight: number | null // Minimum hub yüksekliği (null = filtre yok)
  maxHubHeight: number | null // Maksimum hub yüksekliği (null = filtre yok)
  turbineSettings: TurbineFilterSettings[] // Türbin başına ayarlar
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

// Wizard adımları
export type WizardStep = 'turbines' | 'filters' | 'results'

// Excel'den okunan ham veri
export interface ExcelTurbineRow {
  brand?: string
  model?: string
  capacity?: number
  bladeWidth?: number
  hubHeight?: number
}
