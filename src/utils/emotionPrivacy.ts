interface EmotionPrivacySettings {
  hideNegativeEmotions: boolean;
  allowedEmotions: string[];
  therapistViewOnly: string[];
}

const NEGATIVE_EMOTIONS = [
  'frustration', 'disappointment', 'anger', 'sadness', 'anxiety', 
  'fear', 'stress', 'overwhelm', 'despair', 'hopelessness',
  'irritation', 'worry', 'panic', 'grief', 'loneliness'
];

const POSITIVE_EMOTIONS = [
  'joy', 'happiness', 'calm', 'peaceful', 'hope', 'optimism',
  'gratitude', 'contentment', 'relief', 'confidence', 'love',
  'excitement', 'enthusiasm', 'pride', 'determination'
];

const NEUTRAL_EMOTIONS = [
  'curious', 'thoughtful', 'reflective', 'focused', 'alert',
  'tired', 'neutral', 'processing', 'contemplative'
];

export class EmotionPrivacyManager {
  private static defaultSettings: EmotionPrivacySettings = {
    hideNegativeEmotions: true, // Default to hiding negative emotions from patients
    allowedEmotions: [...POSITIVE_EMOTIONS, ...NEUTRAL_EMOTIONS],
    therapistViewOnly: NEGATIVE_EMOTIONS
  };

  /**
   * Filter emotions based on user role and privacy settings
   */
  static filterEmotionsForPatient(emotions: string, settings?: Partial<EmotionPrivacySettings>): string {
    const config = { ...this.defaultSettings, ...settings };
    
    if (!emotions) return '';
    
    // Split emotions by common delimiters
    const emotionList = emotions.split(/[,;]/).map(emotion => emotion.trim().toLowerCase());
    
    if (!config.hideNegativeEmotions) {
      return emotions; // Show all emotions if privacy is disabled
    }
    
    // Filter out negative emotions for patient view
    const filteredEmotions = emotionList.filter(emotion => {
      // Check if emotion contains negative keywords
      const isNegative = NEGATIVE_EMOTIONS.some(negEmotion => 
        emotion.includes(negEmotion.toLowerCase())
      );
      return !isNegative;
    });
    
    // If no positive emotions remain, show a generic supportive message
    if (filteredEmotions.length === 0) {
      return 'processing, reflective';
    }
    
    return filteredEmotions.join(', ');
  }

  /**
   * Get emotions that should only be visible to therapists
   */
  static getTherapistOnlyEmotions(emotions: string): string {
    if (!emotions) return '';
    
    const emotionList = emotions.split(/[,;]/).map(emotion => emotion.trim().toLowerCase());
    
    const therapistOnlyEmotions = emotionList.filter(emotion => {
      return NEGATIVE_EMOTIONS.some(negEmotion => 
        emotion.includes(negEmotion.toLowerCase())
      );
    });
    
    return therapistOnlyEmotions.join(', ');
  }

  /**
   * Get user-friendly emotion descriptions
   */
  static getEmotionInsight(emotions: string): string {
    if (!emotions) return '';
    
    const emotionList = emotions.split(/[,;]/).map(emotion => emotion.trim().toLowerCase());
    
    // Generate supportive insights based on detected emotions
    const hasPositive = emotionList.some(emotion => 
      POSITIVE_EMOTIONS.some(posEmotion => emotion.includes(posEmotion))
    );
    
    const hasNeutral = emotionList.some(emotion => 
      NEUTRAL_EMOTIONS.some(neutEmotion => emotion.includes(neutEmotion))
    );
    
    if (hasPositive) {
      return 'You seem to be in a positive mindset - that\'s wonderful!';
    } else if (hasNeutral) {
      return 'You appear thoughtful and reflective today.';
    } else {
      return 'I\'m here to support you through whatever you\'re feeling.';
    }
  }

  /**
   * Check if user is a therapist (this would integrate with your auth system)
   */
  static isTherapist(userRole?: string): boolean {
    return userRole === 'therapist' || userRole === 'admin';
  }

  /**
   * Get privacy settings for a user
   */
  static getPrivacySettings(userRole?: string): EmotionPrivacySettings {
    if (this.isTherapist(userRole)) {
      return {
        hideNegativeEmotions: false, // Therapists see all emotions
        allowedEmotions: [...POSITIVE_EMOTIONS, ...NEUTRAL_EMOTIONS, ...NEGATIVE_EMOTIONS],
        therapistViewOnly: []
      };
    }
    
    return this.defaultSettings;
  }
}

export { NEGATIVE_EMOTIONS, POSITIVE_EMOTIONS, NEUTRAL_EMOTIONS }; 