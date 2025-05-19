
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

/**
 * Upload a file to storage and return the public URL
 */
export const uploadFile = async (file: File, filePath: string): Promise<string | null> => {
  try {
    // Upload file to storage
    const { data, error } = await supabase.storage
      .from('uploads')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) throw error;
    
    // Get public URL for the file
    const { data: urlData } = supabase.storage
      .from('uploads')
      .getPublicUrl(data.path);
    
    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading file:', error);
    return null;
  }
};

/**
 * Delete a file from storage
 */
export const deleteFile = async (filePath: string): Promise<boolean> => {
  try {
    const { error } = await supabase.storage
      .from('uploads')
      .remove([filePath]);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

/**
 * List files in a directory
 */
export const listFiles = async (directoryPath: string): Promise<string[]> => {
  try {
    const { data, error } = await supabase.storage
      .from('uploads')
      .list(directoryPath);
    
    if (error) throw error;
    
    return data.map(file => file.name);
  } catch (error) {
    console.error('Error listing files:', error);
    return [];
  }
};
