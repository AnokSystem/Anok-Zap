
import { Badge } from "@/components/ui/badge";

interface ProgressBarProps {
  progressPercentage: number;
}

export const ProgressBar = ({ progressPercentage }: ProgressBarProps) => {
  return (
    <div className="w-full bg-gray-700 rounded-full h-2">
      <div 
        className={`h-2 rounded-full transition-all duration-300 ${
          progressPercentage === 100 
            ? 'bg-green-500' 
            : progressPercentage > 0 
              ? 'bg-blue-500'
              : 'bg-gray-600'
        }`}
        style={{ width: `${progressPercentage}%` }}
      />
    </div>
  );
};
