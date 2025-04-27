'use client';
import { useState, ReactNode } from 'react';
import { useWebsites } from '@/context/WebsiteContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface CreateWebsiteModalProps {
  children?: ReactNode;
}

export default function CreateWebsiteModal({ children }: CreateWebsiteModalProps) {
  const { createWebsite } = useWebsites();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    git_repo: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await createWebsite(formData.name, formData.git_repo);
      toast({
        title: 'Success',
        description: 'Website created successfully! Deployment in progress.',
      });
      setFormData({ name: '', git_repo: '' });
      setOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create website',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="bg-[var(--cosmic-highlight)] hover:bg-[var(--cosmic-highlight-dark)]">
            <Plus className="mr-2 h-4 w-4" />
            New Website
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Website</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div>
            <Label htmlFor="name" className="text-[var(--cosmic-highlight)]">
              Website Name
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-[var(--cosmic-light)] border-[var(--cosmic-accent)] mt-1 text-[var(--text-primary)]"
              placeholder="My Awesome Website"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="git_repo" className="text-[var(--cosmic-highlight)]">
              Git Repository URL
            </Label>
            <Input
              id="git_repo"
              type="url"
              value={formData.git_repo}
              onChange={(e) => setFormData({ ...formData, git_repo: e.target.value })}
              className="bg-[var(--cosmic-light)] border-[var(--cosmic-accent)] mt-1 text-[var(--text-primary)]"
              placeholder="https://github.com/user/repo"
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-[var(--cosmic-accent)] text-[var(--text-primary)] hover:bg-[var(--cosmic-light)]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-[var(--cosmic-highlight)] hover:bg-[var(--cosmic-highlight-dark)]"
            >
              {isLoading ? 'Creating...' : 'Create Website'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}