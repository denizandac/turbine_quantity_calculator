import type { Turbine, FilterSettings, Scenario, ScenarioItem, TurbineFilterSettings } from '../types'

// Hesaplama için türbin bilgisi (verimlilik uygulanmış)
interface TurbineWithSettings {
  turbine: Turbine
  settings: TurbineFilterSettings
  effectiveCapacity: number // Verimlilik uygulanmış kapasite
}

/**
 * Türbin kombinasyonlarını hesaplar ve senaryoları döndürür
 */
export function calculateScenarios(
  turbines: Turbine[],
  filters: FilterSettings
): Scenario[] {
  const scenarios: Scenario[] = []
  
  // Türbinleri ayarlarıyla birleştir ve filtrele
  const turbinesWithSettings: TurbineWithSettings[] = turbines
    .map(t => {
      const settings = filters.turbineSettings.find(s => s.turbineId === t.id) || getDefaultTurbineSettings(t.id)
      return {
        turbine: t,
        settings,
        effectiveCapacity: t.capacity * (settings.efficiency / 100)
      }
    })
    .filter(t => {
      // Aktif değilse dahil etme
      if (!t.settings.enabled) return false
      
      // Hub yüksekliği kontrolü
      if (filters.minHubHeight !== null && t.turbine.hubHeight < filters.minHubHeight) {
        return false
      }
      if (filters.maxHubHeight !== null && t.turbine.hubHeight > filters.maxHubHeight) {
        return false
      }
      return true
    })

  if (turbinesWithSettings.length === 0) {
    return []
  }

  // Hedef kapasite
  const targetCapacity = filters.targetCapacity
  
  // Tolerans hesaplaması
  const minCapacity = targetCapacity * (1 - filters.tolerancePercent / 100)
  // Hedef aşılmasın seçeneği aktifse maxCapacity = targetCapacity
  const maxCapacity = filters.noExceedTarget 
    ? targetCapacity 
    : targetCapacity * (1 + filters.tolerancePercent / 100)

  // Recursive kombinasyon üreteci
  function generateCombinations(
    index: number,
    currentItems: ScenarioItem[],
    currentCapacity: number,
    currentCount: number
  ) {
    // Maksimum toplam türbin sayısı aşıldı
    if (currentCount > filters.maxTurbineCount) {
      return
    }

    // Kapasite maksimumu aştı
    if (currentCapacity > maxCapacity) {
      return
    }

    // Geçerli bir senaryo mu kontrol et
    if (currentCapacity >= minCapacity && currentCapacity <= maxCapacity) {
      if (currentCount >= filters.minTurbineCount && currentCount <= filters.maxTurbineCount) {
        // Sadece count > 0 olan itemları al
        const validItems = currentItems.filter(item => item.count > 0)
        
        if (validItems.length > 0) {
          const totalTurbines = validItems.reduce((sum, item) => sum + item.count, 0)
          
          scenarios.push({
            id: `scenario-${scenarios.length + 1}`,
            items: validItems.map(item => ({ ...item })),
            totalCapacity: Math.round(currentCapacity * 1000) / 1000,
            totalTurbines,
            difference: Math.round((currentCapacity - targetCapacity) * 1000) / 1000,
            differencePercent: Math.round(((currentCapacity - targetCapacity) / targetCapacity) * 10000) / 100
          })
        }
      }
    }

    // Tüm türbinleri denedik
    if (index >= turbinesWithSettings.length) {
      return
    }

    const tws = turbinesWithSettings[index]
    const { turbine, settings, effectiveCapacity } = tws
    
    // Bu türbin için min/max sayı
    const minForThis = settings.minCount
    const maxForThis = Math.min(
      settings.maxCount,
      filters.maxTurbineCount - currentCount,
      effectiveCapacity > 0 ? Math.ceil((maxCapacity - currentCapacity) / effectiveCapacity) : 0
    )

    // minCount'tan başla
    for (let count = minForThis; count <= maxForThis; count++) {
      const newItems = [...currentItems]
      if (count > 0) {
        const existingIndex = newItems.findIndex(item => item.turbine.id === turbine.id)
        if (existingIndex >= 0) {
          newItems[existingIndex] = { ...newItems[existingIndex], count, effectiveCapacity: effectiveCapacity * count }
        } else {
          newItems.push({ turbine, count, effectiveCapacity: effectiveCapacity * count })
        }
      }
      
      generateCombinations(
        index + 1,
        newItems,
        currentCapacity + effectiveCapacity * count,
        currentCount + count
      )
    }
  }

  // Kombinasyonları üret
  generateCombinations(0, [], 0, 0)

  // Farka göre sırala (hedefe en yakın önce)
  scenarios.sort((a, b) => Math.abs(a.difference) - Math.abs(b.difference))

  // Maksimum senaryo sayısı (1-100 arası, varsayılan 100)
  const maxScenarios = Math.min(Math.max(filters.maxScenarios || 100, 1), 100)
  return scenarios.slice(0, maxScenarios)
}

/**
 * Benzersiz ID üretir
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Türbin için varsayılan ayarlar
 */
export function getDefaultTurbineSettings(turbineId: string): TurbineFilterSettings {
  return {
    turbineId,
    enabled: true,
    efficiency: 100,
    minCount: 0,
    maxCount: 50
  }
}

/**
 * Varsayılan filtre ayarları
 */
export function getDefaultFilters(): FilterSettings {
  return {
    targetCapacity: 100, // 100 MW
    tolerancePercent: 5, // %5 tolerans
    minTurbineCount: 1,
    maxTurbineCount: 50,
    minHubHeight: null,
    maxHubHeight: null,
    turbineSettings: [],
    noExceedTarget: false, // Hedef aşılmasın
    maxScenarios: 100 // Maksimum senaryo sayısı
  }
}
