import React from 'react';
import { Label } from "@radix-ui/react-label";
import { Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

// Constants
const NATIONALITIES = [
  "Ghanaian", "Nigerian", "Togolese", "Ivorian", "American", "British",
] as const;

const ETHNICITIES = [
  "Akan", "Ewe", "Ga", "Dagomba", "Hausa", "Yoruba",
] as const;

// Types
export interface HouseHoldUnit {
  id?: number; // Changed to optional number
  fullName: string;
  dateOfBirth: {
    day: string;
    month: string;
    year: string;
  };
  age: string;
  nationality: string;
  ethnicity: string;
}

export interface HouseholdUnitFormData {
  people: HouseHoldUnit[];
}

interface HouseholdUnitFormProps {
  initialData?: HouseholdUnitFormData;
  onChange: (data: HouseholdUnitFormData) => void;
  onSubmit: (data: HouseholdUnitFormData) => void;
  errors?: Record<string, string>;
}

// Sub-components remain the same as before
interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  required = false,
  children
}) => (
  <div className="space-y-1">
    <Label>
      {label} {required && '*'}
    </Label>
    {children}
    {error && <span className="text-red-500 text-sm">{error}</span>}
  </div>
);

interface DateOfBirthInputProps {
  value: HouseHoldUnit['dateOfBirth'];
  onChange: (value: HouseHoldUnit['dateOfBirth']) => void;
  error?: string;
  id: string;
}

const DateOfBirthInput: React.FC<DateOfBirthInputProps> = ({
  value,
  onChange,
  error,
  id
}) => (
  <FormField label="Date of Birth" error={error} required>
    <div className="grid grid-cols-3 gap-2">
      <Input
        id={`${id}-day`}
        placeholder="Day"
        value={value.day}
        onChange={(e) => onChange({ ...value, day: e.target.value })}
      />
      <Input
        id={`${id}-month`}
        placeholder="Month"
        value={value.month}
        onChange={(e) => onChange({ ...value, month: e.target.value })}
      />
      <Input
        id={`${id}-year`}
        placeholder="Year"
        value={value.year}
        onChange={(e) => onChange({ ...value, year: e.target.value })}
      />
    </div>
  </FormField>
);

// Default values
const createDefaultPerson = (): HouseHoldUnit => ({
  fullName: "",
  dateOfBirth: { day: "", month: "", year: "" },
  age: "",
  nationality: "",
  ethnicity: "",
});

const createDefaultFormData = (): HouseholdUnitFormData => ({
  people: [createDefaultPerson()]
});

// Main component
export const HouseholdUnitForm: React.FC<HouseholdUnitFormProps> = ({
  initialData,
  onChange,
  onSubmit,
  errors = {}
}) => {
  const [formData, setFormData] = React.useState<HouseholdUnitFormData>(() => 
    initialData || createDefaultFormData()
  );

  React.useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handlePersonChange = (index: number, field: keyof HouseHoldUnit, value: any) => {
    const updatedPeople = formData.people.map((person, i) =>
      i === index ? { ...person, [field]: value } : person
    );
    const newFormData = { ...formData, people: updatedPeople };
    setFormData(newFormData);
    onChange(newFormData);
  };

  const addPerson = () => {
    const newFormData = {
      ...formData,
      people: [...formData.people, createDefaultPerson()]
    };
    setFormData(newFormData);
    onChange(newFormData);
  };

  const removePerson = (index: number) => {
    if (formData.people.length <= 1) return;
    const newFormData = {
      ...formData,
      people: formData.people.filter((_, i) => i !== index)
    };
    setFormData(newFormData);
    onChange(newFormData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    formData.people.forEach((person, index) => {
      if (!person.fullName) {
        newErrors[`people[${index}].fullName`] = 'Full Name is required';
      }
      if (!person.dateOfBirth.day || !person.dateOfBirth.month || !person.dateOfBirth.year) {
        newErrors[`people[${index}].dateOfBirth`] = 'Complete date of birth is required';
      }
      if (!person.age) {
        newErrors[`people[${index}].age`] = 'Age is required';
      }
      if (!person.nationality) {
        newErrors[`people[${index}].nationality`] = 'Nationality is required';
      }
      if (!person.ethnicity) {
        newErrors[`people[${index}].ethnicity`] = 'Ethnicity is required';
      }
    });

    if (Object.keys(newErrors).length > 0) {
      console.error('Validation errors:', newErrors);
      return;
    }

    // Remove ids from new people before submitting
    const submissionData = {
      people: formData.people.map(person => {
        const { id, ...rest } = person;
        return rest;
      })
    };

    onSubmit(submissionData);
  };

  if (!formData || !formData.people) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardContent className="space-y-6 pt-6">
          {formData.people.map((person, index) => (
            <div key={index} className="border p-4 rounded-lg space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  label="Full Name"
                  error={errors[`people[${index}].fullName`]}
                  required
                >
                  <Input
                    value={person.fullName}
                    onChange={(e) => handlePersonChange(index, 'fullName', e.target.value)}
                  />
                </FormField>

                <DateOfBirthInput
                  id={`dob-${index}`}
                  value={person.dateOfBirth}
                  onChange={(value) => handlePersonChange(index, 'dateOfBirth', value)}
                  error={errors[`people[${index}].dateOfBirth`]}
                />

                <FormField
                  label="Age"
                  error={errors[`people[${index}].age`]}
                  required
                >
                  <Input
                    type="number"
                    value={person.age}
                    onChange={(e) => handlePersonChange(index, 'age', e.target.value)}
                  />
                </FormField>

                <FormField
                  label="Nationality"
                  error={errors[`people[${index}].nationality`]}
                  required
                >
                  <Select
                    value={person.nationality}
                    onValueChange={(value) => handlePersonChange(index, 'nationality', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Nationality" />
                    </SelectTrigger>
                    <SelectContent>
                      {NATIONALITIES.map((nationality) => (
                        <SelectItem key={nationality} value={nationality}>
                          {nationality}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField
                  label="Ethnicity"
                  error={errors[`people[${index}].ethnicity`]}
                  required
                >
                  <Select
                    value={person.ethnicity}
                    onValueChange={(value) => handlePersonChange(index, 'ethnicity', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Ethnicity" />
                    </SelectTrigger>
                    <SelectContent>
                      {ETHNICITIES.map((ethnicity) => (
                        <SelectItem key={ethnicity} value={ethnicity}>
                          {ethnicity}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              </div>

              {formData.people.length > 1 && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removePerson(index)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove Person
                </Button>
              )}
            </div>
          ))}
          
          <Button type="button" onClick={addPerson}>
            Add Person
          </Button>
        </CardContent>
      </Card>

      <Button type="submit" className="w-full">
        Submit
      </Button>
    </form>
  );
};

export default HouseholdUnitForm;