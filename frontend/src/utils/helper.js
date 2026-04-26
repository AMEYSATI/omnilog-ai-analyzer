export const getSeverity = (message = "") => {
  const text = message.toLowerCase();
  if (text.includes("fatal") || text.includes("panic")) return { label: "CRITICAL", color: "bg-red-600" };
  if (text.includes("security")) return { label: "SECURITY", color: "bg-purple-600" };
  if (text.includes("error")) return { label: "ERROR", color: "bg-orange-500" };
  return { label: "INFO", color: "bg-gray-600" };
};

export const getPriority = (message = "") => {
  const text = message.toLowerCase();
  if (text.includes("fatal") || text.includes("security")) return 1;
  if (text.includes("error")) return 3;
  return 5;
};