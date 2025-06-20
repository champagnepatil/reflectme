import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

// Form validation schema
const assessmentSchema = z.object({
  patientId: z.string().min(1, 'Patient ID is required'),
  assessmentType: z.enum(['PHQ9', 'GAD7', 'WHODAS']),
  scores: z.record(z.number().min(0).max(4)),
  notes: z.string().optional(),
});

type AssessmentFormData = z.infer<typeof assessmentSchema>;

interface AssessmentFormProps {
  patientId: string;
  onSubmit: (data: AssessmentFormData) => Promise<void>;
  defaultAssessmentType?: 'PHQ9' | 'GAD7' | 'WHODAS';
}

export function AssessmentForm({ patientId, onSubmit, defaultAssessmentType = 'PHQ9' }: AssessmentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<AssessmentFormData>({
    resolver: zodResolver(assessmentSchema),
    defaultValues: {
      patientId,
      assessmentType: defaultAssessmentType,
      scores: {},
      notes: '',
    },
  });

  const assessmentType = watch('assessmentType');

  const getQuestions = (type: string) => {
    switch (type) {
      case 'PHQ9':
        return [
          'Little interest or pleasure in doing things',
          'Feeling down, depressed, or hopeless',
          'Trouble falling or staying asleep, or sleeping too much',
          'Feeling tired or having little energy',
          'Poor appetite or overeating',
          'Feeling bad about yourself or that you are a failure',
          'Trouble concentrating on things, such as reading the newspaper or watching television',
          'Moving or speaking so slowly that other people could have noticed',
          'Thoughts that you would be better off dead or of hurting yourself',
        ];
      case 'GAD7':
        return [
          'Feeling nervous, anxious, or on edge',
          'Not being able to stop or control worrying',
          'Worrying too much about different things',
          'Trouble relaxing',
          'Being so restless that it\'s hard to sit still',
          'Becoming easily annoyed or irritable',
          'Feeling afraid as if something awful might happen',
        ];
      case 'WHODAS':
        return [
          'Difficulty concentrating for more than 10 minutes',
          'Difficulty remembering important things',
          'Difficulty solving day-to-day problems',
          'Difficulty learning a new task',
          'Difficulty understanding what others are saying',
          'Difficulty starting and maintaining a conversation',
          'Difficulty standing for more than 30 minutes',
          'Difficulty taking care of yourself',
          'Difficulty relating to people close to you',
          'Difficulty maintaining a friendship',
          'Difficulty carrying out daily activities',
          'Difficulty participating in community activities',
        ];
      default:
        return [];
    }
  };

  const onFormSubmit = async (data: AssessmentFormData) => {
    try {
      setIsSubmitting(true);
      await onSubmit(data);
      toast.success('Assessment submitted successfully');
    } catch (error) {
      toast.error('Error submitting assessment');
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="assessmentType">Assessment Type</Label>
          <Select
            onValueChange={(value) => setValue('assessmentType', value as 'PHQ9' | 'GAD7' | 'WHODAS')}
            defaultValue={defaultAssessmentType}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select assessment type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PHQ9">PHQ-9 (Depression)</SelectItem>
              <SelectItem value="GAD7">GAD-7 (Anxiety)</SelectItem>
              <SelectItem value="WHODAS">WHODAS (Functioning)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          {getQuestions(assessmentType).map((question, index) => (
            <div key={index} className="space-y-2">
              <Label>{question}</Label>
              <Select
                onValueChange={(value) => {
                  const scores = watch('scores');
                  setValue('scores', {
                    ...scores,
                    [index]: parseInt(value),
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a score" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0 - Not at all</SelectItem>
                  <SelectItem value="1">1 - Several days</SelectItem>
                  <SelectItem value="2">2 - More than half the days</SelectItem>
                  <SelectItem value="3">3 - Nearly every day</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>

        <div>
          <Label htmlFor="notes">Notes</Label>
          <textarea
            {...register('notes')}
            className="w-full min-h-[100px] p-2 border rounded-md"
            placeholder="Enter any additional notes..."
          />
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit Assessment'}
      </Button>
    </form>
  );
} 