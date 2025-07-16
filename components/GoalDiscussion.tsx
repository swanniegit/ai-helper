'use client'

import React, { useState } from 'react'
import { GoalsData } from './LearningPathWizard'

interface GoalDiscussionProps {
  onComplete: (data: GoalsData) => void
}

const commonGoals = [
  'Get promoted to Senior Developer',
  'Learn a new programming language',
  'Master cloud technologies (AWS/Azure/GCP)',
  'Become a team lead or manager',
  'Specialize in a specific domain (ML, DevOps, etc.)',
  'Start freelancing or consulting',
  'Contribute to open source projects',
  'Build a personal brand',
  'Learn new frameworks or tools',
  'Improve soft skills (communication, leadership)',
  'Get certified in specific technologies',
  'Build a portfolio of projects'
]

const priorityAreas = [
  'Technical Skills',
  'Leadership & Management',
  'Communication & Soft Skills',
  'Industry Knowledge',
  'Project Management',
  'Architecture & Design',
  'Testing & Quality Assurance',
  'DevOps & Infrastructure',
  'Security',
  'Performance Optimization'
]

export const GoalDiscussion: React.FC<GoalDiscussionProps> = ({ onComplete }) => {
  const [selectedGoals, setSelectedGoals] = useState<string[]>([])
  const [customGoals, setCustomGoals] = useState<string[]>([])
  const [newGoal, setNewGoal] = useState('')
  const [timelineMonths, setTimelineMonths] = useState(12)
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([])
  const [currentStep, setCurrentStep] = useState<'goals' | 'timeline' | 'priorities'>('goals')

  const handleGoalToggle = (goal: string) => {
    setSelectedGoals(prev => 
      prev.includes(goal) 
        ? prev.filter(g => g !== goal)
        : [...prev, goal]
    )
  }

  const handleAddCustomGoal = () => {
    if (newGoal.trim() && !selectedGoals.includes(newGoal.trim()) && !customGoals.includes(newGoal.trim())) {
      setCustomGoals(prev => [...prev, newGoal.trim()])
      setSelectedGoals(prev => [...prev, newGoal.trim()])
      setNewGoal('')
    }
  }

  const handlePriorityToggle = (priority: string) => {
    setSelectedPriorities(prev => 
      prev.includes(priority) 
        ? prev.filter(p => p !== priority)
        : [...prev, priority]
    )
  }

  const handleNext = () => {
    if (currentStep === 'goals' && selectedGoals.length >= 3) {
      setCurrentStep('timeline')
    } else if (currentStep === 'timeline') {
      setCurrentStep('priorities')
    } else if (currentStep === 'priorities' && selectedPriorities.length >= 3) {
      handleSubmit()
    }
  }

  const handlePrevious = () => {
    if (currentStep === 'timeline') {
      setCurrentStep('goals')
    } else if (currentStep === 'priorities') {
      setCurrentStep('timeline')
    }
  }

  const handleSubmit = () => {
    if (selectedGoals.length >= 3 && selectedPriorities.length >= 3) {
      onComplete({
        careerGoals: selectedGoals,
        timelineMonths: timelineMonths,
        priorityAreas: selectedPriorities
      })
    }
  }

  const renderGoalsStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          What are your career goals for the next 12 months?
        </h3>
        <p className="text-gray-600">
          Select at least 3 goals that you want to achieve
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        {commonGoals.map(goal => (
          <button
            key={goal}
            onClick={() => handleGoalToggle(goal)}
            className={`p-4 rounded-lg border-2 text-left transition-all ${
              selectedGoals.includes(goal)
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {goal}
          </button>
        ))}
      </div>

      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-900 mb-3">Add Custom Goals</h4>
        <div className="flex gap-2">
          <input
            type="text"
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            placeholder="Enter a custom goal..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onKeyPress={(e) => e.key === 'Enter' && handleAddCustomGoal()}
          />
          <button
            onClick={handleAddCustomGoal}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add
          </button>
        </div>
      </div>

      {selectedGoals.length > 0 && (
        <div className="mb-6">
          <h4 className="text-md font-medium text-gray-900 mb-3">Selected Goals ({selectedGoals.length}/3 minimum):</h4>
          <div className="flex flex-wrap gap-2">
            {selectedGoals.map(goal => (
              <span
                key={goal}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2"
              >
                {goal}
                <button
                  onClick={() => handleGoalToggle(goal)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  const renderTimelineStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          What's your timeline for achieving these goals?
        </h3>
        <p className="text-gray-600">
          How many months do you want to spend on this learning journey?
        </p>
      </div>

      <div className="max-w-md mx-auto">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Timeline: {timelineMonths} months
          </label>
          <input
            type="range"
            min="6"
            max="24"
            value={timelineMonths}
            onChange={(e) => setTimelineMonths(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>6 months</span>
            <span>12 months</span>
            <span>24 months</span>
          </div>
        </div>

        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            This will create {Math.ceil(timelineMonths / 3)} learning quarters, each with specific objectives and milestones.
          </p>
        </div>
      </div>
    </div>
  )

  const renderPrioritiesStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          What are your priority areas for development?
        </h3>
        <p className="text-gray-600">
          Select at least 3 areas you want to focus on most
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        {priorityAreas.map(priority => (
          <button
            key={priority}
            onClick={() => handlePriorityToggle(priority)}
            className={`p-3 rounded-lg border-2 transition-all ${
              selectedPriorities.includes(priority)
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {priority}
          </button>
        ))}
      </div>

      {selectedPriorities.length > 0 && (
        <div className="mb-6">
          <h4 className="text-md font-medium text-gray-900 mb-3">Selected Priorities ({selectedPriorities.length}/3 minimum):</h4>
          <div className="flex flex-wrap gap-2">
            {selectedPriorities.map(priority => (
              <span
                key={priority}
                className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center gap-2"
              >
                {priority}
                <button
                  onClick={() => handlePriorityToggle(priority)}
                  className="text-green-600 hover:text-green-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  const isStepValid = () => {
    switch (currentStep) {
      case 'goals':
        return selectedGoals.length >= 3
      case 'timeline':
        return true
      case 'priorities':
        return selectedPriorities.length >= 3
      default:
        return false
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Step 3: Goal Discussion
        </h2>
        <p className="text-gray-600">
          Let's understand your career objectives and priorities
        </p>
      </div>

      {/* Step Content */}
      {currentStep === 'goals' && renderGoalsStep()}
      {currentStep === 'timeline' && renderTimelineStep()}
      {currentStep === 'priorities' && renderPrioritiesStep()}

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 'goals'}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            currentStep === 'goals'
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gray-600 text-white hover:bg-gray-700'
          }`}
        >
          Previous
        </button>
        
        <button
          onClick={handleNext}
          disabled={!isStepValid()}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            isStepValid()
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {currentStep === 'priorities' ? 'Generate Learning Plan' : 'Next'}
        </button>
      </div>
    </div>
  )
} 