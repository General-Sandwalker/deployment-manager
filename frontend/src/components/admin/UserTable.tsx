'use client';
import { User, UserRole, UserPlanType } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDate } from '@/lib/utils';

interface UserTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
}

export default function UserTable({ users, onEdit, onDelete }: UserTableProps) {
  const checkPlanStatus = (user: User): 'active' | 'expired' | 'none' => {
    if (user.plan_type === UserPlanType.FREE) return 'none';
    if (!user.plan_expires_at) return 'none';
    
    const expiry = new Date(user.plan_expires_at);
    const now = new Date();
    
    return expiry > now ? 'active' : 'expired';
  };

  const getUserInitial = (user: User): string => {
    if (user.full_name) return user.full_name.charAt(0).toUpperCase();
    if (user.email) return user.email.charAt(0).toUpperCase();
    return 'U';
  };

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
            {users.map((user) => {
              const planStatus = checkPlanStatus(user);
              
              return (
                <tr key={user.id} className="hover:bg-cosmic-light transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Avatar className="flex-shrink-0 h-10 w-10 rounded-full bg-cosmic-accent">
                        {user.avatar ? (
                          <AvatarImage src={user.avatar} alt={user.full_name || 'User'} />
                        ) : (
                          <AvatarFallback className="text-white">
                            {getUserInitial(user)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-white">
                          {user.full_name || 'No name'}
                        </div>
                        <div className="text-sm text-cosmic-highlight">
                          {user.email}
                        </div>
                        <div className="text-xs text-cosmic-highlight">
                          Joined: {formatDate(user.created_at)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={user.is_active ? 'success' : 'destructive'}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    {user.role === UserRole.ADMIN && (
                      <Badge variant="outline" className="ml-2 border-cosmic-highlight text-cosmic-highlight">
                        Admin
                      </Badge>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {planStatus === 'active' && (
                      <div>
                        <Badge variant="premium" className="bg-green-600 hover:bg-green-700">
                          Premium
                        </Badge>
                        <div className="text-xs text-cosmic-highlight mt-1">
                          Expires: {formatDate(user.plan_expires_at)}
                        </div>
                      </div>
                    )}
                    {planStatus === 'expired' && (
                      <div>
                        <Badge variant="outline" className="border-orange-500 text-orange-500">
                          Expired
                        </Badge>
                        <div className="text-xs text-cosmic-highlight mt-1">
                          Expired: {formatDate(user.plan_expires_at)}
                        </div>
                      </div>
                    )}
                    {planStatus === 'none' && (
                      <Badge variant="default">Free</Badge>
                    )}
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
                        className="text-red-500 hover:bg-cosmic-light"
                      >
                        <Trash2 size={16} className="mr-1" />
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}