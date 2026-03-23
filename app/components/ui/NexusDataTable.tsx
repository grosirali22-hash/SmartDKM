'use client';

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  ArrowUpDown,
  Filter,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
  width?: string;
  sortable?: boolean;
}

interface NexusDataTableProps<T> {
  title: string;
  data: T[];
  columns: Column<T>[];
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  isLoading?: boolean;
  searchPlaceholder?: string;
  itemsPerPage?: number;
  subtitle?: string;
}

const NexusDataTableComponent = function NexusDataTable<T extends { id: string | number }>({
  title,
  data,
  columns,
  onEdit,
  onDelete,
  isLoading = false,
  searchPlaceholder = "Cari data...",
  itemsPerPage = 10,
  subtitle
}: NexusDataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: keyof T; direction: 'asc' | 'desc' } | null>(null);

  // Filter & Sort Data Memoized
  const sortedAndFilteredData = useMemo(() => {
    let filtered = data;
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = data.filter(item => {
        return Object.values(item).some(val => 
          String(val).toLowerCase().includes(lowerSearch)
        );
      });
    }

    if (!sortConfig) return filtered;

    return [...filtered].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, searchTerm, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(sortedAndFilteredData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    return sortedAndFilteredData.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [sortedAndFilteredData, currentPage, itemsPerPage]);

  const handleSort = (key: keyof T) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  return (
    <div className="w-full bg-card/40 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl overflow-hidden transition-all duration-500 hover:shadow-blue-500/10 hover:border-blue-500/20">
      {/* Table Header */}
      <div className="p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-br from-white/5 to-transparent">
        <div>
          <h3 className="text-2xl font-black text-foreground tracking-tighter">{title}</h3>
          <p className="text-[10px] font-black uppercase tracking-[3px] text-muted-foreground mt-1">
            {subtitle || `Total ${data.length} Data Terdaftar`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group flex-1 md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-5 py-3.5 bg-white/5 border border-white/10 rounded-lg text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white/10 transition-all"
            />
          </div>
          <button className="p-3.5 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all text-muted-foreground">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto scrollbar-hide">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 border-b border-white/5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  style={{ width: col.width }}
                  className={`px-4 py-3 whitespace-nowrap cursor-pointer hover:text-foreground transition-colors ${col.className}`}
                  onClick={() => col.sortable && typeof col.accessor === 'string' && handleSort(col.accessor as keyof T)}
                >
                  <div className="flex items-center gap-2">
                    {col.header}
                    {col.sortable && <ArrowUpDown className="w-3 h-3 opacity-30" />}
                  </div>
                </th>
              ))}
              {(onEdit || onDelete) && <th className="px-4 py-3 text-right w-20">Aksi</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            <AnimatePresence mode="popLayout">
              {paginatedData.map((item, rowIdx) => (
                <motion.tr
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  key={item.id}
                  className="group hover:bg-blue-500/5 transition-colors border-l-4 border-transparent hover:border-blue-500"
                >
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className={`px-4 py-3 ${col.className}`}>
                      <div className="text-sm font-bold text-foreground group-hover:text-blue-600 transition-colors">
                        {typeof col.accessor === 'function'
                          ? col.accessor(item)
                          : (item[col.accessor] as React.ReactNode)}
                      </div>
                    </td>
                  ))}
                  {(onEdit || onDelete) && (
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                        {onEdit && (
                          <button onClick={() => onEdit(item)} className="p-2 bg-blue-500/10 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all">
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {onDelete && (
                          <button onClick={() => onDelete(item)} className="p-2 bg-rose-500/10 text-rose-600 rounded-lg hover:bg-rose-600 hover:text-white transition-all">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </motion.tr>
              ))}
            </AnimatePresence>

            {!isLoading && paginatedData.length === 0 && (
              <tr>
                <td colSpan={columns.length + 1} className="py-20 text-center">
                  <div className="flex flex-col items-center gap-4 text-muted-foreground">
                    <div className="w-16 h-16 bg-white/5 rounded-md flex items-center justify-center">
                      <Search className="w-6 h-6 opacity-20" />
                    </div>
                    <div>
                      <p className="font-black text-sm uppercase tracking-widest">Tidak Ada Data</p>
                      <p className="text-[10px] font-bold mt-1">Gunakan kata kunci lain atau tambah data baru.</p>
                    </div>
                  </div>
                </td>
              </tr>
            )}

            {isLoading && (
              <tr>
                <td colSpan={columns.length + 1} className="py-20 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-md animate-spin" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Memuat Data...</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="p-6 bg-white/5 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            Halaman {currentPage} dari {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="p-3 bg-white/5 border border-white/10 rounded-lg text-muted-foreground hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-10 h-10 rounded-lg font-black text-xs transition-all ${currentPage === i + 1 ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-white/5 text-muted-foreground hover:bg-white/10'}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="p-3 bg-white/5 border border-white/10 rounded-lg text-muted-foreground hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const NexusDataTable = React.memo(NexusDataTableComponent) as <T extends { id: string | number }>(props: NexusDataTableProps<T>) => JSX.Element;

export default NexusDataTable;
