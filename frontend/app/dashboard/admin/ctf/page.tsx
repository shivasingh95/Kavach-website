"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import dynamic from "next/dynamic";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  ShieldAlert,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Flag,
  Upload,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Trophy,
  Medal,
  Star,
  ToggleLeft,
  ToggleRight,
  FileText,
  Search,
  Paperclip,
  X,
  Info,
} from "lucide-react";

// ─── Lazy-load MD Editor (avoids SSR issues) ─────────────────────────────────
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

type Category =
  | "WEB"
  | "CRYPTO"
  | "FORENSICS"
  | "PWNING"
  | "REVERSE_ENGINEERING"
  | "OSINT"
  | "MISC";

type Difficulty = "EASY" | "MEDIUM" | "HARD" | "EXPERT";

type SubmissionStatus = "PENDING" | "APPROVED" | "REJECTED";

interface CTFChallenge {
  id: string;
  title: string;
  description?: string;
  category: Category;
  difficulty: Difficulty;
  points: number;
  isActive: boolean;
  solveCount: number;
  attachmentUrl?: string;
  hints?: string[];
}

interface SubmissionUser {
  id: string;
  name: string;
  email: string;
}

interface SubmissionChallenge {
  id: string;
  title: string;
  points: number;
  category: Category;
}

interface CTFSubmission {
  id: string;
  user: SubmissionUser;
  challenge: SubmissionChallenge;
  status: SubmissionStatus;
  submittedAt: string;
  proofUrl?: string;
  proofDescription?: string;
  reviewNote?: string;
  pointsAwarded?: number;
}

interface LeaderboardEntry {
  rank: number;
  userId: string;
  user: { id: string; name: string; email: string };
  totalPoints: number;
  solveCount: number;
  lastSolveAt?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// ZOD SCHEMA — CHALLENGE FORM
// ─────────────────────────────────────────────────────────────────────────────

const challengeSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.enum([
    "WEB",
    "CRYPTO",
    "FORENSICS",
    "PWNING",
    "REVERSE_ENGINEERING",
    "OSINT",
    "MISC",
  ] as const),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD", "EXPERT"] as const),
  points: z.number().min(1, "Points must be at least 1").max(10000),
  flag: z.string().optional(),
  hints: z.array(z.object({ text: z.string().min(1, "Hint cannot be empty") })),
  attachmentUrl: z.string().optional(),
  isActive: z.boolean().default(true),
});

type ChallengeFormValues = z.infer<typeof challengeSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS & HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<Category, string> = {
  WEB: "Web",
  CRYPTO: "Crypto",
  FORENSICS: "Forensics",
  PWNING: "Pwning",
  REVERSE_ENGINEERING: "Reverse Eng.",
  OSINT: "OSINT",
  MISC: "Misc",
};

const CATEGORY_COLORS: Record<Category, string> = {
  WEB: "#00f0ff",
  CRYPTO: "#7c3aed",
  FORENSICS: "#06d6a0",
  PWNING: "#ef4444",
  REVERSE_ENGINEERING: "#818cf8",
  OSINT: "#f59e0b",
  MISC: "#94a3b8",
};

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  EASY: "#06d6a0",
  MEDIUM: "#f59e0b",
  HARD: "#ef4444",
  EXPERT: "#7c3aed",
};

const inputCls =
  "w-full rounded-xl border border-white/10 bg-[#080d1a] px-3 py-2 text-sm " +
  "text-[var(--text-primary)] placeholder:text-[var(--text-muted)] " +
  "focus:outline-none focus:border-kavach-cyan/40 focus:ring-1 focus:ring-kavach-cyan/20 transition-colors";

const selectCls =
  "w-full rounded-xl border border-white/10 bg-[#080d1a] px-3 py-2 text-sm " +
  "text-[var(--text-primary)] focus:outline-none focus:border-kavach-cyan/40 " +
  "focus:ring-1 focus:ring-kavach-cyan/20 transition-colors appearance-none";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ─────────────────────────────────────────────────────────────────────────────
// SMALL SHARED COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function Field({
  label,
  error,
  required,
  hint,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
        {label}
        {required && <span className="text-red-400">*</span>}
      </label>
      {hint && (
        <p className="text-[11px] text-[var(--text-secondary)] opacity-70">
          {hint}
        </p>
      )}
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

function CategoryBadge({ category }: { category: Category }) {
  const color = CATEGORY_COLORS[category] ?? "#94a3b8";
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold"
      style={{
        color,
        background: `${color}15`,
        border: `1px solid ${color}30`,
      }}
    >
      {CATEGORY_LABELS[category] ?? category}
    </span>
  );
}

function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  const color = DIFFICULTY_COLORS[difficulty] ?? "#94a3b8";
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold"
      style={{
        color,
        background: `${color}15`,
        border: `1px solid ${color}30`,
      }}
    >
      {difficulty}
    </span>
  );
}

function StatusBadge({ status }: { status: SubmissionStatus }) {
  const map: Record<SubmissionStatus, { color: string; label: string }> = {
    PENDING: { color: "#f59e0b", label: "Pending" },
    APPROVED: { color: "#06d6a0", label: "Approved" },
    REJECTED: { color: "#ef4444", label: "Rejected" },
  };
  const { color, label } = map[status];
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold"
      style={{
        color,
        background: `${color}15`,
        border: `1px solid ${color}30`,
      }}
    >
      {label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DELETE CONFIRM DIALOG
// ─────────────────────────────────────────────────────────────────────────────

interface DeleteConfirm {
  open: boolean;
  id: string | null;
  title: string;
  onConfirm: () => void;
}

function DeleteConfirmDialog({
  dialog,
  onClose,
  isDeleting,
}: {
  dialog: DeleteConfirm;
  onClose: () => void;
  isDeleting: boolean;
}) {
  if (!dialog.open) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-white/10 bg-[#0d1224] p-6 shadow-2xl">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="p-3 rounded-full bg-red-500/10 border border-red-500/20">
            <AlertTriangle size={24} className="text-red-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              Delete Challenge?
            </h3>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              <span className="font-medium text-[var(--text-primary)]">
                "{dialog.title}"
              </span>{" "}
              will be permanently deleted. All associated submissions will also
              be removed.
            </p>
          </div>
          <div className="flex gap-3 w-full">
            <Button
              variant="ghost"
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 border border-white/10 hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              onClick={dialog.onConfirm}
              disabled={isDeleting}
              className="flex-1 bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 gap-2"
            >
              {isDeleting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Trash2 size={14} />
              )}
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PROOF MODAL
// ─────────────────────────────────────────────────────────────────────────────

function ProofModal({
  proofUrl,
  proofDescription,
  onClose,
}: {
  proofUrl?: string;
  proofDescription?: string;
  onClose: () => void;
}) {
  const isImage =
    proofUrl && /\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i.test(proofUrl);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-2xl rounded-2xl border border-white/10 bg-[#0d1224] overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
            <FileText size={15} className="text-kavach-cyan" />
            Submission Proof
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-[var(--text-secondary)] transition-colors"
          >
            <X size={15} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          {proofDescription && (
            <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4">
              <p className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                Description
              </p>
              <p className="text-sm text-[var(--text-primary)] leading-relaxed">
                {proofDescription}
              </p>
            </div>
          )}
          {proofUrl && (
            <div>
              <p className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                Attachment
              </p>
              {isImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={proofUrl}
                  alt="Proof"
                  className="w-full max-h-80 object-contain rounded-xl border border-white/10"
                />
              ) : (
                <a
                  href={proofUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-kavach-cyan hover:underline text-sm"
                >
                  <Paperclip size={14} />
                  View attachment
                </a>
              )}
            </div>
          )}
          {!proofUrl && !proofDescription && (
            <p className="text-sm text-[var(--text-secondary)] text-center py-6">
              No proof provided for this submission.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CHALLENGE FORM (inside Sheet)
// ─────────────────────────────────────────────────────────────────────────────

interface ChallengeFormProps {
  challenge?: CTFChallenge | null;
  onSuccess: () => void;
  onCancel: () => void;
}

function ChallengeForm({ challenge, onSuccess, onCancel }: ChallengeFormProps) {
  const isEditing = !!challenge;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showFlag, setShowFlag] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachmentFileName, setAttachmentFileName] = useState<string>(
    challenge?.attachmentUrl ? "Current attachment" : ""
  );

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ChallengeFormValues>({
    resolver: zodResolver(challengeSchema),
    defaultValues: {
      title: challenge?.title ?? "",
      description: challenge?.description ?? "",
      category: (challenge?.category as Category) ?? "WEB",
      difficulty: (challenge?.difficulty as Difficulty) ?? "EASY",
      points: challenge?.points ?? 100,
      flag: "",
      hints: challenge?.hints?.map((h) => ({ text: h })) ?? [],
      attachmentUrl: challenge?.attachmentUrl ?? "",
      isActive: challenge?.isActive ?? true,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "hints",
  });

  const isActive = watch("isActive");
  const attachmentUrl = watch("attachmentUrl");

  // ── Attachment Upload ──
  const handleAttachmentUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      toast.error("Attachment must be smaller than 50MB");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post("/upload/file", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const url: string =
        res.data?.data?.url ?? res.data?.url ?? res.data?.fileUrl ?? "";
      if (!url) throw new Error("No URL returned");
      setValue("attachmentUrl", url, { shouldValidate: true });
      setAttachmentFileName(file.name);
      toast.success("Attachment uploaded ✓");
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Upload failed");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // ── Submit ──
  const onSubmit = async (data: ChallengeFormValues) => {
    setIsSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        title: data.title,
        description: data.description,
        category: data.category,
        difficulty: data.difficulty,
        points: data.points,
        hints: data.hints.map((h) => h.text).filter(Boolean),
        attachmentUrl: data.attachmentUrl?.trim() || undefined,
        isActive: data.isActive,
      };

      if (isEditing) {
        // Only include flag if user typed something (security: don't send empty)
        if (data.flag && data.flag.trim()) {
          payload.flag = data.flag.trim();
        }
        await api.patch(`/ctf/challenges/${challenge!.id}`, payload);
        toast.success("Challenge updated ✓");
      } else {
        if (!data.flag || !data.flag.trim()) {
          toast.error("Flag is required for new challenges");
          setIsSubmitting(false);
          return;
        }
        payload.flag = data.flag.trim(); // sent as plain text; backend bcrypt-hashes it
        await api.post("/ctf/challenges", payload);
        toast.success("Challenge created ✓");
      }
      onSuccess();
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ??
          `Failed to ${isEditing ? "update" : "create"} challenge`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-5"
      noValidate
    >
      {/* Title */}
      <Field label="Title" required error={errors.title?.message}>
        <input
          {...register("title")}
          id="challenge-title"
          placeholder="e.g. SQL Injection 101"
          className={inputCls}
          autoComplete="off"
        />
      </Field>

      {/* Description — MD Editor */}
      <Field
        label="Description"
        required
        error={errors.description?.message}
        hint="Challenge brief shown to participants — Markdown supported"
      >
        <div
          data-color-mode="dark"
          className="rounded-xl overflow-hidden border border-white/10
            [&_.w-md-editor]:bg-[#080d1a] [&_.w-md-editor-toolbar]:bg-[#0d1224]
            [&_.w-md-editor-toolbar]:border-b [&_.w-md-editor-toolbar]:border-white/10
            [&_.w-md-editor-preview]:bg-[#080d1a] [&_.w-md-editor-content]:min-h-[120px]"
        >
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <MDEditor
                value={field.value}
                onChange={(val) => field.onChange(val ?? "")}
                height={180}
                preview="live"
                hideToolbar={false}
                visibleDragbar={false}
              />
            )}
          />
        </div>
      </Field>

      {/* Category + Difficulty */}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Category" required error={errors.category?.message}>
          <select {...register("category")} className={selectCls}>
            <option value="WEB">Web</option>
            <option value="CRYPTO">Cryptography</option>
            <option value="FORENSICS">Forensics</option>
            <option value="PWNING">Pwning</option>
            <option value="REVERSE_ENGINEERING">Reverse Engineering</option>
            <option value="OSINT">OSINT</option>
            <option value="MISC">Misc</option>
          </select>
        </Field>
        <Field label="Difficulty" required error={errors.difficulty?.message}>
          <select {...register("difficulty")} className={selectCls}>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
            <option value="EXPERT">Expert</option>
          </select>
        </Field>
      </div>

      {/* Points */}
      <Field label="Points" required error={errors.points?.message}>
        <input
          {...register("points", { valueAsNumber: true })}
          id="challenge-points"
          type="number"
          min={1}
          max={10000}
          placeholder="100"
          className={inputCls}
        />
      </Field>

      {/* Flag — masked, sent as plain text for backend hashing */}
      <Field
        label="Flag"
        required={!isEditing}
        error={errors.flag?.message}
        hint={
          isEditing
            ? "Leave blank to keep existing flag — value is bcrypt-hashed on the server"
            : "Sent as plain text — backend hashes with bcrypt before storing"
        }
      >
        <div className="relative">
          <ShieldAlert
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500"
          />
          <input
            {...register("flag")}
            id="challenge-flag"
            type={showFlag ? "text" : "password"}
            placeholder={
              isEditing ? "(Leave blank to keep existing)" : "kavach{fl4g_h3r3}"
            }
            autoComplete="new-password"
            className={`${inputCls} pl-9 pr-10 font-mono`}
          />
          <button
            type="button"
            onClick={() => setShowFlag((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
            title={showFlag ? "Hide flag" : "Reveal flag"}
          >
            {showFlag ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
        <p className="text-[10px] text-amber-500/80 flex items-center gap-1 mt-1">
          <Info size={10} />
          Flag is never stored in plain text — hashed with bcrypt on the
          backend.
        </p>
      </Field>

      {/* Hints — dynamic list */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
            Hints
          </label>
          <button
            type="button"
            onClick={() => append({ text: "" })}
            className="flex items-center gap-1 text-[11px] text-kavach-cyan hover:text-kavach-cyan/80 transition-colors"
          >
            <Plus size={11} />
            Add hint
          </button>
        </div>
        {fields.length === 0 ? (
          <p className="text-[11px] text-[var(--text-muted)] text-center py-3 border border-dashed border-white/10 rounded-xl">
            No hints added. Players won't see any hints.
          </p>
        ) : (
          <div className="space-y-2">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-start gap-2">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-kavach-cyan/10 border border-kavach-cyan/20 flex items-center justify-center mt-2">
                  <span className="text-[9px] font-bold text-kavach-cyan">
                    {index + 1}
                  </span>
                </div>
                <div className="flex-1">
                  <input
                    {...register(`hints.${index}.text`)}
                    placeholder={`Hint ${index + 1}...`}
                    className={inputCls}
                  />
                  {errors.hints?.[index]?.text && (
                    <p className="text-[10px] text-red-400 mt-0.5">
                      {errors.hints[index]?.text?.message}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="mt-2 p-1.5 rounded-lg hover:bg-red-500/10 text-[var(--text-muted)] hover:text-red-400 transition-colors flex-shrink-0"
                >
                  <X size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Attachment */}
      <Field
        label="Attachment"
        hint="Optional — challenge file (zip, pdf, binary, etc.) max 50MB"
        error={errors.attachmentUrl?.message}
      >
        <div className="flex gap-2">
          <input
            {...register("attachmentUrl")}
            id="challenge-attachment"
            type="url"
            placeholder="https://... or upload below"
            className={`${inputCls} flex-1`}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="flex-shrink-0 border-white/10 bg-[#080d1a] hover:bg-white/5 
              text-[var(--text-secondary)] hover:text-[var(--text-primary)] size-9"
          >
            {isUploading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Upload size={14} />
            )}
          </Button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleAttachmentUpload}
        />
        {attachmentFileName && (
          <p className="text-[11px] text-kavach-green flex items-center gap-1 mt-1">
            <Paperclip size={10} />
            {attachmentFileName}
          </p>
        )}
        {attachmentUrl && !attachmentFileName && (
          <a
            href={attachmentUrl}
            target="_blank"
            rel="noreferrer"
            className="text-[11px] text-kavach-cyan flex items-center gap-1 mt-1 hover:underline"
          >
            <Paperclip size={10} />
            View current attachment
          </a>
        )}
      </Field>

      {/* Active Toggle */}
      <div
        className={`flex items-start gap-3 rounded-xl border p-4 transition-colors ${
          isActive
            ? "border-kavach-green/30 bg-kavach-green/5"
            : "border-white/10 bg-[#080d1a]"
        }`}
      >
        <Checkbox
          id="isActive"
          checked={isActive}
          onCheckedChange={(c) => setValue("isActive", !!c)}
          className="mt-0.5 border-white/20"
        />
        <div>
          <label
            htmlFor="isActive"
            className="text-sm font-semibold text-[var(--text-primary)] cursor-pointer"
          >
            {isActive ? "✓ Challenge is Active" : "Challenge is Inactive"}
          </label>
          <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
            {isActive
              ? "Visible and accessible to participants."
              : "Hidden from participants — only admins can see it."}
          </p>
        </div>
      </div>

      {/* Actions */}
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
          className="flex-1 bg-kavach-cyan text-black font-bold hover:bg-kavach-cyan/90 gap-2 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              {isEditing ? "Saving..." : "Creating..."}
            </>
          ) : (
            <>{isEditing ? "Save Changes" : "Create Challenge"}</>
          )}
        </Button>
      </div>
    </form>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPANDABLE SUBMISSION ROW
// ─────────────────────────────────────────────────────────────────────────────

function SubmissionRow({
  sub,
  onReview,
  reviewingId,
}: {
  sub: CTFSubmission;
  onReview: (
    id: string,
    status: "APPROVED" | "REJECTED",
    note: string,
    points: number
  ) => void;
  reviewingId: string | null;
}) {
  const [expanded, setExpanded] = useState(false);
  const [proofOpen, setProofOpen] = useState(false);
  const [reviewNote, setReviewNote] = useState("");
  const [customPoints, setCustomPoints] = useState<number>(
    sub.challenge?.points ?? 0
  );

  return (
    <>
      {proofOpen && (
        <ProofModal
          proofUrl={sub.proofUrl}
          proofDescription={sub.proofDescription}
          onClose={() => setProofOpen(false)}
        />
      )}

      {/* Main Row */}
      <tr
        className={`border-b border-white/[0.04] transition-colors ${
          expanded ? "bg-white/[0.025]" : "hover:bg-white/[0.02]"
        }`}
      >
        {/* Expand toggle */}
        <td className="px-4 py-3 w-8">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="p-1 rounded hover:bg-white/10 text-[var(--text-muted)] transition-colors"
          >
            {expanded ? (
              <ChevronDown size={13} />
            ) : (
              <ChevronRight size={13} />
            )}
          </button>
        </td>

        {/* User */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-kavach-violet/10 border border-kavach-violet/20 flex items-center justify-center flex-shrink-0">
              <span className="text-[10px] font-bold text-kavach-violet">
                {sub.user?.name?.charAt(0)?.toUpperCase() ?? "?"}
              </span>
            </div>
            <div>
              <p className="text-xs font-semibold text-[var(--text-primary)]">
                {sub.user?.name ?? "Unknown"}
              </p>
              <p className="text-[10px] text-[var(--text-secondary)]">
                {sub.user?.email ?? ""}
              </p>
            </div>
          </div>
        </td>

        {/* Challenge */}
        <td className="px-4 py-3">
          <p className="text-xs font-medium text-[var(--text-primary)] max-w-[140px] truncate">
            {sub.challenge?.title ?? "Unknown"}
          </p>
          {sub.challenge?.category && (
            <CategoryBadge category={sub.challenge.category} />
          )}
        </td>

        {/* Submitted */}
        <td className="px-4 py-3 whitespace-nowrap text-[11px] text-[var(--text-secondary)]">
          {timeAgo(sub.submittedAt)}
        </td>

        {/* Status */}
        <td className="px-4 py-3">
          <StatusBadge status={sub.status} />
        </td>

        {/* Proof */}
        <td className="px-4 py-3">
          {sub.proofUrl || sub.proofDescription ? (
            <button
              onClick={() => setProofOpen(true)}
              className="flex items-center gap-1 text-[11px] text-kavach-cyan hover:underline"
            >
              <Eye size={11} />
              View
            </button>
          ) : (
            <span className="text-[11px] text-[var(--text-muted)]">None</span>
          )}
        </td>

        {/* Quick Actions (visible for PENDING only) */}
        <td className="px-4 py-3">
          {sub.status === "PENDING" ? (
            <div className="flex items-center gap-1.5">
              <button
                disabled={reviewingId === sub.id}
                onClick={() =>
                  onReview(sub.id, "APPROVED", reviewNote, customPoints)
                }
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-kavach-green/20 
                  bg-kavach-green/10 text-kavach-green hover:bg-kavach-green/20 text-[10px] font-semibold 
                  transition-all disabled:opacity-40"
              >
                {reviewingId === sub.id ? (
                  <Loader2 size={10} className="animate-spin" />
                ) : (
                  <CheckCircle2 size={10} />
                )}
                Approve
              </button>
              <button
                disabled={reviewingId === sub.id}
                onClick={() => setExpanded(true)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-red-500/20 
                  bg-red-500/10 text-red-400 hover:bg-red-500/20 text-[10px] font-semibold transition-all"
              >
                <XCircle size={10} />
                Reject
              </button>
            </div>
          ) : (
            <span className="text-[11px] text-[var(--text-muted)]">
              {sub.status === "APPROVED"
                ? `+${sub.pointsAwarded ?? 0} pts`
                : "—"}
            </span>
          )}
        </td>
      </tr>

      {/* Expanded Row */}
      {expanded && (
        <tr>
          <td
            colSpan={7}
            className="px-4 pb-4 bg-white/[0.025] border-b border-white/[0.04]"
          >
            <div className="ml-8 rounded-xl border border-white/10 bg-[#080d1a] p-4 space-y-4">
              {/* Proof description */}
              {sub.proofDescription && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                    Proof Description
                  </p>
                  <p className="text-xs text-[var(--text-primary)] leading-relaxed bg-white/[0.03] rounded-lg p-3 border border-white/10">
                    {sub.proofDescription}
                  </p>
                </div>
              )}

              {/* Previous review note */}
              {sub.reviewNote && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                    Review Note
                  </p>
                  <p className="text-xs text-amber-400/80 bg-amber-500/5 rounded-lg p-3 border border-amber-500/20">
                    {sub.reviewNote}
                  </p>
                </div>
              )}

              {/* Inline review form (PENDING only) */}
              {sub.status === "PENDING" && (
                <div className="space-y-3 pt-2 border-t border-white/10">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                    Review Decision
                  </p>

                  {/* Custom points for approve */}
                  <div className="flex items-center gap-3">
                    <label className="text-xs text-[var(--text-secondary)] flex-shrink-0">
                      Points to award:
                    </label>
                    <input
                      type="number"
                      value={customPoints}
                      min={0}
                      max={sub.challenge?.points ?? 10000}
                      onChange={(e) =>
                        setCustomPoints(Number(e.target.value))
                      }
                      className="w-24 rounded-lg border border-white/10 bg-[#0d1224] px-2 py-1 text-xs 
                        text-[var(--text-primary)] focus:outline-none focus:border-kavach-cyan/40"
                    />
                    <span className="text-[10px] text-[var(--text-muted)]">
                      (max {sub.challenge?.points ?? "—"})
                    </span>
                  </div>

                  {/* Review note */}
                  <textarea
                    value={reviewNote}
                    onChange={(e) => setReviewNote(e.target.value)}
                    placeholder="Optional review note (shown to user)..."
                    rows={2}
                    className="w-full rounded-lg border border-white/10 bg-[#0d1224] px-3 py-2 text-xs 
                      text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none 
                      focus:border-kavach-cyan/40 resize-none"
                  />

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      disabled={reviewingId === sub.id}
                      onClick={() =>
                        onReview(sub.id, "APPROVED", reviewNote, customPoints)
                      }
                      className="bg-kavach-green/10 text-kavach-green border border-kavach-green/20 
                        hover:bg-kavach-green/20 gap-1.5 text-[11px]"
                    >
                      {reviewingId === sub.id ? (
                        <Loader2 size={11} className="animate-spin" />
                      ) : (
                        <CheckCircle2 size={11} />
                      )}
                      Approve &amp; Award {customPoints} pts
                    </Button>
                    <Button
                      size="sm"
                      disabled={reviewingId === sub.id}
                      onClick={() =>
                        onReview(sub.id, "REJECTED", reviewNote, 0)
                      }
                      className="bg-red-500/10 text-red-400 border border-red-500/20 
                        hover:bg-red-500/20 gap-1.5 text-[11px]"
                    >
                      {reviewingId === sub.id ? (
                        <Loader2 size={11} className="animate-spin" />
                      ) : (
                        <XCircle size={11} />
                      )}
                      Reject
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CHALLENGES TAB
// ─────────────────────────────────────────────────────────────────────────────

function ChallengesTab({
  challenges,
  isLoading,
  onRefresh,
}: {
  challenges: CTFChallenge[];
  isLoading: boolean;
  onRefresh: () => void;
}) {
  const [search, setSearch] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingChallenge, setEditingChallenge] =
    useState<CTFChallenge | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<DeleteConfirm>({
    open: false,
    id: null,
    title: "",
    onConfirm: () => {},
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const filtered = useMemo(() => {
    if (!search.trim()) return challenges;
    const q = search.toLowerCase();
    return challenges.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.difficulty.toLowerCase().includes(q)
    );
  }, [challenges, search]);

  const handleToggleActive = async (challenge: CTFChallenge) => {
    setTogglingId(challenge.id);
    try {
      await api.patch(`/ctf/challenges/${challenge.id}`, {
        isActive: !challenge.isActive,
      });
      toast.success(
        challenge.isActive
          ? `"${challenge.title}" deactivated`
          : `"${challenge.title}" activated ✓`
      );
      onRefresh();
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Failed to update status");
    } finally {
      setTogglingId(null);
    }
  };

  const openEditSheet = async (challenge: CTFChallenge) => {
    try {
      const res = await api.get(`/ctf/challenges/${challenge.id}`);
      const full: CTFChallenge = res.data?.data?.challenge ?? challenge;
      setEditingChallenge(full);
    } catch {
      setEditingChallenge(challenge);
    }
    setIsSheetOpen(true);
  };

  const initiateDelete = (challenge: CTFChallenge) => {
    setDeleteDialog({
      open: true,
      id: challenge.id,
      title: challenge.title,
      onConfirm: async () => {
        setIsDeleting(true);
        try {
          await api.delete(`/ctf/challenges/${challenge.id}`);
          toast.success("Challenge deleted");
          setDeleteDialog((d) => ({ ...d, open: false }));
          onRefresh();
        } catch (err: any) {
          toast.error(err.response?.data?.message ?? "Delete failed");
        } finally {
          setIsDeleting(false);
        }
      },
    });
  };

  return (
    <>
      <DeleteConfirmDialog
        dialog={deleteDialog}
        onClose={() => setDeleteDialog((d) => ({ ...d, open: false }))}
        isDeleting={isDeleting}
      />

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent
          className="w-full sm:max-w-[600px] overflow-y-auto bg-[#080d1a] border-l border-white/10 
            flex flex-col gap-0 p-0"
        >
          <SheetHeader className="sticky top-0 z-10 bg-[#080d1a]/95 backdrop-blur-md border-b border-white/10 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-kavach-cyan/10 border border-kavach-cyan/20">
                <Flag size={16} className="text-kavach-cyan" />
              </div>
              <div>
                <SheetTitle className="text-base font-bold text-[var(--text-primary)]">
                  {editingChallenge ? "Edit Challenge" : "New Challenge"}
                </SheetTitle>
                <SheetDescription className="text-xs text-[var(--text-secondary)]">
                  {editingChallenge
                    ? `Editing: ${editingChallenge.title}`
                    : "Configure a new CTF challenge for participants"}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>
          <div className="flex-1 px-6 py-5 overflow-y-auto">
            <ChallengeForm
              key={editingChallenge?.id ?? "new"}
              challenge={editingChallenge}
              onSuccess={() => {
                setIsSheetOpen(false);
                setEditingChallenge(null);
                onRefresh();
              }}
              onCancel={() => {
                setIsSheetOpen(false);
                setEditingChallenge(null);
              }}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
          />
          <input
            type="text"
            id="challenge-search"
            placeholder="Search challenges..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 rounded-xl border border-white/10 bg-[#0d1224]
              text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]
              focus:outline-none focus:border-kavach-cyan/30 transition-colors"
          />
        </div>
        <Button
          onClick={() => {
            setEditingChallenge(null);
            setIsSheetOpen(true);
          }}
          className="bg-kavach-cyan text-black font-bold hover:bg-kavach-cyan/90 gap-2 flex-shrink-0"
        >
          <Plus size={15} />
          New Challenge
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-white/5 bg-[#0d1224]/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.015]">
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-[var(--text-secondary)]">
                  Title
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-[var(--text-secondary)]">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-[var(--text-secondary)]">
                  Difficulty
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-[var(--text-secondary)]">
                  Points
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-[var(--text-secondary)]">
                  Solves
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-[var(--text-secondary)]">
                  Active
                </th>
                <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-widest text-[var(--text-secondary)]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse border-b border-white/[0.04]">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-3 bg-white/5 rounded w-16" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-16 text-center text-[var(--text-secondary)]"
                  >
                    <Flag size={36} className="mx-auto opacity-15 mb-3" />
                    <p className="text-sm">
                      {search ? "No challenges match your search" : "No challenges yet"}
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((challenge) => (
                  <tr
                    key={challenge.id}
                    className="group hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-4 py-3 max-w-[180px]">
                      <p className="text-xs font-semibold text-[var(--text-primary)] truncate">
                        {challenge.title}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <CategoryBadge category={challenge.category} />
                    </td>
                    <td className="px-4 py-3">
                      <DifficultyBadge difficulty={challenge.difficulty} />
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-[var(--text-primary)]">
                      {challenge.points}
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--text-secondary)]">
                      {challenge.solveCount ?? 0}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        id={`toggle-active-${challenge.id}`}
                        disabled={togglingId === challenge.id}
                        onClick={() => handleToggleActive(challenge)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] 
                          font-semibold transition-all disabled:opacity-40 cursor-pointer ${
                            challenge.isActive
                              ? "bg-kavach-green/10 text-kavach-green border-kavach-green/20 hover:bg-kavach-green/20"
                              : "bg-white/5 text-[var(--text-secondary)] border-white/10 hover:bg-white/10"
                          }`}
                      >
                        {togglingId === challenge.id ? (
                          <Loader2 size={10} className="animate-spin" />
                        ) : challenge.isActive ? (
                          <>
                            <ToggleRight size={12} />
                            Active
                          </>
                        ) : (
                          <>
                            <ToggleLeft size={12} />
                            Inactive
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button
                          id={`edit-challenge-${challenge.id}`}
                          onClick={() => openEditSheet(challenge)}
                          className="p-1.5 rounded-lg border border-white/10 bg-white/5 
                            text-[var(--text-secondary)] hover:text-kavach-cyan hover:border-kavach-cyan/20 
                            hover:bg-kavach-cyan/5 transition-all"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          id={`delete-challenge-${challenge.id}`}
                          onClick={() => initiateDelete(challenge)}
                          className="p-1.5 rounded-lg border border-white/10 bg-white/5 
                            text-[var(--text-secondary)] hover:text-red-400 hover:border-red-500/20 
                            hover:bg-red-500/5 transition-all"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!isLoading && filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-white/5 bg-white/[0.01]">
            <p className="text-xs text-[var(--text-secondary)]">
              {filtered.length} challenge{filtered.length !== 1 ? "s" : ""}
              {search ? " matching search" : ""}
            </p>
          </div>
        )}
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SUBMISSIONS TAB
// ─────────────────────────────────────────────────────────────────────────────

type SubFilter = "PENDING" | "APPROVED" | "REJECTED" | "ALL";

function SubmissionsTab({
  submissions,
  isLoading,
  onRefresh,
}: {
  submissions: CTFSubmission[];
  isLoading: boolean;
  onRefresh: () => void;
}) {
  const [filter, setFilter] = useState<SubFilter>("PENDING");
  const [search, setSearch] = useState("");
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let data =
      filter === "ALL" ? submissions : submissions.filter((s) => s.status === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(
        (s) =>
          s.user?.name?.toLowerCase().includes(q) ||
          s.challenge?.title?.toLowerCase().includes(q) ||
          s.user?.email?.toLowerCase().includes(q)
      );
    }
    return data;
  }, [submissions, filter, search]);

  const counts = useMemo(
    () => ({
      PENDING: submissions.filter((s) => s.status === "PENDING").length,
      APPROVED: submissions.filter((s) => s.status === "APPROVED").length,
      REJECTED: submissions.filter((s) => s.status === "REJECTED").length,
    }),
    [submissions]
  );

  const handleReview = async (
    id: string,
    status: "APPROVED" | "REJECTED",
    reviewNote: string,
    pointsAwarded: number
  ) => {
    setReviewingId(id);
    try {
      await api.patch(`/ctf/submissions/${id}/review`, {
        status,
        reviewNote: reviewNote.trim() || undefined,
        pointsAwarded: status === "APPROVED" ? pointsAwarded : 0,
      });
      toast.success(
        status === "APPROVED"
          ? `Submission approved (+${pointsAwarded} pts) ✓`
          : "Submission rejected"
      );
      onRefresh();
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ?? `Failed to ${status.toLowerCase()} submission`
      );
    } finally {
      setReviewingId(null);
    }
  };

  const filterTabs: { value: SubFilter; label: string }[] = [
    { value: "PENDING", label: `Pending (${counts.PENDING})` },
    { value: "APPROVED", label: `Approved (${counts.APPROVED})` },
    { value: "REJECTED", label: `Rejected (${counts.REJECTED})` },
    { value: "ALL", label: `All (${submissions.length})` },
  ];

  return (
    <>
      {/* Filter + Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4">
        <div className="flex items-center gap-1 bg-[#0d1224] border border-white/10 rounded-xl p-1 flex-wrap">
          {filterTabs.map((t) => (
            <button
              key={t.value}
              id={`sub-filter-${t.value.toLowerCase()}`}
              onClick={() => setFilter(t.value)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                filter === t.value
                  ? "bg-kavach-cyan/15 text-kavach-cyan border border-kavach-cyan/20"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
          />
          <input
            type="text"
            placeholder="Search by user or challenge..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 rounded-xl border border-white/10 bg-[#0d1224]
              text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]
              focus:outline-none focus:border-kavach-cyan/30 transition-colors"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-white/5 bg-[#0d1224]/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.015]">
                <th className="px-4 py-3 w-8" />
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-[var(--text-secondary)]">
                  User
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-[var(--text-secondary)]">
                  Challenge
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-[var(--text-secondary)]">
                  Submitted
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-[var(--text-secondary)]">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-[var(--text-secondary)]">
                  Proof
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-[var(--text-secondary)]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr
                    key={i}
                    className="animate-pulse border-b border-white/[0.04]"
                  >
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-3 bg-white/5 rounded w-20" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-16 text-center text-[var(--text-secondary)]"
                  >
                    <CheckCircle2
                      size={36}
                      className="mx-auto opacity-15 mb-3 text-kavach-green"
                    />
                    <p className="text-sm">
                      {search
                        ? "No submissions match your search"
                        : filter === "PENDING"
                        ? "All caught up! No pending submissions."
                        : `No ${filter.toLowerCase()} submissions.`}
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((sub) => (
                  <SubmissionRow
                    key={sub.id}
                    sub={sub}
                    onReview={handleReview}
                    reviewingId={reviewingId}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
        {!isLoading && filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-white/5 bg-white/[0.01]">
            <p className="text-xs text-[var(--text-secondary)]">
              {filtered.length} submission{filtered.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LEADERBOARD TAB
// ─────────────────────────────────────────────────────────────────────────────

function LeaderboardTab() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRecalculating, setIsRecalculating] = useState(false);

  const fetchLeaderboard = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/progress/leaderboard");
      const data: LeaderboardEntry[] =
        res.data?.data?.leaderboard ??
        res.data?.data ??
        res.data?.leaderboard ??
        [];
      // Ensure rank is set
      setEntries(
        data.map((e, i) => ({ ...e, rank: e.rank ?? i + 1 }))
      );
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Failed to load leaderboard");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const handleRecalculate = async () => {
    setIsRecalculating(true);
    try {
      await api.post("/admin/recalculate-leaderboard");
      toast.success("Leaderboard recalculated ✓");
      await fetchLeaderboard();
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ?? "Recalculation failed"
      );
    } finally {
      setIsRecalculating(false);
    }
  };

  const rankIcon = (rank: number) => {
    if (rank === 1)
      return <Trophy size={16} className="text-yellow-400 flex-shrink-0" />;
    if (rank === 2)
      return <Medal size={16} className="text-slate-300 flex-shrink-0" />;
    if (rank === 3)
      return <Medal size={16} className="text-amber-600 flex-shrink-0" />;
    return (
      <span className="text-xs font-bold text-[var(--text-muted)] w-4 text-center flex-shrink-0">
        {rank}
      </span>
    );
  };

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Trophy size={16} className="text-yellow-400" />
          <span className="text-sm font-bold text-[var(--text-primary)]">
            Global Leaderboard
          </span>
          <span className="text-[11px] text-[var(--text-secondary)]">
            ({entries.length} participants)
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          disabled={isRecalculating || isLoading}
          onClick={handleRecalculate}
          className="border border-white/10 hover:bg-white/5 text-[var(--text-secondary)] 
            hover:text-[var(--text-primary)] gap-2 text-xs"
        >
          {isRecalculating ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <RefreshCw size={13} />
          )}
          Recalculate
        </Button>
      </div>

      <div className="rounded-2xl border border-white/5 bg-[#0d1224]/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.015]">
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-[var(--text-secondary)] w-14">
                  Rank
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-[var(--text-secondary)]">
                  Participant
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-[var(--text-secondary)]">
                  Solves
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-[var(--text-secondary)]">
                  Total Points
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-[var(--text-secondary)]">
                  Last Solve
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr
                    key={i}
                    className="animate-pulse border-b border-white/[0.04]"
                  >
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-3 bg-white/5 rounded w-20" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : entries.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-16 text-center text-[var(--text-secondary)]"
                  >
                    <Star size={36} className="mx-auto opacity-15 mb-3" />
                    <p className="text-sm">No leaderboard data yet.</p>
                  </td>
                </tr>
              ) : (
                entries.map((entry) => (
                  <tr
                    key={entry.userId}
                    className={`transition-colors group ${
                      entry.rank <= 3
                        ? "bg-yellow-500/[0.02] hover:bg-yellow-500/[0.04]"
                        : "hover:bg-white/[0.02]"
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center">
                        {rankIcon(entry.rank)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border ${
                            entry.rank === 1
                              ? "bg-yellow-400/10 border-yellow-400/30"
                              : entry.rank === 2
                              ? "bg-slate-300/10 border-slate-300/30"
                              : entry.rank === 3
                              ? "bg-amber-600/10 border-amber-600/30"
                              : "bg-kavach-cyan/10 border-kavach-cyan/20"
                          }`}
                        >
                          <span
                            className={`text-xs font-bold ${
                              entry.rank === 1
                                ? "text-yellow-400"
                                : entry.rank === 2
                                ? "text-slate-300"
                                : entry.rank === 3
                                ? "text-amber-600"
                                : "text-kavach-cyan"
                            }`}
                          >
                            {entry.user?.name?.charAt(0)?.toUpperCase() ?? "?"}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-[var(--text-primary)]">
                            {entry.user?.name ?? "Unknown"}
                          </p>
                          <p className="text-[10px] text-[var(--text-secondary)]">
                            {entry.user?.email ?? ""}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--text-secondary)]">
                      {entry.solveCount ?? 0} solves
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-sm font-bold ${
                          entry.rank === 1
                            ? "text-yellow-400"
                            : entry.rank === 2
                            ? "text-slate-300"
                            : entry.rank === 3
                            ? "text-amber-600"
                            : "text-[var(--text-primary)]"
                        }`}
                      >
                        {(entry.totalPoints ?? 0).toLocaleString()}
                      </span>
                      <span className="text-[10px] text-[var(--text-secondary)] ml-1">
                        pts
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[11px] text-[var(--text-secondary)]">
                      {entry.lastSolveAt ? timeAgo(entry.lastSolveAt) : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function AdminCTFPage() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [challenges, setChallenges] = useState<CTFChallenge[]>([]);
  const [submissions, setSubmissions] = useState<CTFSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Auth guard
  useEffect(() => {
    if (!authLoading && !isAdmin) {
      toast.error("Admin access required.");
      router.replace("/dashboard");
    }
  }, [authLoading, isAdmin, router]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [chalRes, subRes] = await Promise.all([
        api.get("/ctf/challenges"),
        api.get("/ctf/submissions"),
      ]);
      setChallenges(
        chalRes.data?.data?.challenges ?? chalRes.data?.challenges ?? []
      );
      setSubmissions(
        subRes.data?.data?.submissions ?? subRes.data?.submissions ?? []
      );
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Failed to load CTF data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (authLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-kavach-cyan" size={28} />
      </div>
    );
  }

  if (!isAdmin) return null;

  const pendingCount = submissions.filter((s) => s.status === "PENDING").length;
  const activeCount = challenges.filter((c) => c.isActive).length;

  return (
    <div className="space-y-6">
      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black tracking-tight text-gradient">
              CTF Management
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-kavach-cyan/10 text-kavach-cyan border border-kavach-cyan/20">
              {challenges.length} challenges
            </span>
            {pendingCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse">
                {pendingCount} pending
              </span>
            )}
          </div>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">
            Manage challenges, review manual submissions, and monitor the
            leaderboard.
          </p>
          <div className="flex items-center gap-4 mt-2.5">
            <span className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
              <span className="w-1.5 h-1.5 rounded-full bg-kavach-green inline-block" />
              {activeCount} active
            </span>
            <span className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-muted)] inline-block" />
              {challenges.length - activeCount} inactive
            </span>
          </div>
        </div>
      </div>

      {/* ── Tabs ──────────────────────────────────────────────────────────── */}
      <Tabs defaultValue="challenges" className="w-full">
        <TabsList className="bg-[#0d1224]/80 border border-white/10 backdrop-blur-sm w-fit mb-6 h-auto p-1">
          <TabsTrigger
            value="challenges"
            className="px-4 py-2 text-xs font-semibold rounded-lg gap-2
              data-active:bg-kavach-cyan/15 data-active:text-kavach-cyan data-active:border data-active:border-kavach-cyan/25"
          >
            <Flag size={13} />
            Challenges
            <span className="ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] bg-white/10">
              {challenges.length}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="submissions"
            className="px-4 py-2 text-xs font-semibold rounded-lg gap-2
              data-active:bg-kavach-cyan/15 data-active:text-kavach-cyan data-active:border data-active:border-kavach-cyan/25"
          >
            <FileText size={13} />
            Submissions
            {pendingCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] bg-red-500/20 text-red-400 font-bold">
                {pendingCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="leaderboard"
            className="px-4 py-2 text-xs font-semibold rounded-lg gap-2
              data-active:bg-kavach-cyan/15 data-active:text-kavach-cyan data-active:border data-active:border-kavach-cyan/25"
          >
            <Trophy size={13} />
            Leaderboard
          </TabsTrigger>
        </TabsList>

        <TabsContent value="challenges">
          <ChallengesTab
            challenges={challenges}
            isLoading={isLoading}
            onRefresh={fetchData}
          />
        </TabsContent>

        <TabsContent value="submissions">
          <SubmissionsTab
            submissions={submissions}
            isLoading={isLoading}
            onRefresh={fetchData}
          />
        </TabsContent>

        <TabsContent value="leaderboard">
          <LeaderboardTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
