"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { DataTable, ColumnDef } from "@/components/admin/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Edit2, Trash2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

interface Event {
  id: string;
  title: string;
  description: string;
  content: string;
  date: string;
  location?: string;
  isOnline?: boolean;
  meetLink?: string;
  imageUrl?: string;
  isPublished: boolean;
  rsvpCount: number;
}

const eventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  content: z.string().min(1, "Content is required"),
  date: z.string().min(1, "Date is required"),
  location: z.string().optional(),
  isOnline: z.boolean().optional(),
  meetLink: z.string().url().optional().or(z.literal("")),
  imageUrl: z.string().url().optional().or(z.literal("")),
  isPublished: z.boolean().default(false),
});

type EventFormValues = z.infer<typeof eventSchema>;

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      description: "",
      content: "",
      date: new Date().toISOString().slice(0, 16),
      location: "",
      isOnline: false,
      meetLink: "",
      imageUrl: "",
      isPublished: false,
    }
  });

  const isOnline = watch("isOnline");
  const isPublished = watch("isPublished");

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/events');
      setEvents(res.data?.data?.events || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load events");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const openNewForm = () => {
    setEditingEvent(null);
    reset({
      title: "",
      description: "",
      content: "",
      date: new Date().toISOString().slice(0, 16),
      location: "",
      isOnline: false,
      meetLink: "",
      imageUrl: "",
      isPublished: false,
    });
    setIsSheetOpen(true);
  };

  const openEditForm = (event: Event) => {
    setEditingEvent(event);
    reset({
      title: event.title,
      description: event.description,
      content: event.content,
      date: new Date(event.date).toISOString().slice(0, 16),
      location: event.location || "",
      isOnline: event.isOnline || false,
      meetLink: event.meetLink || "",
      imageUrl: event.imageUrl || "",
      isPublished: event.isPublished,
    });
    setIsSheetOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    try {
      await api.delete(`/events/${id}`);
      toast.success("Event deleted");
      fetchEvents();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete event");
    }
  };

  const onSubmit = async (data: EventFormValues) => {
    try {
      if (editingEvent) {
        await api.put(`/events/${editingEvent.id}`, data);
        toast.success("Event updated");
      } else {
        await api.post('/events', data);
        toast.success("Event created");
      }
      setIsSheetOpen(false);
      fetchEvents();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save event");
    }
  };

  const columns: ColumnDef<Event>[] = [
    {
      header: "Title",
      accessorKey: "title",
      sortable: true,
      cell: (row) => <span className="font-semibold">{row.title}</span>
    },
    {
      header: "Date",
      accessorKey: "date",
      sortable: true,
      cell: (row) => new Date(row.date).toLocaleString()
    },
    {
      header: "RSVPs",
      accessorKey: "rsvpCount",
      sortable: true,
    },
    {
      header: "Status",
      accessorKey: "isPublished",
      sortable: true,
      cell: (row) => (
        <Badge variant={row.isPublished ? 'default' : 'outline'} className={row.isPublished ? "bg-green-500/10 text-green-500" : "text-muted-foreground"}>
          {row.isPublished ? "Published" : "Draft"}
        </Badge>
      )
    },
    {
      header: "Actions",
      accessorKey: "id",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => openEditForm(row)}>
            <Edit2 size={16} />
          </Button>
          <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-400 hover:bg-red-500/10" onClick={() => handleDelete(row.id)}>
            <Trash2 size={16} />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Events Management</h2>
          <p className="text-sm text-muted-foreground">Create, edit, and manage upcoming club events.</p>
        </div>
        
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button onClick={openNewForm} className="bg-kavach-cyan text-black hover:bg-kavach-cyan/90">
              <Plus className="mr-2" size={16} /> New Event
            </Button>
          </SheetTrigger>
          <SheetContent className="overflow-y-auto sm:max-w-[500px]">
            <SheetHeader>
              <SheetTitle>{editingEvent ? "Edit Event" : "Create New Event"}</SheetTitle>
              <SheetDescription>
                Fill out the details for the event below.
              </SheetDescription>
            </SheetHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input {...register("title")} placeholder="Intro to Web Exploitation" className="bg-background/50" />
                {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Input {...register("description")} placeholder="Short summary" className="bg-background/50" />
                {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Content</label>
                <textarea 
                  {...register("content")} 
                  placeholder="Full detailed event content (Markdown supported)" 
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
                {errors.content && <p className="text-xs text-red-500">{errors.content.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Date & Time</label>
                <Input type="datetime-local" {...register("date")} className="bg-background/50 block" />
                {errors.date && <p className="text-xs text-red-500">{errors.date.message}</p>}
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Checkbox 
                  id="isOnline" 
                  checked={isOnline} 
                  onCheckedChange={(c) => setValue("isOnline", !!c)} 
                />
                <label htmlFor="isOnline" className="text-sm font-medium cursor-pointer">Online Event</label>
              </div>

              {isOnline ? (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Meeting Link</label>
                  <Input {...register("meetLink")} placeholder="https://meet.google.com/..." className="bg-background/50" />
                  {errors.meetLink && <p className="text-xs text-red-500">{errors.meetLink.message}</p>}
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Location</label>
                  <Input {...register("location")} placeholder="Room 402, Block B" className="bg-background/50" />
                  {errors.location && <p className="text-xs text-red-500">{errors.location.message}</p>}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Cover Image URL</label>
                <Input {...register("imageUrl")} placeholder="https://example.com/image.png" className="bg-background/50" />
                {errors.imageUrl && <p className="text-xs text-red-500">{errors.imageUrl.message}</p>}
              </div>

              <div className="flex items-center space-x-2 pt-2 pb-4">
                <Checkbox 
                  id="isPublished" 
                  checked={isPublished} 
                  onCheckedChange={(c) => setValue("isPublished", !!c)} 
                />
                <label htmlFor="isPublished" className="text-sm font-medium cursor-pointer">Publish Immediately</label>
              </div>

              <Button type="submit" className="w-full bg-kavach-violet hover:bg-kavach-violet/90">
                {editingEvent ? "Save Changes" : "Create Event"}
              </Button>
            </form>
          </SheetContent>
        </Sheet>
      </div>

      <div className="bg-background/50 border rounded-xl p-4 backdrop-blur-sm">
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-kavach-cyan"></div>
          </div>
        ) : (
          <DataTable 
            columns={columns} 
            data={events} 
            searchKey="title" 
            searchPlaceholder="Search events..." 
          />
        )}
      </div>
    </div>
  );
}
