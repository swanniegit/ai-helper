'use client'

import React from 'react'
import { getCareerFramework, getAllSkillsForLevel, getTrainingResources } from '../lib/careerFrameworks'

interface CareerFrameworkDisplayProps {
  careerPath: 'PHP' | 'Oracle'
  currentLevel?: 'Junior' | 'Intermediate' | 'Senior'
  targetLevel?: 'Junior' | 'Intermediate' | 'Senior'
}

export const CareerFrameworkDisplay: React.FC<CareerFrameworkDisplayProps> = ({
  careerPath,
  currentLevel,
  targetLevel
}) => {
  const framework = getCareerFramework(careerPath)
  
  if (!framework) {
    return null
  }

  return (
    <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-yellow-100 p-6 rounded-lg border border-purple-200">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {careerPath} Developer Career Framework
        </h3>
        <p className="text-gray-600">
          Based on industry standards and best practices for {careerPath} development
        </p>
      </div>

      {/* Core Pillars */}
      {/* Removed: No corePillars property in framework */}

      {/* Current Level Skills */}
      {currentLevel && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">
            Current Level: {currentLevel}
          </h4>
          <div className="bg-white p-4 rounded-lg border">
            <p className="text-sm text-gray-600 mb-3">
              {framework.levels.find(l => l.level === currentLevel)?.focus}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {getAllSkillsForLevel(framework, currentLevel).map((skill, index) => (
                <div key={index} className="border-l-4 border-blue-400 pl-3">
                  <h6 className="font-medium text-gray-900 text-sm">{skill.name}</h6>
                  <p className="text-xs text-gray-600">{skill.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Target Level Skills */}
      {targetLevel && targetLevel !== currentLevel && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">
            Target Level: {targetLevel}
          </h4>
          <div className="bg-white p-4 rounded-lg border">
            <p className="text-sm text-gray-600 mb-3">
              {framework.levels.find(l => l.level === targetLevel)?.focus}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {getAllSkillsForLevel(framework, targetLevel).map((skill, index) => (
                <div key={index} className="border-l-4 border-green-400 pl-3">
                  <h6 className="font-medium text-gray-900 text-sm">{skill.name}</h6>
                  <p className="text-xs text-gray-600">{skill.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Training Resources */}
      {targetLevel && (
        <div>
          <h4 className="font-medium text-gray-900 mb-3">
            Recommended Training Resources
          </h4>
          <div className="bg-white p-4 rounded-lg border">
            {(() => {
              const targetSkills = getAllSkillsForLevel(framework, targetLevel);
              if (!targetSkills.length) return <p className="text-sm text-gray-600">No specific resources available for this level.</p>;
              const resources = getTrainingResources(targetSkills[0].name, targetLevel);
              if (!resources) return <p className="text-sm text-gray-600">No specific resources available for this level.</p>;
              return (
                <div className="space-y-3">
                  {resources.courses && resources.courses.length > 0 && (
                    <div>
                      <h6 className="font-medium text-blue-600 text-sm mb-1">Courses & Platforms</h6>
                      <div className="flex flex-wrap gap-2">
                        {resources.courses.map((course, index) => (
                          <span key={index} className="px-2 py-1 bg-primary/20 text-primary rounded text-xs">
                            {course}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {resources.books && resources.books.length > 0 && (
                    <div>
                      <h6 className="font-medium text-green-600 text-sm mb-1">Books</h6>
                      <div className="flex flex-wrap gap-2">
                        {resources.books.map((book, index) => (
                          <span key={index} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                            {book}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {resources.practice && resources.practice.length > 0 && (
                    <div>
                      <h6 className="font-medium text-orange-600 text-sm mb-1">Practice</h6>
                      <div className="flex flex-wrap gap-2">
                        {resources.practice.map((practice, index) => (
                          <span key={index} className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">
                            {practice}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  )
} 