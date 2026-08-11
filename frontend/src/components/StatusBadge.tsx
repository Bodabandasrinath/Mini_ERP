import React from 'react';

interface Props {
  status: string;
  type?: 'customer' | 'challan' | 'stock' | 'movement';
}

export const StatusBadge: React.FC<Props> = ({ status, type }) => {
  const getStyleClass = () => {
    switch (status.toUpperCase()) {
      case 'ACTIVE':
      case 'CONFIRMED':
      case 'IN':
        return 'badge-success';
      case 'LEAD':
      case 'DRAFT':
        return 'badge-warning';
      case 'INACTIVE':
      case 'CANCELLED':
      case 'OUT':
        return 'badge-danger';
      case 'RETAIL':
      case 'WHOLESALE':
      case 'DISTRIBUTOR':
        return 'badge-info';
      default:
        return 'badge-neutral';
    }
  };

  return <span className={`badge ${getStyleClass()}`}>{status}</span>;
};
