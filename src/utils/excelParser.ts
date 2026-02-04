import * as XLSX from 'xlsx'
import type { Turbine } from '../types'
import { generateId } from './calculator'

// Olası sütun ismi eşleştirmeleri
const COLUMN_MAPPINGS = {
  turbineModel: ['türbin modeli', 'turbin modeli', 'turbine model', 'türbin'],
  brand: ['brand', 'marka', 'üretici', 'manufacturer', 'firma'],
  model: ['model', 'tip', 'type'],
  capacity: ['capacity', 'kapasite', 'mw', 'güç', 'power', 'kw'],
  bladeWidth: ['bladewidth', 'blade_width', 'blade width', 'kanat', 'rotor', 'çap', 'diameter', 'rotor çapı', 'rotor diameter'],
  hubHeight: ['hubheight', 'hub_height', 'hub height', 'hub', 'hub yüksekliği', 'kule yüksekliği', 'yükseklik', 'height', 'kule', 'tower'],
}

/**
 * Sütun ismini normalize eder (küçük harf)
 */
function normalizeColumnName(name: string): string {
  return String(name).toLowerCase().trim()
}

/**
 * Excel sütun ismini bizim alan adımıza eşleştirir
 */
function mapColumnName(excelColumn: string): keyof typeof COLUMN_MAPPINGS | null {
  const normalized = normalizeColumnName(excelColumn)
  
  for (const [field, aliases] of Object.entries(COLUMN_MAPPINGS)) {
    if (aliases.some(alias => normalized.includes(alias) || alias.includes(normalized))) {
      return field as keyof typeof COLUMN_MAPPINGS
    }
  }
  
  return null
}

/**
 * "NORDEX N163/6.X 3.87 MW" formatından marka, model ve kapasiteyi çıkarır
 */
function parseTurbineModel(fullModel: string): { brand: string; model: string; capacity: number } {
  const str = String(fullModel).trim()
  
  // MW değerini bul (örn: "3.87 MW" veya "4.52 MW")
  const mwMatch = str.match(/(\d+[.,]?\d*)\s*MW/i)
  const capacity = mwMatch ? parseFloat(mwMatch[1].replace(',', '.')) : 0
  
  // MW kısmını çıkar
  const withoutMW = str.replace(/\d+[.,]?\d*\s*MW/i, '').trim()
  
  // İlk kelime genellikle marka
  const parts = withoutMW.split(/\s+/)
  const brand = parts[0] || ''
  const model = parts.slice(1).join(' ').trim() || ''
  
  return { brand, model, capacity }
}

/**
 * Excel dosyasından türbin verilerini okur
 */
export async function parseExcelFile(file: File): Promise<Turbine[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: 'binary' })
        
        // İlk sheet'i al
        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]
        
        // JSON'a çevir
        const rawData = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet)
        
        if (rawData.length === 0) {
          console.log('Excel dosyası boş')
          resolve([])
          return
        }
        
        // İlk satırdan sütun isimlerini al ve eşleştir
        const firstRow = rawData[0]
        const columnMap: Record<string, keyof typeof COLUMN_MAPPINGS> = {}
        
        console.log('Excel sütunları:', Object.keys(firstRow))
        
        for (const excelCol of Object.keys(firstRow)) {
          const mappedField = mapColumnName(excelCol)
          if (mappedField) {
            columnMap[excelCol] = mappedField
          }
        }
        
        console.log('Sütun eşleştirmesi:', columnMap)
        
        // Türbin objelerine dönüştür
        const turbines: Turbine[] = rawData
          .map(row => {
            let brand = ''
            let model = ''
            let capacity = 0
            let bladeWidth = 0
            let hubHeight = 0
            
            for (const [excelCol, field] of Object.entries(columnMap)) {
              const value = row[excelCol]
              
              if (field === 'turbineModel' && value) {
                // "NORDEX N163/6.X 3.87 MW" formatını parse et
                const parsed = parseTurbineModel(String(value))
                brand = parsed.brand
                model = parsed.model
                capacity = parsed.capacity
                console.log('Parsed turbineModel:', value, '->', parsed)
              } else if (field === 'brand' && value) {
                brand = String(value).trim()
              } else if (field === 'model' && value) {
                model = String(value).trim()
              } else if (field === 'capacity' && value) {
                let numValue = parseFloat(String(value).replace(',', '.')) || 0
                // kW ise MW'a çevir
                if (numValue > 100) {
                  numValue = numValue / 1000
                }
                capacity = numValue
              } else if (field === 'bladeWidth' && value) {
                bladeWidth = parseFloat(String(value).replace(',', '.')) || 0
              } else if (field === 'hubHeight' && value) {
                hubHeight = parseFloat(String(value).replace(',', '.')) || 0
              }
            }
            
            return {
              id: generateId(),
              brand,
              model,
              capacity,
              bladeWidth,
              hubHeight
            }
          })
          .filter(t => t.capacity > 0)
        
        console.log('Yüklenen türbinler:', turbines.length, 'adet')
        if (turbines.length > 0) {
          console.log('Örnek türbin:', turbines[0])
        }
        
        resolve(turbines)
      } catch (error) {
        console.error('Excel okuma hatası:', error)
        reject(new Error('Excel dosyası okunamadı'))
      }
    }
    
    reader.onerror = () => reject(new Error('Dosya okunamadı'))
    reader.readAsBinaryString(file)
  })
}

/**
 * Örnek Excel şablonu indir
 */
export function downloadExcelTemplate() {
  const templateData = [
    { 'Türbin Modeli': 'NORDEX N163/6.X 3.87 MW', 'Hub Yüksekliği': 118, 'Rotor Çapı': 163 },
    { 'Türbin Modeli': 'VESTAS V126 3.45 MW', 'Hub Yüksekliği': 87, 'Rotor Çapı': 126 },
    { 'Türbin Modeli': 'SIEMENS SG 3.4-132 3.4 MW', 'Hub Yüksekliği': 85, 'Rotor Çapı': 132 },
    { 'Türbin Modeli': 'GE GE 2.5-127 2.5 MW', 'Hub Yüksekliği': 89, 'Rotor Çapı': 127 },
  ]
  
  const worksheet = XLSX.utils.json_to_sheet(templateData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Turbines')
  
  XLSX.writeFile(workbook, 'turbin_sablonu.xlsx')
}
