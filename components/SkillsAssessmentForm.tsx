'use client'

import React, { useState } from 'react'
import { SkillsData } from './LearningPathWizard'
import { getCareerFramework } from '../lib/careerFrameworks'

interface SkillsAssessmentFormProps {
  onComplete: (data: SkillsData & { careerPath?: 'PHP' | 'Oracle' }) => void
}

const commonSkills = [
  'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'C#', 'SQL',
  'AWS', 'Docker', 'Kubernetes', 'Git', 'DevOps', 'Agile', 'Scrum', 'UI/UX Design',
  'Machine Learning', 'Data Analysis', 'Cybersecurity', 'Mobile Development',
  'Cloud Computing', 'Database Design', 'API Development', 'Testing', 'CI/CD'
]

export const SkillsAssessmentForm: React.FC<SkillsAssessmentFormProps> = ({ onComplete }) => {
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [customSkills, setCustomSkills] = useState<string[]>([])
  const [newSkill, setNewSkill] = useState('')
  const [careerPath, setCareerPath] = useState<'PHP' | 'Oracle' | null>(null)

  const handleSkillToggle = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    )
  }

  const handleAddCustomSkill = () => {
    if (newSkill.trim() && !selectedSkills.includes(newSkill.trim()) && !customSkills.includes(newSkill.trim())) {
      setCustomSkills(prev => [...prev, newSkill.trim()])
      setSelectedSkills(prev => [...prev, newSkill.trim()])
      setNewSkill('')
    }
  }

  const handleSubmit = () => {
    if (selectedSkills.length >= 5) {
      const skillLevels: Record<string, 'beginner' | 'intermediate' | 'advanced'> = {}
      selectedSkills.forEach(skill => {
        skillLevels[skill] = 'beginner' // Default level, will be assessed in next step
      })
      
      onComplete({
        skills: selectedSkills,
        skillLevels,
        careerPath: careerPath || undefined
      })
    }
  }

  const isFormValid = selectedSkills.length >= 5

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Step 1: Skills Assessment
        </h2>
        <p className="text-gray-600">
          Select at least 5 skills that you currently have or want to develop
        </p>
      </div>

      {/* Career Path Selection */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Choose Your Career Path (Optional)
        </h3>
        <p className="text-gray-600 mb-4">
          Select a specific career path to get tailored recommendations based on industry frameworks
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => setCareerPath('PHP')}
            className={`p-6 rounded-lg border-2 transition-all text-left ${
              careerPath === 'PHP'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <h4 className="font-semibold text-lg mb-2">PHP Developer</h4>
            <p className="text-sm">
              Web development with PHP frameworks like Laravel, Symfony, and modern PHP practices
            </p>
          </button>
          
          <button
            onClick={() => setCareerPath('Oracle')}
            className={`p-6 rounded-lg border-2 transition-all text-left ${
              careerPath === 'Oracle'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <h4 className="font-semibold text-lg mb-2">Oracle Developer</h4>
            <p className="text-sm">
              Database development with SQL, PL/SQL, and Oracle database technologies
            </p>
          </button>
        </div>
      </div>

      {/* Skills Selection */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Select Your Skills ({selectedSkills.length}/5 minimum)
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
          {commonSkills.map(skill => (
            <button
              key={skill}
              onClick={() => handleSkillToggle(skill)}
              className={`p-3 rounded-lg border-2 transition-all ${
                selectedSkills.includes(skill)
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {skill}
            </button>
          ))}
        </div>

        {/* Custom Skills */}
        <div className="mb-6">
          <h4 className="text-md font-medium text-gray-900 mb-3">Add Custom Skills</h4>
          <div className="flex gap-2">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Enter a custom skill..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && handleAddCustomSkill()}
            />
            <button
              onClick={handleAddCustomSkill}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add
            </button>
          </div>
        </div>

        {/* Selected Skills Display */}
        {selectedSkills.length > 0 && (
          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-900 mb-3">Selected Skills:</h4>
            <div className="flex flex-wrap gap-2">
              {selectedSkills.map(skill => (
                <span
                  key={skill}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2"
                >
                  {skill}
                  <button
                    onClick={() => handleSkillToggle(skill)}
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

      {/* Navigation */}
      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={!isFormValid}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            isFormValid
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Continue to Skill Levels ({selectedSkills.length}/5)
        </button>
      </div>
    </div>
  )
} 