"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAllUsers, updateUser, deleteUser } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Trash2, UserCog, Mail, Calendar } from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";
import { authClient } from "@/lib/auth/client";
import { Badge } from "@/components/ui/badge";

import { ADMIN_EMAILS } from "@/lib/admin";

export default function AdminUsersPage() {
  const router = useRouter();
  const { data: session, isPending: isAuthPending } = authClient.useSession();
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionPending, setIsActionPending] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthPending && session) {
      fetchUsers();
    }
  }, [session, isAuthPending]);

  const fetchUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      showError("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateRole = async (userId: string, role: string) => {
    setIsActionPending(userId);
    try {
      await updateUser(userId, { role });
      setUsers(users.map(u => u.id === userId ? { ...u, role } : u));
      showSuccess("User role updated");
    } catch (error) {
      showError("Failed to update role");
    } finally {
      setIsActionPending(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    
    setIsActionPending(userId);
    try {
      await deleteUser(userId);
      setUsers(users.filter(u => u.id !== userId));
      showSuccess("User deleted");
    } catch (error) {
      showError("Failed to delete user");
    } finally {
      setIsActionPending(null);
    }
  };

  if (isLoading || isAuthPending) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-xl font-serif font-semibold text-primary">Member Management</h2>
        <p className="text-sm text-muted-foreground">Manage access levels and view registered members.</p>
      </div>

      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[250px]">User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground italic">
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => {
                  const isProtectedAdmin = ADMIN_EMAILS.includes(user.email.toLowerCase());
                  return (
                    <TableRow key={user.id} className="group">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">
                            {user.name || "Unnamed User"}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {user.email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select 
                          defaultValue={user.role} 
                          onValueChange={(val) => handleUpdateRole(user.id, val)}
                          disabled={isActionPending === user.id || isProtectedAdmin}
                        >
                          <SelectTrigger className="w-32 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(user.createdAt).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={isActionPending === user.id || isProtectedAdmin}
                        >
                          {isActionPending === user.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}