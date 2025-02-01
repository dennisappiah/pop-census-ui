import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

export interface LocationInfo {
  regionName: string;
  districtName: string;
  localityName: string;
  address: string;
  phone1: string;
  phone2: string;
  enumAreaCode: string;
  nhisNumber: string;
  eaType: string;
  localityCode: string;
  structureNumber: string;
  householdNumber: string;
  residenceType: 'OCCUPIED' | 'VACANT';
  interviewDates: {
    dateStarted: string;
    dateCompleted: string;
  };
}

const residenceTypes = ['OCCUPIED', 'VACANT'];

interface LocationInfoFormProps {
  initialData?: Partial<LocationInfo>;
  onSubmit: (data: LocationInfo) => Promise<void>;
  isSubmitting?: boolean;
}

export const LocationInfoForm: React.FC<LocationInfoFormProps> = ({
  initialData,
  onSubmit,
  isSubmitting = false,
}) => {
  const [formData, setFormData] = React.useState<LocationInfo>({
    regionName: initialData?.regionName || '',
    districtName: initialData?.districtName || '',
    localityName: initialData?.localityName || '',
    address: initialData?.address || '',
    phone1: initialData?.phone1 || '',
    phone2: initialData?.phone2 || '',
    enumAreaCode: initialData?.enumAreaCode || '',
    nhisNumber: initialData?.nhisNumber || '',
    eaType: initialData?.eaType || '',
    localityCode: initialData?.localityCode || '',
    structureNumber: initialData?.structureNumber || '',
    householdNumber: initialData?.householdNumber || '',
    residenceType: initialData?.residenceType || 'OCCUPIED',
    interviewDates: {
      dateStarted: initialData?.interviewDates?.dateStarted || '',
      dateCompleted: initialData?.interviewDates?.dateCompleted || '',
    },
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    console.log('Initial form data:', formData);
    console.log('Initial data provided:', initialData);
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    console.log(`Field "${name}" changed to:`, value);
    
    setFormData((prev) => {
      const newData = {
        ...prev,
        [name]: value,
      };
      console.log('Updated form data:', newData);
      return newData;
    });

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleNestedChange = (parentField: keyof LocationInfo, field: string, value: string) => {
    console.log(`Nested field "${parentField}.${field}" changed to:`, value);
    
    setFormData((prev) => {
      const newData = {
        ...prev,
        [parentField]: {
          ...(prev[parentField] as Record<string, any>),
          [field]: value,
        },
      };
      console.log('Updated form data after nested change:', newData);
      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submission started with data:', formData);
    
    const newErrors: Record<string, string> = {};

    // Validate required fields
    if (!formData.regionName) newErrors.regionName = 'Region is required';
    if (!formData.districtName) newErrors.districtName = 'District is required';
    if (!formData.localityName) newErrors.localityName = 'Locality is required';
    if (!formData.enumAreaCode) newErrors.enumAreaCode = 'EA Code is required';
    if (!formData.eaType) newErrors.eaType = 'EA Type is required';
    if (!formData.residenceType) newErrors.residenceType = 'Residence Type is required';
    if (!formData.interviewDates.dateStarted) newErrors['interviewDates.dateStarted'] = 'Start Date is required';
    if (!formData.interviewDates.dateCompleted) newErrors['interviewDates.dateCompleted'] = 'End Date is required';

    console.log('Validation errors:', newErrors);

    if (Object.keys(newErrors).length > 0) {
      console.log('Form validation failed');
      setErrors(newErrors);
      return;
    }

    try {
      console.log('Submitting form data:', formData);
      await onSubmit(formData);
      console.log('Form submitted successfully');
    } catch (error) {
      console.error('Form submission error:', error);
      setErrors({
        apiError: error instanceof Error ? error.message : 'Failed to submit form',
      });
    }
  };

return (
  <form onSubmit={handleSubmit} className="space-y-6">
    {Object.keys(errors).length > 0 && (
      <Alert variant="destructive">
        <AlertDescription>
          Please fill in all required fields marked with *
        </AlertDescription>
      </Alert>
    )}
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Region Field */}
      <div>
        <Label htmlFor="regionName" className="flex items-center">
          Region <span className="text-red-500 ml-1">*</span>
        </Label>
        <Input
          id="regionName"
          name="regionName"
          value={formData.regionName}
          onChange={handleChange}
          className={errors.regionName ? 'border-red-500' : ''}
          aria-invalid={!!errors.regionName}
        />
        {errors.regionName && (
          <span className="text-red-500 text-sm mt-1">{errors.regionName}</span>
        )}
      </div>

      {/* District Field */}
      <div>
        <Label htmlFor="districtName" className="flex items-center">
          District <span className="text-red-500 ml-1">*</span>
        </Label>
        <Input
          id="districtName"
          name="districtName"
          value={formData.districtName}
          onChange={handleChange}
          className={errors.districtName ? 'border-red-500' : ''}
        />
        {errors.districtName && (
          <span className="text-red-500 text-sm mt-1">{errors.districtName}</span>
        )}
      </div>

      {/* Locality Field */}
      <div>
        <Label htmlFor="localityName" className="flex items-center">
          Locality <span className="text-red-500 ml-1">*</span>
        </Label>
        <Input
          id="localityName"
          name="localityName"
          value={formData.localityName}
          onChange={handleChange}
          className={errors.localityName ? 'border-red-500' : ''}
        />
        {errors.localityName && (
          <span className="text-red-500 text-sm mt-1">{errors.localityName}</span>
        )}
      </div>

      {/* EA Code Field */}
      <div>
        <Label htmlFor="enumAreaCode" className="flex items-center">
          EA Code <span className="text-red-500 ml-1">*</span>
        </Label>
        <Input
          id="enumAreaCode"
          name="enumAreaCode"
          value={formData.enumAreaCode}
          onChange={handleChange}
          className={errors.enumAreaCode ? 'border-red-500' : ''}
        />
        {errors.enumAreaCode && (
          <span className="text-red-500 text-sm mt-1">{errors.enumAreaCode}</span>
        )}
      </div>

      {/* EA Type Field */}
      <div>
        <Label htmlFor="eaType" className="flex items-center">
          EA Type <span className="text-red-500 ml-1">*</span>
        </Label>
        <Input
          id="eaType"
          name="eaType"
          value={formData.eaType}
          onChange={handleChange}
          className={errors.eaType ? 'border-red-500' : ''}
        />
        {errors.eaType && (
          <span className="text-red-500 text-sm mt-1">{errors.eaType}</span>
        )}
      </div>

      {/* Residence Type Field */}
      <div>
        <Label htmlFor="residenceType" className="flex items-center">
          Residence Type <span className="text-red-500 ml-1">*</span>
        </Label>
        <Select
          value={formData.residenceType}
          onValueChange={(value) =>
            setFormData((prev) => ({
              ...prev,
              residenceType: value as 'OCCUPIED' | 'VACANT',
            }))
          }
        >
          <SelectTrigger className={errors.residenceType ? 'border-red-500' : ''}>
            <SelectValue placeholder="Select Residence Type" />
          </SelectTrigger>
          <SelectContent>
            {residenceTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.residenceType && (
          <span className="text-red-500 text-sm mt-1">{errors.residenceType}</span>
        )}
      </div>

      {/* Phone 1 Field */}
      <div>
        <Label htmlFor="phone1">Phone 1</Label>
        <Input
          id="phone1"
          name="phone1"
          value={formData.phone1}
          onChange={handleChange}
          className={errors.phone1 ? 'border-red-500' : ''}
        />
        {errors.phone1 && (
          <span className="text-red-500 text-sm mt-1">{errors.phone1}</span>
        )}
      </div>

      {/* Phone 2 Field */}
      <div>
        <Label htmlFor="phone2">Phone 2</Label>
        <Input
          id="phone2"
          name="phone2"
          value={formData.phone2}
          onChange={handleChange}
          className={errors.phone2 ? 'border-red-500' : ''}
        />
        {errors.phone2 && (
          <span className="text-red-500 text-sm mt-1">{errors.phone2}</span>
        )}
      </div>

      {/* Address Field */}
      <div>
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          className={errors.address ? 'border-red-500' : ''}
        />
        {errors.address && (
          <span className="text-red-500 text-sm mt-1">{errors.address}</span>
        )}
      </div>

      {/* NHIS Number Field */}
      <div>
        <Label htmlFor="nhisNumber">NHIS Number</Label>
        <Input
          id="nhisNumber"
          name="nhisNumber"
          value={formData.nhisNumber}
          onChange={handleChange}
          className={errors.nhisNumber ? 'border-red-500' : ''}
        />
        {errors.nhisNumber && (
          <span className="text-red-500 text-sm mt-1">{errors.nhisNumber}</span>
        )}
      </div>

      {/* Locality Code Field */}
      <div>
        <Label htmlFor="localityCode">Locality Code</Label>
        <Input
          id="localityCode"
          name="localityCode"
          value={formData.localityCode}
          onChange={handleChange}
          className={errors.localityCode ? 'border-red-500' : ''}
        />
        {errors.localityCode && (
          <span className="text-red-500 text-sm mt-1">{errors.localityCode}</span>
        )}
      </div>

      {/* Structure Number Field */}
      <div>
        <Label htmlFor="structureNumber">Structure Number</Label>
        <Input
          id="structureNumber"
          name="structureNumber"
          value={formData.structureNumber}
          onChange={handleChange}
          className={errors.structureNumber ? 'border-red-500' : ''}
        />
        {errors.structureNumber && (
          <span className="text-red-500 text-sm mt-1">{errors.structureNumber}</span>
        )}
      </div>

      {/* Household Number Field */}
      <div>
        <Label htmlFor="householdNumber">Household Number</Label>
        <Input
          id="householdNumber"
          name="householdNumber"
          value={formData.householdNumber}
          onChange={handleChange}
          className={errors.householdNumber ? 'border-red-500' : ''}
        />
        {errors.householdNumber && (
          <span className="text-red-500 text-sm mt-1">{errors.householdNumber}</span>
        )}
      </div>

      {/* Interview Start Date Field */}
      <div>
        <Label htmlFor="dateStarted" className="flex items-center">
          Start Date <span className="text-red-500 ml-1">*</span>
        </Label>
        <Input
          type="datetime-local"
          id="dateStarted"
          name="dateStarted"
          value={formData.interviewDates.dateStarted}
          onChange={(e) => handleNestedChange('interviewDates', 'dateStarted', e.target.value)}
          className={errors['interviewDates.dateStarted'] ? 'border-red-500' : ''}
        />
        {errors['interviewDates.dateStarted'] && (
          <span className="text-red-500 text-sm mt-1">{errors['interviewDates.dateStarted']}</span>
        )}
      </div>

      {/* Interview End Date Field */}
      <div>
        <Label htmlFor="dateCompleted" className="flex items-center">
          End Date <span className="text-red-500 ml-1">*</span>
        </Label>
        <Input
          type="datetime-local"
          id="dateCompleted"
          name="dateCompleted"
          value={formData.interviewDates.dateCompleted}
          onChange={(e) => handleNestedChange('interviewDates', 'dateCompleted', e.target.value)}
          className={errors['interviewDates.dateCompleted'] ? 'border-red-500' : ''}
        />
        {errors['interviewDates.dateCompleted'] && (
          <span className="text-red-500 text-sm mt-1">{errors['interviewDates.dateCompleted']}</span>
        )}
      </div>

      {/* Submit Button */}
      <div className="col-span-2">
        <Button 
          type="submit" 
          disabled={isSubmitting || Object.keys(errors).length > 0}
          className="w-full"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin mr-2" />
              Submitting...
            </>
          ) : (
            'Submit & Continue'
          )}
        </Button>
      </div>
    </div>
  </form>
)
}


export default LocationInfoForm