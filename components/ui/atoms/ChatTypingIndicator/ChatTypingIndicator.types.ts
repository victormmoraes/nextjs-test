export type IndicatorType = 'dots' | 'cursor';

export interface ChatTypingIndicatorProps {
  /** Type of indicator: 'dots' for thinking, 'cursor' for streaming */
  type?: IndicatorType;
  /** Additional CSS classes */
  className?: string;
}
