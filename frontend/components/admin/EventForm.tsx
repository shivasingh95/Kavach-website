"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import dynamic from "next/dynamic";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Calendar,
  Link2,
  MapPin,
  Image as ImageIcon,
  Globe,
  Loader2,
  Sparkles,
  Upload,
  Eye,
  EyeOff,
  Hash,
} from "lucide-react";

// MDEditor dynamic import disabled for debugging freeze
// const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

// ─── Types ───────────────────────────────────────────────────────────────────

export interface EventData {
  id: string;
  title: string;
  slug?: string;
  description: string;
  content: string;
  date: string;
  endDate?: string;
  location?: string;
  isOnline: boolean;
  meetLink?: string;
  imageUrl?: string;
  isPublished: boolean;
  rsvpCount?: number;
}

// ─── Zod Schema ──────────────────────────────────────────────────────────────

export const eventSchema = z
  .object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters")
      .max(200, "Description must not exceed 200 characters"),
    content: z.string().min(20, "Content must be at least 20 characters"),
    date: z.string().min(1, "Start date & time is required"),
    endDate: z.string().optional(),
    isOnline: z.boolean().default(false),
    location: z.string().optional(),
    meetLink: z.string().optional(),
    imageUrl: z.string().optional(),
    isPublished: z.boolean().default(false),
  })
  .superRefine((data, ctx) => {
    if (data.isOnline) {
      if (data.meetLink && data.meetLink.trim() !== "") {
        try {
          new URL(data.meetLink);
        } catch {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["meetLink"],
            message: "Meeting link must be a valid URL",
          });
        }
      }
    }
    if (data.imageUrl && data.imageUrl.trim() !== "") {
      try {
        new URL(data.imageUrl);
      } catch {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["imageUrl"],
          message: "Image URL must be a valid URL",
        });
      }
    }
    if (
      data.endDate &&
      data.endDate.trim() !== "" &&
      data.date &&
      data.endDate < data.date
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endDate"],
        message: "End date must be after start date",
      });
    }
  });

export type EventFormValues = z.infer<typeof eventSchema>;

// ─── Slug generator ──────────────────────────────────────────────────────────

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);
}

// ─── Field wrapper ───────────────────────────────────────────────────────────

function Field({
  label,
  icon: Icon,
  error,
  required,
  hint,
  children,
}: {
  label: string;
  icon?: React.ElementType;
  error?: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
        {Icon && <Icon size={12} className="opacity-70" />}
        {label}
        {required && <span className="text-red-400">*</span>}
      </label>
      {hint && <p className="text-[11px] text-[var(--text-secondary)] opacity-70">{hint}</p>}
      {children}
      {error && (
        <p className="text-[11px] text-red-400 flex items-center gap-1">
          <span className="w-1 h-1 rounded-full bg-red-400 inline-block" />
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Input style shared ───────────────────────────────────────────────────────

const inputCls =
  "w-full rounded-xl border border-white/10 bg-[#080d1a] px-3 py-2 text-sm text-[var(--text-primary)] " +
  "placeholder:text-[var(--text-muted)] focus:outline-none focus:border-kavach-cyan/40 focus:ring-1 " +
  "focus:ring-kavach-cyan/20 transition-colors";

// ─── EventForm Props ──────────────────────────────────────────────────────────

interface EventFormProps {
  /** Pre-filled event when editing; undefined = create mode */
  event?: EventData | null;
  onSuccess: () => void;
  onCancel: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function EventForm({ event, onSuccess, onCancel }: EventFormProps) {
  const isEditing = !!event;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string>(
    event?.imageUrl ?? ""
  );
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: event?.title ?? "",
      description: event?.description ?? "",
      content: event?.content ?? "",
      date: event?.date
        ? new Date(event.date).toISOString().slice(0, 16)
        : new Date().toISOString().slice(0, 16),
      endDate: event?.endDate
        ? new Date(event.endDate).toISOString().slice(0, 16)
        : "",
      isOnline: event?.isOnline ?? false,
      location: event?.location ?? "",
      meetLink: event?.meetLink ?? "",
      imageUrl: event?.imageUrl ?? "",
      isPublished: event?.isPublished ?? false,
    },
  });

  // Watched fields
  const titleValue = watch("title");
  const isOnline = watch("isOnline");
  const isPublished = watch("isPublished");
  const descriptionValue = watch("description");
  const imageUrlValue = watch("imageUrl");

  // Sync image preview when URL field changes
  useEffect(() => {
    setPreviewImageUrl(imageUrlValue ?? "");
  }, [imageUrlValue]);

  // ── Slug preview ──
  const slugPreview = toSlug(titleValue ?? "");

  // ── Image Upload via POST /api/v1/upload/image ──
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB) and type
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5MB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("File must be an image");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await api.post("/upload/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const uploadedUrl: string =
        res.data?.data?.url ?? res.data?.url ?? res.data?.imageUrl ?? "";

      if (!uploadedUrl) throw new Error("No URL returned from upload");

      setValue("imageUrl", uploadedUrl, { shouldValidate: true });
      setPreviewImageUrl(uploadedUrl);
      toast.success("Image uploaded successfully");
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ?? "Image upload failed. Check your connection."
      );
    } finally {
      setIsUploading(false);
      // Reset file input so same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // ── Form Submit ──
  const onSubmit = async (data: EventFormValues) => {
    setIsSubmitting(true);
    try {
      // Clean up conditional fields
      const payload: Partial<EventFormValues> & { slug?: string } = {
        ...data,
        date: data.date ? new Date(data.date).toISOString() : undefined,
        slug: slugPreview || undefined,
        endDate: data.endDate?.trim() ? new Date(data.endDate).toISOString() : undefined,
        location: data.isOnline ? undefined : data.location?.trim() || undefined,
        meetLink: data.isOnline ? data.meetLink?.trim() || undefined : undefined,
      };

      if (isEditing && event) {
        await api.patch(`/events/${event.id}`, payload);
        toast.success("Event updated successfully ✓");
      } else {
        await api.post("/events", payload);
        toast.success("Event created successfully ✓");
      }
      onSuccess();
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ??
          `Failed to ${isEditing ? "update" : "create"} event`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-5 px-1"
      noValidate
    >
      {/* ── Title + Slug Preview ──────────────────────────────────────────── */}
      <Field
        label="Title"
        icon={Sparkles}
        required
        error={errors.title?.message}
      >
        <input
          {...register("title")}
          id="event-title"
          placeholder="e.g. Intro to Web Exploitation"
          className={inputCls}
          autoComplete="off"
        />
        {slugPreview && (
          <div className="flex items-center gap-1.5 mt-1 pl-1">
            <Hash size={10} className="text-[var(--text-muted)] flex-shrink-0" />
            <span className="text-[11px] text-[var(--text-muted)] font-mono truncate">
              /events/
              <span className="text-kavach-cyan/70">{slugPreview}</span>
            </span>
          </div>
        )}
      </Field>

      {/* ── Description ──────────────────────────────────────────────────── */}
      <Field
        label="Short Description"
        required
        error={errors.description?.message}
        hint="Max 200 characters — shown in event cards"
      >
        <textarea
          {...register("description")}
          id="event-description"
          rows={3}
          placeholder="A brief summary shown in event listings..."
          className={`${inputCls} resize-none leading-relaxed`}
          maxLength={200}
        />
        <p className="text-[10px] text-right text-[var(--text-muted)] pr-1">
          {(descriptionValue ?? "").length}/200
        </p>
      </Field>

      {/* ── Content (MD Editor) ──────────────────────────────────────────── */}
      <Field
        label="Full Content"
        required
        error={errors.content?.message}
        hint="Supports GitHub-flavored Markdown with split preview"
      >
        <div
          data-color-mode="dark"
          className="rounded-xl overflow-hidden border border-white/10 
            [&_.w-md-editor]:bg-[#080d1a] [&_.w-md-editor-toolbar]:bg-[#0d1224] 
            [&_.w-md-editor-toolbar]:border-b [&_.w-md-editor-toolbar]:border-white/10
            [&_.w-md-editor-preview]:bg-[#080d1a] [&_.w-md-editor-content]:min-h-[160px]"
        >
          <Controller
            name="content"
            control={control}
            render={({ field }) => (
              <textarea
                {...field}
                className="w-full min-h-[220px] bg-[#080d1a] text-sm text-[var(--text-primary)] p-3 focus:outline-none resize-y"
                placeholder="Write your markdown content here..."
              />
            )}
          />
        </div>
      </Field>

      {/* ── Date & Time Row ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        <Field
          label="Start Date & Time"
          icon={Calendar}
          required
          error={errors.date?.message}
        >
          <input
            {...register("date")}
            id="event-date"
            type="datetime-local"
            className={inputCls}
          />
        </Field>
        <Field
          label="End Date & Time"
          icon={Calendar}
          error={errors.endDate?.message}
          hint="Optional"
        >
          <input
            {...register("endDate")}
            id="event-end-date"
            type="datetime-local"
            className={inputCls}
          />
        </Field>
      </div>

      {/* ── Online Toggle ─────────────────────────────────────────────────── */}
      <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-[#080d1a] p-4">
        <Checkbox
          id="isOnline"
          checked={isOnline}
          onCheckedChange={(checked) => setValue("isOnline", !!checked)}
          className="mt-0.5 border-white/20 data-[state=checked]:border-kavach-cyan data-[state=checked]:bg-kavach-cyan"
        />
        <div className="flex-1">
          <label
            htmlFor="isOnline"
            className="text-sm font-semibold text-[var(--text-primary)] cursor-pointer flex items-center gap-2"
          >
            <Globe size={14} className="text-kavach-cyan" />
            Online Event
          </label>
          <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
            Toggle to switch between a virtual or in-person event
          </p>
        </div>
      </div>

      {/* ── Conditional: Meet Link or Location ───────────────────────────── */}
      {isOnline ? (
        <Field
          label="Meeting Link"
          icon={Link2}
          error={errors.meetLink?.message}
          hint="Google Meet, Zoom, Teams, etc."
        >
          <input
            {...register("meetLink")}
            id="event-meet-link"
            type="url"
            placeholder="https://meet.google.com/abc-defg-hij"
            className={inputCls}
          />
        </Field>
      ) : (
        <Field
          label="Venue / Location"
          icon={MapPin}
          error={errors.location?.message}
          hint="Room number, building, or address"
        >
          <input
            {...register("location")}
            id="event-location"
            placeholder="e.g. Room 402, Block B, Campus"
            className={inputCls}
          />
        </Field>
      )}

      {/* ── Cover Image ──────────────────────────────────────────────────── */}
      <Field
        label="Cover Image"
        icon={ImageIcon}
        error={errors.imageUrl?.message}
      >
        {/* Upload button */}
        <div className="flex gap-2">
          <input
            {...register("imageUrl")}
            id="event-image-url"
            type="url"
            placeholder="https://example.com/banner.jpg"
            className={`${inputCls} flex-1`}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            title="Upload image"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="flex-shrink-0 border-white/10 bg-[#080d1a] hover:bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] size-9"
          >
            {isUploading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Upload size={15} />
            )}
          </Button>
        </div>

        {/* Hidden native file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />

        {/* Image preview */}
        {previewImageUrl && (
          <div className="mt-2 relative group rounded-xl overflow-hidden border border-white/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewImageUrl}
              alt="Cover preview"
              className="w-full h-32 object-cover"
              onError={() => setPreviewImageUrl("")}
            />
            <button
              type="button"
              onClick={() => setImagePreviewOpen((v) => !v)}
              className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white/70 hover:text-white transition-colors"
              title={imagePreviewOpen ? "Hide preview" : "Full preview"}
            >
              {imagePreviewOpen ? <EyeOff size={13} /> : <Eye size={13} />}
            </button>
          </div>
        )}
      </Field>

      {/* ── Publish Toggle ────────────────────────────────────────────────── */}
      <div
        className={`flex items-start gap-3 rounded-xl border p-4 transition-colors ${
          isPublished
            ? "border-kavach-green/30 bg-kavach-green/5"
            : "border-white/10 bg-[#080d1a]"
        }`}
      >
        <Checkbox
          id="isPublished"
          checked={isPublished}
          onCheckedChange={(checked) => setValue("isPublished", !!checked)}
          className="mt-0.5 border-white/20 data-[state=checked]:border-kavach-green data-[state=checked]:bg-kavach-green"
        />
        <div>
          <label
            htmlFor="isPublished"
            className="text-sm font-semibold text-[var(--text-primary)] cursor-pointer"
          >
            {isPublished ? "✓ Publish immediately" : "Save as draft"}
          </label>
          <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
            {isPublished
              ? "Event will be visible to all users right away."
              : "Only admins can see draft events."}
          </p>
        </div>
      </div>

      {/* ── Actions ──────────────────────────────────────────────────────── */}
      <div className="flex gap-3 pt-1 pb-2">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 border border-white/10 hover:bg-white/5 text-[var(--text-secondary)]"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || isUploading}
          className="flex-1 bg-kavach-cyan text-black font-bold hover:bg-kavach-cyan/90 
            disabled:opacity-50 transition-all gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              {isEditing ? "Saving..." : "Creating..."}
            </>
          ) : (
            <>{isEditing ? "Save Changes" : "Create Event"}</>
          )}
        </Button>
      </div>
    </form>
  );
}
