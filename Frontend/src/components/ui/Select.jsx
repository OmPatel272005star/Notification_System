export function Select({
  label,
  value,
  onChange,
  options = [],
  placeholder = "Select...",
  required,
  className = "",
  disabled,
}) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="px-3 py-2 text-sm rounded-lg border transition-colors
          bg-white dark:bg-gray-900
          border-gray-300 dark:border-gray-700
          text-gray-900 dark:text-gray-100
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
          disabled:opacity-50"
      >
        <option value="">{placeholder}</option>
        {options.map((o) =>
          typeof o === "string" ? (
            <option key={o} value={o}>{o}</option>
          ) : (
            <option key={o.value} value={o.value}>{o.label}</option>
          )
        )}
      </select>
    </div>
  );
}
