import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface WrapperProps {
  label?: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}

function FieldWrapper({ label, hint, error, children }: WrapperProps) {
  return (
    <label id="field" className="field block">
      {label && <span id="field__label" className="field__label mb-1.5 block text-sm font-medium text-ink-800">{label}</span>}
      {children}
      {error ? (
        <span id="field__error" className="field__error mt-1.5 block text-xs text-red-600">{error}</span>
      ) : hint ? (
        <span id="field__hint" className="field__hint mt-1.5 block text-xs text-ink-500">{hint}</span>
      ) : null}
    </label>
  );
}

const baseInputClasses =
  'w-full rounded-xl border bg-ink-50 px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 transition-colors outline-none focus:border-ink-500 focus:ring-4 focus:ring-ink-900/5 disabled:bg-ink-100 disabled:text-ink-400';

interface InputProps extends InputHTMLAttributes<HTMLInputElement>, Omit<WrapperProps, 'children'> {}

export function Input({ label, hint, error, className, ...props }: InputProps) {
  return (
    <FieldWrapper label={label} hint={hint} error={error}>
      {/* `required` viaja con el resto de props hasta el control nativo: antes se
          quedaba aquí solo para pintar un asterisco y el navegador nunca llegaba
          a validar el campo. */}
      <input
        className={cn('field__control', baseInputClasses, error ? 'border-red-300' : 'border-ink-200', className)}
        {...props}
      />
    </FieldWrapper>
  );
}

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement>, Omit<WrapperProps, 'children'> {}

export function TextArea({ label, hint, error, className, ...props }: TextAreaProps) {
  return (
    <FieldWrapper label={label} hint={hint} error={error}>
      <textarea
        className={cn('field__control', baseInputClasses, 'resize-none', error ? 'border-red-300' : 'border-ink-200', className)}
        {...props}
      />
    </FieldWrapper>
  );
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement>, Omit<WrapperProps, 'children'> {}

export function Select({ label, hint, error, className, children, ...props }: SelectProps) {
  return (
    <FieldWrapper label={label} hint={hint} error={error}>
      <select
        className={cn('field__control', baseInputClasses, 'appearance-none bg-no-repeat', error ? 'border-red-300' : 'border-ink-200', className)}
        {...props}
      >
        {children}
      </select>
    </FieldWrapper>
  );
}
