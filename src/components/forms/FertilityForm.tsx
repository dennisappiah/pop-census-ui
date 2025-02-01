import React, { useState, useEffect } from 'react';
import { Label } from "@radix-ui/react-label";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from '../ui/button';

export interface FertilityData {
  id: string;
  childrenEverBorn: {
    male: number;
    female: number;
  };
  childrenSurviving: {
    male: number;
    female: number;
  };
  childrenBornLast12Months: {
    male: number;
    female: number;
  };
}

interface FertilityFormProps {
  data?: Partial<FertilityData>;
  onChange: (data: FertilityData) => void;
  onSubmit: (data: FertilityData) => void;
  errors?: Record<string, string>;
}

const initialFertilityData: FertilityData = {
  id: '',
  childrenEverBorn: {
    male: 0,
    female: 0,
  },
  childrenSurviving: {
    male: 0,
    female: 0,
  },
  childrenBornLast12Months: {
    male: 0,
    female: 0,
  },
};

export const FertilityForm: React.FC<FertilityFormProps> = ({
  data,
  onChange,
  onSubmit,
  errors = {},
}) => {
  // Maintain internal state
  const [formData, setFormData] = useState<FertilityData>(initialFertilityData);

  // Update internal state when props change
  useEffect(() => {
    if (data) {
      setFormData(prevData => ({
        ...prevData,
        ...data,
        childrenEverBorn: {
          ...prevData.childrenEverBorn,
          ...data.childrenEverBorn,
        },
        childrenSurviving: {
          ...prevData.childrenSurviving,
          ...data.childrenSurviving,
        },
        childrenBornLast12Months: {
          ...prevData.childrenBornLast12Months,
          ...data.childrenBornLast12Months,
        },
      }));
    }
  }, [data]);

  const handleInputChange = (
    category: keyof Omit<FertilityData, 'id'>,
    gender: 'male' | 'female',
    value: string
  ) => {
    const numValue = value === '' ? 0 : parseInt(value, 10);
    
    const newData = {
      ...formData,
      [category]: {
        ...formData[category],
        [gender]: numValue,
      },
    };
    
    setFormData(newData);
    onChange(newData);
  };

  const handleIdChange = (value: string) => {
    const newData = {
      ...formData,
      id: value,
    };
    setFormData(newData);
    onChange(newData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Helper function to render number input fields
  const renderNumberInput = (
    category: keyof Omit<FertilityData, 'id'>,
    gender: 'male' | 'female',
    label: string
  ) => {
    const id = `${category}${gender.charAt(0).toUpperCase() + gender.slice(1)}`;
    const errorKey = `${id.charAt(0).toLowerCase() + id.slice(1)}` as keyof typeof errors;
    
    return (
      <div>
        <Label htmlFor={id}>{label} *</Label>
        <Input
          id={id}
          type="number"
          min="0"
          value={formData[category][gender] || ''}
          onChange={(e) => handleInputChange(category, gender, e.target.value)}
          required
          aria-invalid={!!errors[errorKey]}
          aria-describedby={errors[errorKey] ? `${id}-error` : undefined}
          className={errors[errorKey] ? 'border-red-500' : ''}
        />
        {errors[errorKey] && (
          <p id={`${id}-error`} className="text-red-500 text-sm mt-1">
            {errors[errorKey]}
          </p>
        )}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardContent className="space-y-6">
          {/* ID Field */}
          <div>
            <Label htmlFor="id">ID *</Label>
            <Input
              id="id"
              type="text"
              value={formData.id}
              onChange={(e) => handleIdChange(e.target.value)}
              required
              aria-invalid={!!errors.id}
              aria-describedby={errors.id ? 'id-error' : undefined}
              className={errors.id ? 'border-red-500' : ''}
            />
            {errors.id && (
              <p id="id-error" className="text-red-500 text-sm mt-1">
                {errors.id}
              </p>
            )}
          </div>

          {/* Children Ever Born */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Children Ever Born</h3>
            <div className="grid grid-cols-2 gap-4">
              {renderNumberInput('childrenEverBorn', 'male', 'Male')}
              {renderNumberInput('childrenEverBorn', 'female', 'Female')}
            </div>
          </div>

          {/* Children Surviving */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Children Surviving</h3>
            <div className="grid grid-cols-2 gap-4">
              {renderNumberInput('childrenSurviving', 'male', 'Male')}
              {renderNumberInput('childrenSurviving', 'female', 'Female')}
            </div>
          </div>

          {/* Children Born Past 12 Months */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Children Born Past 12 Months</h3>
            <div className="grid grid-cols-2 gap-4">
              {renderNumberInput('childrenBornLast12Months', 'male', 'Male')}
              {renderNumberInput('childrenBornLast12Months', 'female', 'Female')}
            </div>
          </div>
        </CardContent>
      </Card>

      <Button type="submit" className="w-full">
        Submit
      </Button>
    </form>
  );
};

export default FertilityForm;