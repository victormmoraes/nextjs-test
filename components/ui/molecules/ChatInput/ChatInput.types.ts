export interface ChatInputProps {
  /** Callback when a message is sent */
  onSend: (message: string) => void;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Placeholder text */
  placeholder?: string;
  /** Maximum character length */
  maxLength?: number;
  /** Whether to show the reset button */
  showResetButton?: boolean;
  /** Callback when reset is clicked */
  onReset?: () => void;
  /** Reset button title/tooltip */
  resetTitle?: string;
  /** Additional CSS classes for the container */
  className?: string;
}
