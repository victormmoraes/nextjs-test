export type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';
export type SpinnerType = 'circular' | 'dots' | 'pulse' | 'ring';

export interface SpinnerProps {
  size?: SpinnerSize;
  type?: SpinnerType;
  overlay?: boolean;
  message?: string;
  fullHeight?: boolean;
}
