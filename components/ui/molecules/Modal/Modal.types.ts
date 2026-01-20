import { ReactNode } from 'react';

export interface ModalProps {
  title?: string;
  maxWidth?: string;
  footer?: ReactNode;
  children: ReactNode;
  onClose: () => void;
}
