import React from "react";

interface StatCardProps {
  icon: string;
  label: string;
  value: number | string;
  prefix?: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, prefix = "" }) => {
  return (
    <div className="bg-white rounded-2xl shadow p-4 flex items-center space-x-4">
      <div className="text-3xl">{icon}</div>
      <div>
        <div className="text-sm text-gray-500">{label}</div>
        <div className="text-xl font-semibold">
          {prefix}{value}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
