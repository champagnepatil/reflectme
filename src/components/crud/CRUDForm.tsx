import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Save, 
  X, 
  AlertTriangle, 
  CheckCircle, 
  Loader2, 
  ArrowLeft,
  Clock,
  Eye,
  EyeOff
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

export interface CRUDField {
  key: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'date' | 'datetime-local' | 'textarea' | 'select' | 'multiselect' | 'boolean' | 'file' | 'custom';
  required?: boolean;
  placeholder?: string;
  description?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: RegExp;
    message?: string;
    custom?: (value: any) => string | null;
  };
  options?: { label: string; value: any }[];
  disabled?: boolean;
  hidden?: boolean;
  defaultValue?: any;
  render?: (value: any, onChange: (value: any) => void, field: CRUDField) => React.ReactNode;
  dependsOn?: string; // Show field only if dependent field has truthy value
  width?: 'full' | 'half' | 'third' | 'quarter';
}

export interface CRUDFormProps<T = any> {
  title: string;
  fields: CRUDField[];
  initialData?: Partial<T>;
  loading?: boolean;
  error?: string | null;
  
  // Actions
  onSubmit: (data: T) => Promise<void>;
  onCancel?: () => void;
  onBack?: () => void;
  
  // Configuration
  submitText?: string;
  cancelText?: string;
  showRequiredIndicator?: boolean;
  autoSave?: boolean;
  autoSaveDelay?: number; // ms
  validateOnChange?: boolean;
  
  // Layout
  layout?: 'single' | 'two-column' | 'sections';
  sections?: {
    title: string;
    description?: string;
    fields: string[];
  }[];
}

export function CRUDForm<T extends Record<string, any>>({
  title,
  fields,
  initialData = {},
  loading = false,
  error = null,
  onSubmit,
  onCancel,
  onBack,
  submitText = 'Save',
  cancelText = 'Cancel',
  showRequiredIndicator = true,
  autoSave = false,
  autoSaveDelay = 2000,
  validateOnChange = true,
  layout = 'single',
  sections = []
}: CRUDFormProps<T>) {
  
  const [formData, setFormData] = useState<Partial<T>>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();
  const originalDataRef = useRef(initialData);

  // Update form data when initialData changes
  useEffect(() => {
    if (JSON.stringify(initialData) !== JSON.stringify(originalDataRef.current)) {
      setFormData(initialData);
      setHasUnsavedChanges(false);
      originalDataRef.current = initialData;
    }
  }, [initialData]);

  // Auto-save functionality
  useEffect(() => {
    if (autoSave && hasUnsavedChanges) {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      
      autoSaveTimeoutRef.current = setTimeout(() => {
        handleAutoSave();
      }, autoSaveDelay);
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [formData, autoSave, autoSaveDelay, hasUnsavedChanges]);

  // Warn about unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const validateField = (field: CRUDField, value: any): string | null => {
    // Required validation
    if (field.required && (!value || (typeof value === 'string' && !value.trim()))) {
      return `${field.label} is required`;
    }

    // Skip other validations if field is empty and not required
    if (!value && !field.required) return null;

    // Type-specific validation
    if (field.validation) {
      const { min, max, pattern, message, custom } = field.validation;
      
      if (custom) {
        const customError = custom(value);
        if (customError) return customError;
      }
      
      if (field.type === 'email' && value) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(value)) {
          return message || 'Please enter a valid email address';
        }
      }
      
      if (field.type === 'number' && value !== undefined) {
        const numValue = Number(value);
        if (isNaN(numValue)) {
          return message || 'Please enter a valid number';
        }
        if (min !== undefined && numValue < min) {
          return message || `Value must be at least ${min}`;
        }
        if (max !== undefined && numValue > max) {
          return message || `Value must be no more than ${max}`;
        }
      }
      
      if (pattern && value) {
        if (!pattern.test(value)) {
          return message || 'Please enter a valid value';
        }
      }
      
      if (typeof value === 'string') {
        if (min !== undefined && value.length < min) {
          return message || `Must be at least ${min} characters`;
        }
        if (max !== undefined && value.length > max) {
          return message || `Must be no more than ${max} characters`;
        }
      }
    }

    return null;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    fields.forEach(field => {
      if (!field.hidden && (!field.dependsOn || formData[field.dependsOn])) {
        const error = validateField(field, formData[field.key]);
        if (error) {
          newErrors[field.key] = error;
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFieldChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
    
    if (validateOnChange) {
      const field = fields.find(f => f.key === key);
      if (field) {
        const error = validateField(field, value);
        setErrors(prev => ({ ...prev, [key]: error || '' }));
      }
    }
  };

  const handleFieldBlur = (key: string) => {
    setTouched(prev => ({ ...prev, [key]: true }));
    
    const field = fields.find(f => f.key === key);
    if (field) {
      const error = validateField(field, formData[key]);
      setErrors(prev => ({ ...prev, [key]: error || '' }));
    }
  };

  const handleAutoSave = async () => {
    if (!validateForm()) return;
    
    try {
      await onSubmit(formData as T);
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Mark all fields as touched to show validation errors
      const allTouched = fields.reduce((acc, field) => ({ ...acc, [field.key]: true }), {});
      setTouched(allTouched);
      return;
    }
    
    try {
      setIsSubmitting(true);
      await onSubmit(formData as T);
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
    } catch (error) {
      console.error('Submit failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: CRUDField) => {
    if (field.hidden || (field.dependsOn && !formData[field.dependsOn])) {
      return null;
    }

    const value = formData[field.key] ?? field.defaultValue ?? '';
    const hasError = touched[field.key] && errors[field.key];
    const fieldId = `field-${field.key}`;

    const commonProps = {
      id: fieldId,
      disabled: field.disabled || loading,
      className: `input ${hasError ? 'border-error-500 focus:border-error-500' : ''}`,
      onBlur: () => handleFieldBlur(field.key)
    };

    let fieldElement: React.ReactNode;

    if (field.render) {
      fieldElement = field.render(value, (newValue) => handleFieldChange(field.key, newValue), field);
    } else {
      switch (field.type) {
        case 'textarea':
          fieldElement = (
            <textarea
              {...commonProps}
              value={value}
              onChange={(e) => handleFieldChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              rows={4}
            />
          );
          break;

        case 'select':
          fieldElement = (
            <select
              {...commonProps}
              value={value}
              onChange={(e) => handleFieldChange(field.key, e.target.value)}
            >
              <option value="">Select {field.label}</option>
              {field.options?.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          );
          break;

        case 'multiselect':
          const selectedValues = Array.isArray(value) ? value : [];
          fieldElement = (
            <div className="space-y-2">
              {field.options?.map(option => (
                <label key={option.value} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedValues.includes(option.value)}
                    onChange={(e) => {
                      const newValue = e.target.checked
                        ? [...selectedValues, option.value]
                        : selectedValues.filter(v => v !== option.value);
                      handleFieldChange(field.key, newValue);
                    }}
                    className="rounded border-neutral-300 mr-2"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          );
          break;

        case 'boolean':
          fieldElement = (
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={Boolean(value)}
                onChange={(e) => handleFieldChange(field.key, e.target.checked)}
                disabled={field.disabled || loading}
                className="rounded border-neutral-300 mr-2"
              />
              {field.placeholder || `Enable ${field.label}`}
            </label>
          );
          break;

        case 'file':
          fieldElement = (
            <input
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                handleFieldChange(field.key, file);
              }}
              disabled={field.disabled || loading}
              className="block w-full text-sm text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
            />
          );
          break;

        case 'password':
          fieldElement = (
            <div className="relative">
              <Input
                {...commonProps}
                type={showPasswords[field.key] ? 'text' : 'password'}
                value={value}
                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPasswords(prev => ({ ...prev, [field.key]: !prev[field.key] }))}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                {showPasswords[field.key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          );
          break;

        case 'number':
          fieldElement = (
            <Input
              {...commonProps}
              type="number"
              value={value}
              onChange={(e) => handleFieldChange(field.key, e.target.value ? Number(e.target.value) : '')}
              placeholder={field.placeholder}
              min={field.validation?.min}
              max={field.validation?.max}
            />
          );
          break;

        default:
          fieldElement = (
            <Input
              {...commonProps}
              type={field.type}
              value={value}
              onChange={(e) => handleFieldChange(field.key, e.target.value)}
              placeholder={field.placeholder}
            />
          );
      }
    }

    const widthClass = {
      full: 'col-span-full',
      half: 'col-span-6',
      third: 'col-span-4',
      quarter: 'col-span-3'
    }[field.width || 'full'];

    return (
      <div key={field.key} className={widthClass}>
        <div className="space-y-2">
          {field.type !== 'boolean' && (
            <Label htmlFor={fieldId} className="flex items-center">
              {field.label}
              {field.required && showRequiredIndicator && (
                <span className="text-error-500 ml-1">*</span>
              )}
            </Label>
          )}
          
          {field.description && (
            <p className="text-sm text-neutral-600">{field.description}</p>
          )}
          
          {fieldElement}
          
          {hasError && (
            <p className="text-sm text-error-600 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-1" />
              {errors[field.key]}
            </p>
          )}
        </div>
      </div>
    );
  };

  const renderFields = () => {
    if (layout === 'sections' && sections.length > 0) {
      return sections.map((section, sectionIndex) => (
        <motion.div
          key={section.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: sectionIndex * 0.1 }}
          className="space-y-6"
        >
          <div>
            <h3 className="text-lg font-semibold text-neutral-900">{section.title}</h3>
            {section.description && (
              <p className="text-sm text-neutral-600 mt-1">{section.description}</p>
            )}
          </div>
          <div className={`grid gap-6 ${layout === 'two-column' ? 'grid-cols-12' : ''}`}>
            {section.fields.map(fieldKey => {
              const field = fields.find(f => f.key === fieldKey);
              return field ? renderField(field) : null;
            })}
          </div>
        </motion.div>
      ));
    }

    return (
      <div className={`grid gap-6 ${layout === 'two-column' ? 'grid-cols-12' : ''}`}>
        {fields.map(renderField)}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-neutral-200">
      {/* Header */}
      <div className="border-b border-neutral-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 rounded-full hover:bg-neutral-100 mr-3"
              >
                <ArrowLeft className="w-5 h-5 text-neutral-600" />
              </button>
            )}
            <h2 className="text-xl font-semibold text-neutral-900">{title}</h2>
          </div>
          
          {autoSave && (
            <div className="flex items-center text-sm text-neutral-500">
              <Clock className="w-4 h-4 mr-1" />
              {lastSaved ? `Saved ${lastSaved.toLocaleTimeString()}` : 'Not saved'}
            </div>
          )}
        </div>
        
        {hasUnsavedChanges && !autoSave && (
          <div className="mt-2 text-sm text-warning-600 flex items-center">
            <AlertTriangle className="w-4 h-4 mr-1" />
            You have unsaved changes
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="border-b border-neutral-200 p-4 bg-error-50">
          <div className="flex items-center text-error-700">
            <AlertTriangle className="w-5 h-5 mr-2" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6">
        <div className="space-y-8">
          {renderFields()}
        </div>

        {/* Form Actions */}
        <div className="border-t border-neutral-200 pt-6 mt-8 flex justify-end space-x-3">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              {cancelText}
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting || loading}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {submitText}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
} 