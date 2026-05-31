export const TextAreaCustom = ({
  id,
  value,
  onChange,
  rows,
  className,
  placeholder,
}: any) => {
  return (
    <textarea
      id={id}
      value={value}
      onChange={(e) => onChange(e)}
      rows={rows}
      className={
        "block p-2.5 w-full text-sm text-foreground bg-muted/30 rounded-lg border border-red-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-accent dark:border-border dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 " +
        className
      }
      placeholder={placeholder}
    ></textarea>
  );
};
