import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  MoreHorizontal, 
  Eye,
  Download,
  Upload,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import EmptyState from '../ui/EmptyState';

export interface CRUDColumn<T = any> {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'date' | 'select' | 'boolean' | 'actions' | 'custom';
  sortable?: boolean;
  filterable?: boolean;
  searchable?: boolean;
  width?: string;
  render?: (value: any, item: T) => React.ReactNode;
  options?: { label: string; value: any }[]; // For select type
}

export interface CRUDTableProps<T = any> {
  title: string;
  data: T[];
  columns: CRUDColumn<T>[];
  loading?: boolean;
  error?: string | null;
  
  // CRUD Operations
  onCreate?: () => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onView?: (item: T) => void;
  onBulkDelete?: (items: T[]) => void;
  onRefresh?: () => void;
  
  // Permissions
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canView?: boolean;
  canExport?: boolean;
  canImport?: boolean;
  
  // Configuration
  pageSize?: number;
  searchPlaceholder?: string;
  emptyMessage?: string;
  emptyActionText?: string;
  onEmptyAction?: () => void;
  
  // Custom actions
  customActions?: {
    label: string;
    icon?: React.ReactNode;
    onClick: (item: T) => void;
    variant?: 'primary' | 'secondary' | 'danger';
  }[];
  
  // Bulk actions
  bulkActions?: {
    label: string;
    icon?: React.ReactNode;
    onClick: (items: T[]) => void;
    variant?: 'primary' | 'secondary' | 'danger';
  }[];
}

export function CRUDTable<T extends { id: string | number }>({
  title,
  data,
  columns,
  loading = false,
  error = null,
  onCreate,
  onEdit,
  onDelete,
  onView,
  onBulkDelete,
  onRefresh,
  canCreate = true,
  canEdit = true,
  canDelete = true,
  canView = true,
  canExport = false,
  canImport = false,
  pageSize = 10,
  searchPlaceholder = "Search...",
  emptyMessage = "No items found",
  emptyActionText = "Create new item",
  onEmptyAction,
  customActions = [],
  bulkActions = []
}: CRUDTableProps<T>) {
  
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItems, setSelectedItems] = useState<Set<string | number>>(new Set());
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<T | null>(null);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

  // Reset selection when data changes
  useEffect(() => {
    setSelectedItems(new Set());
  }, [data]);

  // Filter and search data
  const filteredData = data.filter(item => {
    // Search filter
    if (searchTerm) {
      const searchableColumns = columns.filter(col => col.searchable !== false);
      const matchesSearch = searchableColumns.some(col => {
        const value = item[col.key as keyof T];
        return String(value).toLowerCase().includes(searchTerm.toLowerCase());
      });
      if (!matchesSearch) return false;
    }

    // Column filters
    for (const [key, filterValue] of Object.entries(filters)) {
      if (filterValue !== undefined && filterValue !== '' && filterValue !== null) {
        const itemValue = item[key as keyof T];
        if (Array.isArray(filterValue)) {
          if (!filterValue.includes(itemValue)) return false;
        } else if (itemValue !== filterValue) {
          return false;
        }
      }
    }

    return true;
  });

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig) return 0;
    
    const aValue = a[sortConfig.key as keyof T];
    const bValue = b[sortConfig.key as keyof T];
    
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  // Paginate data
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const paginatedData = sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(new Set(paginatedData.map(item => item.id)));
    } else {
      setSelectedItems(new Set());
    }
  };

  const handleSelectItem = (id: string | number, checked: boolean) => {
    const newSelected = new Set(selectedItems);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedItems(newSelected);
  };

  // Sort handler
  const handleSort = (key: string) => {
    if (sortConfig?.key === key) {
      setSortConfig({
        key,
        direction: sortConfig.direction === 'asc' ? 'desc' : 'asc'
      });
    } else {
      setSortConfig({ key, direction: 'asc' });
    }
  };

  // Delete handlers
  const handleDelete = async (item: T) => {
    if (onDelete) {
      await onDelete(item);
      setShowDeleteConfirm(null);
    }
  };

  const handleBulkDelete = async () => {
    if (onBulkDelete && selectedItems.size > 0) {
      const itemsToDelete = data.filter(item => selectedItems.has(item.id));
      await onBulkDelete(itemsToDelete);
      setSelectedItems(new Set());
      setShowBulkDeleteConfirm(false);
    }
  };

  // Export handler
  const handleExport = () => {
    const csvContent = [
      columns.filter(col => col.type !== 'actions').map(col => col.label).join(','),
      ...filteredData.map(item => 
        columns.filter(col => col.type !== 'actions').map(col => {
          const value = item[col.key as keyof T];
          return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-neutral-200 p-6">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-error-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">Error Loading Data</h3>
          <p className="text-neutral-600 mb-4">{error}</p>
          {onRefresh && (
            <Button onClick={onRefresh} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
      {/* Header */}
      <div className="border-b border-neutral-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-neutral-900">{title}</h2>
          <div className="flex items-center space-x-2">
            {onRefresh && (
              <Button variant="outline" size="sm" onClick={onRefresh}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            )}
            {canImport && (
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
            )}
            {canExport && filteredData.length > 0 && (
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            )}
            {canCreate && onCreate && (
              <Button onClick={onCreate} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Create
              </Button>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <Input
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          
          {/* Column Filters */}
          {columns.filter(col => col.filterable && col.type === 'select').map(col => (
            <select
              key={col.key}
              value={filters[col.key] || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, [col.key]: e.target.value }))}
              className="input w-auto"
            >
              <option value="">All {col.label}</option>
              {col.options?.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ))}
        </div>

        {/* Bulk Actions */}
        {selectedItems.size > 0 && (
          <div className="mt-4 p-3 bg-primary-50 rounded-lg flex items-center justify-between">
            <span className="text-sm text-primary-700">
              {selectedItems.size} item{selectedItems.size > 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center space-x-2">
              {bulkActions.map((action, index) => (
                <Button
                  key={index}
                  size="sm"
                  variant={action.variant === 'danger' ? 'destructive' : 'outline'}
                  onClick={() => action.onClick(data.filter(item => selectedItems.has(item.id)))}
                >
                  {action.icon}
                  {action.label}
                </Button>
              ))}
              {canDelete && onBulkDelete && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setShowBulkDeleteConfirm(true)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary-600" />
          <p className="text-neutral-600">Loading...</p>
        </div>
      ) : paginatedData.length === 0 ? (
        <div className="p-8">
          {filteredData.length === 0 && data.length === 0 ? (
            // No data at all - show engaging empty state
            <EmptyState
              type="custom"
              title={emptyMessage}
              description={emptyMessage === "No clients found" ? 
                "Start building your practice by adding your first client. Our AI-powered platform helps you provide better care with intelligent insights and automated workflows." :
                emptyMessage === "No tasks found" ?
                "Create meaningful assignments and track client progress. Our AI helps generate personalized tasks based on treatment goals and client needs." :
                emptyMessage === "No assessments found" ?
                "Schedule and monitor client assessments to track treatment progress. Our platform supports multiple validated instruments with automated scoring and insights." :
                "Get started by creating your first item. Our platform provides powerful tools to help you succeed."
              }
              primaryAction={onEmptyAction ? {
                label: emptyActionText,
                onClick: onEmptyAction,
                variant: 'default',
                icon: <Plus className="w-5 h-5" />
              } : undefined}
              userRole="therapist"
            />
          ) : (
            // Search/filter returned no results
            <EmptyState
              type="search"
              title="No Results Found"
              description="We couldn't find any items matching your search. Try adjusting your search terms or explore our suggestions below."
              primaryAction={{
                label: 'Clear Search',
                onClick: () => setSearchTerm(''),
                variant: 'outline',
                icon: <RefreshCw className="w-4 h-4" />
              }}
              secondaryActions={[
                {
                  label: 'Clear Filters',
                  onClick: () => setFilters({}),
                  variant: 'outline',
                  icon: <Filter className="w-4 h-4" />
                }
              ]}
              userRole="therapist"
            />
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                {(canDelete || bulkActions.length > 0) && (
                  <th className="px-4 py-3 text-left w-12">
                    <input
                      type="checkbox"
                      checked={selectedItems.size === paginatedData.length && paginatedData.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-neutral-300"
                    />
                  </th>
                )}
                {columns.map(col => (
                  <th 
                    key={col.key}
                    className={`px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider ${col.width || ''}`}
                  >
                    {col.sortable !== false ? (
                      <button
                        onClick={() => handleSort(col.key)}
                        className="flex items-center hover:text-neutral-700"
                      >
                        {col.label}
                        {sortConfig?.key === col.key && (
                          <span className="ml-1">
                            {sortConfig.direction === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </button>
                    ) : (
                      col.label
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              <AnimatePresence>
                {paginatedData.map((item, index) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-neutral-50"
                  >
                    {(canDelete || bulkActions.length > 0) && (
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedItems.has(item.id)}
                          onChange={(e) => handleSelectItem(item.id, e.target.checked)}
                          className="rounded border-neutral-300"
                        />
                      </td>
                    )}
                    {columns.map(col => (
                      <td key={col.key} className="px-4 py-3 text-sm text-neutral-900">
                        {col.type === 'actions' ? (
                          <div className="flex items-center space-x-2">
                            {canView && onView && (
                              <Button size="sm" variant="ghost" onClick={() => onView(item)}>
                                <Eye className="w-4 h-4" />
                              </Button>
                            )}
                            {canEdit && onEdit && (
                              <Button size="sm" variant="ghost" onClick={() => onEdit(item)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                            )}
                            {customActions.map((action, actionIndex) => (
                              <Button
                                key={actionIndex}
                                size="sm"
                                variant="ghost"
                                onClick={() => action.onClick(item)}
                              >
                                {action.icon}
                              </Button>
                            ))}
                            {canDelete && onDelete && (
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => setShowDeleteConfirm(item)}
                                className="text-error-600 hover:text-error-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        ) : col.render ? (
                          col.render(item[col.key as keyof T], item)
                        ) : col.type === 'date' ? (
                          new Date(item[col.key as keyof T] as string).toLocaleDateString()
                        ) : col.type === 'boolean' ? (
                          item[col.key as keyof T] ? (
                            <CheckCircle2 className="w-4 h-4 text-success-600" />
                          ) : (
                            <X className="w-4 h-4 text-neutral-400" />
                          )
                        ) : (
                          String(item[col.key as keyof T] || '')
                        )}
                      </td>
                    ))}
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="border-t border-neutral-200 px-4 py-3 flex items-center justify-between">
          <div className="text-sm text-neutral-700">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length} results
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <span className="text-sm text-neutral-700">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modals */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
            >
              <div className="flex items-center mb-4">
                <AlertTriangle className="w-6 h-6 text-error-500 mr-3" />
                <h3 className="text-lg font-semibold text-neutral-900">Confirm Delete</h3>
              </div>
              <p className="text-neutral-600 mb-6">
                Are you sure you want to delete this item? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setShowDeleteConfirm(null)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={() => handleDelete(showDeleteConfirm)}>
                  Delete
                </Button>
              </div>
            </motion.div>
          </div>
        )}

        {showBulkDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
            >
              <div className="flex items-center mb-4">
                <AlertTriangle className="w-6 h-6 text-error-500 mr-3" />
                <h3 className="text-lg font-semibold text-neutral-900">Confirm Bulk Delete</h3>
              </div>
              <p className="text-neutral-600 mb-6">
                Are you sure you want to delete {selectedItems.size} item{selectedItems.size > 1 ? 's' : ''}? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setShowBulkDeleteConfirm(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleBulkDelete}>
                  Delete {selectedItems.size} Item{selectedItems.size > 1 ? 's' : ''}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
} 