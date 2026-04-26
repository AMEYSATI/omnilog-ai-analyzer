import React from 'react';
import { getSeverity, getPriority } from '../utils/helper';
import { ChevronDown, AlertCircle, Clock } from 'lucide-react';

const LogCard = ({ log }) => {
  const severity = getSeverity(log.message);
  const priority = getPriority(log.message);

  return (
    <div className="bg-white dark:bg-gray-800 border-l-4 border-blue-500 p-6 rounded-r-xl shadow-lg mb-6 transition-all hover:shadow-xl">
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-2 items-center">
          <span className="bg-gray-200 dark:bg-gray-700 text-blue-600 dark:text-blue-400 text-xs font-mono px-3 py-1 rounded">
            {log.projectId}
          </span>
          <span className={`${severity.color} text-white text-[10px] px-2 py-1 rounded font-bold`}>
            {severity.label}
          </span>
          <span className="bg-blue-600 text-white text-[10px] px-2 py-1 rounded font-bold">
            P{priority}
          </span>
        </div>
        <div className="flex items-center text-gray-500 text-xs gap-1">
          <Clock size={12} />
          {new Date(log.createdAt).toLocaleString()}
        </div>
      </div>

      <h3 className="text-xl font-bold text-red-500 dark:text-red-400 mb-3 flex items-center gap-2">
        <AlertCircle size={20} />
        {log.message}
      </h3>

      <div className="bg-gray-100 dark:bg-black/40 p-4 rounded-lg mb-4 font-mono text-xs text-gray-700 dark:text-gray-400 overflow-x-auto border border-gray-200 dark:border-gray-700">
        {log.stackTrace || "No stack trace available"}
      </div>

      <details className="group border border-blue-200 dark:border-blue-900/30 rounded-lg bg-blue-50/50 dark:bg-blue-900/5">
        <summary className="list-none cursor-pointer p-4 flex justify-between items-center text-blue-700 dark:text-blue-400 font-bold text-sm uppercase">
          AI Analysis & Suggested Fix
          <ChevronDown size={18} className="transition-transform group-open:rotate-180" />
        </summary>
        <div className="p-4 pt-0 text-gray-700 dark:text-gray-300 prose dark:prose-invert max-w-none">
          {/* We'll use a library later to parse the analysis Markdown */}
          <p className="whitespace-pre-wrap">{log.analysis}</p>
        </div>
      </details>
    </div>
  );
};

export default LogCard;