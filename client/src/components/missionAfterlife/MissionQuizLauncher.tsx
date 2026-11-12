import React, { useState, useEffect } from 'react';
import type { MAMissionData } from '../../types/missionAfterlife';
import type { AIQuizPayload } from '../../types';
import { generateMissionAfterlifeQuiz } from '../../services/missionAfterlife/missionQuizService';
import { AIQuizModal } from '../quiz/AIQuizModal';

interface MissionQuizLauncherProps {
  isOpen: boolean;
  onClose: () => void;
  mission: MAMissionData;
  onScoreUpdate?: (isCorrect: boolean, reward: number, penalty: number) => void;
}

export const MissionQuizLauncher: React.FC<MissionQuizLauncherProps> = ({
  isOpen,
  onClose,
  mission,
  onScoreUpdate,
}) => {
  const [quizData, setQuizData] = useState<AIQuizPayload | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadQuiz = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const payload = await generateMissionAfterlifeQuiz(mission);
      setQuizData(payload);
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to generate quiz.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadQuiz();
    }
  }, [isOpen, mission.id]);

  const handleAnswerQuestion = (isCorrect: boolean, reward: number, penalty: number) => {
    if (onScoreUpdate) {
      onScoreUpdate(isCorrect, reward, penalty);
    }
  };

  return (
    <AIQuizModal
      isOpen={isOpen}
      onClose={onClose}
      quizData={quizData}
      isLoading={isLoading}
      error={error}
      onRetry={loadQuiz}
      onAnswerQuestion={handleAnswerQuestion}
    />
  );
};

export default MissionQuizLauncher;

