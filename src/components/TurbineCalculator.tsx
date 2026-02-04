import { useState, useCallback, useEffect } from 'react'
import type { Turbine, FilterSettings, Scenario, WizardStep, TurbineFilterSettings } from '../types'
import { calculateScenarios, generateId, getDefaultFilters, getDefaultTurbineSettings } from '../utils/calculator'
import { parseExcelFile, downloadExcelTemplate } from '../utils/excelParser'

// ===== Icons =====
const Icons = {
  Wind: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/>
    </svg>
  ),
  Plus: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  Trash: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    </svg>
  ),
  Upload: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
  ),
  Download: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
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
}

// ===== Step Indicator =====
function StepIndicator({ currentStep }: { currentStep: WizardStep }) {
  const steps: { key: WizardStep; label: string; number: number }[] = [
    { key: 'turbines', label: 'Türbinler', number: 1 },
    { key: 'filters', label: 'Filtreler', number: 2 },
    { key: 'results', label: 'Sonuçlar', number: 3 },
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

// ===== Step 1: Türbin Ekleme =====
function TurbineStep({
  turbines,
  setTurbines,
  onNext
}: {
  turbines: Turbine[]
  setTurbines: (t: Turbine[]) => void
  onNext: () => void
}) {
  const [dragOver, setDragOver] = useState(false)
  
  const addEmptyTurbine = () => {
    setTurbines([...turbines, {
      id: generateId(),
      brand: '',
      model: '',
      capacity: 0,
      bladeWidth: 0,
      hubHeight: 0
    }])
  }
  
  const updateTurbine = (id: string, field: keyof Turbine, value: string | number) => {
    setTurbines(turbines.map(t => 
      t.id === id ? { ...t, [field]: value } : t
    ))
  }
  
  const deleteTurbine = (id: string) => {
    setTurbines(turbines.filter(t => t.id !== id))
  }
  
  const handleFileUpload = async (file: File) => {
    try {
      const imported = await parseExcelFile(file)
      setTurbines([...turbines, ...imported])
    } catch (error) {
      alert('Excel dosyası okunamadı. Lütfen şablona uygun bir dosya yükleyin.')
    }
  }
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
      handleFileUpload(file)
    }
  }, [turbines])
  
  const validTurbines = turbines.filter(t => t.brand && t.model && t.capacity > 0)
  
  return (
    <div className="space-y-6">
      {/* Excel Import Area */}
      <div
        className={`
          glass-card px-8 py-10 text-center cursor-pointer transition-all
          ${dragOver ? 'border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/10' : ''}
        `}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById('excel-input')?.click()}
      >
        <input
          id="excel-input"
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFileUpload(file)
          }}
        />
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[var(--color-accent-primary)]/20 flex items-center justify-center text-[var(--color-accent-primary)]">
            <Icons.Upload />
          </div>
          <div>
            <p className="text-lg font-medium">Excel Dosyası Yükle</p>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">
              Sürükle-bırak veya tıkla (.xlsx, .xls)
            </p>
          </div>
          <button
            type="button"
            className="btn btn-secondary text-sm"
            onClick={(e) => {
              e.stopPropagation()
              downloadExcelTemplate()
            }}
          >
            <Icons.Download />
            Şablon İndir
          </button>
        </div>
      </div>
      
      {/* Divider */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-sm text-[var(--color-text-muted)]">veya manuel ekle</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>
      
      {/* Türbin Listesi */}
      <div className="space-y-3">
        {turbines.map((turbine, index) => (
          <div key={turbine.id} className="glass-card px-5 py-4">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm text-[var(--color-text-muted)] w-6">{index + 1}.</span>
              
              <input
                type="text"
                placeholder="Marka"
                value={turbine.brand}
                onChange={(e) => updateTurbine(turbine.id, 'brand', e.target.value)}
                className="input flex-1 min-w-[100px]"
              />
              
              <input
                type="text"
                placeholder="Model"
                value={turbine.model}
                onChange={(e) => updateTurbine(turbine.id, 'model', e.target.value)}
                className="input flex-1 min-w-[100px]"
              />
              
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  placeholder="MW"
                  value={turbine.capacity || ''}
                  onChange={(e) => updateTurbine(turbine.id, 'capacity', parseFloat(e.target.value) || 0)}
                  className="input w-20 text-center"
                  step="0.01"
                />
                <span className="text-xs text-[var(--color-text-muted)]">MW</span>
              </div>
              
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  placeholder="Rotor"
                  value={turbine.bladeWidth || ''}
                  onChange={(e) => updateTurbine(turbine.id, 'bladeWidth', parseFloat(e.target.value) || 0)}
                  className="input w-20 text-center"
                />
                <span className="text-xs text-[var(--color-text-muted)]">m</span>
              </div>
              
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  placeholder="Hub"
                  value={turbine.hubHeight || ''}
                  onChange={(e) => updateTurbine(turbine.id, 'hubHeight', parseFloat(e.target.value) || 0)}
                  className="input w-20 text-center"
                />
                <span className="text-xs text-[var(--color-text-muted)]">m</span>
              </div>
              
              <button
                type="button"
                onClick={() => deleteTurbine(turbine.id)}
                className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
              >
                <Icons.Trash />
              </button>
            </div>
          </div>
        ))}
        
        {/* Add Button */}
        <button
          type="button"
          onClick={addEmptyTurbine}
          className="w-full glass-card px-5 py-4 flex items-center justify-center gap-2 text-[var(--color-accent-primary)] hover:bg-[var(--color-accent-primary)]/10 transition-colors"
        >
          <Icons.Plus />
          Yeni Türbin Ekle
        </button>
      </div>
      
      {/* Navigation */}
      <div className="flex justify-end pt-4">
        <button
          type="button"
          onClick={onNext}
          disabled={validTurbines.length === 0}
          className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Devam Et
          <Icons.ArrowRight />
        </button>
      </div>
      
      {validTurbines.length === 0 && turbines.length > 0 && (
        <p className="text-sm text-yellow-400 text-center">
          Devam etmek için en az bir geçerli türbin ekleyin (marka, model ve kapasite zorunlu)
        </p>
      )}
    </div>
  )
}

// ===== Step 2: Filtreler =====
function FilterStep({
  turbines,
  filters,
  setFilters,
  onNext,
  onBack
}: {
  turbines: Turbine[]
  filters: FilterSettings
  setFilters: (f: FilterSettings) => void
  onNext: () => void
  onBack: () => void
}) {
  const validTurbines = turbines.filter(t => t.brand && t.model && t.capacity > 0)
  
  // Türbin ayarlarını senkronize et
  useEffect(() => {
    const existingIds = filters.turbineSettings.map(s => s.turbineId)
    const newSettings: TurbineFilterSettings[] = validTurbines.map(t => {
      const existing = filters.turbineSettings.find(s => s.turbineId === t.id)
      return existing || getDefaultTurbineSettings(t.id)
    })
    
    // Sadece değişiklik varsa güncelle
    if (JSON.stringify(newSettings.map(s => s.turbineId)) !== JSON.stringify(existingIds)) {
      setFilters({ ...filters, turbineSettings: newSettings })
    }
  }, [validTurbines.length])
  
  const updateFilter = <K extends keyof FilterSettings>(key: K, value: FilterSettings[K]) => {
    setFilters({ ...filters, [key]: value })
  }
  
  const updateTurbineSettings = (turbineId: string, field: keyof TurbineFilterSettings, value: boolean | number) => {
    const newSettings = filters.turbineSettings.map(s => 
      s.turbineId === turbineId ? { ...s, [field]: value } : s
    )
    // Eğer türbin ayarı yoksa ekle
    if (!newSettings.find(s => s.turbineId === turbineId)) {
      newSettings.push({ ...getDefaultTurbineSettings(turbineId), [field]: value })
    }
    setFilters({ ...filters, turbineSettings: newSettings })
  }
  
  const getTurbineSettings = (turbineId: string): TurbineFilterSettings => {
    return filters.turbineSettings.find(s => s.turbineId === turbineId) || getDefaultTurbineSettings(turbineId)
  }
  
  const enabledCount = filters.turbineSettings.filter(s => s.enabled).length
  
  return (
    <div className="space-y-6">
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
      
      {/* Hub Yüksekliği */}
      <div className="glass-card px-6 py-6">
        <h3 className="text-lg font-semibold mb-4">Hub Yüksekliği Filtresi (Opsiyonel)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-[var(--color-text-muted)] mb-2">Minimum (m)</label>
            <input
              type="number"
              value={filters.minHubHeight ?? ''}
              onChange={(e) => updateFilter('minHubHeight', e.target.value ? parseFloat(e.target.value) : null)}
              className="input"
              placeholder="Boş = filtre yok"
            />
          </div>
          <div>
            <label className="block text-sm text-[var(--color-text-muted)] mb-2">Maksimum (m)</label>
            <input
              type="number"
              value={filters.maxHubHeight ?? ''}
              onChange={(e) => updateFilter('maxHubHeight', e.target.value ? parseFloat(e.target.value) : null)}
              className="input"
              placeholder="Boş = filtre yok"
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
      <div className="glass-card px-6 py-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Türbin Ayarları</h3>
          <span className="text-sm text-[var(--color-text-muted)]">
            {enabledCount} / {validTurbines.length} aktif
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
        
        <div className="space-y-2">
          {validTurbines.map(turbine => {
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
                    {turbine.capacity} MW • Hub: {turbine.hubHeight}m
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
      
      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <button type="button" onClick={onBack} className="btn btn-secondary">
          <Icons.ArrowLeft />
          Geri
        </button>
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
    </div>
  )
}

// ===== Step 3: Sonuçlar =====
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
            Filtreleri gevşetmeyi veya daha fazla türbin eklemeyi deneyin.
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
  const [step, setStep] = useState<WizardStep>('turbines')
  const [turbines, setTurbines] = useState<Turbine[]>([])
  const [filters, setFilters] = useState<FilterSettings>(getDefaultFilters())
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  
  const handleCalculate = () => {
    const validTurbines = turbines.filter(t => t.brand && t.model && t.capacity > 0)
    const results = calculateScenarios(validTurbines, filters)
    setScenarios(results)
    setStep('results')
  }
  
  const handleReset = () => {
    setStep('turbines')
    setTurbines([])
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
        
        {step === 'turbines' && (
          <TurbineStep
            turbines={turbines}
            setTurbines={setTurbines}
            onNext={() => setStep('filters')}
          />
        )}
        
        {step === 'filters' && (
          <FilterStep
            turbines={turbines}
            filters={filters}
            setFilters={setFilters}
            onNext={handleCalculate}
            onBack={() => setStep('turbines')}
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
