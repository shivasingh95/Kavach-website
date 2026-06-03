"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { DataTable, ColumnDef } from "@/components/admin/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, ShieldAlert } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

interface CTFChallenge {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  points: number;
  isActive: boolean;
  solveCount: number;
}

interface CTFSubmission {
  id: string;
  userId: string;
  challengeId: string;
  submittedFlag: string;
  status: string;
  submittedAt: string;
  proofUrl?: string;
}

const challengeSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  difficulty: z.string().min(1, "Difficulty is required"),
  points: z.number().min(0),
  flag: z.string().optional(), // optional when editing
  hintsText: z.string().optional(),
  isActive: z.boolean().default(true),
});

type ChallengeFormValues = z.infer<typeof challengeSchema>;

export default function AdminCTFPage() {
  const [challenges, setChallenges] = useState<CTFChallenge[]>([]);
  const [submissions, setSubmissions] = useState<CTFSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<CTFChallenge | null>(null);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<ChallengeFormValues>({
    resolver: zodResolver(challengeSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "WEB",
      difficulty: "EASY",
      points: 100,
      flag: "",
      hintsText: "",
      isActive: true,
    }
  });

  const isActive = watch("isActive");

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [chalRes, subRes] = await Promise.all([
        api.get('/ctf/challenges'),
        api.get('/ctf/submissions?status=PENDING')
      ]);
      setChallenges(chalRes.data?.data?.challenges || []);
      setSubmissions(subRes.data?.data?.submissions || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load CTF data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openNewForm = () => {
    setEditingChallenge(null);
    reset({
      title: "",
      description: "",
      category: "WEB",
      difficulty: "EASY",
      points: 100,
      flag: "",
      hintsText: "",
      isActive: true,
    });
    setIsSheetOpen(true);
  };

  const openEditForm = async (challenge: CTFChallenge) => {
    setEditingChallenge(challenge);
    // Fetch full challenge details (including description/hints if omitted from list)
    try {
      const res = await api.get(`/ctf/challenges/${challenge.id}`);
      const full = res.data.data.challenge;
      reset({
        title: full.title,
        description: full.description,
        category: full.category,
        difficulty: full.difficulty,
        points: full.points,
        flag: "", // Don't prefill flag for security, leave blank unless changing
        hintsText: full.hints?.map((h: any) => typeof h === 'string' ? h : h.text).join('\n') || "",
        isActive: full.isActive,
      });
      setIsSheetOpen(true);
    } catch (e) {
      toast.error("Failed to fetch challenge details");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this challenge?")) return;
    try {
      await api.delete(`/ctf/challenges/${id}`);
      toast.success("Challenge deleted");
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete challenge");
    }
  };

  const onSubmit = async (data: ChallengeFormValues) => {
    try {
      const payload = {
        ...data,
        hints: data.hintsText ? data.hintsText.split('\n').filter(Boolean) : []
      };

      if (editingChallenge) {
        if (!payload.flag) delete payload.flag; // Don't update flag if empty
        await api.put(`/ctf/challenges/${editingChallenge.id}`, payload);
        toast.success("Challenge updated");
      } else {
        if (!payload.flag) {
          toast.error("Flag is required for new challenges");
          return;
        }
        await api.post('/ctf/challenges', payload);
        toast.success("Challenge created");
      }
      setIsSheetOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save challenge");
    }
  };

  const handleReviewSubmission = async (id: string, status: "APPROVED" | "REJECTED") => {
    const note = prompt(`Enter optional review note for ${status}:`);
    if (note === null) return; // cancelled

    try {
      await api.patch(`/ctf/submissions/${id}`, { status, reviewNote: note });
      toast.success(`Submission ${status.toLowerCase()}`);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to ${status.toLowerCase()} submission`);
    }
  };

  const chalColumns: ColumnDef<CTFChallenge>[] = [
    { header: "Title", accessorKey: "title", sortable: true, cell: row => <span className="font-semibold">{row.title}</span> },
    { header: "Category", accessorKey: "category", sortable: true },
    { header: "Difficulty", accessorKey: "difficulty", sortable: true, cell: row => (
        <Badge variant="outline" className={
          row.difficulty === 'EASY' ? 'text-green-500 border-green-500/50' : 
          row.difficulty === 'MEDIUM' ? 'text-amber-500 border-amber-500/50' : 
          'text-red-500 border-red-500/50'
        }>{row.difficulty}</Badge>
    )},
    { header: "Points", accessorKey: "points", sortable: true },
    { header: "Solves", accessorKey: "solveCount", sortable: true },
    { header: "Status", accessorKey: "isActive", cell: row => (
      <Badge variant={row.isActive ? "default" : "outline"} className={row.isActive ? "bg-green-500/10 text-green-500" : ""}>
        {row.isActive ? "Active" : "Inactive"}
      </Badge>
    )},
    { header: "Actions", accessorKey: "id", cell: row => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => openEditForm(row)}><Edit2 size={16} /></Button>
          <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-400 hover:bg-red-500/10" onClick={() => handleDelete(row.id)}><Trash2 size={16} /></Button>
        </div>
    )}
  ];

  const subColumns: ColumnDef<CTFSubmission>[] = [
    { header: "Challenge ID", accessorKey: "challengeId", cell: row => <span className="font-mono text-xs">{row.challengeId.slice(0, 8)}...</span> },
    { header: "User ID", accessorKey: "userId", cell: row => <span className="font-mono text-xs">{row.userId.slice(0, 8)}...</span> },
    { header: "Flag", accessorKey: "submittedFlag", cell: row => <code className="bg-muted px-1.5 py-0.5 rounded text-xs">{row.submittedFlag}</code> },
    { header: "Proof", accessorKey: "proofUrl", cell: row => row.proofUrl ? (
      <a href={row.proofUrl} target="_blank" rel="noreferrer" className="text-kavach-cyan hover:underline text-xs">View Proof</a>
    ) : <span className="text-xs text-muted-foreground">None</span> },
    { header: "Time", accessorKey: "submittedAt", sortable: true, cell: row => new Date(row.submittedAt).toLocaleString() },
    { header: "Actions", accessorKey: "id", cell: row => (
        <div className="flex items-center gap-2">
          <Button size="sm" className="bg-green-500/10 text-green-500 hover:bg-green-500/20" onClick={() => handleReviewSubmission(row.id, "APPROVED")}>Approve</Button>
          <Button size="sm" variant="destructive" className="bg-red-500/10 text-red-500 hover:bg-red-500/20" onClick={() => handleReviewSubmission(row.id, "REJECTED")}>Reject</Button>
        </div>
    )}
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">CTF Management</h2>
          <p className="text-sm text-muted-foreground">Manage challenges and review manual submissions.</p>
        </div>
        
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button onClick={openNewForm} className="bg-kavach-cyan text-black hover:bg-kavach-cyan/90">
              <Plus className="mr-2" size={16} /> New Challenge
            </Button>
          </SheetTrigger>
          <SheetContent className="overflow-y-auto sm:max-w-[500px]">
            <SheetHeader>
              <SheetTitle>{editingChallenge ? "Edit Challenge" : "Create New Challenge"}</SheetTitle>
              <SheetDescription>Configure challenge details and flag.</SheetDescription>
            </SheetHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input {...register("title")} placeholder="SQL Injection 101" className="bg-background/50" />
                {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <textarea 
                  {...register("description")} 
                  placeholder="Markdown supported" 
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <select {...register("category")} className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                    <option value="WEB">Web</option>
                    <option value="CRYPTO">Cryptography</option>
                    <option value="FORENSICS">Forensics</option>
                    <option value="PWNING">Pwning</option>
                    <option value="REVERSE_ENGINEERING">Reverse Engineering</option>
                    <option value="OSINT">OSINT</option>
                    <option value="MISC">Misc</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Difficulty</label>
                  <select {...register("difficulty")} className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                    <option value="EXPERT">Expert</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Points</label>
                <Input type="number" {...register("points", { valueAsNumber: true })} className="bg-background/50" />
                {errors.points && <p className="text-xs text-red-500">{errors.points.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  Flag <ShieldAlert size={14} className="text-amber-500"/>
                </label>
                <Input {...register("flag")} placeholder={editingChallenge ? "(Leave blank to keep existing)" : "kavach{fl4g_h3r3}"} className="bg-background/50 font-mono" />
                {errors.flag && <p className="text-xs text-red-500">{errors.flag.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Hints (One per line)</label>
                <textarea 
                  {...register("hintsText")} 
                  placeholder="Hint 1&#10;Hint 2" 
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2 pb-4">
                <Checkbox id="isActive" checked={isActive} onCheckedChange={(c) => setValue("isActive", !!c)} />
                <label htmlFor="isActive" className="text-sm font-medium cursor-pointer">Challenge is Active</label>
              </div>

              <Button type="submit" className="w-full bg-kavach-cyan text-black hover:bg-kavach-cyan/90">
                {editingChallenge ? "Save Changes" : "Create Challenge"}
              </Button>
            </form>
          </SheetContent>
        </Sheet>
      </div>

      <Tabs defaultValue="challenges" className="w-full">
        <TabsList className="bg-background/50 border mb-4">
          <TabsTrigger value="challenges" className="data-[state=active]:bg-white/10">Challenges</TabsTrigger>
          <TabsTrigger value="submissions" className="data-[state=active]:bg-white/10">Pending Submissions <Badge variant="secondary" className="ml-2 bg-kavach-cyan/20 text-kavach-cyan border-none">{submissions.length}</Badge></TabsTrigger>
        </TabsList>
        
        <TabsContent value="challenges" className="bg-background/50 border rounded-xl p-4 backdrop-blur-sm">
          {isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-kavach-cyan"></div>
            </div>
          ) : (
            <DataTable columns={chalColumns} data={challenges} searchKey="title" searchPlaceholder="Search challenges..." />
          )}
        </TabsContent>
        
        <TabsContent value="submissions" className="bg-background/50 border rounded-xl p-4 backdrop-blur-sm">
           {isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-kavach-cyan"></div>
            </div>
          ) : (
            <DataTable columns={subColumns} data={submissions} searchKey="challengeId" searchPlaceholder="Search by Challenge ID..." />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
