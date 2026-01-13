'use client';

import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  rightElement?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      rightElement,
      disabled,
      ...props
    },
    ref
  ) => {
    const hasError = !!error;

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-surface-300 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            type={type}
            disabled={disabled}
            className={cn(
              // Base styles
              'w-full h-10 px-3 rounded-lg text-sm text-white',
              'bg-surface-800 border transition-all duration-200',
              'placeholder:text-surface-500',
              'focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-surface-900',
              // States
              hasError
                ? 'border-red-500 focus:ring-red-500/50'
                : 'border-surface-600 hover:border-surface-500 focus:border-brand-500 focus:ring-brand-500/50',
              disabled && 'opacity-50 cursor-not-allowed bg-surface-900',
              // Icon padding
              leftIcon && 'pl-10',
              (rightIcon || rightElement) && 'pr-10',
              className
            )}
            {...props}
          />
          {(rightIcon || rightElement) && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500">
              {rightIcon || rightElement}
            </div>
          )}
        </div>
        {(error || hint) && (
          <p
            className={cn(
              'mt-1.5 text-xs',
              hasError ? 'text-red-400' : 'text-surface-500'
            )}
          >
            {error || hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// Textarea Component
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, disabled, ...props }, ref) => {
    const hasError = !!error;

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-surface-300 mb-1.5">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          disabled={disabled}
          className={cn(
            // Base styles
            'w-full min-h-[100px] px-3 py-2 rounded-lg text-sm text-white resize-y',
            'bg-surface-800 border transition-all duration-200',
            'placeholder:text-surface-500',
            'focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-surface-900',
            // States
            hasError
              ? 'border-red-500 focus:ring-red-500/50'
              : 'border-surface-600 hover:border-surface-500 focus:border-brand-500 focus:ring-brand-500/50',
            disabled && 'opacity-50 cursor-not-allowed bg-surface-900',
            className
          )}
          {...props}
        />
        {(error || hint) && (
          <p
            className={cn(
              'mt-1.5 text-xs',
              hasError ? 'text-red-400' : 'text-surface-500'
            )}
          >
            {error || hint}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

// Select Component
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, hint, options, placeholder, disabled, ...props }, ref) => {
    const hasError = !!error;

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-surface-300 mb-1.5">
            {label}
          </label>
        )}
        <select
          ref={ref}
          disabled={disabled}
          className={cn(
            // Base styles
            'w-full h-10 px-3 rounded-lg text-sm text-white appearance-none',
            'bg-surface-800 border transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-surface-900',
            'bg-[url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' fill=\'%239ca3af\' viewBox=\'0 0 16 16\'%3E%3Cpath d=\'M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z\'/%3E%3C/svg%3E")] bg-[length:16px] bg-[right_12px_center] bg-no-repeat',
            // States
            hasError
              ? 'border-red-500 focus:ring-red-500/50'
              : 'border-surface-600 hover:border-surface-500 focus:border-brand-500 focus:ring-brand-500/50',
            disabled && 'opacity-50 cursor-not-allowed bg-surface-900',
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" className="text-surface-500">
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value} className="bg-surface-800">
              {option.label}
            </option>
          ))}
        </select>
        {(error || hint) && (
          <p
            className={cn(
              'mt-1.5 text-xs',
              hasError ? 'text-red-400' : 'text-surface-500'
            )}
          >
            {error || hint}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
