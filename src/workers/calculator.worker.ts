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

// Timeout süresi (ms) - 30 saniye
const CALCULATION_TIMEOUT = 30000

/**
 * Türbin kombinasyonlarını hesaplar ve senaryoları döndürür
 */
function calculateScenarios(
  turbines: Turbine[],
  filters: FilterSettings,
  onProgress: (progress: number) => void
): Scenario[] {
  const scenarios: Scenario[] = []
  const startTime = Date.now()
  
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

  console.log('Calculation params:', { 
    turbineCount: turbines.length, 
    targetCapacity, 
    minCapacity, 
    maxCapacity,
    efficiency 
  })

  // Türbinleri kapasiteye göre büyükten küçüğe sırala
  const sortedTurbines = [...turbines].sort((a, b) => b.capacity - a.capacity)
  
  // Her türbin için efektif kapasite hesapla
  const turbineData = sortedTurbines.map(t => ({
    turbine: t,
    effectiveCapacity: t.capacity * efficiency,
    // Bu türbinden maksimum kaç adet kullanılabilir
    maxCount: Math.min(
      filters.maxTurbineCount,
      t.capacity * efficiency > 0 
        ? Math.ceil(maxCapacity / (t.capacity * efficiency)) + 1
        : 0
    )
  }))

  let processedCombinations = 0
  let lastProgressUpdate = 0

  // Recursive kombinasyon üreteci
  function generateCombinations(
    index: number,
    currentItems: ScenarioItem[],
    currentCapacity: number,
    currentCount: number
  ): boolean {
    // Timeout kontrolü
    if (Date.now() - startTime > CALCULATION_TIMEOUT) {
      return true
    }

    processedCombinations++
    
    // Her 10000 kombinasyonda progress güncelle
    if (processedCombinations - lastProgressUpdate > 10000) {
      lastProgressUpdate = processedCombinations
      const elapsedTime = Date.now() - startTime
      const progress = Math.min(90, (elapsedTime / CALCULATION_TIMEOUT) * 100)
      onProgress(progress)
    }

    // Maksimum senaryo sayısına ulaştıysak dur
    if (scenarios.length >= filters.maxScenarios) {
      return true
    }

    // BUDAMA: Maksimum türbin sayısı aşıldı
    if (currentCount > filters.maxTurbineCount) {
      return false
    }

    // BUDAMA: Kapasite maksimumu aştı
    if (currentCapacity > maxCapacity + 0.001) {
      return false
    }

    // Geçerli bir senaryo mu kontrol et
    if (currentCapacity >= minCapacity - 0.001 && currentCapacity <= maxCapacity + 0.001) {
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

          if (scenarios.length >= filters.maxScenarios) {
            return true
          }
        }
      }
    }

    // Tüm türbinleri denedik
    if (index >= turbineData.length) {
      return false
    }

    const data = turbineData[index]
    const { turbine, effectiveCapacity, maxCount } = data
    
    // Bu türbin için maksimum adet
    const maxForThis = Math.min(
      maxCount,
      filters.maxTurbineCount - currentCount,
      effectiveCapacity > 0 ? Math.ceil((maxCapacity - currentCapacity) / effectiveCapacity) + 1 : 0
    )

    // 0'dan başla (bu türbini kullanmama dahil)
    for (let count = 0; count <= maxForThis; count++) {
      const newCapacity = currentCapacity + effectiveCapacity * count
      
      // BUDAMA: Eğer kapasite zaten aşıldıysa daha fazla eklemenin anlamı yok
      if (newCapacity > maxCapacity + 0.001) {
        break
      }

      const newItems = count > 0 
        ? [...currentItems, { turbine, count, effectiveCapacity: effectiveCapacity * count }]
        : currentItems
      
      const shouldStop = generateCombinations(
        index + 1,
        newItems,
        newCapacity,
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

  console.log('Found scenarios:', scenarios.length)

  // Farka göre sırala (hedefe en yakın önce)
  scenarios.sort((a, b) => Math.abs(a.difference) - Math.abs(b.difference))

  return scenarios.slice(0, filters.maxScenarios)
}

// Worker message handler
self.onmessage = (e: MessageEvent<WorkerInput>) => {
  const { turbines, filters } = e.data
  
  console.log('Worker received:', { turbineCount: turbines.length, filters })
  
  try {
    const scenarios = calculateScenarios(turbines, filters, (progress) => {
      self.postMessage({ type: 'progress', progress } as WorkerOutput)
    })
    
    console.log('Worker sending results:', scenarios.length)
    
    self.postMessage({ 
      type: 'complete', 
      scenarios,
      progress: 100 
    } as WorkerOutput)
  } catch (error) {
    console.error('Worker error:', error)
    self.postMessage({ 
      type: 'error', 
      error: error instanceof Error ? error.message : 'Hesaplama hatası' 
    } as WorkerOutput)
  }
}
