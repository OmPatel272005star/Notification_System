/**
 * Footer rendered below the user table during infinite scroll.
 *
 * States:
 *  - isFetchingMore=true           → spinner + "Loading more users…"
 *  - isFetchingMore=false + no more pages → "All users loaded"
 *  - isFetchingMore=false + more pages exist → invisible spacer (sentinel triggers next load)
 */
export function UserListFooter({ isFetchingMore, hasNextPage, totalLoaded }) {
  // Still waiting for more: show spinner
  if (isFetchingMore) {
    return (
      <div className="flex justify-center items-center py-6 border-t border-[#E4E7EC] dark:border-[#2A2F3A]">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full border-2 border-[#6D5EF5] border-t-transparent animate-spin" />
          <span className="text-sm text-gray-400 dark:text-gray-500">
            Loading more users…
          </span>
        </div>
      </div>
    );
  }

  // All pages consumed
  if (!hasNextPage && totalLoaded > 0) {
    return (
      <div className="flex justify-center items-center py-4 border-t border-[#E4E7EC] dark:border-[#2A2F3A]">
        <p className="text-xs text-gray-400 dark:text-gray-500">
          All {totalLoaded} user{totalLoaded !== 1 ? "s" : ""} loaded
        </p>
      </div>
    );
  }

  // More pages exist but not currently loading — invisible spacer
  return <div className="h-2" />;
}
