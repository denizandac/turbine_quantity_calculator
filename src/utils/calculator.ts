import type { Turbine, FilterSettings, Scenario, ScenarioItem } from '../types'
import { getCapacityRange } from '../data/turbines'

/**
 * Türbin kombinasyonlarını hesaplar ve senaryoları döndürür
 */
export function calculateScenarios(
  turbines: Turbine[],
  filters: FilterSettings
): Scenario[] {
  const scenarios: Scenario[] = []
  
  if (turbines.length === 0) {
    return []
  }

  // Global verimlilik
  const efficiency = filters.efficiency / 100

  // Hedef kapasite
  const targetCapacity = filters.targetCapacity
  
  // Tolerans hesaplaması
  const minCapacity = targetCapacity * (1 - filters.tolerancePercent / 100)
  // Hedef aşılmasın seçeneği aktifse maxCapacity = targetCapacity
  const maxCapacity = filters.noExceedTarget 
    ? targetCapacity 
    : targetCapacity * (1 + filters.tolerancePercent / 100)

  // Her türbin için max count (maxTurbineCount'a kadar)
  const maxCountPerTurbine = filters.maxTurbineCount

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
    if (index >= turbines.length) {
      return
    }

    const turbine = turbines[index]
    const effectiveCapacityPerUnit = turbine.capacity * efficiency
    
    // Bu türbin için max sayı
    const maxForThis = Math.min(
      maxCountPerTurbine,
      filters.maxTurbineCount - currentCount,
      effectiveCapacityPerUnit > 0 ? Math.ceil((maxCapacity - currentCapacity) / effectiveCapacityPerUnit) : 0
    )

    // 0'dan başla (türbini kullanmayabilir)
    for (let count = 0; count <= maxForThis; count++) {
      const newItems = [...currentItems]
      if (count > 0) {
        newItems.push({ 
          turbine, 
          count, 
          effectiveCapacity: effectiveCapacityPerUnit * count 
        })
      }
      
      generateCombinations(
        index + 1,
        newItems,
        currentCapacity + effectiveCapacityPerUnit * count,
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
 * Varsayılan filtre ayarları
 */
export function getDefaultFilters(): FilterSettings {
  const capacityRange = getCapacityRange()
  
  return {
    selectedBrands: [],
    selectedModels: [],
    minCapacity: capacityRange.min,
    maxCapacity: capacityRange.max,
    targetCapacity: 100, // 100 MW
    tolerancePercent: 5, // %5 tolerans
    minTurbineCount: 1,
    maxTurbineCount: 50,
    efficiency: 100, // %100 verimlilik
    noExceedTarget: false, // Hedef aşılmasın
    maxScenarios: 100 // Maksimum senaryo sayısı
  }
}
