"use client";

import { useState, useEffect } from "react";
import { getAllUsers, setUserAccess, deleteUser } from "@/app/actions";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card, CardContent } from "@/components/ui/card";
import {
  Loader2,
  Trash2,
  Mail,
  Calendar,
  Lock,
  ShieldCheck,
  Users,
} from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";
import { authClient } from "@/lib/auth/client";
import { Badge } from "@/components/ui/badge";

import { ADMIN_EMAILS } from "@/lib/admin";

export default function AdminUsersPage() {
  const { data: session, isPending: isAuthPending } = authClient.useSession();
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionPending, setIsActionPending] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);

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

  const handleSetAccess = async (userId: string, isPaid: boolean) => {
    setIsActionPending(userId);
    try {
      await setUserAccess(userId, isPaid);
      setUsers(users.map((u) => (u.id === userId ? { ...u, isPaid } : u)));
      showSuccess(isPaid ? "Course access granted" : "Course access removed");
    } catch (error) {
      showError("Failed to update access");
    } finally {
      setIsActionPending(null);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    setIsActionPending(deleteTarget.id);
    try {
      await deleteUser(deleteTarget.id);
      setUsers(users.filter((u) => u.id !== deleteTarget.id));
      showSuccess("User deleted");
      setDeleteTarget(null);
    } catch (error) {
      showError("Failed to delete user");
    } finally {
      setIsActionPending(null);
    }
  };

  if (isLoading || isAuthPending) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-xl font-serif font-semibold text-primary">Member Management</h2>
        <p className="text-sm text-muted-foreground">See who has access. Flip the switch to give someone the course free (or remove it). Admin rights are set in code, not here.</p>
      </div>

      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[250px]">User</TableHead>
                <TableHead>Course access</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12">
                    <div className="flex flex-col items-center text-muted-foreground">
                      <Users className="w-8 h-8 mb-2 opacity-30" />
                      <p className="text-sm">No members yet.</p>
                      <p className="text-xs mt-1 opacity-70">New learners appear here as they sign in.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => {
                  const isProtectedAdmin = ADMIN_EMAILS.includes(user.email.toLowerCase());
                  const isPending = isActionPending === user.id;
                  return (
                    <TableRow key={user.id} className="group">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground flex items-center gap-1.5">
                            {user.name || "Unnamed User"}
                            {isProtectedAdmin && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="inline-flex items-center gap-1">
                                    <Badge variant="secondary" className="h-5 px-1.5 gap-1 text-[10px] font-medium shrink-0">
                                      <ShieldCheck className="w-3 h-3" /> Owner
                                    </Badge>
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>Protected account — cannot change role or be deleted.</TooltipContent>
                              </Tooltip>
                            )}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {user.email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {isProtectedAdmin ? (
                          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Lock className="w-3 h-3" /> Owner (full access)
                          </span>
                        ) : (
                          <label className="inline-flex items-center gap-2 text-xs">
                            <Switch
                              checked={!!user.isPaid}
                              onCheckedChange={(val) => handleSetAccess(user.id, val)}
                              disabled={isPending}
                              aria-label={`Course access for ${user.email}`}
                            />
                            {user.isPaid ? (
                              <span className="font-medium text-primary">{user.stripePaymentId ? "Paid" : "Granted"}</span>
                            ) : (
                              <span className="text-muted-foreground">No access</span>
                            )}
                          </label>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(user.createdAt).toLocaleDateString("en-AU")}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {isProtectedAdmin ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="inline-flex">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-muted-foreground/40 cursor-not-allowed"
                                  disabled
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>Protected admin cannot be deleted.</TooltipContent>
                          </Tooltip>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => setDeleteTarget(user)}
                            disabled={isPending}
                            aria-label={`Delete ${user.name || user.email}`}
                          >
                            {isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete member?</DialogTitle>
            <DialogDescription>
              This permanently removes {deleteTarget?.name || "this member"}&nbsp;(
              {deleteTarget?.email}) and their access to the course. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={isActionPending === deleteTarget?.id}
            >
              {isActionPending === deleteTarget?.id ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 mr-1" />
              )}
              Delete member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}