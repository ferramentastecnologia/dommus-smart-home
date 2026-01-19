import React from 'react';

// Componente placeholder para LeadsByStatusChart
function SimpleLeadsByStatusChart({ data, statusConfigs, className }) {
  return (
    <div className={`bg-white dark:bg-gray-800 border rounded-lg shadow p-6 ${className || ''}`}>
      <h3 className="text-lg font-medium mb-4">Leads by Status</h3>
      <div className="flex flex-wrap gap-3 justify-center">
        {statusConfigs && statusConfigs.map(status => (
          <div 
            key={status.id}
            className="py-2 px-4 rounded-full flex items-center gap-2"
            style={{ backgroundColor: `${status.color}20` }}
          >
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: status.color }}
            />
            <span className="font-medium">{status.name}</span>
            <span className="text-sm">
              {data[status.name.toLowerCase()] || 0}
            </span>
          </div>
        ))}
      </div>
      <div className="h-60 flex items-center justify-center text-gray-400 mt-6">
        <p>Chart visualization placeholder</p>
      </div>
    </div>
  );
}

export default SimpleLeadsByStatusChart; 