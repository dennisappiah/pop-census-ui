import { AgriculturalActivity } from "@/components/forms/AgriculturalActivityForm";
import { DisabilitiesData } from "@/components/forms/DisabilityForm";
import { EconomicActivity } from "@/components/forms/EconomicActivityForm";
import { FertilityData } from "@/components/forms/FertilityForm";
import { HouseholdMember } from "@/components/forms/HouseHoldRosterForm";
import { HouseHoldUnit } from "@/components/forms/HouseholdUnitForm";
import { LocationInfo } from "@/components/forms/LocationInfoForm";
import { TemporaryAbsenteesFormData } from "@/components/forms/TemporaryAbsenteesForm";
import axios, { AxiosInstance, AxiosRequestConfig, AxiosError, AxiosResponse } from "axios";

interface ValidationResponse {
  valid: boolean;
  errors: Record<string, string[]>;
  warnings?: Record<string, string[]>;
}

interface FormStatus {
  step: number;
  isComplete: boolean;
  lastUpdated: string;
}

export interface Form {
  id: string;
  currentStep: number;
  createdAt: string;
  status: 'IN_PROGRESS' | 'COMPLETED'; 
  step1Data?: LocationInfo;
  step2Data?: HouseholdMember[]; 
  step3Data?:  HouseHoldUnit[]; 
  step4Data?: TemporaryAbsenteesFormData;
  step5Data?: FertilityData; 
  step6Data?:  EconomicActivity[];
  step7Data?: DisabilitiesData; 
  step8Data?: AgriculturalActivity; 
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  status: number;
  timestamp: string;
}

export interface LoginResponse {
  token: string;
}

export class CensusApiClient {
  private readonly api: AxiosInstance;
  private static instance: CensusApiClient;
  private readonly TOKEN_KEY = 'census_token';

  constructor(config?: AxiosRequestConfig) {
    this.api = axios.create({
      baseURL: 'https://ecl-spring-apps-popcensus-backend.azuremicroservices.io/api',
      headers: {
        'Content-Type': 'application/json',
        ...config?.headers,
      },
      timeout: config?.timeout || 30000,
    });
    this.setupInterceptors();
  }

  public static getInstance(config?: AxiosRequestConfig): CensusApiClient {
    if (!CensusApiClient.instance) {
      CensusApiClient.instance = new CensusApiClient(config);
    } else if (config) {
      console.warn('CensusApiClient is already initialized. Configuration changes will not be applied.');
    }
    return CensusApiClient.instance;
  }

  private setupInterceptors(): void {
    this.api.interceptors.request.use(
      (config) => {
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          this.logout();
        }
        return Promise.reject(error);
      }
    );
  }

  private getAuthToken(): string | null {
    return typeof window !== 'undefined' ? localStorage.getItem('census_token') : null;
  }

  private handleResponse<T>(response: AxiosResponse<ApiResponse<T>>): T {
    if (response.data.status >= 400) {
      throw new Error(response.data.message);
    }
    return response.data.data;
  }

  async createForm(): Promise<Form> {
    const response = await this.api.post<ApiResponse<Form>>('/forms');
    return this.handleResponse(response);
  }

  async getForms(): Promise<Form[]> {
    const response = await this.api.get<ApiResponse<Form[]>>('/forms/agent');
    return this.handleResponse(response);
  }

  async getFormById(formId: string): Promise<Form> {
    const response = await this.api.get<ApiResponse<Form>>(`/forms/${formId}`);
    return this.handleResponse(response);
  }

  async getCurrentUser() {
    const response = await this.api.get<ApiResponse<{ id: string; name: string }>>('/auth/me');
    return this.handleResponse(response);
  }

  async logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('census_token');
      window.location.href = '';
    }
  }

  public async submitStep<T extends Record<string, any>>(formId: string, step: number, data: T): Promise<Form> {
    const response = await this.api.post<ApiResponse<Form>>(`/forms/${formId}/step${step}`, data);
    return this.handleResponse(response);
  }

  async submitLocationInfo(formId: string, data: LocationInfo): Promise<Form> {
    return this.submitStep(formId, 1, data);
  }

  async submitHouseHoldRoster(formId: string, data: HouseholdMember[]): Promise<Form> {
    return this.submitStep(formId, 2, data);
  }

  async submitHouseHoldUnit(formId: string, data: any): Promise<Form> {
    return this.submitStep(formId, 3, data);
  }

  async  submitTemporaryAbsentees(formId: string, data: any): Promise<Form> {
    return this.submitStep(formId, 4, data);
  }

  async  submitFertilityData(formId: string, data: any): Promise<Form> {
    return this.submitStep(formId, 5, data);
  }

  async submitEconomicActivities(formId: string, data: any): Promise<Form> {
    return this.submitStep(formId, 6, data);
  }

  async submitDisabilities(formId: string, data: any): Promise<Form> {
    return this.submitStep(formId, 7, data);
  }


async submitAgriculturalActivities(formId: string, data: AgriculturalActivity): Promise<Form> {
  const response = await this.api.post<ApiResponse<Form>>(`/forms/${formId}/step8`, data);
  const updatedForm = this.handleResponse(response);

  // Explicitly mark the form as completed after the last step
  if (updatedForm.currentStep === 8) {
    return this.completeForm(formId);
  }
  return updatedForm;
}
 
  async validateForm(formId: string): Promise<ValidationResponse> {
    const response = await this.api.get<ApiResponse<ValidationResponse>>(`/forms/${formId}/validate`);
    return this.handleResponse(response);
  }


async completeForm(formId: string): Promise<Form> {
  const response = await this.api.post<ApiResponse<Form>>(`/forms/${formId}/complete`);
  const completedForm = this.handleResponse(response);
  if (completedForm.status !== 'COMPLETED') {
    throw new Error('Form completion failed');
  }
  return completedForm;
}

  async registerUser(data: {
    username: string;
    password: string;
    role: string;
  }): Promise<{ id: string; username: string; role: string; email: string }> {
    const response = await this.api.post<ApiResponse<{ id: string; username: string; email: string; role: string }>>(
      '/auth/register',
      data
    );
    return this.handleResponse(response);
  }

  async loginUser(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await this.api.post('/auth/login', credentials);

      if (!response) {
        console.error("No response received from API");
        throw new Error("No response received from API");
      }

      return response.data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }
}

export const censusApi = CensusApiClient.getInstance();