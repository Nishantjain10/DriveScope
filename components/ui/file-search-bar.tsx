"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
    Search,
    X,
    Filter,
    SortAsc,
    SortDesc,
    FileIcon,
    FolderIcon,
    Calendar,
} from "lucide-react";

function useDebounce<T>(value: T, delay: number = 300): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(timer);
        };
    }, [value, delay]);

    return debouncedValue;
}

export interface FileSearchFilters {
    query: string;
    sortBy: 'name' | 'date';
    sortOrder: 'asc' | 'desc';
    fileType: 'all' | 'files' | 'folders';
    indexStatus: 'all' | 'indexed' | 'pending' | 'error' | 'deindexed' | 'not-indexed' | 'no-status';
}

interface FileSearchBarProps {
    onFiltersChange: (filters: FileSearchFilters) => void;
    className?: string;
    placeholder?: string;
}

const filterOptions = [
    { value: 'all' as const, label: 'All Types', icon: <Search className="w-3 h-3" /> },
    { value: 'files' as const, label: 'Files Only', icon: <FileIcon className="w-3 h-3" /> },
    { value: 'folders' as const, label: 'Folders Only', icon: <FolderIcon className="w-3 h-3" /> },
];

const statusOptions = [
    { value: 'all' as const, label: 'All Status', variant: 'outline' as const },
    { value: 'indexed' as const, label: 'Indexed', variant: 'outline' as const },
    { value: 'pending' as const, label: 'Pending', variant: 'outline' as const },
    { value: 'error' as const, label: 'Error', variant: 'outline' as const },
    { value: 'deindexed' as const, label: 'De-Indexed', variant: 'outline' as const },
    { value: 'not-indexed' as const, label: 'Not Indexed', variant: 'outline' as const },
    { value: 'no-status' as const, label: 'No Status', variant: 'outline' as const },
];

export function FileSearchBar({ 
    onFiltersChange, 
    className = "", 
    placeholder = "Search files and folders..." 
}: FileSearchBarProps) {
    const [query, setQuery] = useState("");
    const [filters, setFilters] = useState<FileSearchFilters>({
        query: "",
        sortBy: 'name',
        sortOrder: 'asc',
        fileType: 'all',
        indexStatus: 'all',
    });

    const debouncedQuery = useDebounce(query, 300);
    const onFiltersChangeRef = useRef(onFiltersChange);
    const prevQueryRef = useRef(query);

    // Update ref when callback changes
    useEffect(() => {
        onFiltersChangeRef.current = onFiltersChange;
    }, [onFiltersChange]);

    // Handle debounced query changes
    useEffect(() => {
        if (debouncedQuery !== prevQueryRef.current) {
            const updatedFilters = { ...filters, query: debouncedQuery };
            setFilters(updatedFilters);
            onFiltersChangeRef.current(updatedFilters);
            prevQueryRef.current = debouncedQuery;
        }
    }, [debouncedQuery, filters]);

    const handleFilterChange = (key: keyof FileSearchFilters, value: string) => {
        const updatedFilters = { ...filters, [key]: value };
        setFilters(updatedFilters);
        onFiltersChange(updatedFilters);
    };

    const handleSortToggle = () => {
        const newOrder = filters.sortOrder === 'asc' ? 'desc' : 'asc';
        handleFilterChange('sortOrder', newOrder);
    };

    const clearSearch = () => {
        setQuery("");
        const clearedFilters: FileSearchFilters = {
            query: "",
            sortBy: 'name',
            sortOrder: 'asc',
            fileType: 'all',
            indexStatus: 'all',
        };
        setFilters(clearedFilters);
        onFiltersChange(clearedFilters);
    };

    const hasActiveFilters = query || filters.fileType !== 'all' || filters.indexStatus !== 'all';

    return (
        <div className={`file-search-container w-full ${className}`}>
            {/* Main Search Input */}
            <div className="search-input-wrapper relative flex items-center gap-2 mb-4">
                <div className="search-input-group relative flex-1">
                    <Search className="search-icon absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                        type="text"
                        placeholder={placeholder}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="search-input pl-10 pr-10"
                    />
                    {query && (
                        <button
                            onClick={() => setQuery("")}
                            className="clear-search absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
                
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className="filter-toggle-btn"
                        >
                            <Filter className="w-4 h-4 mr-2" />
                            Filters
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-80 p-4" align="end">
                        <div className="filter-content space-y-4">
                            {/* Sort Controls */}
                            <div className="sort-controls">
                                <label className="filter-label text-sm font-medium text-foreground mb-2 block">
                                    Sort By
                                </label>
                                <div className="sort-options flex items-center gap-2">
                                    <Button
                                        variant={filters.sortBy === 'name' ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => handleFilterChange('sortBy', 'name')}
                                        className="sort-name-btn"
                                    >
                                        Name
                                    </Button>
                                    <Button
                                        variant={filters.sortBy === 'date' ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => handleFilterChange('sortBy', 'date')}
                                        className="sort-date-btn"
                                    >
                                        <Calendar className="w-3 h-3 mr-1" />
                                        Date
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleSortToggle}
                                        className="sort-order-btn"
                                    >
                                        {filters.sortOrder === 'asc' ? (
                                            <SortAsc className="w-4 h-4" />
                                        ) : (
                                            <SortDesc className="w-4 h-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>

                            {/* File Type Filter */}
                            <div className="file-type-filter">
                                <label className="filter-label text-sm font-medium text-foreground mb-2 block">
                                    File Type
                                </label>
                                <div className="file-type-options flex items-center gap-2 flex-wrap">
                                    {filterOptions.map((option) => (
                                        <Button
                                            key={option.value}
                                            variant={filters.fileType === option.value ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => handleFilterChange('fileType', option.value)}
                                            className={`file-type-${option.value}-btn`}
                                        >
                                            {option.icon}
                                            <span className="ml-1">{option.label}</span>
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            {/* Index Status Filter */}
                            <div className="index-status-filter">
                                <label className="filter-label text-sm font-medium text-foreground mb-2 block">
                                    Index Status
                                </label>
                                <div className="status-options flex items-center gap-2 flex-wrap">
                                    {statusOptions.map((option) => (
                                        <Badge
                                            key={option.value}
                                            variant={filters.indexStatus === option.value ? "default" : option.variant}
                                            className={`status-${option.value}-badge cursor-pointer transition-colors hover:opacity-80`}
                                            onClick={() => handleFilterChange('indexStatus', option.value)}
                                        >
                                            {option.label}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>

                {hasActiveFilters && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearSearch}
                        className="clear-all-btn text-muted-foreground"
                    >
                        Clear All
                    </Button>
                )}
            </div>

            {/* Active Filters Summary */}
            {hasActiveFilters && (
                <div className="active-filters-summary flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <span>Active filters:</span>
                    {query && (
                        <Badge variant="secondary" className="filter-query-badge">
                            Search: &quot;{query}&quot;
                        </Badge>
                    )}
                    {filters.fileType !== 'all' && (
                        <Badge variant="secondary" className="filter-type-badge">
                            Type: {filters.fileType}
                        </Badge>
                    )}
                    {filters.indexStatus !== 'all' && (
                        <Badge variant="secondary" className="filter-status-badge">
                            Status: {filters.indexStatus}
                        </Badge>
                    )}
                    <Badge variant="secondary" className="filter-sort-badge">
                        Sort: {filters.sortBy} ({filters.sortOrder})
                    </Badge>
                </div>
            )}
        </div>
    );
}

export { useDebounce };
