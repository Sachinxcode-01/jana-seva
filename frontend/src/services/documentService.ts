import { apiClient } from './apiClient';
import { DocumentItem } from '../types';

export const documentService = {
  async getUserDocuments(): Promise<{ success: boolean; documents: DocumentItem[] }> {
    const res = await apiClient.get('/users/me/documents');
    return res.data;
  },

  async updateDocumentsChecklist(documents: DocumentItem[]): Promise<{ success: boolean; documents: DocumentItem[]; message?: string }> {
    const res = await apiClient.put('/users/me/documents', { documents });
    return res.data;
  },

  async updateSingleDocument(
    documentId: string,
    updates: { status?: 'available' | 'pending' | 'not_applicable'; documentNumber?: string; notes?: string }
  ): Promise<{ success: boolean; document: DocumentItem; message?: string }> {
    const res = await apiClient.put(`/users/me/documents/${documentId}`, updates);
    return res.data;
  }
};
