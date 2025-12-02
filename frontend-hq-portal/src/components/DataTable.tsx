import { useRef, useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Stack,
  Text,
  Button,
  ActionIcon,
  Group,
  TextInput,
} from '@mantine/core';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table';
import type {
  ColumnDef,
  SortingState,
  ColumnSizingState,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  IconAlertCircle,
  IconSparkles,
  IconChevronLeft,
  IconChevronRight,
  IconSearch,
  IconX,
} from '@tabler/icons-react';
import { CenterLoader } from './CenterLoader';
import { VirtualTableRow } from './VirtualTableRow';

interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  emptyMessage?: string;
  totalItems?: number;
  page?: number;
  onPageChange?: (page: number) => void;
  pageSize?: number;
  onPageSizeChange?: (pageSize: number) => void;
  manualPagination?: boolean;
  enableSearch?: boolean;
  searchPlaceholder?: string;
  height?: number | string;
  actionColumnId?: string;
}

export const DataTable = <TData,>({
  data,
  columns,
  loading = false,
  error = null,
  onRetry,
  emptyMessage = 'No items found',
  totalItems,
  page = 1,
  onPageChange,
  pageSize = 50,
  manualPagination = false,
  enableSearch = false,
  searchPlaceholder = 'Search...',
  actionColumnId = 'actions',
}: DataTableProps<TData>) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({});
  const [showActionShadow, setShowActionShadow] = useState(false);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
      columnSizing,
      pagination: {
        pageIndex: page - 1,
        pageSize,
      },
    },
    manualPagination,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnSizingChange: setColumnSizing,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    columnResizeMode: 'onChange',
  });

  const { rows } = table.getRowModel();

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 48,
    overscan: 5,
  });

  const totalTableWidth = table.getVisibleLeafColumns().reduce((sum, col) => sum + col.getSize(), 0);

  const updateActionShadow = useCallback(() => {
    const container = tableContainerRef.current;
    if (!container) {
      setShowActionShadow(false);
      return;
    }

    const { scrollWidth, clientWidth, scrollLeft } = container;
    const hasHorizontalScroll = scrollWidth - clientWidth > 1;
    if (!hasHorizontalScroll) {
      setShowActionShadow(false);
      return;
    }

    const isAtRightEdge = scrollLeft + clientWidth >= scrollWidth - 1;
    setShowActionShadow(!isAtRightEdge);
  }, []);

  useEffect(() => {
    const container = tableContainerRef.current;
    if (!container) return;

    const handleScroll = () => updateActionShadow();
    container.addEventListener('scroll', handleScroll);
    
    // Also resize observer to handle container resize
    const observer = new ResizeObserver(handleScroll);
    observer.observe(container);

    updateActionShadow();

    return () => {
      container.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, [updateActionShadow, rows.length, totalTableWidth]);

  const totalPages = manualPagination 
    ? Math.ceil((totalItems || 0) / pageSize) 
    : table.getPageCount();

  const currentPage = manualPagination ? page : table.getState().pagination.pageIndex + 1;

  const handlePageChange = (newPage: number) => {
    if (manualPagination) {
      onPageChange?.(newPage);
    } else {
      table.setPageIndex(newPage - 1);
    }
  };

  return (
    <Paper shadow="none" p={0} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {enableSearch && (
        <Box p="md" style={{ borderBottom: '1px solid #dee2e6' }}>
          <TextInput
            placeholder={searchPlaceholder}
            value={globalFilter ?? ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            leftSection={<IconSearch size={16} />}
            rightSection={
              globalFilter ? (
                <ActionIcon variant="subtle" color="gray" onClick={() => setGlobalFilter('')}>
                  <IconX size={14} />
                </ActionIcon>
              ) : null
            }
          />
        </Box>
      )}

      <Box style={{ flex: 1, minHeight: 0, position: 'relative' }}>
        {loading ? (
          <CenterLoader message="Loading items..." />
        ) : error ? (
          <Stack align="center" justify="center" h="100%" gap="sm">
            <IconAlertCircle size={24} color="var(--mantine-color-red-6)" />
            <Text fw={600}>{error}</Text>
            {onRetry && (
              <Button variant="light" onClick={onRetry}>
                Retry
              </Button>
            )}
          </Stack>
        ) : rows.length === 0 ? (
          <Stack align="center" justify="center" h="100%" gap="sm">
            <IconSparkles size={24} color="var(--mantine-color-gray-6)" />
            <Text fw={600}>{emptyMessage}</Text>
          </Stack>
        ) : (
          <Box
            ref={tableContainerRef}
            style={{
              overflow: 'auto',
              height: '100%',
              position: 'relative',
            }}
          >
            <div
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                width: totalTableWidth,
                position: 'relative',
              }}
            >
              <div
                style={{
                  position: 'sticky',
                  top: 0,
                  zIndex: 2,
                  display: 'flex',
                  width: totalTableWidth,
                  height: 40,
                  backgroundColor: 'var(--mantine-color-gray-0)',
                  borderBottom: '1px solid #dee2e6',
                }}
              >
                {table.getFlatHeaders().map((header) => (
                  <div
                    key={header.id}
                    style={{
                      width: header.getSize(),
                      minWidth: header.getSize(),
                      maxWidth: header.getSize(),
                      padding: '0 16px',
                      display: 'flex',
                      alignItems: 'center',
                      fontWeight: 600,
                      fontSize: 12,
                      color: 'var(--mantine-color-gray-7)',
                      cursor: header.column.getCanSort() ? 'pointer' : 'default',
                      userSelect: 'none',
                      ...(header.id === actionColumnId
                        ? {
                            position: 'sticky',
                            right: 0,
                            backgroundColor: 'var(--mantine-color-gray-0)',
                            boxShadow: showActionShadow ? 'inset 3px 0 6px -4px rgba(15, 23, 42, 0.2)' : 'none',
                            zIndex: 3,
                            transition: 'box-shadow 120ms ease',
                          }
                        : undefined),
                    }}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {{
                      asc: ' ▴',
                      desc: ' ▾',
                    }[header.column.getIsSorted() as string] ?? null}
                  </div>
                ))}
              </div>

              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const row = rows[virtualRow.index];
                return (
                  <VirtualTableRow
                    key={row.id}
                    row={row}
                    virtualRow={virtualRow}
                    totalTableWidth={totalTableWidth}
                    showActionShadow={showActionShadow}
                  />
                );
              })}
            </div>
          </Box>
        )}
      </Box>

      <Box p="xs" style={{ borderTop: '1px solid #dee2e6' }}>
        <Group justify="space-between">
          <Text size="xs" c="dimmed">
            {manualPagination ? totalItems : rows.length} items
          </Text>
          <Group gap="xs">
            <ActionIcon
              variant="subtle"
              disabled={currentPage <= 1 || loading}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              <IconChevronLeft size={16} />
            </ActionIcon>
            <Text size="sm">
              Page {currentPage} of {totalPages || 1}
            </Text>
            <ActionIcon
              variant="subtle"
              disabled={currentPage >= totalPages || loading}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              <IconChevronRight size={16} />
            </ActionIcon>
          </Group>
        </Group>
      </Box>
    </Paper>
  );
};
