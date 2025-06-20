# 🔧 **Guida Setup Environment Variables - ReflectMe Phase 3**

Questa guida ti aiuta a configurare tutte le variabili d'ambiente necessarie per far funzionare ReflectMe con le funzionalità Phase 3.

---

## 📋 **Quick Start**

1. **Copia il file template:**
   ```bash
   cp environment.example .env
   ```

2. **Compila i valori essenziali** (minimi per funzionare):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

3. **Aggiungi Google OAuth** (per health data):
   - `REACT_APP_GOOGLE_CLIENT_ID`
   - `REACT_APP_GOOGLE_CLIENT_SECRET`

4. **Aggiungi Gemini AI** (per summaries):
   - `REACT_APP_GEMINI_API_KEY`

---

## 🔥 **Configurazione Supabase (OBBLIGATORIO)**

### **Dove Trovarle:**
1. Vai su [app.supabase.com](https://app.supabase.com)
2. Seleziona il tuo progetto
3. Vai in **Settings → API**

### **Variabili da Configurare:**
```bash
# URL del progetto (dalla sezione "Project URL")
VITE_SUPABASE_URL=https://abcdefghijklmnopqrstuvwxyz.supabase.co

# Chiave pubblica (dalla sezione "Project API keys" → anon/public)
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Chiave di servizio (dalla sezione "Project API keys" → service_role)
# ⚠️ TIENI SEGRETA! Non esporla mai nel frontend
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🔗 **Google OAuth (Google Fit Integration)**

### **Setup Google Cloud Console:**

1. **Vai su [console.cloud.google.com](https://console.cloud.google.com)**

2. **Crea/Seleziona Progetto:**
   - Crea nuovo progetto o seleziona esistente
   - Nome suggerito: "ReflectMe Health Integration"

3. **Abilita APIs:**
   ```
   Vai su "APIs & Services" → "Library"
   Cerca e abilita:
   - Fitness API
   - People API (opzionale)
   ```

4. **Configura OAuth Consent Screen:**
   ```
   Vai su "APIs & Services" → "OAuth consent screen"
   - User Type: External
   - App name: ReflectMe
   - User support email: [tua-email]
   - Developer contact: [tua-email]
   - Scopes: Aggiungi Google Fit scopes
   ```

5. **Crea Credentials:**
   ```
   Vai su "APIs & Services" → "Credentials"
   Clicca "Create Credentials" → "OAuth 2.0 Client IDs"
   - Application type: Web application
   - Name: ReflectMe Web Client
   - Authorized redirect URIs:
     * http://localhost:5173/oauth/callback (development)
     * https://your-domain.com/oauth/callback (production)
   ```

6. **Copia le Credenziali:**
   ```bash
   REACT_APP_GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
   REACT_APP_GOOGLE_CLIENT_SECRET=GOCSPX-your_client_secret_here
   ```

### **Scopes Richiesti:**
- `https://www.googleapis.com/auth/fitness.activity.read`
- `https://www.googleapis.com/auth/fitness.sleep.read`

---

## 🤖 **Gemini AI (Narrative Summaries)**

### **Setup Google AI Studio:**

1. **Vai su [makersuite.google.com](https://makersuite.google.com/app/apikey)**

2. **Crea API Key:**
   - Clicca "Create API key"
   - Seleziona il progetto Google Cloud (stesso di OAuth)
   - Copia la chiave generata

3. **Configura:**
   ```bash
   REACT_APP_GEMINI_API_KEY=AIzaSyYourGeminiApiKeyHere123456789
   ```

### **Rate Limits (Raccomandati):**
- **Requests per minute:** 60
- **Tokens per minute:** 30,000
- **Requests per day:** 1,500

---

## 🚀 **Netlify Deployment**

### **Environment Variables su Netlify:**

1. **Dashboard Netlify:**
   - Vai su [app.netlify.com](https://app.netlify.com)
   - Seleziona il tuo sito
   - Vai in **Site settings → Environment variables**

2. **Aggiungi le Variables:**
   ```bash
   # Frontend (disponibili nel build)
   VITE_SUPABASE_URL
   VITE_SUPABASE_ANON_KEY
   REACT_APP_GEMINI_API_KEY
   REACT_APP_GOOGLE_CLIENT_ID
   REACT_APP_GOOGLE_CLIENT_SECRET
   REACT_APP_BASE_URL
   
   # Backend (solo per Netlify Functions)
   SUPABASE_SERVICE_ROLE_KEY
   ```

3. **Deploy Triggers:**
   - Ogni modifica alle env vars richiede re-deploy
   - Le Functions vengono aggiornate automaticamente

---

## 📧 **Email Services (Opzionale)**

### **Gmail SMTP:**
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password  # Non la password normale!
```

**Come ottenere App Password:**
1. Vai su [myaccount.google.com/security](https://myaccount.google.com/security)
2. Abilita 2-Factor Authentication
3. Vai su "App passwords"
4. Genera password per "Mail"

### **SendGrid (Alternativa):**
```bash
SENDGRID_API_KEY=SG.your_sendgrid_api_key_here
```

---

## 🔒 **Security Best Practices**

### **Chiavi da NON Esporre nel Frontend:**
- `SUPABASE_SERVICE_ROLE_KEY`
- `SMTP_PASS`
- `SENDGRID_API_KEY`
- Qualsiasi `*_SECRET`

### **Gestione Multi-Environment:**
```bash
# Development
.env.development
REACT_APP_BASE_URL=http://localhost:5173

# Staging
.env.staging
REACT_APP_BASE_URL=https://staging-reflectme.netlify.app

# Production
.env.production
REACT_APP_BASE_URL=https://reflectme.app
```

### **Rotazione Chiavi:**
- **Gemini API:** Rinnova ogni 90 giorni
- **Google OAuth:** Monitora usage, rinnova se necessario
- **Supabase:** Rigenera se compromesse

---

## 🧪 **Testing Configuration**

### **Verifica Supabase:**
```bash
# Test connection
curl -H "apikey: YOUR_ANON_KEY" \
     -H "Authorization: Bearer YOUR_ANON_KEY" \
     https://your-project.supabase.co/rest/v1/profiles
```

### **Verifica Google OAuth:**
```bash
# Test in browser console (da /connect-health)
console.log('Google Client ID:', process.env.REACT_APP_GOOGLE_CLIENT_ID);
```

### **Verifica Gemini:**
```bash
# Test in browser console
fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=YOUR_API_KEY', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contents: [{ parts: [{ text: 'Hello, test message' }] }]
  })
});
```

---

## 🚨 **Troubleshooting**

### **Errori Comuni:**

**❌ "Supabase client has not been configured"**
```
→ Verifica VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY
```

**❌ "Google OAuth redirect_uri_mismatch"**
```
→ Aggiungi l'URI esatto nel Google Cloud Console
→ Verifica che non ci siano spazi o caratteri extra
```

**❌ "Gemini API quota exceeded"**
```
→ Controlla rate limits in Google Cloud Console
→ Considera upgrade del piano se necessario
```

**❌ "Netlify Functions timeout"**
```
→ Verifica che SUPABASE_SERVICE_ROLE_KEY sia configurata
→ Controlla logs delle Functions per dettagli
```

### **Debug Tools:**

```bash
# Check environment variables caricamento
npm run build -- --verbose

# Test Netlify Functions localmente
netlify dev

# Verifica build production
npm run preview
```

---

## ✅ **Checklist Finale**

Verifica che tutto funzioni:

- [ ] **App si avvia** senza errori console
- [ ] **Login/Register** funziona (Supabase)
- [ ] **Page /connect-health** si carica
- [ ] **Google OAuth flow** completo (redirect)
- [ ] **Dashboard** mostra componenti Phase 3
- [ ] **Build production** riesce (`npm run build`)
- [ ] **Netlify deployment** senza errori

**🎉 Se tutti i check passano, sei pronto per il go-live!**

---

## 📞 **Support**

In caso di problemi:

1. **Controlla i logs:**
   - Browser console per errori frontend
   - Netlify Function logs per errori backend
   - Supabase logs per errori database

2. **Verifica configurazione:**
   - Tutti i valori nelle env vars sono corretti
   - Nessun spazio extra nelle chiavi
   - HTTPS abilitato per OAuth in production

3. **Test isolati:**
   - Testa ogni servizio singolarmente
   - Usa Postman/curl per API calls diretti

**Ricorda: Phase 3 è pronta! Ora è solo questione di configurazione. 🚀** 