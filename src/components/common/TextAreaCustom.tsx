export const TextAreaCustom = ({ id, value, onChange, rows, className, placeholder }: any) => {
    return <textarea 
        id={id}
        value={value}
        onChange={(e) => onChange(e)}
        rows={rows}
        className={'block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-red-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 ' + className}
        placeholder={placeholder}>
    </textarea>
};