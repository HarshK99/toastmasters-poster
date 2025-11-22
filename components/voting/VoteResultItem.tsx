import React from "react";

interface VoteResult {
  nominee: {
    name: string;
    prefix: string;
    suffix?: string;
  };
  votes: number;
  percentage?: number;
}

interface VoteResultItemProps {
  result: VoteResult;
  position: number;
  isWinner: boolean;
}

const VoteResultItem: React.FC<VoteResultItemProps> = ({ result, position, isWinner }) => {
  return (
    <div
      className={`flex items-center justify-between p-3 rounded-lg ${
        isWinner 
          ? "bg-yellow-100 border border-yellow-300" 
          : "bg-gray-50"
      }`}
    >
      <div className="flex items-center">
        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-3 ${
          isWinner 
            ? "bg-yellow-500 text-white" 
            : "bg-gray-300 text-gray-700"
        }`}>
          {position}
        </span>
        <span className="font-medium text-gray-900">{result.nominee.prefix} {result.nominee.name}{result.nominee.suffix ? ` (${result.nominee.suffix})` : ''}</span>
      </div>
      
      <div className="flex items-center">
        <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
          <div
            className={`h-2 rounded-full ${
              isWinner ? "bg-yellow-500" : "bg-blue-500"
            }`}
            style={{ width: `${result.percentage || 0}%` }}
          ></div>
        </div>
        <span className="text-sm font-medium w-12 text-right text-gray-800">
          {result.votes}
        </span>
      </div>
    </div>
  );
};

export default VoteResultItem;