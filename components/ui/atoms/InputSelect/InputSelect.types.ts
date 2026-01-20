export interface SelectOption {
  value: string;
  label: string;
}

export interface InputSelectProps {
  id?: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  hint?: string;
  options: SelectOption[];
  value?: string;
  customDisplayValue?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
}
