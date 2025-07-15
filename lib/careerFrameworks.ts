export interface Skill {
  name: string;
  description: string;
  category: string;
}

export interface CareerLevel {
  level: 'Junior' | 'Intermediate' | 'Senior';
  focus: string;
  skills: Skill[];
}

export interface CareerFramework {
  type: 'PHP' | 'Oracle';
  levels: CareerLevel[];
}

// PHP Developer Career Framework
export const phpFramework: CareerFramework = {
  type: 'PHP',
  levels: [
    {
      level: 'Junior',
      focus: 'Grasping fundamentals of PHP, a specific framework, and the development lifecycle. Writing clean, functional code for well-defined tasks.',
      skills: [
        {
          name: 'Core PHP',
          description: 'Variables, control structures, functions, arrays, and basic OOP concepts',
          category: 'Programming Fundamentals'
        },
        {
          name: 'OOP Basics',
          description: 'Classes, properties, methods, visibility (public, private, protected)',
          category: 'Programming Fundamentals'
        },
        {
          name: 'Git Version Control',
          description: 'Basic Git workflow: clone, commit, push, pull, feature branches',
          category: 'Development Tools'
        },
        {
          name: 'Basic Database',
          description: 'SQL queries (SELECT, INSERT, UPDATE, DELETE)',
          category: 'Database'
        },
        {
          name: 'Frontend Basics',
          description: 'HTML, CSS, and basic JavaScript for form validation',
          category: 'Frontend'
        },
        {
          name: 'Problem Solving',
          description: 'Debugging with var_dump() and framework tools',
          category: 'Soft Skills'
        }
      ]
    },
    {
      level: 'Intermediate',
      focus: 'Developing features independently, mastering a framework, and understanding software architecture.',
      skills: [
        {
          name: 'Advanced PHP',
          description: 'Traits, Interfaces, Abstract Classes, and advanced OOP patterns',
          category: 'Programming Fundamentals'
        },
        {
          name: 'Framework Mastery',
          description: 'Laravel/Symfony routing, authentication, ORM, dependency injection',
          category: 'Frameworks'
        },
        {
          name: 'Complex Database',
          description: 'Complex SQL queries with JOINs, database design',
          category: 'Database'
        },
        {
          name: 'API Development',
          description: 'RESTful API design, building and consuming APIs',
          category: 'Backend'
        },
        {
          name: 'API Authentication',
          description: 'JWT, OAuth, and other authentication methods',
          category: 'Security'
        },
        {
          name: 'Code Architecture',
          description: 'SOLID principles, design patterns (Repository, Factory)',
          category: 'Architecture'
        },
        {
          name: 'Testing',
          description: 'Unit and feature tests with PHPUnit',
          category: 'Quality Assurance'
        },
        {
          name: 'Performance',
          description: 'Caching strategies (Redis), security best practices',
          category: 'Performance'
        },
        {
          name: 'Communication',
          description: 'Technical communication, code reviews',
          category: 'Soft Skills'
        }
      ]
    },
    {
      level: 'Senior',
      focus: 'Leading technical design, mentoring the team, and ensuring scalability, performance, and security.',
      skills: [
        {
          name: 'Architectural Design',
          description: 'Scalable system architectures, microservices vs monolith',
          category: 'Architecture'
        },
        {
          name: 'Technical Leadership',
          description: 'Leading design discussions, translating business requirements',
          category: 'Leadership'
        },
        {
          name: 'Ecosystem Expertise',
          description: 'Deep framework knowledge, PHP ecosystem mastery',
          category: 'Expertise'
        },
        {
          name: 'CI/CD',
          description: 'GitLab CI, GitHub Actions, deployment pipelines',
          category: 'DevOps'
        },
        {
          name: 'Containerization',
          description: 'Docker, Kubernetes, container orchestration',
          category: 'DevOps'
        },
        {
          name: 'Mentorship',
          description: 'Mentoring developers, leading code reviews',
          category: 'Leadership'
        },
        {
          name: 'Complex Problem Solving',
          description: 'Tackling ambiguous problems, innovative solutions',
          category: 'Problem Solving'
        },
        {
          name: 'Technical Strategy',
          description: 'Technical debt management, performance optimization',
          category: 'Strategy'
        },
        {
          name: 'Monitoring',
          description: 'Application monitoring, proactive issue resolution',
          category: 'Operations'
        }
      ]
    }
  ]
};

// Oracle Developer Career Framework
export const oracleFramework: CareerFramework = {
  type: 'Oracle',
  levels: [
    {
      level: 'Junior',
      focus: 'Foundational knowledge of SQL and PL/SQL, understanding core database concepts, and operating effectively under supervision.',
      skills: [
        {
          name: 'Core SQL',
          description: 'SELECT statements, filtering, sorting, joining tables, aggregate functions',
          category: 'Database'
        },
        {
          name: 'Data Manipulation',
          description: 'INSERT, UPDATE, DELETE statements, data types',
          category: 'Database'
        },
        {
          name: 'Core PL/SQL',
          description: 'Anonymous blocks, variables, control structures, basic procedures',
          category: 'Programming'
        },
        {
          name: 'Database Concepts',
          description: 'Relational database structure, keys, constraints, indexes',
          category: 'Database'
        },
        {
          name: 'Tool Proficiency',
          description: 'PL/SQL Developer, Oracle SQL Developer, schema navigation',
          category: 'Development Tools'
        },
        {
          name: 'Version Control',
          description: 'Basic Git workflow, feature branches',
          category: 'Development Tools'
        }
      ]
    },
    {
      level: 'Intermediate',
      focus: 'Writing complex, performant code independently. Contributing to data model design and mentoring junior developers.',
      skills: [
        {
          name: 'Advanced SQL',
          description: 'Complex queries, subqueries, analytical functions',
          category: 'Database'
        },
        {
          name: 'Advanced PL/SQL',
          description: 'Collections, records, cursors, packages, triggers',
          category: 'Programming'
        },
        {
          name: 'Dynamic SQL',
          description: 'EXECUTE IMMEDIATE, dynamic query building',
          category: 'Programming'
        },
        {
          name: 'Performance Tuning',
          description: 'Execution plans, indexes, query optimization',
          category: 'Performance'
        },
        {
          name: 'Data Modeling',
          description: 'Normalization, table design, relationships',
          category: 'Database'
        },
        {
          name: 'Development Best Practices',
          description: 'Modular code, transaction management, Git workflows',
          category: 'Best Practices'
        }
      ]
    },
    {
      level: 'Senior',
      focus: 'Architectural design, leadership, and strategic optimization. Owning complex database systems and mentoring the team.',
      skills: [
        {
          name: 'Database Architecture',
          description: 'Scalable schemas, partitioning, indexing strategies',
          category: 'Architecture'
        },
        {
          name: 'Advanced Performance',
          description: 'Execution plan analysis, AWR/ASH, memory optimization',
          category: 'Performance'
        },
        {
          name: 'Advanced Features',
          description: 'RAC, Data Guard, advanced security options',
          category: 'Advanced Features'
        },
        {
          name: 'Security',
          description: 'Data encryption, VPDs, fine-grained access control',
          category: 'Security'
        },
        {
          name: 'Leadership',
          description: 'Mentoring, code reviews, technical discussions',
          category: 'Leadership'
        },
        {
          name: 'Strategic Planning',
          description: 'Database upgrades, migrations, technical debt',
          category: 'Strategy'
        }
      ]
    }
  ]
};

/**
 * Get career framework by type
 */
export function getCareerFramework(type: 'PHP' | 'Oracle'): CareerFramework {
  switch (type) {
    case 'PHP':
      return phpFramework;
    case 'Oracle':
      return oracleFramework;
    default:
      throw new Error(`Unknown career framework type: ${type}`);
  }
}

/**
 * Get all skills for a specific level in a career framework
 */
export function getAllSkillsForLevel(framework: CareerFramework, level: 'Junior' | 'Intermediate' | 'Senior'): Skill[] {
  const careerLevel = framework.levels.find(l => l.level === level);
  return careerLevel ? careerLevel.skills : [];
}

/**
 * Get skills by category for a specific level
 */
export function getSkillsByCategory(framework: CareerFramework, level: 'Junior' | 'Intermediate' | 'Senior', category: string): Skill[] {
  const skills = getAllSkillsForLevel(framework, level);
  return skills.filter(skill => skill.category === category);
}

/**
 * Get all available skill categories for a level
 */
export function getSkillCategories(framework: CareerFramework, level: 'Junior' | 'Intermediate' | 'Senior'): string[] {
  const skills = getAllSkillsForLevel(framework, level);
  const categories = skills.map(skill => skill.category);
  return Array.from(new Set(categories));
}

/**
 * Get skill progression path (what skills to learn next)
 */
export function getSkillProgressionPath(framework: CareerFramework, currentLevel: 'Junior' | 'Intermediate' | 'Senior'): Skill[] {
  const levelIndex = framework.levels.findIndex(l => l.level === currentLevel);
  if (levelIndex === -1 || levelIndex === framework.levels.length - 1) {
    return [];
  }
  
  const nextLevel = framework.levels[levelIndex + 1];
  return nextLevel.skills;
}

/**
 * Get skill gap analysis
 */
export function getSkillGapAnalysis(
  framework: CareerFramework,
  currentLevel: 'Junior' | 'Intermediate' | 'Senior',
  userSkills: string[]
): {
  missingSkills: Skill[];
  recommendedSkills: Skill[];
  currentLevelSkills: Skill[];
} {
  const currentLevelSkills = getAllSkillsForLevel(framework, currentLevel);
  const missingSkills = currentLevelSkills.filter(skill => !userSkills.includes(skill.name));
  const recommendedSkills = getSkillProgressionPath(framework, currentLevel);
  
  return {
    missingSkills,
    recommendedSkills,
    currentLevelSkills
  };
}

/**
 * Get career level requirements
 */
export function getCareerLevelRequirements(framework: CareerFramework, targetLevel: 'Junior' | 'Intermediate' | 'Senior'): {
  level: CareerLevel;
  prerequisites: Skill[];
  estimatedTime: string;
} {
  const level = framework.levels.find(l => l.level === targetLevel);
  if (!level) {
    throw new Error(`Level ${targetLevel} not found in framework`);
  }

  let prerequisites: Skill[] = [];
  let estimatedTime = '';

  switch (targetLevel) {
    case 'Junior':
      prerequisites = [];
      estimatedTime = '0-6 months';
      break;
    case 'Intermediate':
      prerequisites = getAllSkillsForLevel(framework, 'Junior');
      estimatedTime = '1-2 years';
      break;
    case 'Senior':
      prerequisites = getAllSkillsForLevel(framework, 'Intermediate');
      estimatedTime = '3-5 years';
      break;
  }

  return {
    level,
    prerequisites,
    estimatedTime
  };
} 