"use client";

import { InputHTMLAttributes, forwardRef, useState } from "react";
import { UseFormRegisterReturn } from "react-hook-form";
import { motion } from "framer-motion";
import { Eye, EyeOff, Check } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  registration?: UseFormRegisterReturn;
  icon?: LucideIcon;
  isValid?: boolean;
}

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ label, error, type = "text", registration, icon: Icon, isValid, className = "", ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const isPassword = type === "password";
    const currentType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
      <div className="flex flex-col space-y-1.5 w-full">
        <label className="text-sm font-medium text-kavach-cyan/80 ml-1">
          {label}
        </label>
        <div className="relative group">
          {/* Glow effect on focus */}
          <motion.div
            className="absolute -inset-0.5 bg-gradient-to-r from-[#00f0ff] to-[#7c3aed] rounded-xl opacity-0 blur-sm transition-opacity duration-300"
            animate={{ opacity: isFocused ? 0.4 : 0 }}
          />
          
          <div className="relative">
            {/* Left icon */}
            {Icon && (
              <div className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
                isFocused ? "text-kavach-cyan" : "text-white/30"
              }`}>
                <Icon size={16} strokeWidth={1.5} />
              </div>
            )}

            <input
              {...props}
              {...registration}
              ref={(e) => {
                if (registration?.ref) registration.ref(e);
                if (typeof ref === 'function') ref(e);
                else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = e;
              }}
              type={currentType}
              onFocus={(e) => {
                setIsFocused(true);
                props.onFocus?.(e);
              }}
              onBlur={(e) => {
                setIsFocused(false);
                registration?.onBlur?.(e);
                props.onBlur?.(e);
              }}
              className={`w-full py-3 bg-[#0a0f1c]/80 border border-kavach-cyan/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-kavach-cyan/60 transition-all duration-200 backdrop-blur-sm ${
                Icon ? "pl-10 pr-4" : "px-4"
              } ${
                isPassword ? "pr-12" : ""
              } ${
                error ? "border-red-500/50 focus:border-red-500" : ""
              } ${
                isValid && !error ? "border-green-500/40" : ""
              } ${className}`}
            />
            
            {/* Password toggle */}
            {isPassword && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-kavach-cyan transition-colors p-1"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            )}

            {/* Valid checkmark (non-password fields) */}
            {isValid && !error && !isPassword && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Check size={12} className="text-green-400" />
                </div>
              </motion.div>
            )}
          </div>
        </div>
        
        {/* Error message */}
        {error && (
          <motion.span
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-red-400 ml-1 mt-1 font-medium"
          >
            {error}
          </motion.span>
        )}
      </div>
    );
  }
);

AuthInput.displayName = "AuthInput";
