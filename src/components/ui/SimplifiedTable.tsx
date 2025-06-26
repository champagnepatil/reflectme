import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Download,
  RefreshCw,
  Settings,
  X,
  Check,
  AlertTriangle
} from 'lucide-react';
import { Button } from './button';
import { Input } from './input';

interface TableColumn<T = any> {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'date' | 'status' | 'actions' | 'custom';
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  render?: (value: any, item: T) => React.ReactNode;
  priority?: 'high' | 'medium' | 'low'; // For responsive hiding
}

interface SimplifiedTableProps<T = any> {
  data: T[];
  columns: TableColumn<T>[];
  title?: string;
  loading?: boolean;
  error?: string | null;
  
  // Actions
  onView?: (item: T) => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onRefresh?: () => void;
  onExport?: () => void;
  
  // Configuration
  pageSize?: number;
  searchable?: boolean;
  filterable?: boolean;
  sortable?: boolean;
  selectable?: boolean;
  expandable?: boolean;
  
  // Customization
  emptyMessage?: string;
  emptyActionText?: string;
  onEmptyAction?: () => void;
  
  // Responsive
  showAdvanced?: boolean;
  onToggleAdvanced?: () => void;
}

const SimplifiedTable = <T extends { id: string | number }>({
  data,
  columns,
  title,
  loading = false,
  error = null,
  onView,
  onEdit,
  onDelete,
  onRefresh,
  onExport,
  pageSize = 10,
  searchable = true,
  filterable = true,
  sortable = true,
  selectable = false,
  expandable = false,
  emptyMessage = "No data found",
  emptyActionText = "Add new item",
  onEmptyAction,
  showAdvanced = false,
  onToggleAdvanced
}: SimplifiedTableProps<T>) => {
  
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItems, setSelectedItems] = useState<Set<string | number>>(new Set());
  const [expandedItems, setExpandedItems] = useState<Set<string | number>>(new Set());
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [showFilters, setShowFilters] = useState(false);

  // Filter columns based on priority and advanced mode
  const visibleColumns = useMemo(() => {
    if (showAdvanced) return columns;
    
    return columns.filter(col => {
      if (col.priority === 'low') return false;
      return true;
    });
  }, [columns, showAdvanced]);

  // Filter and search data
  const filteredData = useMemo(() => {
    let result = [...data];

    // Search
    if (searchTerm) {
      const searchableColumns = visibleColumns.filter(col => col.type !== 'actions');
      result = result.filter(item => {
        return searchableColumns.some(col => {
          const value = item[col.key as keyof T];
          return String(value).toLowerCase().includes(searchTerm.toLowerCase());
        });
      });
    }

    // Filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        result = result.filter(item => {
          const itemValue = item[key as keyof T];
          return Array.isArray(value) ? value.includes(itemValue) : itemValue === value;
        });
      }
    });

    return result;
  }, [data, visibleColumns, searchTerm, filters]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key as keyof T];
      const bValue = b[sortConfig.key as keyof T];
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  // Paginate data
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  // Handlers
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

  const handleExpandItem = (id: string | number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'success':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderCell = (column: TableColumn<T>, item: T) => {
    const value = item[column.key as keyof T];

    if (column.render) {
      return column.render(value, item);
    }

    switch (column.type) {
      case 'status':
        return (
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(String(value))}`}>
            {String(value)}
          </span>
        );
      case 'date':
        return new Date(value).toLocaleDateString();
      case 'number':
        return typeof value === 'number' ? value.toLocaleString() : value;
      default:
        return String(value || '');
    }
  };

  const totalPages = Math.ceil(sortedData.length / pageSize);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          {title && <h2 className="text-xl font-semibold text-gray-900">{title}</h2>}
          <p className="text-sm text-gray-600 mt-1">
            {sortedData.length} of {data.length} items
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          {onToggleAdvanced && (
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleAdvanced}
            >
              <Settings className="w-4 h-4 mr-2" />
              {showAdvanced ? 'Simple' : 'Advanced'}
            </Button>
          )}
          
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          )}
          
          {onExport && (
            <Button
              variant="outline"
              size="sm"
              onClick={onExport}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        {searchable && (
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        )}
        
        {filterable && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
            {Object.keys(filters).length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                {Object.keys(filters).length}
              </span>
            )}
          </Button>
        )}
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-50 rounded-lg p-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {visibleColumns
                .filter(col => col.filterable && col.type !== 'actions')
                .map(col => (
                  <div key={col.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {col.label}
                    </label>
                    <Input
                      placeholder={`Filter ${col.label}...`}
                      value={filters[col.key] || ''}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        [col.key]: e.target.value
                      }))}
                    />
                  </div>
                ))}
            </div>
            <div className="flex items-center justify-end mt-4 space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilters({})}
              >
                Clear All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(false)}
              >
                <X className="w-4 h-4 mr-2" />
                Close
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {selectable && (
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedItems.size === paginatedData.length && paginatedData.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                  </th>
                )}
                
                {expandable && (
                  <th className="px-6 py-3 text-left w-12"></th>
                )}
                
                {visibleColumns.map(column => (
                  <th
                    key={column.key}
                    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                      column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                    }`}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{column.label}</span>
                      {column.sortable && sortConfig?.key === column.key && (
                        sortConfig.direction === 'asc' ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedData.map((item, index) => (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50"
                >
                  {selectable && (
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.has(item.id)}
                        onChange={(e) => handleSelectItem(item.id, e.target.checked)}
                        className="rounded border-gray-300"
                      />
                    </td>
                  )}
                  
                  {expandable && (
                    <td className="px-6 py-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleExpandItem(item.id)}
                      >
                        {expandedItems.has(item.id) ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </Button>
                    </td>
                  )}
                  
                  {visibleColumns.map(column => (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {renderCell(column, item)}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {paginatedData.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <AlertTriangle className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">{emptyMessage}</h3>
            {onEmptyAction && (
              <Button onClick={onEmptyAction}>
                {emptyActionText}
              </Button>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">Loading...</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} results
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            
            <span className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimplifiedTable; 