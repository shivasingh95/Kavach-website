"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Send, CheckCircle2 } from "lucide-react";

const joinSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  college: z.string().min(2, "College name must be at least 2 characters"),
  yearOfStudy: z.string().min(1, "Please select your year of study"),
  githubUrl: z.string().url("Must be a valid URL").optional().or(z.literal('')),
  linkedinUrl: z.string().url("Must be a valid URL").optional().or(z.literal('')),
  whyJoin: z.string().min(10, "Please provide a more detailed reason"),
  experienceLevel: z.string().min(1, "Please select your experience level"),
  skills: z.string().min(1, "Please list at least one skill"),
});

type JoinFormValues = z.infer<typeof joinSchema>;

export default function JoinForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<JoinFormValues>({
    resolver: zodResolver(joinSchema),
  });

  const onSubmit = async (data: JoinFormValues) => {
    setIsSubmitting(true);
    try {
      // Backend expects an array of skills, but the form field is a comma separated string
      const payload = {
        ...data,
        skills: data.skills.split(',').map(s => s.trim()).filter(Boolean),
      };

      await api.post('/join', payload);
      setIsSuccess(true);
      toast.success("Application submitted successfully!");
      reset();
      
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-6">
        <div className="w-16 h-16 bg-kavach-green/10 text-kavach-green rounded-full flex items-center justify-center mb-6 border border-kavach-green/20">
          <CheckCircle2 size={32} />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Application Submitted!</h3>
        <p className="text-gray-400">
          Thank you for applying to Kavach. We will review your application and get back to you soon.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="fullName" className="text-sm font-medium text-gray-300">Full Name *</label>
          <input
            id="fullName"
            {...register("fullName")}
            className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-kavach-cyan transition-colors"
            placeholder="John Doe"
          />
          {errors.fullName && <p className="text-red-400 text-xs">{errors.fullName.message}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-gray-300">Email Address *</label>
          <input
            id="email"
            type="email"
            {...register("email")}
            className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-kavach-cyan transition-colors"
            placeholder="john@example.com"
          />
          {errors.email && <p className="text-red-400 text-xs">{errors.email.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="college" className="text-sm font-medium text-gray-300">College / University *</label>
          <input
            id="college"
            {...register("college")}
            className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-kavach-cyan transition-colors"
            placeholder="e.g. MIT, Stanford"
          />
          {errors.college && <p className="text-red-400 text-xs">{errors.college.message}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="yearOfStudy" className="text-sm font-medium text-gray-300">Year of Study *</label>
          <select
            id="yearOfStudy"
            {...register("yearOfStudy")}
            className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-kavach-cyan transition-colors appearance-none"
          >
            <option value="">Select Year...</option>
            <option value="1st Year">1st Year</option>
            <option value="2nd Year">2nd Year</option>
            <option value="3rd Year">3rd Year</option>
            <option value="4th Year">4th Year</option>
            <option value="Graduate">Graduate</option>
            <option value="Other">Other</option>
          </select>
          {errors.yearOfStudy && <p className="text-red-400 text-xs">{errors.yearOfStudy.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="githubUrl" className="text-sm font-medium text-gray-300">GitHub URL (Optional)</label>
          <input
            id="githubUrl"
            {...register("githubUrl")}
            className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-kavach-cyan transition-colors"
            placeholder="https://github.com/..."
          />
          {errors.githubUrl && <p className="text-red-400 text-xs">{errors.githubUrl.message}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="linkedinUrl" className="text-sm font-medium text-gray-300">LinkedIn URL (Optional)</label>
          <input
            id="linkedinUrl"
            {...register("linkedinUrl")}
            className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-kavach-cyan transition-colors"
            placeholder="https://linkedin.com/in/..."
          />
          {errors.linkedinUrl && <p className="text-red-400 text-xs">{errors.linkedinUrl.message}</p>}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="experienceLevel" className="text-sm font-medium text-gray-300">Experience Level *</label>
          <select
            id="experienceLevel"
            {...register("experienceLevel")}
            className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-kavach-cyan transition-colors appearance-none"
          >
            <option value="">Select Level...</option>
            <option value="Beginner">Beginner (Just starting)</option>
            <option value="Intermediate">Intermediate (Some CTFs / Knowledge)</option>
            <option value="Advanced">Advanced (Experienced)</option>
          </select>
          {errors.experienceLevel && <p className="text-red-400 text-xs">{errors.experienceLevel.message}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="skills" className="text-sm font-medium text-gray-300">Skills (Comma separated) *</label>
          <input
            id="skills"
            {...register("skills")}
            className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-kavach-cyan transition-colors"
            placeholder="Python, Web Exploitation, Linux"
          />
          {errors.skills && <p className="text-red-400 text-xs">{errors.skills.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="whyJoin" className="text-sm font-medium text-gray-300">Why do you want to join Kavach? *</label>
        <textarea
          id="whyJoin"
          rows={4}
          {...register("whyJoin")}
          className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-kavach-cyan transition-colors resize-none"
          placeholder="Tell us what drives you and what you hope to achieve..."
        />
        {errors.whyJoin && <p className="text-red-400 text-xs">{errors.whyJoin.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-4 bg-kavach-cyan text-black font-bold rounded-xl hover:bg-cyan-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] flex items-center justify-center gap-2 mt-4"
      >
        {isSubmitting ? "Submitting Application..." : (
          <>
            Submit Application <Send size={18} />
          </>
        )}
      </button>
    </form>
  );
}
