# AI Safety & Memory Layer (Phase-Guard) Implementation

## Overview

The AI Safety & Memory Layer provides comprehensive safety monitoring, semantic memory, and crisis detection for the Zentia mental health platform. This system ensures all AI interactions are safe, contextually aware, and properly monitored.

## Architecture Components

### 1. Database Schema (`supabase/migrations/202507_guardrails.sql`)

**Tables Created:**
- `guardrail_log` - Logs all safety violations and blocked content
- `chat_semantic` - Vector store for semantic conversation memory
- `chat_archive` - Long-term storage for old conversations
- `alerts` - Crisis and safety alerts for therapists
- `crisis_keywords` - Configurable keywords for crisis detection

**Key Features:**
- Row Level Security (RLS) for therapist-client data isolation
- Vector indexing for semantic search
- Automatic crisis keyword detection
- Configurable severity levels

### 2. Input Guard Edge Function (`supabase/functions/input-guard/index.ts`)

**Safety Checks:**
- Crisis keyword detection (faster than external APIs)
- Gemini AI therapeutic safety analysis
- Automatic alert generation for critical/high severity
- Comprehensive logging of all blocked content

**Response Format:**
```json
{
  "allowed": boolean,
  "reason": string,
  "severity": "low|medium|high|critical"
}
```

### 3. AI Orchestrator (`packages/ai/orchestrator.ts`)

**Core Functions:**
- `rewriteQuery()` - Therapeutic query enhancement
- `getSemanticContext()` - Vector-based context retrieval
- `getTransactionalContext()` - Recent data aggregation
- `buildPrompt()` - Comprehensive prompt construction
- `outputGuard()` - AI response safety validation
- `alertTherapist()` - Crisis notification system
- `saveChatTurn()` - Semantic memory storage

### 4. Semantic Retriever (`packages/ai/retriever.ts`)

**Search Capabilities:**
- Vector similarity search using pgvector
- Multi-source retrieval (chat, journal, assessments, mood)
- Conversation history analysis
- Therapeutic theme extraction
- Progress indicator tracking

### 5. Chat API (`apps/web/app/api/chat/route.ts`)

**Processing Pipeline:**
1. Input safety validation
2. Context gathering (semantic + transactional)
3. Query rewriting for therapeutic enhancement
4. AI response generation
5. Output safety validation
6. Crisis detection and alerting
7. Semantic memory storage
8. Transactional logging

### 6. Archive System (`supabase/functions/archive-chat/index.ts`)

**Maintenance Tasks:**
- Moves 30+ day old chat data to archive
- Cleans up 90+ day old guardrail logs
- Maintains database performance
- Preserves data for compliance

### 7. Therapist Dashboard Widgets

**AlertBadge Component:**
- Real-time alert count display
- Critical vs. regular alert distinction
- Click-to-navigate functionality
- Live updates via Supabase subscriptions

**GuardrailTable Component:**
- Recent safety event display
- Detailed violation information
- Client identification
- Time-based filtering

## Safety Features

### Crisis Detection
- **Critical Keywords:** suicide, kill myself, want to die, end it all
- **High Risk:** self harm, cut myself, overdose, no reason to live
- **Medium Risk:** hopeless, worthless, burden, can't take it anymore
- **Automatic Alerting:** Immediate therapist notification for critical/high severity

### Content Moderation
- **Gemini AI Safety Analysis:** Therapeutic content appropriateness checking
- **Dual Validation:** Both input and output are screened
- **Safe Responses:** Pre-approved therapeutic responses for blocked content
- **Audit Trail:** Complete logging of all safety events

### Memory System
- **Semantic Storage:** Vector embeddings for conversation context
- **Multi-Source Retrieval:** Chat, journal, assessments, mood data
- **Therapeutic Context:** AI-enhanced prompt building with client history
- **Performance Optimization:** Automatic archiving of old data

## Usage Examples

### Basic Chat Integration
```typescript
import { buildPrompt, outputGuard } from '@zentia/ai-orchestrator';

// Build context-aware prompt
const prompt = await buildPrompt(userMessage, clientId, context);

// Generate AI response
const aiResponse = await generateResponse(prompt);

// Validate output safety
const safetyCheck = await outputGuard(aiResponse, clientId);
if (!safetyCheck.allowed) {
  return getSafeResponse(safetyCheck.reason);
}
```

### Semantic Search
```typescript
import { retrieveNotes } from '@zentia/ai/retriever';

// Get relevant context
const relevantNotes = await retrieveNotes(
  clientId, 
  "anxiety symptoms", 
  5, 
  ['chat', 'journal']
);
```

### Crisis Alerting
```typescript
import { alertTherapist } from '@zentia/ai/orchestrator';

// Alert therapist about crisis
await alertTherapist(clientId, 'crisis_keywords_detected', {
  keyword: 'suicide',
  severity: 'critical',
  originalMessage: userMessage
});
```

## Configuration

### Environment Variables
```bash
# Required
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE=your_service_role_key
# OPENAI_API_KEY=your_openai_key (no longer needed - using Gemini)
GEMINI_API_KEY=your_gemini_key

# Optional
GUARDRAIL_LOG_RETENTION_DAYS=90
CHAT_ARCHIVE_DAYS=30
CRISIS_ALERT_EMAIL=therapist@example.com
```

### Crisis Keywords Management
```sql
-- Add new crisis keyword
INSERT INTO crisis_keywords (keyword, severity) 
VALUES ('new_crisis_term', 'medium');

-- Deactivate keyword
UPDATE crisis_keywords 
SET is_active = false 
WHERE keyword = 'old_term';
```

## Monitoring & Analytics

### Guardrail Metrics
- **Blocked Content Rate:** Percentage of messages blocked
- **Crisis Detection Rate:** Frequency of crisis keyword detection
- **Response Time:** Average processing time for safety checks
- **False Positive Rate:** Incorrectly blocked content

### Memory Performance
- **Context Retrieval Accuracy:** Relevance of retrieved context
- **Semantic Search Speed:** Vector query performance
- **Storage Efficiency:** Archive compression and cleanup
- **Memory Hit Rate:** Successful context matches

### Therapist Dashboard
- **Real-time Alerts:** Live crisis notifications
- **Safety Overview:** Recent guardrail events
- **Client Risk Assessment:** Individual client safety profiles
- **System Health:** Performance and error monitoring

## Security & Compliance

### Data Protection
- **HIPAA Compliance:** All data handling follows HIPAA guidelines
- **Encryption:** Data encrypted in transit and at rest
- **Access Control:** Row-level security for therapist-client isolation
- **Audit Logging:** Complete trail of all safety events

### Privacy Features
- **Anonymized Logging:** Sensitive data filtered from logs
- **Consent Management:** Client control over data retention
- **Data Minimization:** Only necessary data is stored
- **Right to Deletion:** Complete data removal capabilities

## Deployment

### 1. Database Migration
```bash
supabase db push
```

### 2. Edge Functions
```bash
supabase functions deploy input-guard
supabase functions deploy archive-chat
```

### 3. Package Installation
```bash
npm install @zentia/ai-orchestrator
```

### 4. Environment Setup
```bash
# Copy environment variables
cp environment.example .env.local
# Configure your API keys
```

### 5. CRON Setup
```bash
# Add to your deployment pipeline
# Runs nightly at 2 AM
0 2 * * * curl -X POST https://your-project.supabase.co/functions/v1/archive-chat
```

## Testing

### Safety Testing
```bash
# Test crisis keyword detection
curl -X POST /api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "I want to kill myself", "clientId": "test-id"}'

# Test content moderation
curl -X POST /api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "inappropriate content", "clientId": "test-id"}'
```

### Performance Testing
```bash
# Test semantic search
npm run test:retriever

# Test memory storage
npm run test:memory
```

## Troubleshooting

### Common Issues

**1. Vector Extension Not Available**
```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;
```

**2. Match Documents Function Missing**
```sql
-- Create the function manually
-- See the function definition in the chat API route
```

**3. Gemini API Rate Limits**
```typescript
// Implement retry logic with exponential backoff
// Consider caching moderation results
```

**4. Memory Performance Issues**
```sql
-- Optimize vector index
CREATE INDEX CONCURRENTLY chat_semantic_idx_optimized 
ON chat_semantic USING ivfflat (ctx_embedding vector_cosine_ops) 
WITH (lists = 100);
```

## Future Enhancements

### Planned Features
- **Advanced Crisis Detection:** Machine learning-based risk assessment
- **Multi-language Support:** Crisis keywords in multiple languages
- **Predictive Analytics:** Risk prediction based on conversation patterns
- **Enhanced Memory:** Cross-client pattern recognition (anonymized)
- **Real-time Collaboration:** Live therapist-AI collaboration features

### Performance Optimizations
- **Caching Layer:** Redis-based response caching
- **Batch Processing:** Efficient bulk operations
- **CDN Integration:** Global content delivery
- **Database Sharding:** Horizontal scaling for large deployments

## Support

For technical support or questions about the AI Safety & Memory Layer:

1. Check the troubleshooting section above
2. Review the Supabase logs for detailed error information
3. Contact the development team with specific error messages
4. Monitor the system health dashboard for performance issues

---

**Note:** This system is designed for mental health applications and should be used with appropriate clinical oversight. Always ensure compliance with local healthcare regulations and maintain proper therapist supervision of AI interactions. 