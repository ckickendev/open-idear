'use client';

interface AdminFilterSelectProps {
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
    className?: string;
}

const AdminFilterSelect = ({
    value,
    onChange,
    options,
    className = '',
}: AdminFilterSelectProps) => {
    const isActive = value !== options[0]?.value;

    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`
                px-3 py-2.5 text-sm rounded-lg border transition-all duration-150
                appearance-none bg-white bg-no-repeat bg-right
                pr-8
                ${isActive
                    ? 'border-admin-primary text-admin-primary bg-admin-primary-light'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }
                focus:outline-none focus:border-admin-primary focus:ring-2 focus:ring-admin-primary-ring
                ${className}
            `}
            style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
                backgroundPosition: 'right 8px center',
            }}
        >
            {options.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    );
};

export default AdminFilterSelect;
