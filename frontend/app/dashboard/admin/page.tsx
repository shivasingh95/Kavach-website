"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Users, Calendar, Flag, FileText } from "lucide-react";
import { DataTable, ColumnDef } from "@/components/admin/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface CTFSubmission {
  id: string;
  userId: string;
  challengeId: string;
  submittedFlag: string;
  status: string;
  submittedAt: string;
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState({
    users: 0,
    events: 0,
    submissions: 0,
    blogs: 0,
  });
  const [pendingSubmissions, setPendingSubmissions] = useState<CTFSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      const [usersRes, eventsRes, submissionsRes, blogsRes] = await Promise.all([
        api.get('/users').catch(() => ({ data: { data: { total: 0 } } })),
        api.get('/events').catch(() => ({ data: { data: { events: [] } } })),
        api.get('/ctf/submissions?status=PENDING').catch(() => ({ data: { data: { submissions: [] } } })),
        api.get('/blog').catch(() => ({ data: { data: { posts: [] } } })),
      ]);

      const submissions = submissionsRes.data?.data?.submissions || [];

      setStats({
        users: usersRes.data?.data?.total || usersRes.data?.data?.users?.length || 0,
        events: eventsRes.data?.data?.events?.length || 0,
        submissions: submissions.length,
        blogs: blogsRes.data?.data?.posts?.length || 0,
      });

      setPendingSubmissions(submissions);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleReviewSubmission = async (id: string, status: "APPROVED" | "REJECTED") => {
    try {
      await api.patch(`/ctf/submissions/${id}`, { status });
      toast.success(`Submission ${status.toLowerCase()}`);
      fetchData(); // Refresh data
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to ${status.toLowerCase()} submission`);
    }
  };

  const columns: ColumnDef<CTFSubmission>[] = [
    {
      header: "User ID",
      accessorKey: "userId",
      sortable: true,
      cell: (row) => <span className="font-mono text-xs">{row.userId.slice(0, 8)}...</span>
    },
    {
      header: "Challenge ID",
      accessorKey: "challengeId",
      sortable: true,
      cell: (row) => <span className="font-mono text-xs">{row.challengeId.slice(0, 8)}...</span>
    },
    {
      header: "Flag Submitted",
      accessorKey: "submittedFlag",
      cell: (row) => <code className="bg-muted px-1.5 py-0.5 rounded text-xs">{row.submittedFlag}</code>
    },
    {
      header: "Submitted At",
      accessorKey: "submittedAt",
      sortable: true,
      cell: (row) => new Date(row.submittedAt).toLocaleString()
    },
    {
      header: "Status",
      accessorKey: "status",
      sortable: true,
      cell: (row) => (
        <Badge variant={row.status === 'PENDING' ? 'outline' : 'default'} className="text-amber-500 border-amber-500/50">
          {row.status}
        </Badge>
      )
    },
    {
      header: "Actions",
      accessorKey: "id",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Button 
            size="sm" 
            variant="default"
            className="bg-green-500/10 text-green-500 hover:bg-green-500/20 hover:text-green-400"
            onClick={() => handleReviewSubmission(row.id, "APPROVED")}
          >
            Approve
          </Button>
          <Button 
            size="sm" 
            variant="destructive"
            className="bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-400"
            onClick={() => handleReviewSubmission(row.id, "REJECTED")}
          >
            Reject
          </Button>
        </div>
      )
    }
  ];

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-kavach-cyan"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-background/50 border rounded-xl p-6 flex flex-col justify-between backdrop-blur-sm shadow-glow relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-kavach-cyan/10 rounded-full blur-2xl"></div>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Total Users</p>
            <Users className="text-kavach-cyan" size={20} />
          </div>
          <p className="text-3xl font-bold mt-4">{stats.users}</p>
        </div>
        
        <div className="bg-background/50 border rounded-xl p-6 flex flex-col justify-between backdrop-blur-sm relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-kavach-violet/10 rounded-full blur-2xl"></div>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Active Events</p>
            <Calendar className="text-kavach-violet" size={20} />
          </div>
          <p className="text-3xl font-bold mt-4">{stats.events}</p>
        </div>

        <div className="bg-background/50 border rounded-xl p-6 flex flex-col justify-between backdrop-blur-sm relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl"></div>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Pending Submissions</p>
            <Flag className="text-amber-500" size={20} />
          </div>
          <p className="text-3xl font-bold mt-4">{stats.submissions}</p>
        </div>

        <div className="bg-background/50 border rounded-xl p-6 flex flex-col justify-between backdrop-blur-sm relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-500/10 rounded-full blur-2xl"></div>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Published Posts</p>
            <FileText className="text-green-500" size={20} />
          </div>
          <p className="text-3xl font-bold mt-4">{stats.blogs}</p>
        </div>
      </div>

      {/* Pending Submissions Table */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-bold tracking-tight">Recent Pending Submissions</h3>
          <p className="text-sm text-muted-foreground">Review and approve CTF challenge submissions manually.</p>
        </div>
        <DataTable 
          columns={columns} 
          data={pendingSubmissions} 
          searchKey="challengeId" 
          searchPlaceholder="Search by Challenge ID..." 
        />
      </div>
    </div>
  );
}
