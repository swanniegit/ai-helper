'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Question {
  id: number;
  question: string;
  options: { text: string; correct: boolean }[];
}

const quiz: Question[] = [
  {
    id: 1,
    question: 'What does HTML stand for?',
    options: [
      { text: 'Hyper Text Markup Language', correct: true },
      { text: 'Home Tool Markup Language', correct: false },
      { text: 'Hyperlinks and Text Mark Language', correct: false },
    ],
  },
  {
    id: 2,
    question: 'Which JavaScript feature lets you handle async operations?',
    options: [
      { text: 'Promises', correct: true },
      { text: 'CSS Modules', correct: false },
      { text: 'HTML Templates', correct: false },
    ],
  },
  {
    id: 3,
    question: 'What command creates a React app with Vite?',
    options: [
      { text: 'npm create vite@latest', correct: true },
      { text: 'npm init react-app', correct: false },
      { text: 'npx next-app', correct: false },
    ],
  },
];

export default function NewLearningPathPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [targetRole, setTargetRole] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pathText, setPathText] = useState('');

  const handleRoleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleAnswer = (index: number) => {
    const question = quiz[currentQuestion];
    if (question.options[index].correct) {
      setScore(prev => prev + 1);
    }
    if (currentQuestion + 1 < quiz.length) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setStep(3);
    }
  };

  const level = score <= 1 ? 'Beginner' : score === 2 ? 'Intermediate' : 'Advanced';

  useEffect(() => {
    const generatePath = async () => {
      if (step !== 3) return;
      setLoading(true);
      try {
        const res = await fetch('/api/generate-learning-path', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ role: targetRole, level }),
        });
        const data = await res.json();
        if (data.text) {
          setPathText(data.text);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    generatePath();
  }, [step, targetRole, level]);

  return (
    <div className="max-w-xl mx-auto space-y-6 p-6 bg-white rounded-lg shadow-md">
      {step === 1 && (
        <form onSubmit={handleRoleSubmit} className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-800">Choose Your Career Goal</h2>
          <input
            type="text"
            value={targetRole}
            onChange={e => setTargetRole(e.target.value)}
            placeholder="Desired Role (e.g. Frontend Developer)"
            className="w-full border p-2 rounded"
            required
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Next
          </button>
        </form>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Quick Skill Check</h2>
          <p className="text-gray-600">{quiz[currentQuestion].question}</p>
          <ul className="space-y-2">
            {quiz[currentQuestion].options.map((opt, idx) => (
              <li key={idx}>
                <button
                  onClick={() => handleAnswer(idx)}
                  className="w-full text-left border p-2 rounded hover:bg-gray-50"
                >
                  {opt.text}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-800">Your Learning Path</h2>
          <p className="text-gray-600">Target role: {targetRole}</p>
          <p className="text-gray-600">Estimated level: {level}</p>
          <ul className="list-disc list-inside space-y-2">
            {loading && <li>Loading...</li>}
            {!loading &&
              pathText
                .split('\n')
                .filter(Boolean)
                .map((line, idx) => (
                  <li key={idx}>{line}</li>
                ))}
          </ul>
          <Link
            href="/learning-paths"
            className="inline-block mt-2 text-blue-600 hover:underline"
          >
            Back to Learning Paths
          </Link>
        </div>
      )}
    </div>
  );
}
