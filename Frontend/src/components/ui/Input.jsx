export function Input({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  required,
  className = "",
  helper,
  error,
  disabled,
  maxLength,
}) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        maxLength={maxLength}
        className={`px-3 py-2 text-sm rounded-lg border transition-colors
          bg-white dark:bg-gray-900
          border-gray-300 dark:border-gray-700
          text-gray-900 dark:text-gray-100
          placeholder-gray-400 dark:placeholder-gray-600
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
          disabled:opacity-50 disabled:bg-gray-50 dark:disabled:bg-gray-800
          ${error ? "border-red-500 focus:ring-red-500" : ""}`}
      />
      {helper && <p className="text-xs text-gray-500 dark:text-gray-400">{helper}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
