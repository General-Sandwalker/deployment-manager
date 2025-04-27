'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getUsers, updateUser, deleteUser } from '@/services/users';
import UserTable from '@/components/admin/UserTable';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { User } from '@/types';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/lable';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

export default function UsersAdminPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    is_active: true,
    is_admin: false
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        if (token) {
          const data = await getUsers(token);
          setUsers(data);
        }
      } catch (err) {
        setError('Failed to fetch users');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [token]);

  const handleEditUser = (user: User) => {
    setCurrentUser(user);
    setFormData({
      email: user.email,
      full_name: user.full_name || '',
      is_active: user.is_active,
      is_admin: user.is_admin
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteUser(userId, token as string);
      setUsers(users.filter(user => user.id !== userId));
    } catch (err) {
      setError('Failed to delete user');
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      const updatedUser = await updateUser(
        currentUser.id,
        formData,
        token as string
      );

      setUsers(users.map(user => 
        user.id === updatedUser.id ? updatedUser : user
      ));
      
      setIsEditModalOpen(false);
    } catch (err) {
      setError('Failed to update user');
      console.error(err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner className="text-[var(--cosmic-highlight)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">User Management</h1>
        <Button className="bg-[var(--cosmic-highlight)] hover:bg-[var(--cosmic-highlight-dark)]">
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 text-red-500 rounded-md">
          {error}
        </div>
      )}

      <UserTable 
        users={users} 
        onEdit={handleEditUser} 
        onDelete={handleDeleteUser} 
      />

      {/* Edit User Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div>
              <Label htmlFor="email" className="text-[var(--text-primary)]">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="bg-[var(--cosmic-light)] border-[var(--cosmic-accent)] mt-1 text-[var(--text-primary)]"
                disabled
              />
            </div>
            
            <div>
              <Label htmlFor="full_name" className="text-[var(--text-primary)]">
                Full Name
              </Label>
              <Input
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className="bg-[var(--cosmic-light)] border-[var(--cosmic-accent)] mt-1 text-[var(--text-primary)]"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="is_active"
                name="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, is_active: checked === true }))
                }
              />
              <Label htmlFor="is_active" className="text-[var(--text-primary)]">
                Active Account
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="is_admin"
                name="is_admin"
                checked={formData.is_admin}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, is_admin: checked === true }))
                }
              />
              <Label htmlFor="is_admin" className="text-[var(--text-primary)]">
                Admin Privileges
              </Label>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
                className="border-[var(--cosmic-accent)] text-[var(--text-primary)]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[var(--cosmic-highlight)] hover:bg-[var(--cosmic-highlight-dark)]"
              >
                Save Changes
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}