'use client'

import React, { useState } from 'react'
import { SkillsAssessmentForm } from './SkillsAssessmentForm'
import { SkillLevelAssessment } from './SkillLevelAssessment'
import { GoalDiscussion } from './GoalDiscussion'
import { LearningPlanGeneration } from './LearningPlanGeneration'

export type AssessmentStep = 'skills' | 'levels' | 'goals' | 'generating'

export interface SkillsData {
  skills: string[]
  skillLevels: Record<string, 'beginner' | 'intermediate' | 'advanced'>
  careerPath?: 'PHP' | 'Oracle'
}

export interface GoalsData {
  careerGoals: string[]
  timelineMonths: number
  priorityAreas: string[]
}

export const LearningPathWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<AssessmentStep>('skills')
  const [skillsData, setSkillsData] = useState<SkillsData | null>(null)
  const [goalsData, setGoalsData] = useState<GoalsData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSkillsComplete = (data: SkillsData & { careerPath?: 'PHP' | 'Oracle' }) => {
    setSkillsData(data)
    setCurrentStep('levels')
  }

  const handleLevelsComplete = (skillLevels: Record<string, 'beginner' | 'intermediate' | 'advanced'>) => {
    if (skillsData) {
      setSkillsData({ ...skillsData, skillLevels })
      setCurrentStep('goals')
    }
  }

  const handleGoalsComplete = (data: GoalsData) => {
    setGoalsData(data)
    setCurrentStep('generating')
  }

  const handlePlanGenerated = () => {
    // Navigate to dashboard or show success message
    console.log('Learning plan generated successfully!')
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'skills':
        return <SkillsAssessmentForm onComplete={handleSkillsComplete} />
      case 'levels':
        return skillsData && (
          <SkillLevelAssessment 
            skills={skillsData.skills} 
            onComplete={handleLevelsComplete} 
          />
        )
      case 'goals':
        return <GoalDiscussion onComplete={handleGoalsComplete} />
      case 'generating':
        return skillsData && goalsData && (
          <LearningPlanGeneration 
            skillsData={skillsData}
            goalsData={goalsData}
            onComplete={handlePlanGenerated}
          />
        )
      default:
        return <SkillsAssessmentForm onComplete={handleSkillsComplete} />
    }
  }

  const getStepProgress = () => {
    const steps = ['skills', 'levels', 'goals', 'generating']
    const currentIndex = steps.indexOf(currentStep)
    return ((currentIndex + 1) / steps.length) * 100
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create Your Learning Path
          </h1>
          <p className="text-gray-600">
            Let&apos;s assess your skills and create a personalized learning plan for the next 12 months
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Step {['skills', 'levels', 'goals', 'generating'].indexOf(currentStep) + 1} of 4</span>
            <span>{Math.round(getStepProgress())}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getStepProgress()}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {renderCurrentStep()}
        </div>
      </div>
    </div>
  )
} 