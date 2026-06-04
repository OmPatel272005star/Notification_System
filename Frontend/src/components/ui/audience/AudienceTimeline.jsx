function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return Math.floor(seconds) + " seconds ago";
}

export default function AudienceTimeline({ entries = [] }) {
  if (!entries || entries.length === 0) {
    return <p className="text-sm text-gray-500 dark:text-gray-400">No history available.</p>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Activity Timeline</h3>
      <div className="relative pl-4 border-l border-gray-200 dark:border-[#2A2F3A] space-y-6">
        {entries.map((entry, idx) => {
          const actionColor =
            entry.action === 'created' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' :
            entry.action === 'imported' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400' :
            'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400';

          return (
            <div key={idx} className="relative">
              <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-white dark:bg-[#161B22] border-2 border-[#6D5EF5]" />
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
                    {entry.edited_by?.display_name || entry.edited_by?.email || 'Unknown User'}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${actionColor}`}>
                    {entry.action}
                  </span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {timeAgo(entry.edited_at)}
                </span>
                
                {entry.changed_fields && entry.changed_fields.length > 0 && (
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 flex flex-wrap gap-1 items-center">
                    <span className="text-xs">Updated:</span>
                    {entry.changed_fields.map(field => (
                      <span key={field} className="px-1.5 py-0.5 bg-gray-100 dark:bg-[#1A2030] text-gray-600 dark:text-gray-300 rounded text-xs font-mono">
                        {field}
                      </span>
                    ))}
                  </div>
                )}
                {entry.change_note && (
                  <p className="mt-1 text-sm italic text-gray-500 dark:text-gray-400">"{entry.change_note}"</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
