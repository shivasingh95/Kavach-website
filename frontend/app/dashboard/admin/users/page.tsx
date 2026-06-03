"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { DataTable, ColumnDef } from "@/components/admin/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Shield, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "MEMBER" | "PUBLIC";
  avatar?: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [usersRes, meRes] = await Promise.all([
        api.get('/users'),
        api.get('/auth/me').catch(() => ({ data: { data: { user: { id: null } } } }))
      ]);
      setUsers(usersRes.data?.data?.users || []);
      setCurrentUserId(meRes.data?.data?.user?.id || null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChangeRole = async (userId: string, newRole: string) => {
    try {
      await api.patch(`/users/${userId}/role`, { role: newRole });
      toast.success(`Role updated to ${newRole}`);
      // Optimistic update
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole as any } : u));
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update role");
    }
  };

  const columns: ColumnDef<User>[] = [
    {
      header: "User",
      accessorKey: "name",
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden border border-white/10">
            {row.avatar ? (
              <img src={row.avatar} alt={row.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs font-medium">{row.name.substring(0, 2).toUpperCase()}</span>
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-sm">{row.name}</span>
            <span className="text-xs text-muted-foreground">{row.email}</span>
          </div>
        </div>
      )
    },
    {
      header: "Role",
      accessorKey: "role",
      sortable: true,
      cell: (row) => (
        <Badge variant="outline" className={
          row.role === 'ADMIN' ? 'border-red-500/50 text-red-500' :
          row.role === 'MEMBER' ? 'border-kavach-cyan/50 text-kavach-cyan' :
          'border-muted-foreground/50 text-muted-foreground'
        }>
          {row.role === 'ADMIN' && <Shield size={10} className="mr-1" />}
          {row.role}
        </Badge>
      )
    },
    {
      header: "Joined",
      accessorKey: "createdAt",
      sortable: true,
      cell: (row) => new Date(row.createdAt).toLocaleDateString()
    },
    {
      header: "Actions",
      accessorKey: "id",
      cell: (row) => {
        const isSelf = currentUserId === row.id;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-background/95 backdrop-blur-md border-white/10">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(row.id)}>
                Copy User ID
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">Change Role</DropdownMenuLabel>
              <DropdownMenuItem 
                disabled={isSelf || row.role === 'PUBLIC'} 
                onClick={() => handleChangeRole(row.id, 'PUBLIC')}
              >
                Set to PUBLIC
              </DropdownMenuItem>
              <DropdownMenuItem 
                disabled={isSelf || row.role === 'MEMBER'} 
                onClick={() => handleChangeRole(row.id, 'MEMBER')}
              >
                Set to MEMBER
              </DropdownMenuItem>
              <DropdownMenuItem 
                disabled={isSelf || row.role === 'ADMIN'} 
                onClick={() => handleChangeRole(row.id, 'ADMIN')}
                className="text-red-500 focus:text-red-400 focus:bg-red-500/10"
              >
                Set to ADMIN
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      }
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
          <p className="text-sm text-muted-foreground">Manage user roles and permissions.</p>
        </div>
      </div>

      <div className="bg-background/50 border rounded-xl p-4 backdrop-blur-sm">
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-kavach-cyan"></div>
          </div>
        ) : (
          <DataTable 
            columns={columns} 
            data={users} 
            searchKey="name" 
            searchPlaceholder="Search users by name..." 
          />
        )}
      </div>
    </div>
  );
}
