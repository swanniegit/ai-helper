'use client';

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  TreePine, 
  Code, 
  Database, 
  Layers, 
  Crown,
  Star,
  Target,
  TrendingUp,
  Award,
  BookOpen
} from 'lucide-react';

// Skill Tree Components
import SkillTreeViewer from '@/components/gamification/SkillTreeViewer';
import { SkillTreePath, UserSkillPath } from '@/types/gamification';

export default function SkillTreesPage() {
  const [activeTab, setActiveTab] = useState<SkillTreePath>('php');
  const [userPaths, setUserPaths] = useState<UserSkillPath[]>([]);
  const [availableTrees, setAvailableTrees] = useState<Array<{
    tree_path: SkillTreePath;
    title: string;
    description: string;
    total_skills: number;
    estimated_hours: number;
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSkillPaths();
  }, []);

  const fetchSkillPaths = async () => {
    try {
      setLoading(true);

      const response = await fetch('/api/skill-tree/paths', {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch skill paths');
      }

      const result = await response.json();
      if (result.success) {
        setUserPaths(result.data.user_paths || []);
        setAvailableTrees(result.data.available_trees || []);
        
        // Set active tab to user's primary path if available
        const primaryPath = result.data.user_paths?.find((path: UserSkillPath) => path.is_primary);
        if (primaryPath) {
          setActiveTab(primaryPath.path_name);
        }
      }
    } catch (err) {
      console.error('Skill paths fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChoosePath = async (pathName: SkillTreePath, isPrimary: boolean = false) => {
    try {
      const response = await fetch('/api/skill-tree/paths', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          path_name: pathName,
          is_primary: isPrimary
        })
      });

      if (!response.ok) {
        throw new Error('Failed to choose skill path');
      }

      const result = await response.json();
      if (result.success) {
        // Refresh paths
        await fetchSkillPaths();
      } else {
        throw new Error(result.error || 'Failed to choose skill path');
      }
    } catch (err) {
      console.error('Choose path error:', err);
      alert(err instanceof Error ? err.message : 'Failed to choose skill path');
    }
  };

  const getPathIcon = (path: SkillTreePath) => {
    switch (path) {
      case 'php':
        return <Code className="w-5 h-5 text-purple-600" />;
      case 'oracle':
        return <Database className="w-5 h-5 text-blue-600" />;
      case 'general':
        return <BookOpen className="w-5 h-5 text-green-600" />;
      case 'full_stack':
        return <Layers className="w-5 h-5 text-orange-600" />;
      default:
        return <Target className="w-5 h-5 text-gray-600" />;
    }
  };

  const getPathColor = (path: SkillTreePath) => {
    switch (path) {
      case 'php':
        return 'purple';
      case 'oracle':
        return 'blue';
      case 'general':
        return 'green';
      case 'full_stack':
        return 'orange';
      default:
        return 'gray';
    }
  };

  const getUserPathData = (pathName: SkillTreePath) => {
    return userPaths.find(path => path.path_name === pathName);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-metro p-6 space-y-6">
        <div className="animate-pulse">
          <div className="bg-card/10 backdrop-blur-sm rounded-lg border border-border/20 p-6 shadow-lg">
            <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-96"></div>
          </div>
          <div className="mt-6 h-96 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-metro p-6 space-y-6">
      {/* Header */}
      <div className="bg-card/10 backdrop-blur-sm rounded-lg border border-border/20 p-6 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-primary-foreground mb-2 flex items-center gap-3">
              <TreePine className="w-8 h-8 text-green-500" />
              Skill Tree Explorer
            </h1>
            <p className="text-primary-foreground/80 text-lg">
              Navigate your learning journey through interactive skill trees
            </p>
          </div>
          
          {userPaths.length > 0 && (
            <div className="flex flex-col gap-2">
              <div className="text-sm text-primary-foreground/80">Your Progress:</div>
              <div className="flex gap-4">
                {userPaths.map(path => (
                  <div key={path.id} className="flex items-center gap-2 text-sm">
                    {getPathIcon(path.path_name)}
                    <span className="font-medium text-primary-foreground">
                      {path.progress_percentage.toFixed(1)}%
                    </span>
                    {path.is_primary && (
                      <Crown className="w-3 h-3 text-yellow-500" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Path Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {[
          { path: 'php' as SkillTreePath, title: 'PHP Developer', description: 'Web development with PHP frameworks' },
          { path: 'oracle' as SkillTreePath, title: 'Oracle Specialist', description: 'Database administration and development' },
          { path: 'general' as SkillTreePath, title: 'General Skills', description: 'Universal programming concepts' },
          { path: 'full_stack' as SkillTreePath, title: 'Full Stack', description: 'Complete web development stack' }
        ].map(({ path, title, description }) => {
          const userPath = getUserPathData(path);
          const color = getPathColor(path);
          
          return (
            <Card key={path} className="bg-card/90 backdrop-blur-sm border-primary/20 hover:bg-card/95 transition-colors">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  {getPathIcon(path)}
                  {title}
                  {userPath?.is_primary && (
                    <Crown className="w-4 h-4 text-yellow-500" />
                  )}
                </CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {userPath ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress:</span>
                      <span className="font-medium">{userPath.progress_percentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 bg-${color}-500 rounded-full transition-all duration-300`}
                        style={{ width: `${userPath.progress_percentage}%` }}
                      />
                    </div>
                    {userPath.path_xp_bonus > 0 && (
                      <div className="flex items-center gap-1 text-sm text-primary">
                        <Star className="w-3 h-3" />
                        <span>{userPath.path_xp_bonus} bonus XP</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Not started</p>
                    <Button
                      onClick={() => handleChoosePath(path, userPaths.length === 0)}
                      size="sm"
                      className="w-full"
                    >
                      {userPaths.length === 0 ? 'Start Primary Path' : 'Add Path'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Skill Tree Viewer */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as SkillTreePath)} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-card/20 backdrop-blur-sm">
          <TabsTrigger value="php" className="flex items-center gap-2">
            <Code className="w-4 h-4" />
            <span className="hidden sm:inline">PHP</span>
          </TabsTrigger>
          <TabsTrigger value="oracle" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            <span className="hidden sm:inline">Oracle</span>
          </TabsTrigger>
          <TabsTrigger value="general" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">General</span>
          </TabsTrigger>
          <TabsTrigger value="full_stack" className="flex items-center gap-2">
            <Layers className="w-4 h-4" />
            <span className="hidden sm:inline">Full Stack</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="php" className="mt-6">
          <SkillTreeViewer
            tree_path="php"
            interactive={true}
            show_user_progress={true}
          />
        </TabsContent>

        <TabsContent value="oracle" className="mt-6">
          <SkillTreeViewer
            tree_path="oracle"
            interactive={true}
            show_user_progress={true}
          />
        </TabsContent>

        <TabsContent value="general" className="mt-6">
          <SkillTreeViewer
            tree_path="general"
            interactive={true}
            show_user_progress={true}
          />
        </TabsContent>

        <TabsContent value="full_stack" className="mt-6">
          <SkillTreeViewer
            tree_path="full_stack"
            interactive={true}
            show_user_progress={true}
          />
        </TabsContent>
      </Tabs>

      {/* Learning Tips */}
      <Card className="bg-card/90 backdrop-blur-sm border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Skill Tree Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-medium">
                <Target className="w-4 h-4 text-blue-500" />
                Getting Started
              </div>
              <p className="text-muted-foreground">
                Choose a primary skill path to focus your learning. You can always explore other paths later!
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-medium">
                <TrendingUp className="w-4 h-4 text-green-500" />
                Prerequisites
              </div>
              <p className="text-muted-foreground">
                Some skills require completing prerequisites first. Look for locked skills and their requirements.
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-medium">
                <Star className="w-4 h-4 text-yellow-500" />
                Mastery
              </div>
              <p className="text-muted-foreground">
                Complete skills to earn XP and unlock achievements. Master skills for bonus rewards and recognition!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}