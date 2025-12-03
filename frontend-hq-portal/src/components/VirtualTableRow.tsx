import type { CSSProperties } from 'react';
import { useState } from 'react';
import type { Row } from '@tanstack/react-table';
import type { VirtualItem } from '@tanstack/react-virtual';
import { flexRender } from '@tanstack/react-table';

const ACTION_COLUMN_ID = 'actions';

interface VirtualTableRowProps<TData> {
  row: Row<TData>;
  virtualRow: VirtualItem;
  totalTableWidth: number;
  showActionShadow: boolean;
}

export const VirtualTableRow = <TData,>({
  row,
  virtualRow,
  totalTableWidth,
  showActionShadow,
}: VirtualTableRowProps<TData>) => {
  const [isHovered, setIsHovered] = useState(false);

  const baseCellStyle: CSSProperties = {
    overflow: 'hidden',
    height: 48,
    display: 'flex',
    alignItems: 'center',
    borderBottom: '1px solid #dee2e6',
    padding: '0 16px',
    boxSizing: 'border-box',
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: totalTableWidth,
        height: 48,
        transform: `translateY(${virtualRow.start}px)`,
        borderBottom: '1px solid #dee2e6',
        backgroundColor: isHovered ? 'var(--mantine-color-gray-0)' : 'transparent',
        transition: 'background-color 100ms ease',
        display: 'flex',
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <div
          key={cell.id}
          style={{
            ...baseCellStyle,
            width: cell.column.getSize(),
            minWidth: cell.column.getSize(),
            maxWidth: cell.column.getSize(),
            ...(cell.column.id === ACTION_COLUMN_ID
              ? {
                  position: 'sticky',
                  right: 0,
                  backgroundColor: isHovered ? 'var(--mantine-color-gray-0)' : 'white',
                  boxShadow: showActionShadow ? 'inset 3px 0 6px -4px rgba(15, 23, 42, 0.2)' : 'none',
                  zIndex: 1,
                  transition: 'background-color 100ms ease, box-shadow 120ms ease',
                }
              : undefined),
          }}
        >
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </div>
      ))}
    </div>
  );
};
