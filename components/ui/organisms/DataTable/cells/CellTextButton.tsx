'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/atoms/Button';

export interface CellTextButtonProps {
  text: string;
  href?: string;
  onClick?: () => void;
}

export function CellTextButton({ text, href, onClick }: CellTextButtonProps) {
  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
  };

  if (href) {
    return (
      <div onClick={handleClick} data-no-row-click>
        <Link href={href} className="inline-block">
          <Button variant="primary" size="sm">
            {text}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div onClick={handleClick} data-no-row-click>
      <Button variant="primary" size="sm" onClick={onClick}>
        {text}
      </Button>
    </div>
  );
}
