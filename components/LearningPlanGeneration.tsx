'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { SkillsData, GoalsData } from './LearningPathWizard'
import { CareerFrameworkDisplay } from './CareerFrameworkDisplay'

interface LearningPlanGenerationProps {
  skillsData: SkillsData
  goalsData: GoalsData
  onComplete: () => void
}

interface GeneratedPlan {
  quarters: Quarter[]
  summary: string
  estimatedHours: number
}

interface Quarter {
  quarter: number
  title: string
  objectives: string[]
  resources: string[]
  milestones: string[]
  estimatedHours: number
}

export const LearningPlanGeneration: React.FC<LearningPlanGenerationProps> = ({ 
  skillsData, 
  goalsData, 
  onComplete 
}) => {
  const [isGenerating, setIsGenerating] = useState(true)
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlan | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  const generateLearningPlan = useCallback(async () => {
    try {
      setProgress(10)
      
      // Generate learning plan with OpenAI
      const response = await fetch('/api/generate-learning-path', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          skills: skillsData.skills,
          skillLevels: skillsData.skillLevels,
          careerGoals: goalsData.careerGoals,
          timelineMonths: goalsData.timelineMonths,
          priorityAreas: goalsData.priorityAreas,
          careerPath: skillsData.careerPath
        })
      })

      setProgress(50)

      if (!response.ok) {
        throw new Error('Failed to generate learning plan')
      }

      const plan = await response.json()
      setProgress(70)

      // Save learning path to database
      const saveResponse = await fetch('/api/learning-paths', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: `${skillsData.careerPath || 'Custom'} Learning Path`,
          description: `Personalized learning path for ${skillsData.careerPath || 'your career goals'}`,
          career_path: skillsData.careerPath,
          current_level: 'Junior', // This could be determined from skill assessment
          target_level: 'Intermediate', // This could be determined from goals
          timeline_months: goalsData.timelineMonths,
          skills: skillsData.skills,
          skill_levels: skillsData.skillLevels,
          career_goals: goalsData.careerGoals,
          priority_areas: goalsData.priorityAreas,
          generated_plan: plan
        })
      })

      setProgress(90)
      
      if (!saveResponse.ok) {
        console.warn('Failed to save learning path to database')
      }

      // Set the generated plan
      setTimeout(() => {
        setGeneratedPlan(plan)
        setIsGenerating(false)
        setProgress(100)
      }, 1000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setIsGenerating(false)
    }
  }, [skillsData, goalsData])

  useEffect(() => {
    generateLearningPlan()
  }, [generateLearningPlan])

  const renderGeneratingState = () => (
    <div className="text-center space-y-6">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
      
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Generating Your Learning Plan
        </h3>
        <p className="text-gray-600 mb-4">
          Our AI is analyzing your skills, goals, and timeline to create a personalized learning path...
        </p>
        
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <p className="text-sm text-gray-500">
          {progress < 25 && "Analyzing your skills and experience..."}
          {progress >= 25 && progress < 50 && "Mapping your career goals..."}
          {progress >= 50 && progress < 75 && "Creating quarterly objectives..."}
          {progress >= 75 && progress < 100 && "Finalizing your learning path..."}
          {progress === 100 && "Plan generated successfully!"}
        </p>
      </div>
    </div>
  )

  const renderGeneratedPlan = () => {
    if (!generatedPlan) return null

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Your Personalized Learning Plan
          </h3>
          <p className="text-gray-600">
            Here's your {goalsData.timelineMonths}-month journey to achieve your career goals
          </p>
        </div>

        {/* Career Framework Display */}
        {skillsData.careerPath && (
          <div className="mb-6">
            <CareerFrameworkDisplay 
              careerPath={skillsData.careerPath}
              currentLevel="Junior" // This could be determined from skill assessment
              targetLevel="Intermediate" // This could be determined from goals
            />
          </div>
        )}

        {/* Plan Summary */}
        <div className="bg-blue-50 p-6 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-3">Plan Summary</h4>
          <p className="text-blue-800 mb-4">{generatedPlan.summary}</p>
          <div className="flex justify-between text-sm text-blue-700">
            <span>Total Estimated Hours: {generatedPlan.estimatedHours}</span>
            <span>Quarters: {generatedPlan.quarters.length}</span>
          </div>
        </div>

        {/* Quarterly Plans */}
        <div className="space-y-6">
          {generatedPlan.quarters.map((quarter, index) => (
            <div key={quarter.quarter} className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900">
                  Quarter {quarter.quarter}: {quarter.title}
                </h4>
                <span className="text-sm text-gray-500">
                  ~{quarter.estimatedHours} hours
                </span>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {/* Objectives */}
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Objectives</h5>
                  <ul className="space-y-1">
                    {quarter.objectives.map((objective, idx) => (
                      <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                        {objective}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Resources */}
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Resources</h5>
                  <ul className="space-y-1">
                    {quarter.resources.map((resource, idx) => (
                      <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                        {resource}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Milestones */}
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Milestones</h5>
                  <ul className="space-y-1">
                    {quarter.milestones.map((milestone, idx) => (
                      <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                        {milestone}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between pt-6 border-t border-gray-200">
          <button
            onClick={() => window.print()}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Print Plan
          </button>
          
          <button
            onClick={onComplete}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start My Learning Journey
          </button>
        </div>
      </div>
    )
  }

  const renderError = () => (
    <div className="text-center space-y-6">
      <div className="text-red-500 text-6xl">⚠️</div>
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Something went wrong
        </h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={generateLearningPlan}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Step 4: Learning Plan Generation
        </h2>
        <p className="text-gray-600">
          Creating your personalized learning path based on your assessment
        </p>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        {isGenerating && renderGeneratingState()}
        {error && renderError()}
        {generatedPlan && renderGeneratedPlan()}
      </div>
    </div>
  )
} 