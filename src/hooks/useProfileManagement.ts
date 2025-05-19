
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UserProfile } from '@/contexts/AuthContext';

export const useProfileManagement = () => {
  const fetchProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data as UserProfile;
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      return null;
    }
  };

  const updateProfile = async (userId: string, data: Partial<UserProfile>): Promise<UserProfile | null> => {
    if (!userId) throw new Error('No authenticated user');
    
    try {
      // Update the profile data with id
      const profileData = {
        id: userId,
        ...data,
        updated_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('profiles')
        .upsert(profileData);
      
      if (error) throw error;
      
      // Refresh profile
      const updatedProfile = await fetchProfile(userId);
      
      toast.success('Profile updated successfully');
      
      return updatedProfile;
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
      return null;
    }
  };

  return {
    fetchProfile,
    updateProfile
  };
};
