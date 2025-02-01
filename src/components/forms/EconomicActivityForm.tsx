import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Label } from "@radix-ui/react-label";
import { Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

export interface EconomicActivity {
  activityId: string;
  establishmentName: string;
  mainProduct: string;
  industryCode: string;
  employmentStatus: string;
  employmentSector: string;
}

export interface EconomicActivityFormData {
  activities: EconomicActivity[];
}

interface EconomicActivityFormProps {
  data?: Partial<EconomicActivityFormData>;
  onChange: (data: EconomicActivityFormData) => void;
  onSubmit: (data: EconomicActivityFormData) => void;
  errors?: Record<string, string>;
}

const initialActivity: EconomicActivity = {
  activityId: uuidv4(),
  establishmentName: '',
  mainProduct: '',
  industryCode: '',
  employmentStatus: '',
  employmentSector: '',
};

const employmentStatusOptions = [
  { value: 'EMPLOYED', label: 'Employed' },
  { value: 'SELF_EMPLOYED', label: 'Self-Employed' },
  { value: 'UNEMPLOYED', label: 'Unemployed' },
];

const employmentSectorOptions = [
  { value: 'PUBLIC', label: 'Public' },
  { value: 'PRIVATE', label: 'Private' },
  { value: 'INFORMAL', label: 'Informal' },
];

export const EconomicActivityForm: React.FC<EconomicActivityFormProps> = ({
  data,
  onChange,
  onSubmit,
  errors = {},
}) => {
  // Initialize state with provided data or default
  const [formData, setFormData] = useState<EconomicActivityFormData>({
    activities: data?.activities || [initialActivity],
  });

  // Update local state when prop data changes
  useEffect(() => {
    if (data?.activities) {
      setFormData({
        activities: data.activities,
      });
    }
  }, [data]);

  const handleActivityChange = (index: number, field: keyof EconomicActivity, value: string) => {
    const updatedActivities = formData.activities.map((activity, i) => {
      if (i === index) {
        return { ...activity, [field]: value };
      }
      return activity;
    });

    const newFormData = {
      activities: updatedActivities,
    };

    setFormData(newFormData);
    onChange(newFormData);
  };

  const addActivity = () => {
    const newActivity = {
      ...initialActivity,
      activityId: uuidv4(),
    };

    const newFormData = {
      activities: [...formData.activities, newActivity],
    };

    setFormData(newFormData);
    onChange(newFormData);
  };

  const removeActivity = (index: number) => {
    const newFormData = {
      activities: formData.activities.filter((_, i) => i !== index),
    };

    setFormData(newFormData);
    onChange(newFormData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const renderField = (
    index: number,
    field: keyof EconomicActivity,
    label: string,
    required: boolean = false
  ) => {
    const id = `${field}-${index}`;
    const errorKey = `activities[${index}].${field}`;
    const value = formData.activities[index][field];

    return (
      <div className="space-y-2">
        <Label htmlFor={id}>
          {label} {required && '*'}
        </Label>
        <Input
          id={id}
          value={value}
          onChange={(e) => handleActivityChange(index, field, e.target.value)}
          required={required}
          aria-invalid={!!errors[errorKey]}
          aria-describedby={errors[errorKey] ? `${id}-error` : undefined}
          className={errors[errorKey] ? 'border-red-500' : ''}
        />
        {errors[errorKey] && (
          <span id={`${id}-error`} className="text-red-500 text-sm">
            {errors[errorKey]}
          </span>
        )}
      </div>
    );
  };

  const renderSelect = (
    index: number,
    field: 'employmentStatus' | 'employmentSector',
    label: string,
    options: { value: string; label: string }[]
  ) => {
    const id = `${field}-${index}`;
    const errorKey = `activities[${index}].${field}`;
    const value = formData.activities[index][field];

    return (
      <div className="space-y-2">
        <Label htmlFor={id}>{label} *</Label>
        <Select
          value={value}
          onValueChange={(value) => handleActivityChange(index, field, value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={`Select ${label}`} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors[errorKey] && (
          <span id={`${id}-error`} className="text-red-500 text-sm">
            {errors[errorKey]}
          </span>
        )}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardContent className="space-y-6 pt-6">
          {formData.activities.map((activity, index) => (
            <div
              key={activity.activityId}
              className="border p-4 rounded-lg space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                {renderField(index, 'establishmentName', 'Establishment Name', true)}
                {renderField(index, 'mainProduct', 'Main Product')}
                {renderField(index, 'industryCode', 'Industry Code')}
                {renderSelect(
                  index,
                  'employmentStatus',
                  'Employment Status',
                  employmentStatusOptions
                )}
                {renderSelect(
                  index,
                  'employmentSector',
                  'Employment Sector',
                  employmentSectorOptions
                )}
              </div>

              {formData.activities.length > 1 && (
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeActivity(index)}
                    className="mt-2"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove Activity
                  </Button>
                </div>
              )}
            </div>
          ))}
          
          <Button 
            type="button" 
            onClick={addActivity}
            variant="outline"
            className="w-full"
          >
            Add Activity
          </Button>
        </CardContent>
      </Card>

      <Button type="submit" className="w-full">
        Submit
      </Button>
    </form>
  );
};

export default EconomicActivityForm;