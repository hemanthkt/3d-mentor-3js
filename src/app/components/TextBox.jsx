import { useAITeacher } from "../hooks/useAITeacher";
import { useEffect, useState } from "react";

import React from "react";

export const TextBox = () => {
  const currentQuestion = useAITeacher((state) => state.currentQuestion);
  const currentAnswer = useAITeacher((state) => state.currentMessages);
  const [answers, setAnswers] = useState("Questions");

  useEffect(() => {
    if (currentAnswer) {
      setAnswers(currentAnswer.answer);
    }
  }, [currentAnswer]);

  if (currentAnswer) {
    return (
      <div>
        <div>{currentQuestion}</div>
        <div>{answers}</div>;
      </div>
    );
  }
};
