import { useState, useEffect, useMemo } from "react";
import { censusApi, Form } from "@/services/api";
import { toast } from "react-toastify";


interface UseCensusFormReturn {
  forms: Form[];
  setForms: React.Dispatch<React.SetStateAction<Form[]>>;
  isLoading: boolean;
  error: string | null;
  loadForms: () => Promise<void>;
}

export const useCensusForm = (): UseCensusFormReturn => {
  const [forms, setForms] = useState<Form[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch forms
  const loadForms = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const userForms = await censusApi.getForms(); 
      setForms(userForms as Form[]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      console.error("Error loading forms:", err);
      toast.error("Failed to load forms. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadForms();
  }, []);

  // Memoize the return value
  return useMemo(() => ({ forms, setForms, isLoading, error, loadForms }), [
    forms,
    isLoading,
    error,
  ]);
};