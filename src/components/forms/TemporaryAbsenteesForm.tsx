import React, { useState, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Trash2, AlertCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AbsentMember {
  lineNo: string;
  fullName: string;
  relationshipToHead: string;
  code: string;
  sex: 'M' | 'F';
  age: string;
  destination: string;
  regionCode: string;
  monthsAbsent: string;
}

interface EmigrantMember {
  lineNo: string;
  fullName: string;
  relationshipToHead: string;
  code: string;
  sex: 'M' | 'F';
  age: string;
  countryName: string;
  countryCode: string;
  yearOfDeparture: string;
  activityCode: string;
  otherActivity: string;
}

export interface TemporaryAbsenteesFormData {
  absentCount: string;
  hasEmigrants: 'Yes' | 'No';
  absentMembers: AbsentMember[];
  emigrantMembers: EmigrantMember[];
}

interface ApiTemporaryAbsenteesFormData extends Omit<TemporaryAbsenteesFormData, 'hasEmigrants'> {
  hasEmigrants: 'Yes' | 'No';
}

interface TemporaryAbsenteesFormProps {
  data: Partial<TemporaryAbsenteesFormData>;
  onChange: (data: TemporaryAbsenteesFormData) => void;
  onSubmit: (data: ApiTemporaryAbsenteesFormData) => void;
  errors?: Record<string, string>;
}

const TemporaryAbsenteesForm: React.FC<TemporaryAbsenteesFormProps> = ({ data, onChange, onSubmit, errors = {} }) => {
  const initialData: TemporaryAbsenteesFormData = {
    absentCount: '0',
    hasEmigrants: 'No',
    absentMembers: [],
    emigrantMembers: [],
  };

  const [formData, setFormData] = useState<TemporaryAbsenteesFormData>(initialData);
  const [formErrors, setFormErrors] = useState<Record<string, string>>(errors);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formTouched, setFormTouched] = useState(false);

  useEffect(() => {
    setFormData({
      ...initialData, // Start with initial data
      ...(data || {}), // Override with values from data, if provided
    });
  }, [data]);
  useEffect(() => {
    setFormErrors(errors || {});
  }, [errors]);

  useEffect(() => {
    onChange(formData);
  }, [formData, onChange]);

  const handleFormTouch = () => setFormTouched(true);

  const handleAbsentCountChange = (value: string) => setFormData(prev => ({ ...prev, absentCount: value }));

  const handleAbsentMemberChange = (index: number, field: keyof AbsentMember, value: string) => {
    const numericFields = ['age', 'monthsAbsent'];
    const newValue = numericFields.includes(field) && value !== '' ? String(Number(value)) : value;

    setFormData(prev => ({
      ...prev,
      absentMembers: prev.absentMembers.map((member, i) =>
        i === index ? { ...member, [field]: newValue } : member
      ),
    }));
  };

  const addAbsentMember = () => {
    const newMember: AbsentMember = { lineNo: uuidv4(), fullName: '', relationshipToHead: '', code: '', sex: 'M', age: '', destination: '', regionCode: '', monthsAbsent: '' };
    setFormData(prev => ({ ...prev, absentMembers: [...prev.absentMembers, newMember] }));
  };

  const removeAbsentMember = (index: number) => setFormData(prev => ({ ...prev, absentMembers: prev.absentMembers.filter((_, i) => i !== index) }));

  const handleEmigrantChange = (index: number, field: keyof EmigrantMember, value: string) => {
    const numericFields = ['age', 'yearOfDeparture'];
    const newValue = numericFields.includes(field) && value !== '' ? String(Number(value)) : value;

    setFormData(prev => ({
      ...prev,
      emigrantMembers: prev.emigrantMembers.map((member, i) =>
        i === index ? { ...member, [field]: newValue } : member
      ),
    }));
  };

  const addEmigrant = () => {
    const newMember: EmigrantMember = { lineNo: uuidv4(), fullName: '', relationshipToHead: '', code: '', sex: 'M', age: '', countryName: '', countryCode: '', yearOfDeparture: '', activityCode: '', otherActivity: '' };
    setFormData(prev => ({ ...prev, emigrantMembers: [...prev.emigrantMembers, newMember] }));
  };

  const removeEmigrant = (index: number) => setFormData(prev => ({ ...prev, emigrantMembers: prev.emigrantMembers.filter((_, i) => i !== index) }));

  const validateForm = (): Record<string, string> => {
    const newErrors: Record<string, string> = {};

    if (!formData.hasEmigrants || (formData.hasEmigrants !== 'Yes' && formData.hasEmigrants !== 'No')) {
      newErrors.hasEmigrants = 'Please select whether there are emigrants';
    }

    if (!formData.absentCount) {
      newErrors.absentCount = 'Number of Absent Members is required';
    } else if (isNaN(parseInt(formData.absentCount)) || parseInt(formData.absentCount) < 0) {
      newErrors.absentCount = 'Number of Absent Members must be a positive number';
    }

    formData.absentMembers.forEach((member, index) => {
      if (!member.fullName?.trim()) {
        newErrors[`absentMembers[${index}].fullName`] = 'Full Name is required';
      }
      if (!member.age) {
        newErrors[`absentMembers[${index}].age`] = 'Age is required';
      } else if (parseInt(member.age) < 0 || parseInt(member.age) > 150) {
        newErrors[`absentMembers[${index}].age`] = 'Age must be between 0 and 150';
      }
    });

    formData.emigrantMembers.forEach((member, index) => {
      if (!member.fullName?.trim()) {
        newErrors[`emigrantMembers[${index}].fullName`] = 'Full Name is required';
      }
      if (!member.age) {
        newErrors[`emigrantMembers[${index}].age`] = 'Age is required';
      } else if (parseInt(member.age) < 0 || parseInt(member.age) > 150) {
        newErrors[`emigrantMembers[${index}].age`] = 'Age must be between 0 and 150';
      }
      if (member.yearOfDeparture) {
        const year = parseInt(member.yearOfDeparture);
        const currentYear = new Date().getFullYear();
        if (year < 1900 || year > currentYear) {
          newErrors[`emigrantMembers[${index}].yearOfDeparture`] = `Year must be between 1900 and ${currentYear}`;
        }
      }
    });

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormTouched(true);
    setFormErrors({});

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const apiData: ApiTemporaryAbsenteesFormData = { ...formData, hasEmigrants: formData.hasEmigrants, absentCount: formData.absentCount || '0' };
      await onSubmit(apiData);
      setFormData(initialData);
      setFormTouched(false);
      alert('Data submitted successfully');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data?.data;
        const errorMessage = errorData?.message || error.response?.data?.error || 'An error occurred while submitting the form. Please try again.';

        setFormErrors({
            general: errorMessage,
          });
          console.error("Axios Error:", error);
          alert(errorMessage);
        } else if (error instanceof Error) {
          setFormErrors({
            general: error.message,
          });
          console.error("Standard Error:", error);
          alert(error.message);
        } else {
          const errorMessage = 'An unexpected error occurred. Please try again.';
          setFormErrors({
            general: errorMessage,
          });
          console.error("Unexpected Error:", error);
          alert(errorMessage);
        }
      } finally {
        setIsSubmitting(false);
      }
    };
  
    const sexOptions = useMemo(() => [{ value: 'M', label: 'Male' }, { value: 'F', label: 'Female' }], []);
  
    const relationshipOptions = useMemo(() => [
      { value: 'HEAD', label: 'Head' },
      { value: 'SPOUSE', label: 'Spouse' },
      { value: 'CHILD', label: 'Child' },
      { value: 'PARENT', label: 'Parent' },
      { value: 'SIBLING', label: 'Sibling' },
      { value: 'OTHER', label: 'Other' },
    ], []);
  
    return (
      <form onSubmit={handleSubmit} className="space-y-6" onClick={handleFormTouch}>
        {formErrors.general && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{formErrors.general}</AlertDescription>
          </Alert>
        )}
  
        <Card>
          <CardContent className="space-y-4">
            <Label htmlFor="absentCount">Absent Count *</Label>
            <Input
              id="absentCount"
              value={formData.absentCount}
              onChange={(e) => handleAbsentCountChange(e.target.value)}
              type="number"
              aria-invalid={!!formErrors.absentCount}
              aria-describedby={formErrors.absentCount ? 'absentCount-error' : undefined}
            />
            {formErrors.absentCount && (
              <span id="absentCount-error" className="text-red-500 text-sm">
                {formErrors.absentCount}
              </span>
            )}
          </CardContent>
        </Card>
  
        <Card>
          <CardContent className="space-y-4">
            <Label htmlFor="hasEmigrants">Has Emigrants? *</Label>
            <Select
              value={formData.hasEmigrants}
              onValueChange={(value) =>
                setFormData((prevState) => ({
                  ...prevState,
                  hasEmigrants: value as 'Yes' | 'No',
                }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Yes">Yes</SelectItem>
                <SelectItem value="No">No</SelectItem>
              </SelectContent>
            </Select>
            {formErrors.hasEmigrants && (
              <span className="text-red-500 text-sm">{formErrors.hasEmigrants}</span>
            )}
          </CardContent>
        </Card>
  
        {/* Absent Members Section */}
        <Card>
          <CardContent className="space-y-4">
            <h3 className="text-lg font-semibold">Absent Members</h3>
            {formData.absentMembers.map((member, index) => (
              <div key={member.lineNo} className="border p-4 rounded-lg space-y-4 grid grid-cols-2 gap-4">
                {/* ... (Absent Member Input Fields) */}
                  <div>
                    <Label htmlFor={`absentFullName-${index}`}>Full Name *</Label>
                    <Input
                      id={`absentFullName-${index}`}
                      value={member.fullName}
                      onChange={(e) => handleAbsentMemberChange(index, 'fullName', e.target.value)}
                      aria-invalid={!!formErrors[`absentMembers[${index}].fullName`]}
                      aria-describedby={formErrors[`absentMembers[${index}].fullName`] ? `absentFullName-${index}-error` : undefined}
                    />
                    {formErrors[`absentMembers[${index}].fullName`] && (
                      <span id={`absentFullName-${index}-error`} className="text-red-500 text-sm">
                        {formErrors[`absentMembers[${index}].fullName`]}
                      </span>
                    )}
                  </div>
                  <div>
                    <Label htmlFor={`absentAge-${index}`}>Age *</Label>
                    <Input
                      id={`absentAge-${index}`}
                      value={member.age}
                      onChange={(e) => handleAbsentMemberChange(index, 'age', e.target.value)}
                      type="number"
                      aria-invalid={!!formErrors[`absentMembers[${index}].age`]}
                      aria-describedby={formErrors[`absentMembers[${index}].age`] ? `absentAge-${index}-error` : undefined}
                    />
                    {formErrors[`absentMembers[${index}].age`] && (
                      <span id={`absentAge-${index}-error`} className="text-red-500 text-sm">
                        {formErrors[`absentMembers[${index}].age`]}
                      </span>
                    )}
                  </div>
                  <div>
                    <Label htmlFor={`absentSex-${index}`}>Sex</Label>
                    <Select
                      value={member.sex}
                      onValueChange={(value) => handleAbsentMemberChange(index, 'sex', value as 'M' | 'F')}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Sex" />
                      </SelectTrigger>
                      <SelectContent>
                        {sexOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor={`absentRelationship-${index}`}>Relationship to Head</Label>
                    <Select
                      value={member.relationshipToHead}
                      onValueChange={(value) => handleAbsentMemberChange(index, 'relationshipToHead', value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Relationship" />
                      </SelectTrigger>
                      <SelectContent>
                        {relationshipOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor={`absentDestination-${index}`}>Destination</Label>
                    <Input
                      id={`absentDestination-${index}`}
                      value={member.destination}
                      onChange={(e) => handleAbsentMemberChange(index, 'destination', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`absentRegionCode-${index}`}>Region Code</Label>
                    <Input
                      id={`absentRegionCode-${index}`}
                      value={member.regionCode}
                      onChange={(e) => handleAbsentMemberChange(index, 'regionCode', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`absentMonthsAbsent-${index}`}>Months Absent</Label>
                    <Input
                      id={`absentMonthsAbsent-${index}`}
                      value={member.monthsAbsent}
                      onChange={(e) => handleAbsentMemberChange(index, 'monthsAbsent', e.target.value)}
                      type="number"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={() => removeAbsentMember(index)}
                    variant="destructive"
                    size="icon"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
              </div>
            ))}
            <Button type="button" onClick={addAbsentMember}>Add Absent Member</Button>
          </CardContent>
        </Card>
  
        {/* Emigrant Members Section */}
        <Card>
          <CardContent className="space-y-4">
            <h3 className="text-lg font-semibold">Emigrant Members</h3>
            {formData.emigrantMembers.map((member, index) => (
              <div key={member.lineNo} className="border p-4 rounded-lg space-y-4 grid grid-cols-2 gap-4">
                 {/* ... (Emigrant Member Input Fields) */}
                 <div>
                    <Label htmlFor={`emigrantFullName-${index}`}>Full Name *</Label>
                    <Input
                      id={`emigrantFullName-${index}`}
                      value={member.fullName}
                      onChange={(e) => handleEmigrantChange(index, 'fullName', e.target.value)}
                      aria-invalid={!!formErrors[`emigrantMembers[${index}].fullName`]}
                      aria-describedby={formErrors[`emigrantMembers[${index}].fullName`] ? `emigrantFullName-${index}-error` : undefined}
                    />
                    {formErrors[`emigrantMembers[${index}].fullName`] && (
                      <span id={`emigrantFullName-${index}-error`} className="text-red-500 text-sm">
                        {formErrors[`emigrantMembers[${index}].fullName`]}
                      </span>
                    )}
                  </div>
                  <div>
                    <Label htmlFor={`emigrantAge-${index}`}>Age *</Label>
                    <Input
                      id={`emigrantAge-${index}`}
                      value={member.age}
                      onChange={(e) => handleEmigrantChange(index, 'age', e.target.value)}
                      type="number"
                      aria-invalid={!!formErrors[`emigrantMembers[${index}].age`]}
                      aria-describedby={formErrors[`emigrantMembers[${index}].age`] ? `emigrantAge-${index}-error` : undefined}
                    />
                    {formErrors[`emigrantMembers[${index}].age`] && (
                      <span id={`emigrantAge-${index}-error`} className="text-red-500 text-sm">
                        {formErrors[`emigrantMembers[${index}].age`]}
                      </span>
                    )}
                  </div>
                  <div>
                    <Label htmlFor={`emigrantSex-${index}`}>Sex</Label>
                    <Select
                      value={member.sex}
                      onValueChange={(value) => handleEmigrantChange(index, 'sex', value as 'M' | 'F')}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Sex" />
                      </SelectTrigger>
                      <SelectContent>
                        {sexOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor={`emigrantRelationship-${index}`}>Relationship to Head</Label>
                    <Select
                      value={member.relationshipToHead}
                      onValueChange={(value) => handleEmigrantChange(index, 'relationshipToHead', value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Relationship" />
                      </SelectTrigger>
                      <SelectContent>
                        {relationshipOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor={`emigrantCountryName-${index}`}>Country Name</Label>
                    <Input
                      id={`emigrantCountryName-${index}`}
                      value={member.countryName}
                      onChange={(e) => handleEmigrantChange(index, 'countryName', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`emigrantCountryCode-${index}`}>Country Code</Label>
                    <Input
                      id={`emigrantCountryCode-${index}`}
                      value={member.countryCode}
                      onChange={(e) => handleEmigrantChange(index, 'countryCode', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`emigrantYearOfDeparture-${index}`}>Year of Departure</Label>
                    <Input
                      id={`emigrantYearOfDeparture-${index}`}
                      value={member.yearOfDeparture}
                      onChange={(e) => handleEmigrantChange(index, 'yearOfDeparture', e.target.value)}
                      type="number"
                      aria-invalid={!!formErrors[`emigrantMembers[${index}].yearOfDeparture`]}
                      aria-describedby={formErrors[`emigrantMembers[${index}].yearOfDeparture`] ? `emigrantYearOfDeparture-${index}-error` : undefined}
                    />
                    {formErrors[`emigrantMembers[${index}].yearOfDeparture`] && (
                      <span id={`emigrantYearOfDeparture-${index}-error`} className="text-red-500 text-sm">
                        {formErrors[`emigrantMembers[${index}].yearOfDeparture`]}
                      </span>
                    )}
                  </div>
                  <div>
                    <Label htmlFor={`emigrantActivityCode-${index}`}>Activity Code</Label>
                    <Input
                      id={`emigrantActivityCode-${index}`}
                      value={member.activityCode}
                      onChange={(e) => handleEmigrantChange(index, 'activityCode', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`emigrantOtherActivity-${index}`}>Other Activity</Label>
                    <Input
                      id={`emigrantOtherActivity-${index}`}
                      value={member.otherActivity}
                      onChange={(e) => handleEmigrantChange(index, 'otherActivity', e.target.value)}
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={() => removeEmigrant(index)}
                    variant="destructive"
                    size="icon"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
              </div>
            ))}
            <Button type="button" onClick={addEmigrant}>Add Emigrant</Button>
          </CardContent>
        </Card>
  
        {formTouched && formData.absentMembers.length === 0 && formData.emigrantMembers.length === 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>At least one member is required. Please add an absent or emigrant member.</AlertDescription>
          </Alert>
        )}
  
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </Button>
      </form>
    );
  };
  
  export default TemporaryAbsenteesForm;