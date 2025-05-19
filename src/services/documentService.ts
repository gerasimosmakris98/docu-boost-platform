
import { supabase } from "@/integrations/supabase/client";
import { aiService } from "./aiService";
import { toast } from "sonner";

export type DocumentType = 'resume' | 'cover_letter' | 'other';

export interface Document {
  id: string;
  user_id: string;
  title: string;
  type: DocumentType;
  content: string;
  job_description?: string;
  created_at: string;
  updated_at: string;
}

export const documentService = {
  // Get all documents for the current user
  async getDocuments(): Promise<Document[]> {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(item => ({
        ...item,
        type: item.type as DocumentType
      }));
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to load documents');
      return [];
    }
  },

  // Get a single document by id
  async getDocument(id: string): Promise<Document | null> {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      
      if (!data) return null;
      
      return {
        ...data,
        type: data.type as DocumentType
      };
    } catch (error) {
      console.error('Error fetching document:', error);
      toast.error('Failed to load document');
      return null;
    }
  },

  // Create a new document
  async createDocument(
    title: string, 
    type: DocumentType, 
    content: string, 
    job_description?: string
  ): Promise<Document | null> {
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await supabase
        .from('documents')
        .insert({
          title, 
          type, 
          content, 
          job_description,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return {
        ...data,
        type: data.type as DocumentType
      };
    } catch (error) {
      console.error('Error creating document:', error);
      toast.error('Failed to create document');
      return null;
    }
  },

  // Update an existing document
  async updateDocument(
    id: string, 
    updates: Partial<Document>
  ): Promise<Document | null> {
    try {
      const { data, error } = await supabase
        .from('documents')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return {
        ...data,
        type: data.type as DocumentType
      };
    } catch (error) {
      console.error('Error updating document:', error);
      toast.error('Failed to update document');
      return null;
    }
  },

  // Delete a document
  async deleteDocument(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
      return false;
    }
  },

  // Generate document content using AI
  async generateDocument(
    type: 'resume' | 'cover_letter',
    userProfile: any,
    jobDescription: string
  ): Promise<Document | null> {
    try {
      // Get AI-generated content
      const generated = await aiService.generateDocument(
        type,
        userProfile,
        jobDescription
      );
      
      if (!generated) {
        throw new Error('Failed to generate document content');
      }
      
      // Create a new document with the generated content
      const document = await this.createDocument(
        generated.title,
        type,
        generated.content,
        jobDescription
      );
      
      return document;
    } catch (error) {
      console.error('Error generating document:', error);
      toast.error('Failed to generate document');
      return null;
    }
  }
};
