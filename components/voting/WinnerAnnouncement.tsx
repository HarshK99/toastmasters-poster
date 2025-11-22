import React from "react";

interface Winner {
  nominee: {
    name: string;
    prefix: string;
    suffix?: string;
  };
  votes: number;
  percentage?: number;
}

interface WinnerAnnouncementProps {
  winners: Winner[];
}

const WinnerAnnouncement: React.FC<WinnerAnnouncementProps> = ({ winners }) => {
  if (winners.length === 0) {
    return (
      <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4 mb-4">
        <div className="text-center text-gray-600">
          No votes recorded for this role
        </div>
      </div>
    );
  }

  return (
    <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 mb-4">
      <div className="flex items-start">
        <div className="text-2xl mr-3">🏆</div>
        <div className="flex-1">
          <div className="text-lg text-yellow-800 mb-2">
            {winners.length === 1 ? 'Winner:' : 'Winners:'}
          </div>
          {winners.map((winner) => (
            <div key={`${winner.nominee.name}-${winner.nominee.prefix}-${winner.nominee.suffix || ''}`} className="mb-1 last:mb-0">
              <div className="font-semibold text-yellow-900">
                {winner.nominee.prefix} {winner.nominee.name}{winner.nominee.suffix ? ` (${winner.nominee.suffix})` : ''}
              </div>
              <div className="text-sm text-yellow-800">
                {winner.votes} votes ({(winner.percentage || 0).toFixed(1)}%)
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WinnerAnnouncement;