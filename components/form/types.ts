/**
 * Shared types for ShootForm wizard steps
 */
import { Shoot } from '../../types';

export interface StepProps {
  formData: Shoot;
  updateFormData: (updates: Partial<Shoot>) => void;
  onAIGenerate?: (aiData: Partial<Shoot>) => void;
}

export interface WizardStep {
  id: number;
  title: string;
  description: string;
  component: React.ComponentType<StepProps>;
  isComplete: (formData: Shoot) => boolean;
}
