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
 * Optimize edilmiş versiyon - akıllı budama ve timeout
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

  // Türbinleri kapasiteye göre büyükten küçüğe sırala (daha iyi budama için)
  const sortedTurbines = [...turbines].sort((a, b) => b.capacity - a.capacity)
  
  // Her türbin için efektif kapasite hesapla
  const turbineData = sortedTurbines.map(t => ({
    turbine: t,
    effectiveCapacity: t.capacity * efficiency,
    // Bu türbinden maksimum kaç adet kullanılabilir (hedef kapasiteye göre)
    maxPossible: Math.min(
      filters.maxTurbineCount,
      t.capacity * efficiency > 0 
        ? Math.ceil(maxCapacity / (t.capacity * efficiency)) 
        : 0
    )
  }))

  let processedCombinations = 0
  let lastProgressUpdate = 0

  // Recursive kombinasyon üreteci - optimize edilmiş
  function generateCombinations(
    index: number,
    currentItems: ScenarioItem[],
    currentCapacity: number,
    currentCount: number,
    remainingMinCapacity: number
  ): boolean {
    // Timeout kontrolü
    if (Date.now() - startTime > CALCULATION_TIMEOUT) {
      return true // Dur
    }

    processedCombinations++
    
    // Her 5000 kombinasyonda progress güncelle
    if (processedCombinations - lastProgressUpdate > 5000) {
      lastProgressUpdate = processedCombinations
      // İlerlemeyi tahmini olarak hesapla
      const elapsedTime = Date.now() - startTime
      const progress = Math.min(90, (elapsedTime / CALCULATION_TIMEOUT) * 100)
      onProgress(progress)
    }

    // Maksimum senaryo sayısına ulaştıysak dur
    if (scenarios.length >= filters.maxScenarios) {
      return true
    }

    // Maksimum toplam türbin sayısı aşıldı - BUDAMA
    if (currentCount > filters.maxTurbineCount) {
      return false
    }

    // Kapasite maksimumu aştı - BUDAMA
    if (currentCapacity > maxCapacity) {
      return false
    }

    // Kalan türbinlerle bile minimum kapasiteye ulaşılamıyorsa - BUDAMA
    if (currentCapacity + remainingMinCapacity < minCapacity && index >= turbineData.length) {
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
    if (index >= turbineData.length) {
      return false
    }

    const data = turbineData[index]
    const { turbine, effectiveCapacity, maxPossible } = data
    
    // Kalan türbinlerin maksimum potansiyel kapasitesi
    let remainingMaxCapacity = 0
    for (let i = index; i < turbineData.length; i++) {
      remainingMaxCapacity += turbineData[i].effectiveCapacity * turbineData[i].maxPossible
    }
    
    // Bu türbin için max sayı - dinamik optimizasyon
    const maxForThis = Math.min(
      maxPossible,
      filters.maxTurbineCount - currentCount,
      effectiveCapacity > 0 ? Math.ceil((maxCapacity - currentCapacity) / effectiveCapacity) : 0
    )

    // 0'dan başla
    for (let count = 0; count <= maxForThis; count++) {
      // Erken budama: Bu ve sonraki türbinlerle minimum kapasiteye ulaşılamıyorsa atla
      const potentialCapacity = currentCapacity + (effectiveCapacity * count)
      const futureMaxCapacity = potentialCapacity + remainingMaxCapacity - (effectiveCapacity * maxPossible)
      
      if (futureMaxCapacity < minCapacity && count === 0) {
        // Bu türbini kullanmadan devam etmenin anlamı yok
        continue
      }

      const newItems = [...currentItems]
      if (count > 0) {
        newItems.push({ 
          turbine, 
          count, 
          effectiveCapacity: effectiveCapacity * count 
        })
      }
      
      // Kalan minimum kapasite (sonraki türbinler için)
      const newRemainingMin = remainingMaxCapacity - (effectiveCapacity * maxPossible)
      
      const shouldStop = generateCombinations(
        index + 1,
        newItems,
        currentCapacity + effectiveCapacity * count,
        currentCount + count,
        newRemainingMin
      )

      if (shouldStop) {
        return true
      }
    }

    return false
  }

  // Kalan maksimum kapasite hesapla (başlangıç için)
  let totalRemainingCapacity = 0
  for (const data of turbineData) {
    totalRemainingCapacity += data.effectiveCapacity * data.maxPossible
  }

  // Kombinasyonları üret
  generateCombinations(0, [], 0, 0, totalRemainingCapacity)

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
