"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import localQuestionsPool from "../data/quiz.json";

interface AnswerOption {
  text: string;
  isCorrect: boolean;
}

interface Question {
  id: number;
  law: string;
  question: string;
  options: AnswerOption[];
}

export default function QuizPage() {
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, number>
  >({});
  const [isFinished, setIsFinished] = useState(false);

  // Configuration Screen States
  const [isStarted, setIsStarted] = useState(false);
  const [chosenLength, setChosenLength] = useState<number>(20);

  const startQuiz = () => {
    const shuffled = [...localQuestionsPool].sort(() => 0.5 - Math.random());
    setQuizQuestions(shuffled.slice(0, chosenLength));
    setIsStarted(true);
  };

  const handleReset = () => {
    setQuizQuestions([]);
    setCurrentIdx(0);
    setSelectedAnswers({});
    isFinished && setIsFinished(false);
    setIsStarted(false);
  };

  const handleSelectOption = (optionIdx: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentIdx]: optionIdx,
    }));
  };

  const handleNext = () => {
    if (currentIdx < quizQuestions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1);
    }
  };

  const handleSubmitQuiz = () => {
    setIsFinished(true);
  };

  const calculateScore = () => {
    let correctCount = 0;
    quizQuestions.forEach((q, idx) => {
      const userSelection = selectedAnswers[idx];
      if (userSelection !== undefined && q.options[userSelection].isCorrect) {
        correctCount++;
      }
    });
    const percentage = Math.round((correctCount / quizQuestions.length) * 100);

    let grade = "F";
    if (percentage >= 90) grade = "A";
    else if (percentage >= 80) grade = "B";
    else if (percentage >= 70) grade = "C";
    else if (percentage >= 60) grade = "D";

    return { correctCount, percentage, grade };
  };

  // --- RENDERING SCREEN 1: PRE-QUIZ SETUP OPTIONS MENU ---
  if (!isStarted) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-slate-900 px-6 py-12 text-slate-100 flex items-center justify-center">
        <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-8 shadow-xl space-y-6">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              RefZone Academy
            </span>
            <h2 className="mt-2 text-2xl font-extrabold text-white">
              Configure Your Practice Exam
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Test your split-second matching judgments based on real IFAB
              rulebook laws.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
              Select Question Count:
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[10, 20, 50].map((lengthOption) => {
                const isSelected = chosenLength === lengthOption;
                return (
                  <button
                    key={lengthOption}
                    type="button"
                    onClick={() => setChosenLength(lengthOption)}
                    className={`rounded-xl border py-3 text-sm font-bold transition ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-md shadow-emerald-500/5"
                        : "border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700 hover:text-white"
                    }`}
                  >
                    {lengthOption === 50 ? "All 50" : `${lengthOption} Qs`}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={startQuiz}
              className="w-full rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-slate-950 shadow-md transition hover:bg-emerald-400"
            >
              Begin Certification Test
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDERING SCREEN 2: REPORT CARD / GRADING RESULT ---
  if (isFinished) {
    const { correctCount, percentage, grade } = calculateScore();
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-slate-900 px-6 py-12 text-slate-100">
        <div className="mx-auto max-w-xl rounded-2xl border border-slate-800 bg-slate-950 p-8 text-center shadow-xl">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Official Evaluation
          </span>
          <h2 className="mt-2 text-3xl font-extrabold text-white">
            Exam Completed
          </h2>

          <div className="mx-auto my-8 flex h-32 w-32 flex-col items-center justify-center rounded-full border-4 border-emerald-500 bg-emerald-500/5 shadow-lg shadow-emerald-500/10">
            <span className="text-4xl font-black text-white">{grade}</span>
            <span className="text-xs font-medium text-emerald-400">
              {percentage}%
            </span>
          </div>

          <p className="text-sm text-slate-400">
            You accurately solved{" "}
            <strong className="text-white">{correctCount}</strong> out of{" "}
            {quizQuestions.length} match scenarios.
          </p>

          <div className="mt-8 flex flex-col gap-3">
            <button
              onClick={handleReset}
              className="w-full rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-slate-950 hover:bg-emerald-400 transition shadow-md"
            >
              Configure a New Test Setup
            </button>
            <Link
              href="/chat"
              className="w-full block rounded-xl border border-slate-800 bg-slate-900/50 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition"
            >
              Review Rulebook with AI
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // SAFE DECLARATION: We place currentQuestion right here because we are guaranteed
  // to have initialized and started the quiz if code execution reaches this point.
  const currentQuestion = quizQuestions[currentIdx];

  // Extra guard check to prevent runtime crashes during structural re-renders
  if (!currentQuestion) return null;

  // --- RENDERING SCREEN 3: ACTIVE MULTIPLE CHOICE EXAM ---
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-900 px-6 py-12 text-slate-100">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 text-xs text-slate-400">
          <span className="rounded bg-slate-950 px-2.5 py-1 font-medium text-emerald-400 border border-slate-800">
            {currentQuestion.law}
          </span>
          <span>
            Question <strong className="text-white">{currentIdx + 1}</strong> of{" "}
            {quizQuestions.length}
          </span>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-md">
          <h3 className="text-lg font-medium leading-relaxed text-white">
            {currentQuestion.question}
          </h3>
        </div>

        <div className="space-y-3">
          {currentQuestion.options.map((option, oIdx) => {
            const isSelected = selectedAnswers[currentIdx] === oIdx;
            return (
              <button
                key={oIdx}
                type="button"
                onClick={() => handleSelectOption(oIdx)}
                className={`w-full text-left rounded-xl border p-4 text-sm font-medium transition duration-150 ${
                  isSelected
                    ? "border-emerald-500 bg-emerald-500/10 text-white shadow-md"
                    : "border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700 hover:bg-slate-900"
                }`}
              >
                {option.text}
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-4">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentIdx === 0}
            className="rounded-xl border border-slate-800 bg-slate-950 px-5 py-2.5 text-sm font-semibold text-slate-400 transition hover:bg-slate-900 hover:text-white disabled:opacity-30 disabled:pointer-events-none"
          >
            ← Previous
          </button>

          {currentIdx === quizQuestions.length - 1 ? (
            <button
              type="button"
              onClick={handleSubmitQuiz}
              disabled={
                Object.keys(selectedAnswers).length < quizQuestions.length
              }
              className="rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-slate-950 shadow-md transition hover:bg-emerald-400 disabled:opacity-40 disabled:pointer-events-none"
            >
              Submit Exam
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="rounded-xl bg-slate-800 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Next Step →
            </button>
          )}
        </div>

        {Object.keys(selectedAnswers).length < quizQuestions.length &&
          currentIdx === quizQuestions.length - 1 && (
            <p className="text-center text-xs text-amber-500 animate-pulse">
              Please provide answers for all {quizQuestions.length} scenarios
              before finalizing your score card.
            </p>
          )}
      </div>
    </div>
  );
}
