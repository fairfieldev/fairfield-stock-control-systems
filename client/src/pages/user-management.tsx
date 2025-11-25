import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Pencil, Trash2, Shield, User as UserIcon, Eye, Truck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { User, InsertUser } from "@shared/schema";

const TAB_PERMISSIONS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "products", label: "Products" },
  { id: "locations", label: "Locations" },
  { id: "new-transfer", label: "New Transfer" },
  { id: "dispatch", label: "Dispatch" },
  { id: "receive", label: "Receive" },
  { id: "all-transfers", label: "All Transfers" },
  { id: "reports", label: "Reports" },
  { id: "users", label: "User Management" },
  { id: "integration", label: "Integration Settings" },
];

const ROLE_DEFAULTS: Record<string, string[]> = {
  admin: TAB_PERMISSIONS.map(p => p.id),
  dispatch: ["dashboard", "products", "locations", "dispatch", "all-transfers"],
  receiver: ["dashboard", "products", "locations", "receive", "all-transfers"],
  view_only: ["dashboard", "products", "locations", "all-transfers", "reports"],
};

export default function UserManagement() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<InsertUser>({
    email: "",
    name: "",
    role: "view_only",
    permissions: [],
    active: true,
  });
  const { toast } = useToast();

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertUser) => apiRequest("POST", "/api/users", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setIsAddOpen(false);
      resetForm();
      toast({ title: "User added successfully" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> }) =>
      apiRequest("PATCH", `/api/users/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setEditingUser(null);
      resetForm();
      toast({ title: "User updated successfully" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({ title: "User deleted successfully" });
    },
  });

  const resetForm = () => {
    setFormData({
      email: "",
      name: "",
      role: "view_only",
      permissions: [],
      active: true,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      updateMutation.mutate({ id: editingUser.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      name: user.name,
      role: user.role,
      permissions: user.permissions || [],
      active: user.active,
    });
    setIsAddOpen(true);
  };

  const handleRoleChange = (role: string) => {
    setFormData({
      ...formData,
      role,
      permissions: ROLE_DEFAULTS[role] || [],
    });
  };

  const togglePermission = (permissionId: string) => {
    const permissions = formData.permissions || [];
    if (permissions.includes(permissionId)) {
      setFormData({
        ...formData,
        permissions: permissions.filter(p => p !== permissionId),
      });
    } else {
      setFormData({
        ...formData,
        permissions: [...permissions, permissionId],
      });
    }
  };

  const getRoleIcon = (role: string) => {
    const icons = {
      admin: Shield,
      dispatch: Truck,
      receiver: UserIcon,
      view_only: Eye,
    };
    const Icon = icons[role as keyof typeof icons] || UserIcon;
    return <Icon className="h-3 w-3" />;
  };

  const getRoleBadge = (role: string) => {
    const styles = {
      admin: "bg-red-100 text-red-800",
      dispatch: "bg-blue-100 text-blue-800",
      receiver: "bg-green-100 text-green-800",
      view_only: "bg-gray-100 text-gray-800",
    };
    return styles[role as keyof typeof styles] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold" data-testid="heading-users">User Management</h1>
          <p className="text-muted-foreground mt-1">Manage system users and permissions</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} data-testid="button-add-user">
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Permission Levels</CardTitle>
          <CardDescription>Overview of role-based access control</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { role: "admin", name: "Admin", desc: "Full system access", perms: ["All features", "User management", "Settings"] },
              { role: "dispatch", name: "Dispatch", desc: "Dispatch transfers only", perms: ["View transfers", "Dispatch", "View products"] },
              { role: "receiver", name: "Receiver", desc: "Receive incoming stock", perms: ["View transfers", "Receive", "View products"] },
              { role: "view_only", name: "View Only", desc: "Read-only access", perms: ["View only", "No edits", "No actions"] },
            ].map((roleInfo) => (
              <div key={roleInfo.role} className="border rounded-md p-4 space-y-2">
                <Badge className={getRoleBadge(roleInfo.role)}>
                  {getRoleIcon(roleInfo.role)}
                  <span className="ml-1">{roleInfo.name}</span>
                </Badge>
                <p className="text-sm text-muted-foreground">{roleInfo.desc}</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {roleInfo.perms.map((perm, idx) => (
                    <li key={idx}>• {perm}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center text-muted-foreground py-8">Loading...</p>
          ) : users.length === 0 ? (
            <p className="text-center text-muted-foreground py-8" data-testid="text-no-users">
              No users yet. Add your first user!
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} data-testid={`user-${user.id}`}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell>
                      <Badge className={getRoleBadge(user.role)}>
                        {getRoleIcon(user.role)}
                        <span className="ml-1 capitalize">{user.role.replace("_", " ")}</span>
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {user.permissions?.length || 0} tabs
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.active ? "default" : "secondary"}>
                        {user.active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(user)}
                        data-testid={`button-edit-${user.id}`}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          if (confirm("Are you sure you want to delete this user?")) {
                            deleteMutation.mutate(user.id);
                          }
                        }}
                        data-testid={`button-delete-${user.id}`}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isAddOpen} onOpenChange={(open) => {
        setIsAddOpen(open);
        if (!open) {
          setEditingUser(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-user-form">
          <DialogHeader>
            <DialogTitle>{editingUser ? "Edit User" : "Add New User"}</DialogTitle>
            <DialogDescription>
              {editingUser ? "Update user information and permissions" : "Create a new user account with role-based permissions"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                    required
                    data-testid="input-user-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                    required
                    data-testid="input-user-email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={formData.role} onValueChange={handleRoleChange}>
                  <SelectTrigger data-testid="select-user-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin - Full Access</SelectItem>
                    <SelectItem value="dispatch">Dispatch - Dispatch Only</SelectItem>
                    <SelectItem value="receiver">Receiver - Receive Only</SelectItem>
                    <SelectItem value="view_only">View Only - Read Access</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Tab Permissions</Label>
                <p className="text-sm text-muted-foreground">
                  Select which tabs this user can access
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 border rounded-md p-4">
                  {TAB_PERMISSIONS.map((perm) => (
                    <div key={perm.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`perm-${perm.id}`}
                        checked={formData.permissions?.includes(perm.id)}
                        onCheckedChange={() => togglePermission(perm.id)}
                        data-testid={`checkbox-permission-${perm.id}`}
                      />
                      <Label
                        htmlFor={`perm-${perm.id}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {perm.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData({ ...formData, active: !!checked })}
                  data-testid="checkbox-user-active"
                />
                <Label htmlFor="active" className="cursor-pointer">
                  Active user (can login)
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-submit-user">
                {(createMutation.isPending || updateMutation.isPending) ? "Saving..." : (editingUser ? "Update User" : "Add User")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
