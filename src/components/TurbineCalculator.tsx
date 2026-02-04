import { useState, useEffect, useMemo } from 'react'
import type { Turbine, FilterSettings, Scenario, WizardStep, TurbineFilterSettings } from '../types'
import { calculateScenarios, getDefaultFilters, getDefaultTurbineSettings } from '../utils/calculator'
import { ALL_TURBINES, getAllBrands, getModelsByBrand, filterTurbines, getUniqueTurbines, getCapacityRange } from '../data/turbines'

// ===== Icons =====
const Icons = {
  Wind: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/>
    </svg>
  ),
  Filter: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
    </svg>
  ),
  ArrowRight: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
    </svg>
  ),
  ArrowLeft: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
    </svg>
  ),
  Settings: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v10"/>
    </svg>
  ),
  Check: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  Zap: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
  X: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  ChevronDown: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  ),
}

// ===== Step Indicator =====
function StepIndicator({ currentStep }: { currentStep: WizardStep }) {
  const steps: { key: WizardStep; label: string; number: number }[] = [
    { key: 'filters', label: 'Filtreler', number: 1 },
    { key: 'results', label: 'Sonuçlar', number: 2 },
  ]
  
  const currentIndex = steps.findIndex(s => s.key === currentStep)
  
  return (
    <div className="flex items-center justify-center gap-4 mb-8">
      {steps.map((step, index) => (
        <div key={step.key} className="flex items-center gap-3">
          <div className={`
            w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
            transition-all duration-300
            ${index < currentIndex 
              ? 'bg-green-500 text-white' 
              : index === currentIndex 
                ? 'bg-gradient-to-br from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)] text-black' 
                : 'bg-white/5 text-[var(--color-text-muted)]'
            }
          `}>
            {index < currentIndex ? <Icons.Check /> : step.number}
          </div>
          <span className={`
            hidden sm:block font-medium transition-colors
            ${index === currentIndex ? 'text-white' : 'text-[var(--color-text-muted)]'}
          `}>
            {step.label}
          </span>
          {index < steps.length - 1 && (
            <div className={`
              w-12 h-0.5 rounded-full transition-colors
              ${index < currentIndex ? 'bg-green-500' : 'bg-white/10'}
            `} />
          )}
        </div>
      ))}
    </div>
  )
}

// ===== Multi-Select Dropdown =====
function MultiSelect({
  label,
  options,
  selected,
  onChange,
  placeholder = 'Seçiniz...'
}: {
  label: string
  options: string[]
  selected: string[]
  onChange: (values: string[]) => void
  placeholder?: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  
  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter(s => s !== option))
    } else {
      onChange([...selected, option])
    }
  }
  
  const clearAll = () => onChange([])
  
  return (
    <div className="relative">
      <label className="block text-sm text-[var(--color-text-muted)] mb-2">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="input w-full flex items-center justify-between gap-2 text-left"
      >
        <span className={selected.length === 0 ? 'text-[var(--color-text-muted)]' : ''}>
          {selected.length === 0 ? placeholder : `${selected.length} seçili`}
        </span>
        <Icons.ChevronDown />
      </button>
      
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute z-20 top-full left-0 right-0 mt-2 glass-card p-2 max-h-60 overflow-y-auto">
            {selected.length > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 rounded-lg mb-1"
              >
                Tümünü Temizle
              </button>
            )}
            {options.map(option => (
              <button
                key={option}
                type="button"
                onClick={() => toggleOption(option)}
                className={`
                  w-full px-3 py-2 text-left text-sm rounded-lg flex items-center justify-between
                  ${selected.includes(option) 
                    ? 'bg-[var(--color-accent-primary)]/20 text-[var(--color-accent-primary)]' 
                    : 'hover:bg-white/5'
                  }
                `}
              >
                {option}
                {selected.includes(option) && <Icons.Check />}
              </button>
            ))}
          </div>
        </>
      )}
      
      {/* Selected Tags */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selected.map(s => (
            <span 
              key={s}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-lg bg-[var(--color-accent-primary)]/20 text-[var(--color-accent-primary)]"
            >
              {s}
              <button type="button" onClick={() => toggleOption(s)} className="hover:text-white">
                <Icons.X />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// ===== Filter Step =====
function FilterStep({
  filters,
  setFilters,
  onNext
}: {
  filters: FilterSettings
  setFilters: (f: FilterSettings) => void
  onNext: () => void
}) {
  const capacityRange = getCapacityRange()
  const allBrands = useMemo(() => getAllBrands(), [])
  
  // Seçili markalara göre modelleri filtrele
  const availableModels = useMemo(() => {
    if (filters.selectedBrands.length === 0) {
      // Tüm modeller
      const models = [...new Set(ALL_TURBINES.map(t => t.model))]
      return models.sort()
    }
    // Seçili markalardaki modeller
    const models = filters.selectedBrands.flatMap(brand => getModelsByBrand(brand))
    return [...new Set(models)].sort()
  }, [filters.selectedBrands])
  
  // Filtrelenmiş türbinler
  const filteredTurbines = useMemo(() => {
    const turbines = filterTurbines(
      filters.selectedBrands,
      filters.selectedModels,
      filters.minCapacity,
      filters.maxCapacity
    )
    return getUniqueTurbines(turbines)
  }, [filters.selectedBrands, filters.selectedModels, filters.minCapacity, filters.maxCapacity])
  
  // Türbin ayarlarını senkronize et
  useEffect(() => {
    const existingIds = new Set(filters.turbineSettings.map(s => s.turbineId))
    const newTurbineIds = new Set(filteredTurbines.map(t => t.id))
    
    // Sadece gerektiğinde güncelle
    const needsUpdate = filteredTurbines.some(t => !existingIds.has(t.id)) ||
                        filters.turbineSettings.some(s => !newTurbineIds.has(s.turbineId))
    
    if (needsUpdate) {
      const newSettings: TurbineFilterSettings[] = filteredTurbines.map(t => {
        const existing = filters.turbineSettings.find(s => s.turbineId === t.id)
        return existing || getDefaultTurbineSettings(t.id)
      })
      setFilters({ ...filters, turbineSettings: newSettings })
    }
  }, [filteredTurbines])
  
  const updateFilter = <K extends keyof FilterSettings>(key: K, value: FilterSettings[K]) => {
    setFilters({ ...filters, [key]: value })
  }
  
  const updateTurbineSettings = (turbineId: string, field: keyof TurbineFilterSettings, value: boolean | number) => {
    const newSettings = filters.turbineSettings.map(s => 
      s.turbineId === turbineId ? { ...s, [field]: value } : s
    )
    setFilters({ ...filters, turbineSettings: newSettings })
  }
  
  const getTurbineSettings = (turbineId: string): TurbineFilterSettings => {
    return filters.turbineSettings.find(s => s.turbineId === turbineId) || getDefaultTurbineSettings(turbineId)
  }
  
  const enabledCount = filters.turbineSettings.filter(s => s.enabled).length
  
  // Marka değiştiğinde model seçimini temizle (ilgili olmayan modelleri)
  useEffect(() => {
    if (filters.selectedBrands.length > 0) {
      const validModels = filters.selectedModels.filter(model => 
        availableModels.includes(model)
      )
      if (validModels.length !== filters.selectedModels.length) {
        setFilters({ ...filters, selectedModels: validModels })
      }
    }
  }, [filters.selectedBrands, availableModels])
  
  return (
    <div className="space-y-6">
      {/* Türbin Filtreleri */}
      <div className="glass-card px-6 py-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Icons.Filter />
          Türbin Filtreleri
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MultiSelect
            label="Marka"
            options={allBrands}
            selected={filters.selectedBrands}
            onChange={(v) => updateFilter('selectedBrands', v)}
            placeholder="Tüm markalar"
          />
          <MultiSelect
            label="Model"
            options={availableModels}
            selected={filters.selectedModels}
            onChange={(v) => updateFilter('selectedModels', v)}
            placeholder="Tüm modeller"
          />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm text-[var(--color-text-muted)] mb-2">
              Min Kapasite (MW)
            </label>
            <input
              type="number"
              value={filters.minCapacity}
              onChange={(e) => updateFilter('minCapacity', parseFloat(e.target.value) || 0)}
              className="input"
              min={capacityRange.min}
              max={filters.maxCapacity}
              step="0.1"
            />
          </div>
          <div>
            <label className="block text-sm text-[var(--color-text-muted)] mb-2">
              Max Kapasite (MW)
            </label>
            <input
              type="number"
              value={filters.maxCapacity}
              onChange={(e) => updateFilter('maxCapacity', parseFloat(e.target.value) || capacityRange.max)}
              className="input"
              min={filters.minCapacity}
              max={capacityRange.max}
              step="0.1"
            />
          </div>
        </div>
        
        <div className="mt-4 p-3 rounded-lg bg-white/5 text-sm">
          <span className="text-[var(--color-accent-primary)] font-medium">{filteredTurbines.length}</span>
          <span className="text-[var(--color-text-muted)]"> türbin filtrelendi (toplam {ALL_TURBINES.length} türbin)</span>
        </div>
      </div>
      
      {/* Hedef Kapasite */}
      <div className="glass-card px-6 py-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Icons.Zap />
          Hedef Kapasite
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-[var(--color-text-muted)] mb-2">Hedef (MW)</label>
            <input
              type="number"
              value={filters.targetCapacity}
              onChange={(e) => updateFilter('targetCapacity', parseFloat(e.target.value) || 0)}
              className="input"
              min="0"
              step="1"
            />
          </div>
          <div>
            <label className="block text-sm text-[var(--color-text-muted)] mb-2">Tolerans (%)</label>
            <input
              type="number"
              value={filters.tolerancePercent}
              onChange={(e) => updateFilter('tolerancePercent', parseFloat(e.target.value) || 0)}
              className="input"
              min="0"
              max="100"
            />
          </div>
        </div>
      </div>
      
      {/* Toplam Türbin Sayısı Limitleri */}
      <div className="glass-card px-6 py-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Icons.Settings />
          Toplam Türbin Sayısı Limitleri
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-[var(--color-text-muted)] mb-2">Minimum Toplam</label>
            <input
              type="number"
              value={filters.minTurbineCount}
              onChange={(e) => updateFilter('minTurbineCount', parseInt(e.target.value) || 1)}
              className="input"
              min="1"
            />
          </div>
          <div>
            <label className="block text-sm text-[var(--color-text-muted)] mb-2">Maksimum Toplam</label>
            <input
              type="number"
              value={filters.maxTurbineCount}
              onChange={(e) => updateFilter('maxTurbineCount', parseInt(e.target.value) || 50)}
              className="input"
              min="1"
            />
          </div>
        </div>
      </div>
      
      {/* Ek Seçenekler */}
      <div className="glass-card px-6 py-6">
        <h3 className="text-lg font-semibold mb-4">Ek Seçenekler</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-[var(--color-text-muted)] mb-2">Maksimum Senaryo Sayısı</label>
            <input
              type="number"
              value={filters.maxScenarios}
              onChange={(e) => updateFilter('maxScenarios', Math.min(Math.max(parseInt(e.target.value) || 1, 1), 100))}
              className="input"
              min="1"
              max="100"
            />
          </div>
          <div className="flex items-center pt-6">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={filters.noExceedTarget}
                onChange={(e) => updateFilter('noExceedTarget', e.target.checked)}
                className="w-5 h-5 rounded border-2 border-white/20 bg-transparent checked:bg-[var(--color-accent-primary)] checked:border-[var(--color-accent-primary)] cursor-pointer accent-[var(--color-accent-primary)]"
              />
              <span className="text-sm">Hedef kapasiteyi aşma</span>
            </label>
          </div>
        </div>
      </div>
      
      {/* Türbin Bazlı Ayarlar */}
      {filteredTurbines.length > 0 && (
        <div className="glass-card px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Türbin Ayarları</h3>
            <span className="text-sm text-[var(--color-text-muted)]">
              {enabledCount} / {filteredTurbines.length} aktif
            </span>
          </div>
          
          {/* Header */}
          <div className="hidden sm:grid grid-cols-12 gap-3 mb-2 px-4 text-xs text-[var(--color-text-muted)] font-medium">
            <div className="col-span-1">Aktif</div>
            <div className="col-span-4">Türbin</div>
            <div className="col-span-2 text-center">Verimlilik %</div>
            <div className="col-span-2 text-center">Min Adet</div>
            <div className="col-span-2 text-center">Max Adet</div>
            <div className="col-span-1"></div>
          </div>
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredTurbines.map(turbine => {
              const settings = getTurbineSettings(turbine.id)
              return (
                <div 
                  key={turbine.id} 
                  className={`
                    grid grid-cols-1 sm:grid-cols-12 gap-3 items-center px-4 py-3 rounded-xl transition-all
                    ${settings.enabled 
                      ? 'bg-[var(--color-accent-primary)]/10 border border-[var(--color-accent-primary)]/30' 
                      : 'bg-white/5 border border-white/10 opacity-60'
                    }
                  `}
                >
                  {/* Checkbox */}
                  <div className="col-span-1 flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.enabled}
                      onChange={(e) => updateTurbineSettings(turbine.id, 'enabled', e.target.checked)}
                      className="w-5 h-5 rounded border-2 border-white/20 bg-transparent checked:bg-[var(--color-accent-primary)] checked:border-[var(--color-accent-primary)] cursor-pointer"
                    />
                  </div>
                  
                  {/* Türbin Adı */}
                  <div className="col-span-4">
                    <div className="font-medium text-sm">{turbine.brand} {turbine.model}</div>
                    <div className="text-xs text-[var(--color-text-muted)]">
                      {turbine.capacity} MW
                    </div>
                  </div>
                  
                  {/* Verimlilik */}
                  <div className="col-span-2">
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={settings.efficiency}
                        onChange={(e) => {
                          const val = e.target.value === '' ? 0 : parseFloat(e.target.value)
                          updateTurbineSettings(turbine.id, 'efficiency', isNaN(val) ? 0 : val)
                        }}
                        className="input w-full text-center text-sm py-2"
                        min="0"
                        max="100"
                        disabled={!settings.enabled}
                      />
                      <span className="text-xs text-[var(--color-text-muted)]">%</span>
                    </div>
                  </div>
                  
                  {/* Min Adet */}
                  <div className="col-span-2">
                    <input
                      type="number"
                      value={settings.minCount}
                      onChange={(e) => {
                        const val = e.target.value === '' ? 0 : parseInt(e.target.value)
                        updateTurbineSettings(turbine.id, 'minCount', isNaN(val) ? 0 : val)
                      }}
                      className="input w-full text-center text-sm py-2"
                      min="0"
                      disabled={!settings.enabled}
                    />
                  </div>
                  
                  {/* Max Adet */}
                  <div className="col-span-2">
                    <input
                      type="number"
                      value={settings.maxCount}
                      onChange={(e) => {
                        const val = e.target.value === '' ? 0 : parseInt(e.target.value)
                        updateTurbineSettings(turbine.id, 'maxCount', isNaN(val) ? 0 : val)
                      }}
                      className="input w-full text-center text-sm py-2"
                      min="0"
                      disabled={!settings.enabled}
                    />
                  </div>
                  
                  {/* Efektif MW */}
                  <div className="col-span-1 text-right">
                    <span className="text-xs text-[var(--color-text-muted)]">
                      {(turbine.capacity * settings.efficiency / 100).toFixed(2)} MW
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
      
      {/* Navigation */}
      <div className="flex justify-end pt-4">
        <button 
          type="button" 
          onClick={onNext} 
          disabled={enabledCount === 0}
          className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Hesapla
          <Icons.Zap />
        </button>
      </div>
      
      {filteredTurbines.length === 0 && (
        <p className="text-sm text-yellow-400 text-center">
          Seçilen filtrelere uygun türbin bulunamadı. Filtreleri genişletmeyi deneyin.
        </p>
      )}
    </div>
  )
}

// ===== Results Step =====
function ResultsStep({
  scenarios,
  filters,
  onBack,
  onReset
}: {
  scenarios: Scenario[]
  filters: FilterSettings
  onBack: () => void
  onReset: () => void
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  
  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="glass-card px-6 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-3xl font-bold text-gradient">{scenarios.length}</div>
            <div className="text-sm text-[var(--color-text-muted)]">Senaryo Bulundu</div>
          </div>
          <div>
            <div className="text-3xl font-bold">{filters.targetCapacity}</div>
            <div className="text-sm text-[var(--color-text-muted)]">Hedef MW</div>
          </div>
          <div>
            <div className="text-3xl font-bold">±{filters.tolerancePercent}%</div>
            <div className="text-sm text-[var(--color-text-muted)]">Tolerans</div>
          </div>
        </div>
      </div>
      
      {/* Scenarios List */}
      {scenarios.length === 0 ? (
        <div className="glass-card px-6 py-12 text-center">
          <p className="text-lg text-[var(--color-text-muted)]">
            Kriterlere uygun senaryo bulunamadı.
          </p>
          <p className="text-sm text-[var(--color-text-muted)] mt-2">
            Filtreleri gevşetmeyi veya daha fazla türbin seçmeyi deneyin.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {scenarios.map((scenario, index) => (
            <div
              key={scenario.id}
              className="glass-card overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setExpandedId(expandedId === scenario.id ? null : scenario.id)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className={`
                    w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold
                    ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-black' : 'bg-white/10'}
                  `}>
                    {index + 1}
                  </span>
                  <div>
                    <div className="font-medium">
                      {scenario.totalCapacity.toFixed(2)} MW
                      <span className={`ml-2 text-sm ${scenario.difference >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        ({scenario.difference >= 0 ? '+' : ''}{scenario.difference.toFixed(2)} MW)
                      </span>
                    </div>
                    <div className="text-sm text-[var(--color-text-muted)]">
                      {scenario.totalTurbines} türbin
                    </div>
                  </div>
                </div>
                <div className={`
                  px-3 py-1 rounded-full text-sm font-medium
                  ${Math.abs(scenario.differencePercent) <= 1 
                    ? 'bg-green-500/20 text-green-400' 
                    : Math.abs(scenario.differencePercent) <= 3 
                      ? 'bg-yellow-500/20 text-yellow-400' 
                      : 'bg-red-500/20 text-red-400'
                  }
                `}>
                  {scenario.differencePercent >= 0 ? '+' : ''}{scenario.differencePercent}%
                </div>
              </button>
              
              {expandedId === scenario.id && (
                <div className="px-6 py-4 border-t border-white/10 bg-white/[0.02]">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-[var(--color-text-muted)]">
                        <th className="text-left py-2">Türbin</th>
                        <th className="text-center py-2">Adet</th>
                        <th className="text-center py-2">Birim MW</th>
                        <th className="text-right py-2">Efektif MW</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scenario.items.map(item => (
                        <tr key={item.turbine.id} className="border-t border-white/5">
                          <td className="py-2">{item.turbine.brand} {item.turbine.model}</td>
                          <td className="text-center py-2 font-medium">{item.count}</td>
                          <td className="text-center py-2">{item.turbine.capacity}</td>
                          <td className="text-right py-2 font-medium">
                            {item.effectiveCapacity.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <button type="button" onClick={onBack} className="btn btn-secondary">
          <Icons.ArrowLeft />
          Filtrelere Dön
        </button>
        <button type="button" onClick={onReset} className="btn btn-primary">
          Yeni Hesaplama
        </button>
      </div>
    </div>
  )
}

// ===== Main Component =====
export default function TurbineCalculator() {
  const [step, setStep] = useState<WizardStep>('filters')
  const [filters, setFilters] = useState<FilterSettings>(getDefaultFilters())
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  
  // Filtrelenmiş türbinleri hesapla
  const filteredTurbines = useMemo(() => {
    const turbines = filterTurbines(
      filters.selectedBrands,
      filters.selectedModels,
      filters.minCapacity,
      filters.maxCapacity
    )
    return getUniqueTurbines(turbines)
  }, [filters.selectedBrands, filters.selectedModels, filters.minCapacity, filters.maxCapacity])
  
  const handleCalculate = () => {
    const results = calculateScenarios(filteredTurbines, filters)
    setScenarios(results)
    setStep('results')
  }
  
  const handleReset = () => {
    setStep('filters')
    setFilters(getDefaultFilters())
    setScenarios([])
  }
  
  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] bg-noise">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[var(--color-bg-primary)]/70 border-b border-white/[0.05]">
        <div className="container pt-5 pb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)] flex items-center justify-center text-black shadow-lg shadow-[var(--color-accent-primary)]/20">
              <Icons.Wind />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Egesa Energy</h1>
              <p className="text-xs text-[var(--color-text-muted)]">Proje Geliştirme</p>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex items-center gap-2">
            <button 
              type="button"
              className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)] border border-[var(--color-accent-primary)]/30"
            >
              Türbin Hesaplayıcı
            </button>
            <button 
              type="button"
              disabled
              className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--color-text-muted)] hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Santral Verileri
            </button>
          </nav>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="container pt-10 pb-8">
        <StepIndicator currentStep={step} />
        
        {step === 'filters' && (
          <FilterStep
            filters={filters}
            setFilters={setFilters}
            onNext={handleCalculate}
          />
        )}
        
        {step === 'results' && (
          <ResultsStep
            scenarios={scenarios}
            filters={filters}
            onBack={() => setStep('filters')}
            onReset={handleReset}
          />
        )}
      </main>
    </div>
  )
}
