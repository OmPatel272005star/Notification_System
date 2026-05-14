export const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatDateTime = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatNumber = (num) => {
  if (typeof num !== "number") return "";
  return new Intl.NumberFormat("en-US").format(num);
};

export const formatPercent = (value) => {
  return `${parseFloat(value).toFixed(1)}%`;
};

export const truncateText = (text, length = 50) => {
  if (!text || text.length <= length) return text;
  return text.substring(0, length) + "...";
};
