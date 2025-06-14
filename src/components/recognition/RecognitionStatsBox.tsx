
import React from "react";

interface RecognitionStatsBoxProps {
  totalRecognized: number;
  totalRecognizers: number;
  recognitionRate: number;
  successfulRecognitions: number;
  recognitionAttempts: number;
}

const RecognitionStatsBox: React.FC<RecognitionStatsBoxProps> = ({
  totalRecognized,
  totalRecognizers,
  recognitionRate,
  successfulRecognitions,
  recognitionAttempts,
}) => (
  <div className="flex flex-col gap-4 mb-4">
    <div className="grid grid-cols-2 gap-4 text-center">
      <div className="border rounded-lg p-4">
        <p className="text-lg font-semibold">{totalRecognized}</p>
        <p className="text-sm text-muted-foreground">Users you recognized</p>
      </div>
      <div className="border rounded-lg p-4">
        <p className="text-lg font-semibold">{totalRecognizers}</p>
        <p className="text-sm text-muted-foreground">Users who recognized you</p>
      </div>
    </div>
    <div className="border rounded-lg p-4">
      <div className="flex justify-between">
        <p className="text-sm font-medium">Recognition Rate</p>
        <p className="text-sm font-semibold">{recognitionRate}%</p>
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <p>
          {successfulRecognitions}/{recognitionAttempts} guesses correct
        </p>
      </div>
    </div>
  </div>
);

export default RecognitionStatsBox;
