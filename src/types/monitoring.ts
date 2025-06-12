export interface MonitoringFormData {
  waterIntake: number; // 0-10
  sunlightExposure: number; // 0-10
  healthyMeals: number; // 0-10
  exerciseDuration: 'none' | 'under15' | 'under30' | 'above30';
  sleepHours: number; // 0-10
  socialInteractions: number; // 0-10
  taskNotes: string;
  taskRemarks: string;
  date: Date;
}

export interface MonitoringEntry extends MonitoringFormData {
  id: string;
  clientId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TherapistReviewProps {
  clientId: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface MonitoringStats {
  averageWaterIntake: number;
  averageSunlightExposure: number;
  averageHealthyMeals: number;
  averageSleepHours: number;
  averageSocialInteractions: number;
  mostCommonExerciseDuration: string;
  totalEntries: number;
}