import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface WrapperProps {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}

function FieldWrapper({ label, hint, error, required, children }: WrapperProps) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1.5 block text-sm font-medium text-ink-800">
          {label}
          {required && <span className="text-ink-400"> *</span>}
        </span>
      )}
      {children}
      {error ? (
        <span className="mt-1.5 block text-xs text-red-600">{error}</span>
      ) : hint ? (
        <span className="mt-1.5 block text-xs text-ink-500">{hint}</span>
      ) : null}
    </label>
  );
}

const baseInputClasses =
  'w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 transition-colors outline-none focus:border-ink-500 focus:ring-4 focus:ring-ink-900/5 disabled:bg-ink-50 disabled:text-ink-400';

interface InputProps extends InputHTMLAttributes<HTMLInputElement>, Omit<WrapperProps, 'children'> {}

export function Input({ label, hint, error, required, className, ...props }: InputProps) {
  return (
    <FieldWrapper label={label} hint={hint} error={error} required={required}>
      <input
        className={cn(baseInputClasses, error ? 'border-red-300' : 'border-ink-200', className)}
        {...props}
      />
    </FieldWrapper>
  );
}

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement>, Omit<WrapperProps, 'children'> {}

export function TextArea({ label, hint, error, required, className, ...props }: TextAreaProps) {
  return (
    <FieldWrapper label={label} hint={hint} error={error} required={required}>
      <textarea
        className={cn(baseInputClasses, 'resize-none', error ? 'border-red-300' : 'border-ink-200', className)}
        {...props}
      />
    </FieldWrapper>
  );
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement>, Omit<WrapperProps, 'children'> {}

export function Select({ label, hint, error, required, className, children, ...props }: SelectProps) {
  return (
    <FieldWrapper label={label} hint={hint} error={error} required={required}>
      <select
        className={cn(baseInputClasses, 'appearance-none bg-no-repeat', error ? 'border-red-300' : 'border-ink-200', className)}
        {...props}
      >
        {children}
      </select>
    </FieldWrapper>
  );
}
