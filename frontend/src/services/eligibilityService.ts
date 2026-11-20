import { apiClient } from './apiClient';
import { SavedEligibilityRecord } from '../types';

export interface EligibilityCheckParams {
  age: number;
  state: string;
  occupation: string;
  gender: string;
  beneficiaryCategory: string;
  annualIncome: number;
  educationLevel?: string;
  hasBPLCard?: boolean;
}

export const eligibilityService = {
  async checkEligibility(params: EligibilityCheckParams): Promise<any> {
    const res = await apiClient.post('/eligibility/check', params);
    return res.data;
  },

  async getEvaluationHistory(): Promise<{ success: boolean; count: number; history: SavedEligibilityRecord[] }> {
    const res = await apiClient.get('/users/me/eligibility-history');
    return res.data;
  },

  async saveEvaluationHistory(record: Partial<SavedEligibilityRecord>): Promise<{ success: boolean; record: SavedEligibilityRecord; message?: string }> {
    const res = await apiClient.post('/users/me/eligibility-history', record);
    return res.data;
  },

  async deleteEvaluationHistory(id: string): Promise<{ success: boolean; message: string }> {
    const res = await apiClient.delete(`/users/me/eligibility-history/${id}`);
    return res.data;
  }
};
