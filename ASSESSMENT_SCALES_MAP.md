# 📊 **Mappa Completa Scale di Assessment - ReflectMe**

**Guida alle Scale Cliniche e AI Progress Summaries**

---

## 🎯 **SCALE DISPONIBILI NEL SISTEMA**

### **🧠 Scale Mental Health Principali**

#### **1. 😔 PHQ-9 (Patient Health Questionnaire-9)**
```
📋 Tipo: Depression Assessment
🎯 Target: Episodi depressivi maggiori
📊 Scale: 0-27 punti
⏱️ Durata: 2-3 minuti
🔄 Frequenza: Bisettimanale

📍 Dove trovarla:
├── 🏠 Dashboard → "Pending Assessments" 
├── 📊 Monitoring → "Available Assessments"
├── 👨‍⚕️ Therapist → Client Details → "Assign Assessment"
└── 🔗 Direct link: /assessment/[client-id]?scale=phq9

📊 Interpretazione Scores:
├── 0-4:   Minimal depression 🟢
├── 5-9:   Mild depression 🟡  
├── 10-14: Moderate depression 🟠
├── 15-19: Moderately severe 🔴
└── 20-27: Severe depression ⚫

⚠️ Alert Speciale:
└── Domanda 9 (ideazione suicidaria) trigger protocollo safety
```

#### **2. 😰 GAD-7 (Generalized Anxiety Disorder-7)**
```
📋 Tipo: Anxiety Assessment  
🎯 Target: Disturbi d'ansia generalizzata
📊 Scale: 0-21 punti
⏱️ Durata: 2-3 minuti
🔄 Frequenza: Bisettimanale

📍 Dove trovarla:
├── 🏠 Dashboard → "Anxiety Assessment"
├── 📊 Monitoring → "GAD-7 Quick Check"
├── 👨‍⚕️ Therapist → Analytics → "Anxiety Trends"
└── 🔗 Direct link: /assessment/[client-id]?scale=gad7

📊 Interpretazione Scores:
├── 0-4:   Minimal anxiety 🟢
├── 5-9:   Mild anxiety 🟡
├── 10-14: Moderate anxiety 🟠  
└── 15-21: Severe anxiety 🔴

🎯 Clinical Use:
└── Screening + monitoring treatment response
```

#### **3. 🧩 WHODAS-2.0 (WHO Disability Assessment Schedule)**
```
📋 Tipo: Functional Disability Assessment
🎯 Target: Impairment in daily functioning
📊 Scale: 0-100% disability score
⏱️ Durata: 5-7 minuti  
🔄 Frequenza: Mensile

📍 Dove trovarla:
├── 📊 Monitoring → "Functional Assessment"
├── 👨‍⚕️ Therapist → Client Details → "WHODAS-2.0"
├── 📈 Analytics → "Disability Trends"
└── 🔗 Direct link: /assessment/[client-id]?scale=whodas

📊 Domini Valutati:
├── 🧠 Cognition (understanding & communicating)
├── 🚶 Mobility (moving & getting around)
├── 🧑‍🤝‍🧑 Self-care (hygiene, dressing, eating)
├── 🏠 Getting along (interacting with people)
├── 💼 Life activities (domestic, work/school)
└── 🌍 Participation (community activities)

🎯 Clinical Value:
└── Misura outcome funzionali + disability burden
```

#### **4. 🎭 DSM-5-CC (Cross-Cutting Symptom Measure)**
```
📋 Tipo: Multi-domain Symptom Screening
🎯 Target: Broad mental health symptoms
📊 Scale: Multi-dimensional scoring
⏱️ Durata: 5-10 minuti
🔄 Frequenza: Intake + follow-up

📍 Dove trovarla:
├── 🏥 Initial Assessment → "Comprehensive Screening"
├── 👨‍⚕️ Therapist → "New Client Setup"
├── 📊 Monitoring → "Full Symptom Review"
└── 🔗 Direct link: /assessment/[client-id]?scale=dsm5

📊 Domini Coperti (13 aree):
├── 😔 Depression
├── 😰 Anxiety  
├── 😴 Sleep problems
├── 🍷 Substance use
├── 🧠 Memory/cognition
├── 😡 Irritability
├── 🎭 Mania/hypomania
├── 👻 Psychosis
├── 🔄 Repetitive thoughts
├── 🌪️ Dissociation
├── 💥 Personality dysfunction
└── 🤕 Somatic symptoms

🎯 Uso Clinico:
└── Screening completo + identify comorbidities
```

---

## 🤖 **AI PROGRESS SUMMARIES - Locations & Features**

### **📍 1. Patient Dashboard Summary**
```
🎯 Location: /client → "🤖 Your Progress Summary" card
📊 Content: 3-sentence clinical narrative
🔄 Update: Every 24 hours + manual refresh
📱 Mobile: Collapsible card with swipe gestures

Example Output:
┌─────────────────────────────────────────────────┐
│ 🤖 Your Progress Summary                        │
├─────────────────────────────────────────────────┤
│ "Over the past month, your PHQ-9 depression    │
│ scores have shown consistent improvement,       │
│ declining from 14 to 9 points. Your sleep      │
│ patterns have stabilized at 7-8 hours nightly  │
│ and daily step counts average 8,500, both      │
│ correlating positively with mood improvements." │
├─────────────────────────────────────────────────┤
│ 🔄 Updated 3 hours ago • Powered by Gemini AI  │
│ [🔄 Refresh] [📊 View Details] [📤 Share]       │
└─────────────────────────────────────────────────┘
```

### **📍 2. Therapist Clinical Insights**
```
🎯 Location: /therapist/clients/[id] → "🧠 AI Clinical Insights" tab
📊 Content: Detailed clinical analysis + recommendations
🔄 Update: Daily + triggered by new data
👨‍⚕️ Audience: Clinical-grade language

Features:
├── 📈 Assessment trend analysis
├── 🔍 Risk factor identification  
├── 🎯 Treatment recommendation
├── 📊 Biometrics correlation
├── ⚠️ Safety alerts
└── 📋 Progress benchmarking
```

### **📍 3. Session Preparation Summary**
```
🎯 Location: /therapist/session-recap/[client-id]
📊 Content: Pre-session briefing with key points
🔄 Update: Generated before each scheduled session
⏰ Timing: Auto-generated 2 hours before appointment

Content Includes:
├── 📊 Recent assessment changes
├── 🎯 Key discussion topics
├── ⚠️ Safety concerns to address
├── 🎉 Achievements to celebrate
├── 📈 Progress since last session
└── 💡 Suggested interventions
```

### **📍 4. Mobile Quick Insights**
```
🎯 Location: Mobile app → Push notifications
📱 Delivery: Smart notifications based on data changes
🔔 Frequency: Weekly digest + significant changes

Types:
├── 🎉 "Great progress this week!" celebrations
├── 📊 "Your mood scores improved" updates  
├── ⚠️ "Consider checking in with therapist" alerts
├── 🎯 "You're close to your goals" motivation
└── 📈 "New patterns detected" insights
```

---

## 🎨 **UI NAVIGATION PATHS**

### **🧭 Per Pazienti - Come Accedere alle Scale**

#### **Percorso Rapido (Dashboard):**
```
1. 🏠 Login → Dashboard (/client)
2. 👀 Cerca "Pending Assessments" widget
3. 📊 Click su assessment name (es. "PHQ-9 Due")
4. ➡️ Auto-redirect a /assessment/[id]
5. ✅ Complete questionnaire
6. 📈 View instant results + interpretation
```

#### **Percorso Completo (Monitoring):**
```
1. 🏠 Dashboard → "Monitoring" tab
2. 📍 URL: /client/monitoring  
3. 📋 See "Available Assessments" section
4. 🎯 Filter by:
   ├── 📊 Type (Depression, Anxiety, etc.)
   ├── ⏰ Due date
   ├── ✅ Completion status
   └── 🔄 Frequency
5. 📝 Click "Start Assessment"
6. 🎯 Complete in guided interface
7. 📊 View results + trend graphs
```

### **🧭 Per Terapisti - Gestione Assessment**

#### **Vista Cliente Singolo:**
```
1. 👨‍⚕️ Therapist Dashboard (/therapist)
2. 👤 Click client name → Client Details
3. 📊 Navigate to "Assessments" tab
4. 📋 View:
   ├── ✅ Completed assessments list
   ├── ⏳ Pending/overdue assessments
   ├── 📈 Score trends over time
   ├── 📊 Comparison charts
   └── 🎯 Clinical interpretation

Actions Available:
├── ➕ "Assign New Assessment"
├── 📊 "View Full Results"  
├── 📈 "Export Trend Data"
├── 📤 "Generate Report"
└── 🔄 "Schedule Follow-up"
```

#### **Vista Analytics Globale:**
```
1. 👨‍⚕️ Dashboard → "Analytics" (/therapist/analytics)
2. 📊 Assessment Overview Dashboard
3. 🎛️ Filter Controls:
   ├── 👥 Client groups
   ├── 📅 Date ranges  
   ├── 📊 Assessment types
   ├── 🎯 Severity levels
   └── 📈 Completion rates

Visualizations:
├── 📊 Score distribution charts
├── 📈 Trend analysis graphs
├── 🎯 Outcome predictions
├── 📋 Completion rate metrics
└── ⚠️ Risk assessment alerts
```

---

## 🔍 **COME TROVARE SPECIFIC SCALE**

### **🔍 Quick Search Method:**

#### **URL Diretti:**
```bash
# PHQ-9 per client specifico
/assessment/[client-id]?scale=phq9

# GAD-7 assessment
/assessment/[client-id]?scale=gad7

# WHODAS disability assessment  
/assessment/[client-id]?scale=whodas

# DSM-5 Cross-Cutting
/assessment/[client-id]?scale=dsm5
```

#### **Search nella UI:**
```
🔍 Dashboard Search:
1. 🏠 Any dashboard page
2. 🔍 Use search bar (top navigation)
3. 🎯 Type: "PHQ", "GAD", "depression", "anxiety"
4. 📋 Get instant results with direct links

🎛️ Filter Options:
├── 📊 By assessment type
├── ⏰ By due date
├── 👤 By client (therapists)
├── ✅ By completion status  
└── 🎯 By severity level
```

### **📱 Mobile Navigation:**
```
📱 Mobile App Quick Access:
├── 🏠 Bottom tab: "Assessments"
├── 🔔 Push notifications with direct links
├── 📊 Widget shortcuts on home screen
├── 🎯 Voice command: "Open PHQ assessment"
└── 📋 Offline completion with sync
```

---

## ⚡ **SHORTCUTS & TIPS**

### **⌨️ Keyboard Shortcuts:**
```
🎯 Assessment Navigation:
├── Ctrl+A: Open available assessments
├── Ctrl+H: View assessment history
├── Ctrl+R: Refresh AI summary
├── Tab: Navigate between questions
├── Enter: Submit current answer
├── Esc: Save progress & exit
└── Ctrl+S: Manual save (auto-save enabled)
```

### **🎯 Pro Tips per Therapists:**
```
💡 Efficiency Hacks:
├── 📊 Bookmark direct assessment URLs
├── 🔔 Set up custom notification rules
├── 📈 Create assessment templates
├── 📋 Use bulk assignment features
├── 📤 Schedule automated reports
└── 🎯 Set client-specific reminders

📊 Analytics Tips:
├── 📈 Use trend overlay comparisons
├── 🎯 Set custom score thresholds
├── 📋 Export data for external analysis
├── 🔍 Use correlation discovery tools
└── ⚠️ Configure risk alert parameters
```

### **📱 Tips per Patients:**
```
💡 User Experience Tips:
├── 🔔 Enable smart notifications
├── 📊 Set personal goals in assessments
├── 🎯 Use voice-to-text for open questions
├── 📱 Complete during optimal mood times
├── 📈 Review progress graphs regularly
└── 🤖 Read AI summaries for motivation

⏰ Timing Recommendations:
├── 🌅 Morning: Energy-related assessments
├── 🌆 Evening: Mood reflection assessments
├── 📅 Weekly: Comprehensive reviews
└── 🎯 Pre-session: Quick check-ins
```

**🎯 Con questa mappa completa, hai tutto quello che serve per navigare efficacemente le scale di assessment e gli AI insights in ReflectMe! 🚀** 