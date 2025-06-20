# 📧 Setup Resend API per ReflectMe

## 🚀 Passo 1: Crea Account Resend

1. Vai su **https://resend.com**
2. Crea un account gratuito
3. Verifica la tua email

## 🔑 Passo 2: Genera API Key

1. Dashboard Resend → **API Keys**
2. Click **"Create API Key"**
3. Nome: `ReflectMe Production`
4. Permissions: **Full Access**
5. Copia la chiave (inizia con `re_`)

## ⚙️ Passo 3: Configura Environment Variables

Crea un file `.env.local` nella root del progetto:

```env
# Resend API Configuration
RESEND_API_KEY=re_your_actual_api_key_here

# Base URL per magic links
NEXT_PUBLIC_BASE_URL=http://localhost:5174

# Supabase (se non già configurato)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## 🌐 Passo 4: Configura Dominio (Opzionale - Produzione)

### Per Production (dominio personalizzato):

1. **Dashboard Resend** → **Domains**
2. Click **"Add Domain"**
3. Inserisci il tuo dominio: `yourdomain.com`
4. Aggiungi i record DNS richiesti:
   - **SPF**: `v=spf1 include:_spf.resend.com ~all`
   - **DKIM**: Record fornito da Resend
   - **DMARC**: `v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com`

### Aggiorna il codice per production:

Nel file `src/services/emailService.ts`, cambia:

```typescript
// DA:
from: 'ReflectMe <noreply@yourdomain.com>',

// A: 
from: 'ReflectMe <noreply@tuodominio.it>',
```

## 🧪 Passo 5: Test

Testa il sistema email:

```typescript
// Nel browser console o test file
import { sendAssessmentReminder } from '@/services/emailService';

await sendAssessmentReminder('test@example.com', {
  clientName: 'Mario Rossi',
  instrumentName: 'PHQ-9',
  dueDate: '2024-12-25',
  magicLink: 'https://reflectme.app/assessment/test?token=abc123'
});
```

## 📊 Passo 6: Monitora Email

Dashboard Resend mostra:
- ✅ Email inviate
- 📈 Delivery rate
- 🔍 Bounce/spam reports
- 📊 Analytics dettagliate

## 🚨 Email di Crisi

Gli alert automatici per ideazione suicidaria vengono inviati con:
- **Priorità**: Urgent
- **Tag**: crisis-alert
- **Subject**: 🚨 URGENTE: Alert di crisi

## 💰 Prezzi Resend

- **Free Tier**: 3.000 email/mese
- **Pro**: $20/mese per 50.000 email
- **Business**: $80/mese per 100.000 email

## ✅ Verifica Setup

Se tutto è configurato correttamente, dovresti vedere nei log:
```
✅ Email sent via Resend: 01234567-89ab-cdef-0123-456789abcdef
```

Invece di:
```
⚠️ Demo mode: Email not sent (add RESEND_API_KEY for production)
```

## 🔒 Sicurezza

- ❌ **Non committare** mai l'API key in Git
- ✅ Usa variabili d'ambiente
- ✅ Rigenera chiavi se compromesse
- ✅ Monitora usage per rilevare abusi

La tua API Resend è ora pronta per il sistema di assessment automatico! 🎉 