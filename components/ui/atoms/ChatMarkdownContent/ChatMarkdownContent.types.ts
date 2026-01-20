export interface ChatMarkdownContentProps {
  /** The markdown content to render */
  content: string;
  /** Additional CSS classes */
  className?: string;
  /** Whether to remove sources section from content */
  removeSourcesSection?: boolean;
}
