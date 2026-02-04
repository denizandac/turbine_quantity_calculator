// Web Worker for turbine scenario calculations
import type { Turbine, FilterSettings, Scenario, ScenarioItem } from '../types'

// Worker message types
interface WorkerInput {
  turbines: Turbine[]
  filters: FilterSettings
}

interface WorkerOutput {
  type: 'progress' | 'complete' | 'error'
  progress?: number
  scenarios?: Scenario[]
  error?: string
}

/**
 * Türbin kombinasyonlarını hesaplar ve senaryoları döndürür
 */
function calculateScenarios(
  turbines: Turbine[],
  filters: FilterSettings,
  onProgress: (progress: number) => void
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
  const maxCapacity = filters.noExceedTarget 
    ? targetCapacity 
    : targetCapacity * (1 + filters.tolerancePercent / 100)

  // Her türbin için max count
  const maxCountPerTurbine = Math.min(filters.maxTurbineCount, 20) // Limit per turbine

  let totalCombinations = 0
  let processedCombinations = 0

  // Tahmini kombinasyon sayısı (kaba hesap)
  const estimatedTotal = Math.pow(Math.min(maxCountPerTurbine, 10), Math.min(turbines.length, 5))

  // Recursive kombinasyon üreteci
  function generateCombinations(
    index: number,
    currentItems: ScenarioItem[],
    currentCapacity: number,
    currentCount: number
  ): boolean {
    // Her 1000 kombinasyonda progress güncelle
    processedCombinations++
    if (processedCombinations % 1000 === 0) {
      const progress = Math.min(95, (processedCombinations / estimatedTotal) * 100)
      onProgress(progress)
    }

    // Maksimum senaryo sayısına ulaştıysak dur
    if (scenarios.length >= filters.maxScenarios) {
      return true // Stop
    }

    // Maksimum toplam türbin sayısı aşıldı
    if (currentCount > filters.maxTurbineCount) {
      return false
    }

    // Kapasite maksimumu aştı
    if (currentCapacity > maxCapacity) {
      return false
    }

    // Geçerli bir senaryo mu kontrol et
    if (currentCapacity >= minCapacity && currentCapacity <= maxCapacity) {
      if (currentCount >= filters.minTurbineCount && currentCount <= filters.maxTurbineCount) {
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

          // Yeterli senaryo bulundu
          if (scenarios.length >= filters.maxScenarios) {
            return true
          }
        }
      }
    }

    // Tüm türbinleri denedik
    if (index >= turbines.length) {
      return false
    }

    const turbine = turbines[index]
    const effectiveCapacityPerUnit = turbine.capacity * efficiency
    
    // Bu türbin için max sayı - optimizasyon için sınırla
    const maxForThis = Math.min(
      maxCountPerTurbine,
      filters.maxTurbineCount - currentCount,
      effectiveCapacityPerUnit > 0 ? Math.ceil((maxCapacity - currentCapacity) / effectiveCapacityPerUnit) + 1 : 0
    )

    // 0'dan başla
    for (let count = 0; count <= maxForThis; count++) {
      const newItems = [...currentItems]
      if (count > 0) {
        newItems.push({ 
          turbine, 
          count, 
          effectiveCapacity: effectiveCapacityPerUnit * count 
        })
      }
      
      const shouldStop = generateCombinations(
        index + 1,
        newItems,
        currentCapacity + effectiveCapacityPerUnit * count,
        currentCount + count
      )

      if (shouldStop) {
        return true
      }
    }

    return false
  }

  // Kombinasyonları üret
  generateCombinations(0, [], 0, 0)

  // Farka göre sırala (hedefe en yakın önce)
  scenarios.sort((a, b) => Math.abs(a.difference) - Math.abs(b.difference))

  return scenarios.slice(0, filters.maxScenarios)
}

// Worker message handler
self.onmessage = (e: MessageEvent<WorkerInput>) => {
  const { turbines, filters } = e.data
  
  try {
    const scenarios = calculateScenarios(turbines, filters, (progress) => {
      self.postMessage({ type: 'progress', progress } as WorkerOutput)
    })
    
    self.postMessage({ 
      type: 'complete', 
      scenarios,
      progress: 100 
    } as WorkerOutput)
  } catch (error) {
    self.postMessage({ 
      type: 'error', 
      error: error instanceof Error ? error.message : 'Hesaplama hatası' 
    } as WorkerOutput)
  }
}

