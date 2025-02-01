import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

type Crop = {
  id: number | null;
  type: string;
  cropCode: string;
  farmSize: number;
};

type Livestock = {
  id: number | null;
  type: string;
  code: string;
  quantity: number;
};

export type AgriculturalActivity = {
  crops: Crop[];
  livestock: Livestock[];
};

type FieldErrors<T> = Partial<Record<keyof T, string>>;

interface FormErrors {
  crops?: Record<number, FieldErrors<Crop>>;
  livestock?: Record<number, FieldErrors<Livestock>>;
}

interface Props {
  initialData?: AgriculturalActivity;
  onChange: (data: AgriculturalActivity) => void;
  onSubmit: (data: AgriculturalActivity) => void;
}

const DEFAULT_DATA: AgriculturalActivity = {
  crops: [],
  livestock: [],
};

let tempIdCounter = -1;
const getTemporaryId = (): number => tempIdCounter--;

const createCrop = (): Crop => ({
  id: getTemporaryId(),
  type: '',
  cropCode: '',
  farmSize: 0,
});

const createLivestock = (): Livestock => ({
  id: getTemporaryId(),
  type: '',
  code: '',
  quantity: 0,
});

export const AgriculturalActivityForm = ({
  initialData = DEFAULT_DATA,
  onChange,
  onSubmit,
}: Props) => {
  const [data, setData] = useState<AgriculturalActivity>(initialData);
  const [errors, setErrors] = useState<FormErrors>({});

  // Crop handlers
  const addCrop = () => {
    const newData = { ...data, crops: [...data.crops, createCrop()] };
    setData(newData);
    onChange(newData);
  };

  const updateCrop = (index: number, field: keyof Omit<Crop, 'id'>, value: string) => {
    const newCrops = data.crops.map((crop, i) => {
      if (i !== index) return crop;
      
      // Handle numeric fields
      if (field === 'farmSize') {
        const numericValue = value === '' ? 0 : parseFloat(value);
        return { ...crop, [field]: numericValue };
      }
      
      return { ...crop, [field]: value };
    });

    const newData = { ...data, crops: newCrops };
    setData(newData);
    onChange(newData);

    // Clear error for the field if it exists
    if (errors.crops?.[index]?.[field]) {
      setErrors((prev) => ({
        ...prev,
        crops: {
          ...prev.crops,
          [index]: { ...prev.crops?.[index], [field]: undefined },
        },
      }));
    }
  };

  const removeCrop = (index: number) => {
    const newData = { ...data, crops: data.crops.filter((_, i) => i !== index) };
    setData(newData);
    onChange(newData);

    if (errors.crops?.[index]) {
      const newErrors = { ...errors };
      delete newErrors.crops?.[index];
      setErrors(newErrors);
    }
  };

  // Livestock handlers
  const addLivestock = () => {
    const newData = { ...data, livestock: [...data.livestock, createLivestock()] };
    setData(newData);
    onChange(newData);
  };

  const updateLivestock = (index: number, field: keyof Omit<Livestock, 'id'>, value: string) => {
    const newLivestock = data.livestock.map((item, i) => {
      if (i !== index) return item;
      
      // Handle numeric fields
      if (field === 'quantity') {
        const numericValue = value === '' ? 0 : parseFloat(value);
        return { ...item, [field]: numericValue };
      }
      
      return { ...item, [field]: value };
    });

    const newData = { ...data, livestock: newLivestock };
    setData(newData);
    onChange(newData);

    // Clear error for the field if it exists
    if (errors.livestock?.[index]?.[field]) {
      setErrors((prev) => ({
        ...prev,
        livestock: {
          ...prev.livestock,
          [index]: { ...prev.livestock?.[index], [field]: undefined },
        },
      }));
    }
  };

  const removeLivestock = (index: number) => {
    const newData = { ...data, livestock: data.livestock.filter((_, i) => i !== index) };
    setData(newData);
    onChange(newData);

    if (errors.livestock?.[index]) {
      const newErrors = { ...errors };
      delete newErrors.livestock?.[index];
      setErrors(newErrors);
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(data);
  };

  // Validation logic
  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};

    // Validate crops
    data.crops.forEach((crop, index) => {
      const cropErrors: FieldErrors<Crop> = {};
      if (!crop.type.trim()) cropErrors.type = 'Type is required';
      if (!crop.cropCode.trim()) cropErrors.cropCode = 'Crop code is required';
      if (crop.farmSize <= 0) {
        cropErrors.farmSize = 'Farm size must be a positive number';
      }

      if (Object.keys(cropErrors).length > 0) {
        if (!newErrors.crops) newErrors.crops = {};
        newErrors.crops[index] = cropErrors;
      }
    });

    // Validate livestock
    data.livestock.forEach((item, index) => {
      const livestockErrors: FieldErrors<Livestock> = {};
      if (!item.type.trim()) livestockErrors.type = 'Type is required';
      if (!item.code.trim()) livestockErrors.code = 'Code is required';
      if (item.quantity <= 0) {
        livestockErrors.quantity = 'Quantity must be a positive number';
      }

      if (Object.keys(livestockErrors).length > 0) {
        if (!newErrors.livestock) newErrors.livestock = {};
        newErrors.livestock[index] = livestockErrors;
      }
    });

    return newErrors;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardContent className="space-y-8 pt-6">
          {/* Crops Section */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Crops</h2>
              <Button type="button" variant="outline" onClick={addCrop}>
                Add Crop
              </Button>
            </div>
            <div className="space-y-4">
              {data.crops.map((crop, index) => (
                <div key={crop.id} className="grid grid-cols-4 gap-4 p-4 border rounded-lg">
                  <div className="space-y-1">
                    <Input
                      placeholder="Type"
                      value={crop.type}
                      onChange={(e) => updateCrop(index, 'type', e.target.value)}
                      aria-invalid={!!errors.crops?.[index]?.type}
                    />
                    {errors.crops?.[index]?.type && (
                      <p className="text-red-500 text-sm">{errors.crops[index].type}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Input
                      placeholder="Crop Code"
                      value={crop.cropCode}
                      onChange={(e) => updateCrop(index, 'cropCode', e.target.value)}
                      aria-invalid={!!errors.crops?.[index]?.cropCode}
                    />
                    {errors.crops?.[index]?.cropCode && (
                      <p className="text-red-500 text-sm">{errors.crops[index].cropCode}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Input
                      placeholder="Farm Size"
                      type="number"
                      min="0"
                      step="0.01"
                      value={crop.farmSize || ''}
                      onChange={(e) => updateCrop(index, 'farmSize', e.target.value)}
                      aria-invalid={!!errors.crops?.[index]?.farmSize}
                    />
                    {errors.crops?.[index]?.farmSize && (
                      <p className="text-red-500 text-sm">{errors.crops[index].farmSize}</p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => removeCrop(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </section>

          {/* Livestock Section */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Livestock</h2>
              <Button type="button" variant="outline" onClick={addLivestock}>
                Add Livestock
              </Button>
            </div>
            <div className="space-y-4">
              {data.livestock.map((item, index) => (
                <div key={item.id} className="grid grid-cols-4 gap-4 p-4 border rounded-lg">
                  <div className="space-y-1">
                    <Input
                      placeholder="Type"
                      value={item.type}
                      onChange={(e) => updateLivestock(index, 'type', e.target.value)}
                      aria-invalid={!!errors.livestock?.[index]?.type}
                    />
                    {errors.livestock?.[index]?.type && (
                      <p className="text-red-500 text-sm">{errors.livestock[index].type}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Input
                      placeholder="Code"
                      value={item.code}
                      onChange={(e) => updateLivestock(index, 'code', e.target.value)}
                      aria-invalid={!!errors.livestock?.[index]?.code}
                    />
                    {errors.livestock?.[index]?.code && (
                      <p className="text-red-500 text-sm">{errors.livestock[index].code}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Input
                      placeholder="Quantity"
                      type="number"
                      min="0"
                      step="1"
                      value={item.quantity || ''}
                      onChange={(e) => updateLivestock(index, 'quantity', e.target.value)}
                      aria-invalid={!!errors.livestock?.[index]?.quantity}
                    />
                    {errors.livestock?.[index]?.quantity && (
                      <p className="text-red-500 text-sm">{errors.livestock[index].quantity}</p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => removeLivestock(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </section>
        </CardContent>
      </Card>

      <Button type="submit" className="w-full">
        Submit
      </Button>
    </form>
  );
};

export default AgriculturalActivityForm;