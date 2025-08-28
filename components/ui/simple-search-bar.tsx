"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    X,
    Filter,
    SortAsc,
    SortDesc,
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

export interface SearchFilters {
    query: string;
    sortBy: 'name' | 'date';
    sortOrder: 'asc' | 'desc';
}

interface SimpleSearchBarProps {
    onSearch: (filters: SearchFilters) => void;
    className?: string;
    placeholder?: string;
}

export function SimpleSearchBar({ 
    onSearch, 
    className = "", 
    placeholder = "Search files and folders..." 
}: SimpleSearchBarProps) {
    const [query, setQuery] = useState("");
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [sortBy, setSortBy] = useState<'name' | 'date'>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    const debouncedQuery = useDebounce(query, 300);

    useEffect(() => {
        onSearch({
            query: debouncedQuery,
            sortBy,
            sortOrder,
        });
    }, [debouncedQuery, sortBy, sortOrder, onSearch]);

    const clearSearch = () => {
        setQuery("");
        setSortBy('name');
        setSortOrder('asc');
        setShowAdvanced(false);
    };

    const toggleSort = () => {
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    };

    return (
        <div className={`simple-search-wrapper w-full max-w-2xl mx-auto ${className}`}>
            {/* Main Search Input - Clean like 21st.dev */}
            <div className="search-input-container relative">
                <div className="search-input-wrapper relative">
                    <Search className="search-icon absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                        type="text"
                        placeholder={placeholder}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="search-input h-11 pl-10 pr-20 text-base border-2 rounded-lg focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                    <div className="search-actions absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                        {query && (
                            <button
                                onClick={() => setQuery("")}
                                className="clear-btn p-1 text-muted-foreground hover:text-foreground rounded transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            className="filter-btn p-1 h-8 w-8"
                        >
                            <Filter className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Minimal Advanced Options */}
            <AnimatePresence>
                {showAdvanced && (
                    <motion.div
                        className="advanced-options mt-3 p-3 border rounded-lg bg-muted/30"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="options-content flex items-center justify-between">
                            <div className="sort-controls flex items-center gap-2">
                                <span className="sort-label text-sm text-muted-foreground">Sort by:</span>
                                <Button
                                    variant={sortBy === 'name' ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setSortBy('name')}
                                    className="sort-name-btn h-7 px-3 text-xs"
                                >
                                    Name
                                </Button>
                                <Button
                                    variant={sortBy === 'date' ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setSortBy('date')}
                                    className="sort-date-btn h-7 px-3 text-xs"
                                >
                                    Date
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={toggleSort}
                                    className="sort-order-btn h-7 w-7 p-0"
                                >
                                    {sortOrder === 'asc' ? (
                                        <SortAsc className="w-3 h-3" />
                                    ) : (
                                        <SortDesc className="w-3 h-3" />
                                    )}
                                </Button>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearSearch}
                                className="clear-all-btn text-xs text-muted-foreground h-7"
                            >
                                Clear
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Search Status */}
            {query && (
                <div className="search-status mt-2 text-sm text-muted-foreground">
                    Searching for "{query}" • Sorted by {sortBy} ({sortOrder === 'asc' ? 'A-Z' : 'Z-A'})
                </div>
            )}
        </div>
    );
}
