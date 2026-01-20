'use client';

export interface TruncatedTextCellProps {
  text: string;
  maxWidth?: string;
}

export function TruncatedTextCell({ text, maxWidth = '150px' }: TruncatedTextCellProps) {
  return (
    <span className="block truncate mx-auto" style={{ maxWidth }} title={text}>
      {text}
    </span>
  );
}
