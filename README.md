# MindTwin - Mental Health Digital Twin Platform

A comprehensive mental health platform that bridges the gap between therapy sessions with personalized digital support.

## Features

### For Patients
- **Digital Companion**: AI-powered chat interface for support between sessions
- **Local Voice Journal**: Client-side speech recognition with automatic mood detection
- **Mood Tracking**: Interactive charts showing mood trends over time
- **Coping Strategies**: Personalized techniques based on therapy sessions

### For Therapists
- **Client Management**: Comprehensive dashboard for tracking patient progress
- **Session Notes**: SOAP note generation with voice recording capabilities
- **Case Histories**: Detailed patient documentation and assessment tools
- **Analytics**: Mood trends and progress tracking across all clients

## Voice Journal Integration

### Client-Side Speech Recognition
The application now uses the Web Speech API for local, privacy-focused voice journaling:

#### Key Features
- **Local Processing**: All speech recognition happens in the browser - no data sent to external servers
- **60-Second Recording**: Optimized for quick daily mood and thought capture
- **Automatic Mood Detection**: Uses local sentiment analysis to map speech to a 1-5 mood scale
- **Real-time Transcription**: Live text display as you speak
- **Editable Results**: Modify transcribed text before saving to journal

#### Browser Compatibility
- **Chrome**: Full support with high-quality recognition
- **Edge**: Full support with high-quality recognition  
- **Safari**: Full support with good recognition quality
- **Firefox**: Limited support (Web Speech API not fully implemented)

#### How It Works
1. **Speech Capture**: Uses browser's native Web Speech API for audio input
2. **Real-time Transcription**: Converts speech to text locally in the browser
3. **Sentiment Analysis**: Analyzes text using the `sentiment` library to determine emotional tone
4. **Mood Mapping**: Maps sentiment score to 1-5 mood scale:
   - Score ≤ -0.6: Mood 1 (Very Low) 😔
   - Score ≤ -0.2: Mood 2 (Low) 🙁  
   - Score ≤ 0.2: Mood 3 (Neutral) 😐
   - Score ≤ 0.6: Mood 4 (Good) 🙂
   - Score > 0.6: Mood 5 (Very Good) 😊
5. **Journal Integration**: Saves transcribed text and mood score to patient's journal

### SpeechJournalMood Component

The `SpeechJournalMood` component provides a complete voice journaling experience:

```typescript
interface VoiceJournalData {
  journal: string;
  mood: number;
}

<SpeechJournalMood 
  onDataUpdate={(data: VoiceJournalData) => {
    // Handle journal entry and mood data
  }}
/>
```

#### Component Features
- **Visual Recording Interface**: Large microphone button with recording timer
- **Progress Indicators**: Visual feedback during recording and processing
- **Error Handling**: Clear messages for unsupported browsers or permission issues
- **Mood Visualization**: Emoji and color-coded mood display with 5-level bar chart
- **Editable Text**: Users can modify transcribed text before saving
- **Local Storage**: All processing happens client-side for maximum privacy

## Environment Variables

```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Note**: ElevenLabs dependencies have been removed. The application now uses local browser APIs for speech processing.

## Development Setup

### Prerequisites
- Node.js 18+ 
- npm or pnpm
- Modern browser with Web Speech API support (Chrome, Edge, Safari recommended)

### Installation
```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Add your Supabase credentials to .env file
```

### Running the Application
```bash
# Start the development server
npm run dev

# Application will be available at http://localhost:5173
```

## Testing Voice Integration

1. **Browser Setup**: Use Chrome, Edge, or Safari for best results
2. **Permissions**: Grant microphone access when prompted
3. **Recording**: Navigate to any patient page and use the voice journal widget
4. **Process Flow**:
   - Click microphone to start 60-second recording
   - Speak your thoughts and current mood
   - Watch real-time transcription appear
   - Review automatically detected mood score
   - Edit text if needed and save to journal

## Local Speech Processing

### Web Speech API Integration
- **Recognition Engine**: Uses browser's built-in speech recognition
- **Language**: Configured for English (en-US) with high accuracy
- **Continuous Mode**: Captures speech continuously during recording session
- **Interim Results**: Shows partial transcription in real-time

### Sentiment Analysis
- **Library**: Uses `sentiment` npm package for local text analysis
- **Processing**: Analyzes emotional tone of transcribed text
- **Mapping Algorithm**: 
  ```javascript
  const mapSentimentToMood = (sentimentScore) => {
    if (sentimentScore <= -0.6) return 1; // Very negative
    if (sentimentScore <= -0.2) return 2; // Negative  
    if (sentimentScore <= 0.2) return 3;  // Neutral
    if (sentimentScore <= 0.6) return 4;  // Positive
    return 5; // Very positive
  };
  ```

### Privacy & Security
- **No External APIs**: All speech processing happens locally in the browser
- **No Data Transmission**: Voice data never leaves the user's device
- **HIPAA Compliance**: Local processing ensures patient privacy
- **Secure Storage**: Journal entries stored securely in Supabase with RLS

## Component Architecture

### Patient-Only Access Control
Voice journal components are restricted to patient accounts:
```typescript
{user?.role === 'patient' && (
  <SpeechJournalMood onDataUpdate={handleVoiceJournalUpdate} />
)}
```

### Data Flow
1. **Voice Input**: Patient records audio via Web Speech API
2. **Local Transcription**: Browser converts speech to text in real-time
3. **Sentiment Analysis**: Local analysis determines mood score
4. **UI Update**: Components update with transcribed text and detected mood
5. **Journal Integration**: Data can be edited and saved to permanent journal entries

## Troubleshooting

### Browser Compatibility Issues
- **Firefox**: Web Speech API not fully supported - use Chrome, Edge, or Safari
- **Older Browsers**: Upgrade to latest version for best compatibility
- **Mobile**: iOS Safari and Android Chrome work well

### Microphone Access
- **Permissions**: Ensure microphone access is granted
- **HTTPS Required**: Voice features require secure connection in production
- **Privacy Settings**: Check browser privacy settings if microphone blocked

### Speech Recognition Issues
- **Clear Speech**: Speak clearly and at normal pace
- **Quiet Environment**: Reduce background noise for better accuracy
- **Language**: Currently optimized for English - other languages may have reduced accuracy

## Production Deployment

### Build Process
```bash
# Build the frontend
npm run build

# Serve static files from dist/ directory
```

### Environment Setup
- Configure Supabase credentials
- Ensure HTTPS for microphone access
- Set up proper CORS policies

### Performance Optimization
- Voice processing is entirely client-side - no server load
- Sentiment analysis library is lightweight (~50KB)
- Real-time transcription provides immediate feedback

---

**Note**: This platform supplements professional mental health care. All voice interactions are processed locally in the browser with strict privacy protections and no external data transmission.