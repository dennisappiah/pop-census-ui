import React from 'react';
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface DisabilitiesData {
  id?: string;
  sight: string;
  hearing: string;
  speech: string;
  physical: string;
  intellectual: string;
  emotional: string;
}

interface DisabilitiesFormProps {
  data?: Partial<DisabilitiesData>;
  onChange: (data: DisabilitiesData) => void;
  onSubmit: (data: DisabilitiesData) => void;
  errors?: Record<string, string>;
}

const initialDisabilitiesData: DisabilitiesData = {
  sight: '',
  hearing: '',
  speech: '',
  physical: '',
  intellectual: '',
  emotional: '',
};

export const DisabilitiesForm: React.FC<DisabilitiesFormProps> = ({
  data = {},
  onChange,
  onSubmit,
  errors = {},
}) => {
  const [formData, setFormData] = React.useState<DisabilitiesData>({
    ...initialDisabilitiesData,
    ...data,
    ...(data.id && { id: String(data.id) }),
  });

  const handleFieldChange = (field: keyof Omit<DisabilitiesData, 'id'>, value: string) => {
    const updatedData = {
      ...formData,
      [field]: value,
    };
    setFormData(updatedData);
    onChange(updatedData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    const fields: (keyof Omit<DisabilitiesData, 'id'>)[] = [
      'sight',
      'hearing',
      'speech',
      'physical',
      'intellectual',
      'emotional'
    ];

    fields.forEach((field) => {
      if (!formData[field]) {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      } else if (!['Yes', 'No'].includes(formData[field])) {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} must be either 'Yes' or 'No'`;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      console.log('Validation errors:', newErrors);
      return;
    }

    onSubmit(formData);
  };

  const options = [
    { value: 'Yes', label: 'Yes' },
    { value: 'No', label: 'No' },
  ] as const;

  const fields: { key: keyof Omit<DisabilitiesData, 'id'>; label: string }[] = [
    { key: 'sight', label: 'Sight Disability' },
    { key: 'hearing', label: 'Hearing Disability' },
    { key: 'speech', label: 'Speech Disability' },
    { key: 'physical', label: 'Physical Disability' },
    { key: 'intellectual', label: 'Intellectual Disability' },
    { key: 'emotional', label: 'Emotional Disability' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-6">
          {fields.map(({ key, label }) => (
            <div key={key} className="space-y-2">
              <Label htmlFor={key}>{label} *</Label>
              <Select
                value={formData[key]}
                onValueChange={(value: string) => handleFieldChange(key, value)}
              >
                <SelectTrigger id={key} className="w-full">
                  <SelectValue placeholder="Select Yes/No" />
                </SelectTrigger>
                <SelectContent>
                  {options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors[key] && (
                <p className="text-sm text-red-500">
                  {errors[key]}
                </p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Button type="submit" className="w-full">
        Submit
      </Button>
    </form>
  );
};

export default DisabilitiesForm;