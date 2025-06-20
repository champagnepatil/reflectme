# 📄 PDF Reports System - ReflectMe

## 🎯 Sistema Completato

Il sistema di generazione PDF per report sintomi è completamente configurato e funzionante! Ecco cosa è stato implementato:

### ✅ **Componenti Implementati:**

1. **🎨 React PDF Template** - Design professionale con:
   - Header con brand ReflectMe
   - Tabella dati assessment colorata
   - Riepilogo clinico automatico
   - Raccomandazioni basate sui trend
   - Footer con informazioni contatto

2. **⚙️ PDF Service** - Generazione automatica con:
   - Integrazione @react-pdf/renderer
   - Upload automatico su Supabase Storage
   - URL firmati con scadenza 1 ora
   - Fallback per gestione errori

3. **🔗 API Endpoints** disponibili:
   - `/api/reports/download` - Download PDF per clientId/mese
   - `/api/test/generate-pdf` - Test generazione PDF

4. **🖱️ UI Integration** - Bottone Download in AssessmentCard

---

## 🚀 Come Utilizzare

### **1. Download PDF dal Frontend**

Nel componente AssessmentCard è già presente il bottone Download PDF che:
- Genera automaticamente il report per il mese corrente
- Apre il PDF in una nuova tab
- Gestisce errori con alert informativi

### **2. API Direct Call**

```bash
# Download PDF via API
GET /api/reports/download?clientId=abc123&month=2024-01

# Response:
{
  "success": true,
  "downloadUrl": "https://supabase-url/storage/...",
  "fileName": "symptom-report-abc123-2024-01.pdf",
  "expiresIn": "1 hour",
  "generatedAt": "2024-01-15T10:30:00.000Z"
}
```

### **3. Test Generation**

```bash
# Test PDF generation
POST /api/test/generate-pdf
{
  "clientId": "test-123",
  "month": "2024-01"
}
```

---

## 📊 Contenuti del Report PDF

### **📋 Sezioni Incluse:**

1. **Header Professionale**
   - Logo/Brand ReflectMe
   - Nome paziente
   - Periodo di riferimento
   - Data generazione

2. **📈 Riepilogo Clinico**
   - Analisi automatica dei trend
   - Punteggi medi per strumento
   - Direzione del cambiamento

3. **📊 Tabella Assessment**
   - Data, Strumento, Punteggio, Severità
   - Colori per facilitare lettura
   - Ordinamento cronologico

4. **💡 Raccomandazioni Cliniche**
   - Suggerimenti basati sui dati
   - Azioni specifiche per trend rilevati
   - Linee guida di monitoraggio

5. **📞 Footer Informativo**
   - Contatti supporto
   - Disclaimer automatico

---

## 🎨 Personalizzazioni Disponibili

### **Colori e Styling:**

Nel file `src/services/pdfService.ts`, sezione `styles`:

```typescript
// Colori brand personalizzabili
borderBottomColor: '#6366f1',  // Blu primario
scoreHigh: '#dc2626',          // Rosso per score alti
scoreMedium: '#f59e0b',        // Giallo per score medi
scoreLow: '#059669',           // Verde per score bassi
```

### **Layout e Font:**

```typescript
// Font e dimensioni
fontFamily: 'Inter',           // Font professionale
fontSize: 24,                  // Titolo principale
fontSize: 11,                  // Testo body
```

### **Logo Personalizzato:**

Per aggiungere il tuo logo:

```typescript
// Nel componente SymptomReportDocument
<Image 
  style={styles.logo} 
  src="https://yoursite.com/logo.png" 
/>
```

---

## 🔧 Configurazione Storage

### **Supabase Storage Setup:**

Il bucket `reports` è già configurato con:
- ✅ **Public Access**: Per download sicuri
- ✅ **RLS Policies**: Solo utenti autenticati
- ✅ **Upload Path**: `{clientId}/symptom-report-{clientId}-{month}.pdf`

### **Gestione File:**

```typescript
// Auto-cleanup file vecchi (opzionale)
import { cleanupOldReports } from '@/services/pdfService';

// Elimina report > 90 giorni
await cleanupOldReports(90);
```

---

## 🧪 Testing del Sistema

### **1. Test Rapido:**

```bash
curl -X POST http://localhost:5174/api/test/generate-pdf \
  -H "Content-Type: application/json" \
  -d '{"clientId": "demo", "month": "2024-01"}'
```

### **2. Test con Mock Data:**

```bash
curl -X POST http://localhost:5174/api/test/generate-pdf \
  -H "Content-Type: application/json" \
  -d '{"clientId": "demo", "month": "2024-01", "mockData": true}'
```

### **3. Test Frontend:**

1. Apri un assessment con risultati
2. Click sul bottone "Download" (icona 📄)
3. Verifica apertura PDF in nuova tab

---

## 📈 Miglioramenti Futuri

### **Caratteristiche Aggiuntive:**

1. **📊 Grafici Visuali**
   ```bash
   npm install react-chartjs-2 chart.js
   # Aggiungere grafici trend nei PDF
   ```

2. **🔄 Report Multipli**
   - Report annuali
   - Confronti tra periodi
   - Report per strumento specifico

3. **📧 Invio Automatico**
   - Email PDF ai terapisti
   - Schedule report mensili
   - Integration con calendario

4. **🎨 Template Personalizzati**
   - Template per clinica/ospedale
   - Branding personalizzato
   - Lingue multiple

### **Performance Optimization:**

```typescript
// Cache PDF per richieste multiple
// Background generation
// Compressione file
```

---

## 📂 Struttura File

```
src/services/pdfService.ts      # Core PDF generation
src/pages/api/reports/          # API endpoints
src/pages/api/test/             # Test endpoints
src/components/assessment/      # UI integration
```

---

## 🐛 Troubleshooting

### **Errori Comuni:**

1. **PDF non si genera:**
   - Verifica Supabase connection
   - Check storage bucket permissions
   - Console logs per dettagli

2. **Font non carica:**
   - Verifica URL Google Fonts
   - Fallback a font di sistema

3. **Upload fallisce:**
   - Check RLS policies
   - Verifica API keys Supabase

### **Debug Mode:**

```typescript
// Abilita logging dettagliato
console.log('PDF generation steps...');
```

---

## 🎉 **Sistema PDF Pronto!**

Il tuo sistema PDF ReflectMe è ora completamente funzionante con:

- ✅ Template professionali
- ✅ Integrazione Supabase
- ✅ API robuste
- ✅ UI user-friendly
- ✅ Error handling completo

**Next:** I tuoi pazienti possono ora scaricare report PDF professionali dei loro progressi! 📄✨ 