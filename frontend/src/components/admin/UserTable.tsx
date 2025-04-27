'use client';
import { User } from '@/types/user';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';

interface UserTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (userId: number) => void;
}

export default function UserTable({ users, onEdit, onDelete }: UserTableProps) {
  return (
    <div className="rounded-xl border border-cosmic-accent overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-cosmic-accent">
          <thead className="bg-cosmic-light">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-cosmic-highlight uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-cosmic-highlight uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-cosmic-highlight uppercase tracking-wider">
                Plan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-cosmic-highlight uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-cosmic-blue divide-y divide-cosmic-accent">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-cosmic-light transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-cosmic-accent flex items-center justify-center text-white">
                      {user.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-white">
                        {user.full_name || 'No name'}
                      </div>
                      <div className="text-sm text-cosmic-highlight">
                        {user.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant={user.is_active ? 'success' : 'destructive'}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  {user.is_admin && (
                    <Badge variant="outline" className="ml-2 border-cosmic-highlight text-cosmic-highlight">
                      Admin
                    </Badge>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant={user.plan_expires_at ? 'premium' : 'default'}>
                    {user.plan_expires_at ? 'Premium' : 'Free'}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onEdit(user)}
                      className="text-cosmic-highlight hover:bg-cosmic-light"
                    >
                      <Edit size={16} className="mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDelete(user.id)}
                      className="text-danger hover:bg-cosmic-light"
                    >
                      <Trash2 size={16} className="mr-1" />
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}