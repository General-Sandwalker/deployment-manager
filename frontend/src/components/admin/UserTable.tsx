'use client';

import React from 'react';
import { User } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

interface UserTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (id: number) => void;
}

export default function UserTable({ users, onEdit, onDelete }: UserTableProps) {
  const getPlanStatus = (user: User) => {
    if (!user.plan_expires_at) {
      return 'none';
    }

    const expiresAt = new Date(user.plan_expires_at);
    const now = new Date();

    if (expiresAt < now) {
      return 'expired';
    }
    
    return 'active';
  };

  return (
    <div className="rounded-md border border-[var(--cosmic-accent)] overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-[var(--cosmic-light)]">
            <TableHead className="w-[50px] text-[var(--text-primary)]">ID</TableHead>
            <TableHead className="text-[var(--text-primary)]">Email</TableHead>
            <TableHead className="text-[var(--text-primary)]">Name</TableHead>
            <TableHead className="text-[var(--text-primary)]">Status</TableHead>
            <TableHead className="text-[var(--text-primary)]">Role</TableHead>
            <TableHead className="text-[var(--text-primary)]">Plan</TableHead>
            <TableHead className="text-right text-[var(--text-primary)]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => {
            const planStatus = getPlanStatus(user);
            
            return (
              <TableRow 
                key={user.id}
                className="border-b border-[var(--cosmic-accent)] hover:bg-[var(--cosmic-light)]/10"
              >
                <TableCell className="font-medium text-[var(--text-primary)]">
                  {user.id}
                </TableCell>
                <TableCell className="text-[var(--text-primary)]">
                  {user.email}
                </TableCell>
                <TableCell className="text-[var(--text-primary)]">
                  {user.full_name || '-'}
                </TableCell>
                <TableCell>
                  {user.is_active ? (
                    <Badge variant="success" className="bg-green-500">Active</Badge>
                  ) : (
                    <Badge variant="destructive">Inactive</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {user.is_admin ? (
                    <Badge variant="premium" className="bg-[var(--cosmic-highlight)]">Admin</Badge>
                  ) : (
                    <Badge variant="outline">User</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {planStatus === 'active' && (
                    <div>
                      <Badge variant="success" className="bg-blue-500">Premium</Badge>
                      <div className="text-xs text-cosmic-highlight mt-1">
                        Until: {formatDate(user.plan_expires_at!)}
                      </div>
                    </div>
                  )}
                  {planStatus === 'expired' && (
                    <div>
                      <Badge variant="outline" className="border-yellow-500 text-yellow-500">Expired</Badge>
                      <div className="text-xs text-cosmic-highlight mt-1">
                        Expired: {formatDate(user.plan_expires_at!)}
                      </div>
                    </div>
                  )}
                  {planStatus === 'none' && (
                    <Badge variant="default">Free</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex space-x-2 justify-end">
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
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}