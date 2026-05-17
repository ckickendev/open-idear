'use client';
import { Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface AdminSearchInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    debounceMs?: number;
    className?: string;
}

const AdminSearchInput = ({
    value,
    onChange,
    placeholder = 'Tìm kiếm...',
    debounceMs = 300,
    className = '',
}: AdminSearchInputProps) => {
    const [localValue, setLocalValue] = useState(value);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    const handleChange = (newValue: string) => {
        setLocalValue(newValue);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            onChange(newValue);
        }, debounceMs);
    };

    const handleClear = () => {
        setLocalValue('');
        onChange('');
    };

    return (
        <div className={`relative flex-1 ${className}`}>
            <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                size={16}
            />
            <input
                type="text"
                value={localValue}
                onChange={(e) => handleChange(e.target.value)}
                placeholder={placeholder}
                className="w-full pl-10 pr-10 py-2.5 text-sm bg-white border border-gray-200 rounded-lg 
                    transition-all duration-150
                    placeholder:text-gray-400
                    hover:border-gray-300
                    focus:outline-none focus:border-admin-primary focus:ring-2 focus:ring-admin-primary-ring"
            />
            {localValue && (
                <button
                    onClick={handleClear}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-0.5 rounded-full hover:bg-gray-100"
                    aria-label="Clear search"
                >
                    <X size={14} />
                </button>
            )}
        </div>
    );
};

export default AdminSearchInput;
