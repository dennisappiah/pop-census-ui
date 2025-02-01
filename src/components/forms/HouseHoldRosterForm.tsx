import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

export interface HouseholdMember {
  personId: string;
  fullName: string;
  relationshipToHead: string;
  relationshipCode: string;
  sex: 'M' | 'F';
}

interface HouseholdRoster {
  members: HouseholdMember[];
}

interface MemberFormProps {
  member: HouseholdMember;
  index: number;
  onChange: (field: keyof HouseholdMember, value: string) => void;
  onRemove: () => void;
  error?: string;
  isHead: boolean;
}

const relationshipOptions = [
  { value: 'HEAD', label: 'Head', code: '1' },
  { value: 'SPOUSE', label: 'Spouse', code: '2' },
  { value: 'CHILD', label: 'Child', code: '3' },
  { value: 'PARENT', label: 'Parent', code: '4' },
  { value: 'SIBLING', label: 'Sibling', code: '5' },
  { value: 'OTHER', label: 'Other', code: '6' },
];

const sexOptions = [
  { value: 'M', label: 'Male' },
  { value: 'F', label: 'Female' },
];

const MemberForm: React.FC<MemberFormProps> = ({ 
  member, 
  index, 
  onChange, 
  onRemove, 
  error, 
  isHead 
}) => {
  const handleRelationshipChange = (value: string) => {
    const option = relationshipOptions.find(opt => opt.value === value);
    onChange('relationshipToHead', value);
    if (option) {
      onChange('relationshipCode', option.code);
    }
  };

  return (
    <div className="border p-4 rounded-lg space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Member #{index + 1}</h3>
        {!isHead && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onRemove}
            className="h-8 w-8"
            aria-label="Remove member"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div>
        <Label htmlFor={`fullName-${index}`}>Full Name *</Label>
        <Input
          id={`fullName-${index}`}
          value={member.fullName}
          onChange={(e) => onChange('fullName', e.target.value)}
          className={error ? 'border-red-500' : ''}
          aria-invalid={!!error}
          aria-describedby={error ? `fullNameError-${index}` : undefined}
        />
        {error && (
          <span id={`fullNameError-${index}`} className="text-red-500 text-sm">
            {error}
          </span>
        )}
      </div>

      <div>
        <Label htmlFor={`relationshipToHead-${index}`}>Relationship to Head</Label>
        <Select
          value={member.relationshipToHead}
          onValueChange={handleRelationshipChange}
          disabled={isHead}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Relationship" />
          </SelectTrigger>
          <SelectContent>
            {relationshipOptions.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                disabled={isHead && option.value !== 'HEAD'}
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor={`sex-${index}`}>Sex *</Label>
        <Select
          value={member.sex}
          onValueChange={(value) => onChange('sex', value as 'M' | 'F')}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Sex" />
          </SelectTrigger>
          <SelectContent>
            {sexOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

interface HouseholdRosterFormProps {
  maxMembers?: number;
  onSubmit?: (roster: HouseholdRoster) => void;
}

export const HouseholdRosterForm: React.FC<HouseholdRosterFormProps> = ({ 
  maxMembers = 10, 
  onSubmit = () => {} 
}) => {
  const [members, setMembers] = useState<HouseholdMember[]>([{
    personId: uuidv4(),
    fullName: '',
    relationshipToHead: 'HEAD',
    relationshipCode: '1',
    sex: 'M',
  }]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const addMember = () => {
    if (members.length >= maxMembers) return;

    const newMember: HouseholdMember = {
      personId: uuidv4(),
      fullName: '',
      relationshipToHead: 'OTHER',
      relationshipCode: '6',
      sex: 'M',
    };
    
    setMembers(prevMembers => [...prevMembers, newMember]);
    setFormErrors({});
  };

  const removeMember = (index: number) => {
    if (index === 0) return;
    setMembers(prevMembers => prevMembers.filter((_, i) => i !== index));
    setFormErrors({});
  };

  const handleMemberChange = (index: number, field: keyof HouseholdMember, value: string) => {
    setMembers(prevMembers => 
      prevMembers.map((member, i) => 
        i === index ? { ...member, [field]: value } : member
      )
    );
    setFormErrors({});
  };

  const validateForm = (): Record<string, string> => {
    const newErrors: Record<string, string> = {};
    
    if (members.length === 0) {
      newErrors['general'] = 'At least one household member is required';
      return newErrors;
    }

    members.forEach((member, index) => {
      if (!member.fullName.trim()) {
        newErrors[`members[${index}].fullName`] = 'Full Name is required';
      } else if (member.fullName.length < 2) {
        newErrors[`members[${index}].fullName`] = 'Name must be at least 2 characters';
      }

      if (index === 0 && member.relationshipToHead !== 'HEAD') {
        newErrors[`members[${index}].relationshipToHead`] = 'First member must be the household head';
      }
    });

    const headCount = members.filter(m => m.relationshipToHead === 'HEAD').length;
    if (headCount > 1) {
      newErrors['general'] = 'Only one household head is allowed';
    }

    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validateForm();
    setFormErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      // Create the household roster object
      const householdRoster: HouseholdRoster = {
        members: members
      };
      onSubmit(householdRoster);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Household Roster</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit}>
          {members.map((member, index) => (
            <MemberForm
              key={member.personId}
              member={member}
              index={index}
              onChange={(field, value) => handleMemberChange(index, field, value)}
              onRemove={() => removeMember(index)}
              error={formErrors[`members[${index}].fullName`]}
              isHead={index === 0}
            />
          ))}

          <div className="flex justify-between mt-6">
            <Button
              type="button"
              onClick={addMember}
              disabled={members.length >= maxMembers}
            >
              Add Member
            </Button>
            <Button type="submit">Submit & Continue</Button>
          </div>

          {members.length >= maxMembers && (
            <Alert className="mt-4">
              <AlertDescription>
                Maximum number of household members ({maxMembers}) reached
              </AlertDescription>
            </Alert>
          )}

          {formErrors['general'] && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{formErrors['general']}</AlertDescription>
            </Alert>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default HouseholdRosterForm;