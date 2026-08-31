import React from 'react';

export default function ActionCard({ stepNumber, title, icon, actions, items }) {
  const resolvedActions = actions ?? items ?? [];

  return (
    <div className="card relative p-5 border-l-4 border-l-emerald-500 overflow-hidden">
      <div className="flex items-start mb-4">
        <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold mr-3">
          {stepNumber}
        </div>
        <h3 className="text-lg font-semibold text-gray-800 pt-1 flex items-center gap-2">
          {icon} {title}
        </h3>
      </div>
      <ul className="space-y-2 pl-11">
        {resolvedActions.map((action, index) => (
          <li key={index} className="text-gray-600 relative before:content-['•'] before:absolute before:-left-4 before:text-emerald-500">
            {action}
          </li>
        ))}
      </ul>
    </div>
  );
}
