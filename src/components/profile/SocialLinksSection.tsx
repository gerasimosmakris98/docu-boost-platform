
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PlusCircle, Trash2, Pencil, Save, X, Github, Linkedin, Globe, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";

interface SocialLink {
  id: string;
  platform: string;
  url: string;
}

const SocialLinksSection = () => {
  const { user, isAuthenticated } = useAuth();
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [newLink, setNewLink] = useState({ platform: '', url: '' });
  const [editLink, setEditLink] = useState({ platform: '', url: '' });

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchSocialLinks();
    }
  }, [isAuthenticated, user]);

  const fetchSocialLinks = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('social_links')
        .select('*')
        .eq('user_id', user?.id)
        .order('platform', { ascending: true });

      if (error) {
        throw error;
      }

      setLinks(data || []);
    } catch (error) {
      console.error('Error fetching social links:', error);
      toast.error('Failed to load social links');
    } finally {
      setIsLoading(false);
    }
  };

  const addSocialLink = async () => {
    if (!newLink.platform || !newLink.url) {
      toast.error('Please enter both platform name and URL');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('social_links')
        .insert({
          user_id: user?.id,
          platform: newLink.platform,
          url: newLink.url
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      setLinks([...links, data]);
      setNewLink({ platform: '', url: '' });
      setIsAdding(false);
      toast.success('Social link added successfully');
    } catch (error: any) {
      console.error('Error adding social link:', error);
      if (error.code === '23505') {
        toast.error(`You already have a link for ${newLink.platform}`);
      } else {
        toast.error('Failed to add social link');
      }
    }
  };

  const updateSocialLink = async (id: string) => {
    if (!editLink.platform || !editLink.url) {
      toast.error('Please enter both platform name and URL');
      return;
    }

    try {
      const { error } = await supabase
        .from('social_links')
        .update({
          platform: editLink.platform,
          url: editLink.url,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        throw error;
      }

      setLinks(links.map(link => 
        link.id === id ? { ...link, ...editLink } : link
      ));
      setEditingLinkId(null);
      toast.success('Social link updated successfully');
    } catch (error) {
      console.error('Error updating social link:', error);
      toast.error('Failed to update social link');
    }
  };

  const deleteSocialLink = async (id: string) => {
    try {
      const { error } = await supabase
        .from('social_links')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      setLinks(links.filter(link => link.id !== id));
      toast.success('Social link deleted successfully');
    } catch (error) {
      console.error('Error deleting social link:', error);
      toast.error('Failed to delete social link');
    }
  };

  const startEdit = (link: SocialLink) => {
    setEditingLinkId(link.id);
    setEditLink({ platform: link.platform, url: link.url });
  };

  const cancelEdit = () => {
    setEditingLinkId(null);
  };

  const cancelAdd = () => {
    setIsAdding(false);
    setNewLink({ platform: '', url: '' });
  };

  const getLinkIcon = (platform: string) => {
    const platformLower = platform.toLowerCase();
    if (platformLower.includes('github')) return <Github size={16} />;
    if (platformLower.includes('linkedin')) return <Linkedin size={16} />;
    if (platformLower.includes('portfolio') || platformLower.includes('website')) return <Globe size={16} />;
    return <LinkIcon size={16} />;
  };

  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-semibold">Social Links</CardTitle>
        {!isAdding && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsAdding(true)}
            className="text-gray-400 hover:text-white"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Link
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-4 text-center text-gray-400">Loading social links...</div>
        ) : (
          <div className="space-y-4">
            {links.length === 0 && !isAdding ? (
              <div className="py-4 text-center text-gray-400">
                No social links added yet. Click "Add Link" to add your first social profile.
              </div>
            ) : (
              <ul className="space-y-3">
                {links.map(link => (
                  <li key={link.id} className="flex items-center justify-between bg-gray-800/50 p-3 rounded border border-gray-700">
                    {editingLinkId === link.id ? (
                      <div className="w-full space-y-2">
                        <div className="flex gap-2">
                          <Input
                            className="bg-gray-700 border-gray-600"
                            placeholder="Platform (e.g., LinkedIn)"
                            value={editLink.platform}
                            onChange={(e) => setEditLink({...editLink, platform: e.target.value})}
                          />
                          <Input
                            className="bg-gray-700 border-gray-600"
                            placeholder="URL"
                            value={editLink.url}
                            onChange={(e) => setEditLink({...editLink, url: e.target.value})}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="ghost" onClick={cancelEdit}>
                            <X size={16} className="mr-1" /> Cancel
                          </Button>
                          <Button size="sm" onClick={() => updateSocialLink(link.id)}>
                            <Save size={16} className="mr-1" /> Save
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          {getLinkIcon(link.platform)}
                          <span className="font-medium">{link.platform}</span>
                          <a 
                            href={link.url.startsWith('http') ? link.url : `https://${link.url}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-primary hover:underline text-sm ml-2 truncate max-w-[200px]"
                          >
                            {link.url}
                          </a>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button size="icon" variant="ghost" onClick={() => startEdit(link)}>
                            <Pencil size={16} />
                          </Button>
                          <Button size="icon" variant="ghost" className="text-red-400 hover:text-red-300" onClick={() => deleteSocialLink(link.id)}>
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}

            {isAdding && (
              <div className="bg-gray-800/50 p-3 rounded border border-gray-700 space-y-3">
                <h4 className="font-medium">Add New Social Link</h4>
                <div className="space-y-2">
                  <div>
                    <Label htmlFor="platform">Platform</Label>
                    <Input
                      id="platform"
                      className="bg-gray-700 border-gray-600"
                      placeholder="e.g., LinkedIn, GitHub, Portfolio"
                      value={newLink.platform}
                      onChange={(e) => setNewLink({...newLink, platform: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="url">URL</Label>
                    <Input
                      id="url"
                      className="bg-gray-700 border-gray-600"
                      placeholder="e.g., https://linkedin.com/in/yourprofile"
                      value={newLink.url}
                      onChange={(e) => setNewLink({...newLink, url: e.target.value})}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={cancelAdd}>Cancel</Button>
                  <Button onClick={addSocialLink}>Add Link</Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SocialLinksSection;
