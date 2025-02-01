import React, { useState, useEffect, FC } from 'react';
import {
  FileText,
  LogOut,
  Loader2,
  Menu,
  ChevronRight,
  CheckCircle2,
  Search,
  ChevronDown,
  Filter,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { toast } from 'react-toastify';
import { censusApi, Form } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { useCensusForm } from '@/hooks/useCensusForm';
import LocationInfoForm, { LocationInfo } from '@/components/forms/LocationInfoForm';
import HouseholdRosterForm, { HouseholdMember } from '@/components/forms/HouseHoldRosterForm';
import TemporaryAbsenteesForm, { TemporaryAbsenteesFormData } from '@/components/forms/TemporaryAbsenteesForm';
import HouseholdUnitForm, { HouseHoldUnit } from '@/components/forms/HouseholdUnitForm';
import EconomicActivityForm, { EconomicActivity } from '@/components/forms/EconomicActivityForm';
import FertilityForm, { FertilityData } from '@/components/forms/FertilityForm';
import DisabilitiesForm, { DisabilitiesData } from '@/components/forms/DisabilityForm';
import AgriculturalActivityForm, { AgriculturalActivity } from '@/components/forms/AgriculturalActivityForm';



interface FormConfig<T = any> {
  title: string;
  component: FC<T>;
  description: string;
  dataKey: keyof Form;
  formDataType: T;
}

const formConfigs: Record<number, FormConfig> = {
  1: {
    title: 'Location Information',
    component: LocationInfoForm,
    description: 'Enter geographical and address details',
    dataKey: 'step1Data',
    formDataType: {} as LocationInfo,
  },
  2: {
    title: 'Household Roster',
    component: HouseholdRosterForm,
    description: 'List all household members',
    dataKey: 'step2Data',
    formDataType: [] as HouseholdMember[],
  },
  3: {
    title: 'Household Unit',
    component: HouseholdUnitForm,
    description: 'Describe household characteristics',
    dataKey: 'step3Data',
    formDataType: [] as HouseHoldUnit[],
  },
  4: {
    title: 'Temporary Absentees',
    component: TemporaryAbsenteesForm,
    description: 'Record temporarily absent members',
    dataKey: 'step4Data',
    formDataType: {} as TemporaryAbsenteesFormData,
  },
  5: {
    title: 'Fertility Data',
    component: FertilityForm,
    description: 'Record fertility information',
    dataKey: 'step5Data',
    formDataType: {} as FertilityData,
  },
  6: {
    title: 'Economic Activity',
    component: EconomicActivityForm,
    description: 'Document employment and income',
    dataKey: 'step6Data',
    formDataType: [] as EconomicActivity[],
  },
  7: {
    title: 'Disability Data',
    component: DisabilitiesForm,
    description: 'Note any disabilities',
    dataKey: 'step7Data',
    formDataType: {} as DisabilitiesData,
  },
  8: {
    title: 'Agricultural Activity',
    component: AgriculturalActivityForm,
    description: 'Document farming and livestock',
    dataKey: 'step8Data',
    formDataType: {} as AgriculturalActivity,
  },
};

type GroupedForms = {
  today: Form[];
  yesterday: Form[];
  thisWeek: Form[];
  thisMonth: Form[];
  older: Form[];
};

const CensusApplication: React.FC = () => {
  const { user, logout } = useAuth();
  const { forms, setForms, isLoading, error: apiError, loadForms } = useCensusForm();
  const [activeForm, setActiveForm] = useState<Form | null>(null);
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'submitted' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'complete'>('all');
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  useEffect(() => {
    if (!forms.length) {
      loadForms();
    } else {
      setActiveForm(forms[0]);
    }
  }, [forms, loadForms]);

  const createNewForm = async () => {
    setFormStatus('submitting');
    setError(null);
    try {
      const newForm = await censusApi.createForm();
      setForms((prevForms) => [...prevForms, newForm]);
      setActiveForm(newForm);
      toast.success('New form created successfully.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create form');
      toast.error('Failed to create new form. Please try again.');
    } finally {
      setFormStatus('idle');
    }
  };

  const handleStepSubmit = async <T extends Record<string, any>>(
    formId: string,
    step: number,
    data: T,
    isLastStep = false
  ) => {
    setFormStatus('submitting');
    setError(null);

    try {
      let updatedForm: Form;

      if (isLastStep) {
        updatedForm = await censusApi.submitAgriculturalActivities(formId, data as any);
      } else {
        updatedForm = await censusApi.submitStep<T>(formId, step, data);
      }

      // Update the forms list and active form
      setForms((prevForms) =>
        prevForms.map((form) => (form.id === updatedForm.id ? updatedForm : form))
      );
      setActiveForm(updatedForm);

      if (isLastStep) {
        toast.success('Form completed successfully!');
        setFormStatus('submitted');
      } else {
        toast.success(`Step ${step} saved successfully.`);
      }
    } catch (err) {
      console.error('Error submitting step:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setFormStatus('error');
      toast.error(`Failed to save step ${step}. Please try again.`);
    } finally {
      setFormStatus('idle');
    }
  };

  const getProgressPercentage = (form: Form | null): number => {
    if (!form) return 0;
    return ((form.currentStep - 1) / Object.keys(formConfigs).length) * 100 || 0;
  };

  const groupForms = (forms: Form[]): GroupedForms => {
    const grouped: GroupedForms = { today: [], yesterday: [], thisWeek: [], thisMonth: [], older: [] };

    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(now);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    forms.forEach((form) => {
      const formDate = new Date(form.createdAt);
      if (formDate.toDateString() === now.toDateString()) {
        grouped.today.push(form);
      } else if (formDate.toDateString() === yesterday.toDateString()) {
        grouped.yesterday.push(form);
      } else if (formDate > weekAgo) {
        grouped.thisWeek.push(form);
      } else if (formDate > monthAgo) {
        grouped.thisMonth.push(form);
      } else {
        grouped.older.push(form);
      }
    });

    return grouped;
  };

  const filterForms = (forms: Form[]) => {
    return forms.filter((form) => {
      const matchesSearch = form.id.toString().includes(searchTerm);
      const matchesStatus =
        filterStatus === 'all'
          ? true
          : filterStatus === 'complete'
          ? form.status === 'COMPLETED'
          : form.status === 'IN_PROGRESS';
      return matchesSearch && matchesStatus;
    });
  };

  const renderFormGroup = (title: string, forms: Form[], groupKey: string) => {
    if (!forms.length) return null;

    return (
      <div key={groupKey} className="mb-4">
        <button
          className="w-full flex items-center justify-between p-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded"
          onClick={() => setExpandedGroup(expandedGroup === groupKey ? null : groupKey)}
          aria-expanded={expandedGroup === groupKey}
        >
          <span>
            {title} ({forms.length})
          </span>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${
              expandedGroup === groupKey ? 'transform rotate-180' : ''
            }`}
          />
        </button>

        {expandedGroup === groupKey && (
          <div className="mt-2 space-y-2">
            {forms.map((form) => (
              <div
                key={form.id}
                className={`p-4 rounded-lg cursor-pointer transition-all ${
                  activeForm?.id === form.id
                    ? 'bg-blue-50 border border-blue-200'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => setActiveForm(form)}
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">Form {form.id}</h3>
                  <span
                    className={`text-sm px-2 py-1 rounded ${
                      form.status === 'COMPLETED'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {form.status === 'COMPLETED' ? 'Complete' : `Step ${form.currentStep}/8`}
                  </span>
                </div>
                <Progress value={getProgressPercentage(form)} className="h-2" />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderStepIndicator = (step: number, currentStep: number, formStatus: 'IN_PROGRESS' | 'COMPLETED') => {
    const config = formConfigs[step];
    const isComplete = currentStep > step || formStatus === 'COMPLETED';
    const isActive = currentStep === step && formStatus === 'IN_PROGRESS';

    return (
      <div
        key={step}
        className={`flex items-center p-4 rounded-lg ${
          isActive ? 'bg-blue-50 border border-blue-200' : 'bg-white'
        }`}
      >
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
            isComplete
              ? 'bg-green-100'
              : isActive
              ? 'bg-blue-100'
              : 'bg-gray-100'
          }`}
        >
          {isComplete ? (
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          ) : (
            <span
              className={`text-sm font-medium ${
                isActive ? 'text-blue-600' : 'text-gray-500'
              }`}
            >
              {step}
            </span>
          )}
        </div>
        <div>
          <h3 className="text-sm font-medium">{config.title}</h3>
          <p className="text-xs text-gray-500">{config.description}</p>
        </div>
        {isActive && <ChevronRight className="w-5 h-5 ml-auto text-blue-500" />}
      </div>
    );
  };

  const renderFormStep = () => {
    if (!activeForm) return null;

    const currentConfig = formConfigs[activeForm.currentStep];
    if (!currentConfig) return null;

    const FormComponent = currentConfig.component;
    const stepData = activeForm[currentConfig.dataKey] || {};

    const handleSubmit = (data: any) => {
      handleStepSubmit(
        activeForm.id,
        activeForm.currentStep,
        data,
        activeForm.currentStep === 8
      );
    };

    const handleChange = (data: any) => {
      // Handle changes in the form data (optional)
      console.log('Form data changed:', data);
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle>{currentConfig.title}</CardTitle>
          <CardDescription>{currentConfig.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <FormComponent
            formId={activeForm.id}
            data={stepData}
            onSubmit={handleSubmit}
            onChange={handleChange} // Pass the onChange prop
          />
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="flex items-center space-x-2">
              <FileText className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-semibold">Census 2025</h1>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-medium">
                  {user?.name?.charAt(0)}
                </span>
              </div>
              <span className="text-sm font-medium">{user?.name}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={logout}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <div
          className={`bg-white w-80 border-r border-gray-200 h-[calc(100vh-4rem)] transition-all duration-300 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-80'
          }`}
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">Forms</h2>
              <Button
                onClick={createNewForm}
                disabled={formStatus === 'submitting'}
              >
                {formStatus === 'submitting' ? (
                  <Loader2 className="animate-spin w-5 h-5" />
                ) : (
                  'New Form'
                )}
              </Button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search forms..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Select
                value={filterStatus}
                onValueChange={(value: 'all' | 'active' | 'complete') => setFilterStatus(value)}
              >
                <SelectTrigger>
                  <div className="flex items-center space-x-2">
                    <Filter className="w-4 h-4" />
                    <SelectValue placeholder="Filter by status" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Forms</SelectItem>
                  <SelectItem value="active">In Progress</SelectItem>
                  <SelectItem value="complete">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="overflow-y-auto max-h-[calc(100vh-20rem)]">
              {Object.entries(groupForms(filterForms(forms))).map(([key, groupForms]) =>
                renderFormGroup(
                  key === 'today'
                    ? 'Today'
                    : key === 'yesterday'
                    ? 'Yesterday'
                    : key === 'thisWeek'
                    ? 'This Week'
                    : key === 'thisMonth'
                    ? 'This Month'
                    : 'Older',
                  groupForms,
                  key
                )
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {apiError && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{apiError}</AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <div className="flex justify-center items-center h-[calc(100vh-16rem)]">
              <Loader2 className="animate-spin w-8 h-8 text-blue-500" />
            </div>
          ) : activeForm ? (
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-3 gap-6">
                <div className="col-span-1 space-y-4">
                  {Object.keys(formConfigs).map((step) =>
                    renderStepIndicator(
                      parseInt(step),
                      activeForm.currentStep,
                      activeForm.status
                    )
                  )}
                </div>
                <div className="col-span-2">{renderFormStep()}</div>
                </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 mt-12">
              Select a form or create a new one to begin
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CensusApplication;