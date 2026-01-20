import { InputHTMLAttributes } from 'react';
import { LucideIcon } from 'lucide-react';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: LucideIcon;
  suffixIcon?: LucideIcon;
  suffixIconClickable?: boolean;
  onSuffixIconClick?: () => void;
}
