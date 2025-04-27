'use client';
import { useState, ReactNode } from 'react';
import { useWebsites } from '@/context/WebsiteContext';
import { WebsiteCreate } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/lable';
import { useToast } from '@/components/ui/use-toast';
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
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<WebsiteCreate>({
    name: '',
    git_repo: '',
  });
  const { createWebsite, isLoading } = useWebsites();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createWebsite(formData.name, formData.git_repo);
      toast({
        title: "Success",
        description: "Website created successfully",
      });
      setOpen(false);
      setFormData({ name: '', git_repo: '' });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create website",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button
            variant="default"
            className="bg-[var(--cosmic-highlight)] hover:bg-[var(--cosmic-highlight)/90]"
          >
            Create Website
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-[var(--text-primary)]">
            Create New Website
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <Label htmlFor="name" className="text-[var(--cosmic-highlight)]">
              Website Name
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-[var(--cosmic-light)] border-[var(--cosmic-accent)] mt-1 text-[var(--text-primary)]"
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
              className="bg-[var(--cosmic-highlight)] hover:bg-[var(--cosmic-highlight)/90]"
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Website'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}