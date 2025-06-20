# 🧭 ReflectMe - Guida Navigazione UI

## 📍 **Mappa Completa delle Route**

### **🩺 Area Terapista**

#### **1. Dashboard (`/therapist`)**
```
🎯 Percorso: Login → Therapist Portal
📍 URL: /therapist

Dashboard Overview:
├── 📊 "Client Overview" cards
├── 📈 "Recent Assessments" summary
├── 🔔 "Alerts" high-priority clients
├── 📅 "Today's Sessions" schedule
└── 🎯 "Quick Actions" navigation
```

#### **2. Active Clients (`/therapist/active-clients`)**
```
🎯 Percorso: Dashboard → Active Clients
📍 URL: /therapist/active-clients

Client Management:
├── 🔍 Search & filter clients
├── 📊 Client status cards (active/pending/on-hold)
├── 🚨 Risk levels & trend indicators
├── 📅 Assessment due notifications
└── 🔗 Direct links to client details
```

#### **3. Dettagli Cliente (`/therapist/clients/:clientId`)**
```
🎯 Percorso: Active Clients → Click client card
📍 URL: /therapist/clients/[client-id]

Client Profile:
├── 📋 Complete assessment history
├── 📊 Progress charts & trends
├── 📝 Session notes & case history
├── 🎯 Treatment goals & milestones
└── 📱 Communication logs
```

#### **4. Monitoring Overview (`/therapist/monitoring`)**
```
🎯 Percorso: Dashboard → Monitoring
📍 URL: /therapist/monitoring

System-wide Monitoring:
├── 📊 Client status dashboard
├── 🚨 Risk level filtering
├── 📈 Trend analysis across all clients
├── ⏰ Assessment due notifications
└── 📋 Quick intervention options
```

#### **5. Analytics Globali (`/therapist/analytics`)**
```
🎯 Percorso: Dashboard → Analytics
📍 URL: /therapist/analytics

Practice Analytics:
├── 📈 Outcome trends analysis
├── 📊 Client progress statistics
├── 🎯 Treatment effectiveness metrics
├── 📅 Session frequency patterns
└── 📋 Assessment completion rates
```

#### **6. Case Histories (`/therapist/case-histories`)**
```
🎯 Percorso: Dashboard → Case Histories
📍 URL: /therapist/case-histories

Case Management:
├── 📁 All client case files
├── 🔍 Search & filter cases
├── 📝 Create new case history
├── 📊 Case outcomes tracking
└── 📋 Treatment plan templates
```

---

### **👤 Area Paziente**

#### **1. Dashboard (`/client`)**
```
🎯 Percorso: Login → Patient Portal
📍 URL: /client

Patient Dashboard:
├── 🎉 Phase 3 health data banner
├── 🏆 MicroWins celebration card
├── 📊 Health metrics preview (steps/sleep)
├── 📋 Next assessments queue
├── 📝 Recent journal entries
└── 🔗 Quick access navigation
```

#### **2. Assessment Hub (`/client/monitoring`)**
```
🎯 Percorso: Dashboard → Monitoring
📍 URL: /client/monitoring

Complete Assessment Center:
├── 📋 "Scale Assessment" tab
│   ├── 😔 PHQ-9 (Depressione)
│   ├── 😰 GAD-7 (Ansia)
│   ├── 🎯 WHODAS-2.0 (Disabilità)
│   └── 📋 DSM-5-CC (Multi-dominio)
├── 📊 "Wellness Quotidiano" tab
│   ├── ✅ Daily check-ins
│   ├── 📈 Wellness metrics
│   └── 🏆 Streak tracking
└── 📈 "Trend Personalizzati" tab
    ├── 📊 Assessment score trends
    ├── 🌟 Correlazioni wellness
    ├── 🎯 Progress verso obiettivi
    └── 📈 AI insights personalizzati
```

#### **3. Chat & Journal (`/client/chat`, `/client/journal`)**
```
🎯 Percorso: Dashboard → Chat/Journal
📍 URL: /client/chat | /client/journal

Communication Tools:
├── 💬 Real-time therapist chat
├── 📝 Personal journal entries
├── 🎯 Mood tracking integration
├── 📊 Wellness pattern recognition
└── 🤖 AI micro-wins detection
```

---

### **📝 Assessment Experience**

#### **Assessment Diretto (`/assessment/:clientId`)**
```
🎯 Percorso: Link diretto o notifica
📍 URL: /assessment/[client-id]?scale=[scale-id]

Interactive Assessment:
├── 🎯 Scale-specific questionnaire
├── 📊 Real-time progress bar
├── 💾 Auto-save functionality
├── 📤 Submit & instant results
├── 📈 Score interpretation
└── 🔄 Navigation to next assessment
```

Parametri URL supportati:
- `scale=phq9` → PHQ-9 Depression scale
- `scale=gad7` → GAD-7 Anxiety scale  
- `scale=whodas` → WHODAS-2.0 Disability scale
- `scale=dsm5` → DSM-5-CC Cross-cutting scale

---

### **🔗 Health Integration**

#### **Connect Health (`/connect-health`)**
```
🎯 Percorso: Dashboard → Phase 3 banner
📍 URL: /connect-health

OAuth Integration:
├── 🏃‍♂️ Google Fit connection
├── ❤️ Apple Health (mobile app)
├── 📊 Data permissions explanation
├── 🔒 Privacy & security info
└── ⚙️ Integration setup wizard
```

#### **OAuth Callback (`/oauth/callback`)**
```
🎯 Percorso: Automatic redirect from Google
📍 URL: /oauth/callback

OAuth Flow:
├── 🔄 Token exchange processing
├── ✅ PKCE verification
├── 💾 Secure token storage
├── 📊 Initial data sync trigger
└── ↩️ Redirect to dashboard
```

---

## 🎯 **AI Summary Locations**

### **1. Patient Dashboard**
```
📍 Location: /client (main dashboard)
🎯 Component: AI Progress Card
📊 Content: "Your 30-day progress summary with key insights"
🔄 Update: Daily refresh, cached 24h
```

### **2. Therapist Insights**
```
📍 Location: /therapist/clients/:clientId
🎯 Component: Clinical Summary Panel
📊 Content: "Detailed progress analysis with recommendations"
🔄 Update: Pre-session refresh, manual trigger
```

### **3. Session Prep**
```
📍 Location: /therapist/session-recap/:clientId
🎯 Component: Pre-Session Brief
📊 Content: "Recent developments and focus areas"
🔄 Update: Real-time before sessions
```

### **4. Mobile Notifications**
```
📍 Location: Push notifications (future mobile app)
🎯 Component: Weekly Progress Digest
📊 Content: "Weekly achievements and insights summary"
🔄 Update: Weekly automated delivery
```

---

## 🔍 **Assessment Scale Access**

### **Scale Availability Matrix**
| Scale | Patient Access | Therapist View | Mobile Support |
|-------|---------------|----------------|----------------|
| **PHQ-9** | ✅ /client/monitoring | ✅ All locations | 🔄 Coming soon |
| **GAD-7** | ✅ /client/monitoring | ✅ All locations | 🔄 Coming soon |
| **WHODAS-2.0** | ✅ /client/monitoring | ✅ All locations | 🔄 Coming soon |
| **DSM-5-CC** | ✅ /client/monitoring | ✅ All locations | 🔄 Coming soon |

### **Quick Assessment Links**
```
Direct PHQ-9: /assessment/[client-id]?scale=phq9
Direct GAD-7: /assessment/[client-id]?scale=gad7
Direct WHODAS: /assessment/[client-id]?scale=whodas
Direct DSM-5: /assessment/[client-id]?scale=dsm5
```

---

## 📱 **Mobile Navigation (Future)**

### **Phase 4 Mobile App Structure**
```
ReflectMe Mobile:
├── 🏠 Home (dashboard condensed)
├── 📋 Quick Assessment (simplified UI)
├── 💬 Chat (real-time notifications)
├── 📝 Journal (voice-to-text)
├── 📊 Progress (visual charts)
├── ❤️ Health Data (Apple Health integration)
└── ⚙️ Settings (sync preferences)
```

---

## 🚀 **Quick Reference URLs**

### **Therapist Quick Links**
```
Dashboard: /therapist
Active Clients: /therapist/active-clients  
Monitoring: /therapist/monitoring
Analytics: /therapist/analytics
Case Management: /therapist/case-histories
```

### **Patient Quick Links**
```
Dashboard: /client
Assessment Hub: /client/monitoring
Chat: /client/chat
Journal: /client/journal
Health Connect: /connect-health
```

### **Assessment Quick Links**
```
Assessment Landing: /assessment/[client-id]
PHQ-9 Direct: /assessment/[client-id]?scale=phq9
GAD-7 Direct: /assessment/[client-id]?scale=gad7
Multi-scale Flow: /client/monitoring → Select scale
```

---

**💡 Pro Tip**: Tutti i path sono responsive e supportano navigation via breadcrumb e back buttons. Le deep-links funzionano correttamente per bookmarking e condivisione.
