import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PaginationMeta } from '../types';

interface Props {
  meta?: PaginationMeta;
  onPageChange: (newPage: number) => void;
}

export const Pagination: React.FC<Props> = ({ meta, onPageChange }) => {
  if (!meta || meta.totalPages <= 1) return null;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem',
        borderTop: '1px solid var(--border-color)',
        gap: '1rem',
        flexWrap: 'wrap',
      }}
    >
      <div style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
        Showing page <strong style={{ color: 'var(--text-primary)' }}>{meta.page}</strong> of{' '}
        <strong style={{ color: 'var(--text-primary)' }}>{meta.totalPages}</strong> ({meta.total} total items)
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          className="btn btn-secondary btn-sm"
          disabled={meta.page <= 1}
          onClick={() => onPageChange(meta.page - 1)}
        >
          <ChevronLeft size={16} /> Previous
        </button>
        <button
          className="btn btn-secondary btn-sm"
          disabled={meta.page >= meta.totalPages}
          onClick={() => onPageChange(meta.page + 1)}
        >
          Next <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
