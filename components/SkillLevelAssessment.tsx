'use client'

import React, { useState } from 'react'

interface SkillLevelAssessmentProps {
  skills: string[]
  onComplete: (skillLevels: Record<string, 'beginner' | 'intermediate' | 'advanced'>) => void
}

const levelDescriptions = {
  beginner: {
    title: 'Beginner',
    description: 'Basic understanding, can follow tutorials and simple examples',
    examples: ['Can write basic code', 'Understands fundamental concepts', 'Needs guidance for complex tasks']
  },
  intermediate: {
    title: 'Intermediate',
    description: 'Can work independently on most tasks, some advanced concepts',
    examples: ['Can build small projects', 'Understands design patterns', 'Can debug common issues']
  },
  advanced: {
    title: 'Advanced',
    description: 'Expert level, can mentor others and solve complex problems',
    examples: ['Can architect solutions', 'Mentors junior developers', 'Contributes to open source']
  }
}

export const SkillLevelAssessment: React.FC<SkillLevelAssessmentProps> = ({ skills, onComplete }) => {
  const [skillLevels, setSkillLevels] = useState<Record<string, 'beginner' | 'intermediate' | 'advanced'>>({})
  const [currentSkillIndex, setCurrentSkillIndex] = useState(0)

  const handleLevelSelect = (skill: string, level: 'beginner' | 'intermediate' | 'advanced') => {
    setSkillLevels(prev => ({
      ...prev,
      [skill]: level
    }))
  }

  const handleNext = () => {
    if (currentSkillIndex < skills.length - 1) {
      setCurrentSkillIndex(prev => prev + 1)
    } else {
      // All skills assessed
      onComplete(skillLevels)
    }
  }

  const handlePrevious = () => {
    if (currentSkillIndex > 0) {
      setCurrentSkillIndex(prev => prev - 1)
    }
  }

  const currentSkill = skills[currentSkillIndex]
  const currentLevel = skillLevels[currentSkill] || 'beginner'
  const progress = ((currentSkillIndex + 1) / skills.length) * 100

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Step 2: Skill Level Assessment
        </h2>
        <p className="text-gray-600">
          Rate your proficiency level for each selected skill
        </p>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Skill {currentSkillIndex + 1} of {skills.length}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-green-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Current Skill Assessment */}
      <div className="text-center mb-8">
        <h3 className="text-xl font-medium text-gray-900 mb-4">
          How would you rate your proficiency in <span className="text-blue-600 font-semibold">{currentSkill}</span>?
        </h3>
      </div>

      {/* Level Options */}
      <div className="grid gap-4 mb-8">
        {Object.entries(levelDescriptions).map(([level, details]) => (
          <div
            key={level}
            onClick={() => handleLevelSelect(currentSkill, level as 'beginner' | 'intermediate' | 'advanced')}
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              currentLevel === level
                ? 'border-primary bg-primary/20'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-4 h-4 rounded-full border-2 mt-1 ${
                currentLevel === level
                  ? 'border-primary bg-primary'
                  : 'border-gray-300'
              }`}>
                {currentLevel === level && (
                  <div className="w-2 h-2 bg-white rounded-full m-0.5" />
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 mb-2">{details.title}</h4>
                <p className="text-gray-600 mb-3">{details.description}</p>
                <ul className="text-sm text-gray-500 space-y-1">
                  {details.examples.map((example, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="w-1 h-1 bg-gray-400 rounded-full" />
                      {example}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentSkillIndex === 0}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            currentSkillIndex === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gray-600 text-white hover:bg-gray-700'
          }`}
        >
          Previous
        </button>
        
        <button
          onClick={handleNext}
          className="px-6 py-3 bg-gradient-to-r from-primary to-gray-700 text-white rounded-lg font-medium hover:from-primary/90 hover:to-gray-700/90 transition-colors"
        >
          {currentSkillIndex === skills.length - 1 ? 'Complete Assessment' : 'Next Skill'}
        </button>
      </div>

      {/* Skills Overview */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-3">Assessment Progress:</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {skills.map((skill, index) => (
            <div
              key={skill}
              className={`p-2 rounded text-sm ${
                index === currentSkillIndex
                  ? 'bg-primary/20 text-primary border border-primary/30'
                  : skillLevels[skill]
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {skill}: {skillLevels[skill] || 'Not assessed'}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 