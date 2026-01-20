"use client";

import { forwardRef, useId } from "react";
import { cn } from "@/lib/utils";
import type { InputProps } from "./Input.types";

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      hint,
      icon: Icon,
      suffixIcon: SuffixIcon,
      suffixIconClickable = false,
      onSuffixIconClick,
      required,
      id: providedId,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const id = providedId || generatedId;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {label}
            {required && <span className="text-error-500"> *</span>}
          </label>
        )}

        <div className="relative">
          {Icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon className="text-gray-500 w-5 h-5" />
            </div>
          )}

          <input
            ref={ref}
            id={id}
            required={required}
            className={cn(
              "block w-full px-3 py-2 rounded-sm border border-gray-300",
              "transition-all duration-200 ease-in-out",
              "focus:border-primary-700 focus:ring-1 focus:ring-primary-700 focus:outline-none",
              "disabled:bg-gray-100 disabled:cursor-not-allowed",
              "text-gray-900 placeholder-gray-400 text-sm leading-tight",
              error &&
                "!border-error-500 focus:!border-error-500 focus:!ring-error-500",
              Icon && "pl-10",
              SuffixIcon && "pr-10",
              className,
            )}
            {...props}
          />

          {SuffixIcon && (
            <div
              className={cn(
                "absolute inset-y-0 right-0 pr-3 flex items-center",
                suffixIconClickable ? "cursor-pointer" : "pointer-events-none",
              )}
              onClick={suffixIconClickable ? onSuffixIconClick : undefined}
            >
              <SuffixIcon
                className={cn(
                  "text-gray-500 w-5 h-5",
                  suffixIconClickable && "hover:text-primary-700",
                )}
              />
            </div>
          )}
        </div>

        {error && <p className="mt-1 text-sm text-error-500">{error}</p>}
        {hint && !error && <p className="mt-1 text-sm text-gray-500">{hint}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";
