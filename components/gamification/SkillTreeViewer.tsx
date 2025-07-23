'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Lock, 
  CheckCircle2, 
  Circle, 
  Star, 
  Zap, 
  Crown, 
  Target,
  Clock,
  Book,
  TrendingUp,
  Award,
  Eye,
  Play
} from 'lucide-react';
import { 
  SkillTreeViewerProps, 
  EnhancedSkillTreeNode, 
  SkillTreeVisualization,
  SkillNodeStatus 
} from '../../types/gamification';
import { Card } from '../ui/card';
import { Button } from '../ui/button';

const SkillTreeViewer: React.FC<SkillTreeViewerProps> = ({
  tree_path,
  interactive = true,
  show_user_progress = true,
  compact = false,
  on_skill_select
}) => {
  const [skillTreeData, setSkillTreeData] = useState<SkillTreeVisualization | null>(null);
  const [selectedNode, setSelectedNode] = useState<EnhancedSkillTreeNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    fetchSkillTree();
  }, [tree_path]);

  const fetchSkillTree = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/skill-tree/${tree_path}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch skill tree data');
      }

      const result = await response.json();
      if (result.success) {
        setSkillTreeData(result.data);
      } else {
        throw new Error(result.error || 'Failed to load skill tree');
      }
    } catch (err) {
      console.error('Skill tree fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load skill tree');
    } finally {
      setLoading(false);
    }
  };

  const getNodeStatusColor = (status: SkillNodeStatus) => {
    switch (status) {
      case 'locked':
        return 'stroke-gray-300 fill-gray-100';
      case 'available':
        return 'stroke-blue-400 fill-blue-50';
      case 'in_progress':
        return 'stroke-yellow-400 fill-yellow-50';
      case 'completed':
        return 'stroke-green-500 fill-green-100';
      case 'mastered':
        return 'stroke-purple-600 fill-purple-100';
      default:
        return 'stroke-gray-300 fill-gray-100';
    }
  };

  const getNodeIcon = (node: EnhancedSkillTreeNode) => {
    const iconMap = {
      'code': '💻',
      'database': '🗄️',
      'package': '📦',
      'shield': '🛡️',
      'layers': '📚',
      'globe': '🌐',
      'server': '🖥️',
      'crown': '👑',
      'zap': '⚡',
      'search': '🔍',
      'code2': '📝',
      'settings': '⚙️',
      'trending-up': '📈',
      'lock': '🔒',
      'archive': '📁',
      'layout': '🎨',
      'cpu': '🧠',
      'git-branch': '🌳'
    };

    return iconMap[node.icon_name as keyof typeof iconMap] || '🎯';
  };

  const handleNodeClick = (node: EnhancedSkillTreeNode) => {
    if (!interactive) return;

    setSelectedNode(node);
    on_skill_select?.(node);
  };

  const handleStartLearning = async (nodeId: string) => {
    try {
      const response = await fetch('/api/skill-tree/start-learning', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ skill_node_id: nodeId })
      });

      if (!response.ok) {
        throw new Error('Failed to start learning');
      }

      const result = await response.json();
      if (result.success) {
        // Refresh skill tree data
        await fetchSkillTree();
      } else {
        throw new Error(result.error || 'Failed to start learning');
      }
    } catch (err) {
      console.error('Start learning error:', err);
      alert(err instanceof Error ? err.message : 'Failed to start learning');
    }
  };

  const renderSkillNode = (node: EnhancedSkillTreeNode) => {
    const radius = compact ? 20 : 30;
    const statusColors = getNodeStatusColor(node.user_progress?.status || 'locked');
    const icon = getNodeIcon(node);

    return (
      <g key={node.id} transform={`translate(${node.position_x}, ${node.position_y})`}>
        {/* Connection lines to prerequisites */}
        {node.prerequisites.map(prereq => {
          const prereqNode = skillTreeData?.nodes.find(n => n.node_key === prereq.node_key);
          if (!prereqNode) return null;

          const dx = prereqNode.position_x - node.position_x;
          const dy = prereqNode.position_y - node.position_y;

          return (
            <line
              key={`connection-${prereq.id}`}
              x1={0}
              y1={0}
              x2={dx}
              y2={dy}
              stroke={prereq.is_required ? '#6b7280' : '#d1d5db'}
              strokeWidth={prereq.is_required ? 2 : 1}
              strokeDasharray={prereq.is_required ? '0' : '4,4'}
              className="pointer-events-none"
            />
          );
        })}

        {/* Node circle */}
        <circle
          cx="0"
          cy="0"
          r={radius}
          className={`${statusColors} transition-all duration-200 ${
            interactive ? 'cursor-pointer hover:stroke-primary hover:stroke-2' : ''
          }`}
          onClick={() => handleNodeClick(node)}
        />

        {/* Node icon/emoji */}
        <text
          x="0"
          y="0"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={compact ? "16" : "20"}
          className="pointer-events-none select-none"
        >
          {icon}
        </text>

        {/* Progress indicator */}
        {show_user_progress && node.user_progress && node.user_progress.progress_percentage > 0 && (
          <circle
            cx="0"
            cy="0"
            r={radius - 2}
            fill="none"
            stroke="#10b981"
            strokeWidth="3"
            strokeDasharray={`${(node.user_progress.progress_percentage / 100) * (2 * Math.PI * (radius - 2))} ${2 * Math.PI * (radius - 2)}`}
            strokeLinecap="round"
            transform="rotate(-90)"
            className="opacity-75"
          />
        )}

        {/* Status indicators */}
        {node.user_progress?.status === 'completed' && (
          <CheckCircle2 
            className="w-4 h-4 text-green-600 absolute -top-1 -right-1" 
            style={{ transform: `translate(${radius - 8}px, ${-radius + 4}px)` }}
          />
        )}
        {node.user_progress?.status === 'mastered' && (
          <Crown 
            className="w-4 h-4 text-purple-600 absolute -top-1 -right-1"
            style={{ transform: `translate(${radius - 8}px, ${-radius + 4}px)` }}
          />
        )}
        {node.user_progress?.status === 'locked' && (
          <Lock 
            className="w-3 h-3 text-gray-500 absolute -top-1 -right-1"
            style={{ transform: `translate(${radius - 6}px, ${-radius + 2}px)` }}
          />
        )}

        {/* Node label */}
        {!compact && (
          <text
            x="0"
            y={radius + 15}
            textAnchor="middle"
            className="text-xs font-medium fill-gray-700 pointer-events-none select-none"
          >
            {node.title.length > 15 ? `${node.title.substring(0, 15)}...` : node.title}
          </text>
        )}
      </g>
    );
  };

  if (loading) {
    return (
      <Card className="p-8">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-6">
            <div className="h-6 bg-gray-200 rounded w-48"></div>
            <div className="h-8 bg-gray-200 rounded w-32"></div>
          </div>
          <div className="h-96 bg-gray-200 rounded-lg"></div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-8">
        <div className="text-center text-gray-500">
          <Target className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm">{error}</p>
          <Button 
            onClick={fetchSkillTree}
            variant="outline"
            className="mt-4"
          >
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  if (!skillTreeData) {
    return (
      <Card className="p-8">
        <div className="text-center text-gray-500">
          <Target className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm">No skill tree data available</p>
        </div>
      </Card>
    );
  }

  const treeWidth = compact ? 600 : 800;
  const treeHeight = compact ? 400 : 600;

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 capitalize">
            {tree_path.replace('_', ' ')} Developer Path
          </h2>
          <p className="text-gray-600 text-sm">
            {skillTreeData.user_stats.completion_percentage.toFixed(1)}% Complete • {' '}
            {skillTreeData.user_stats.completed_nodes}/{skillTreeData.user_stats.total_nodes} Skills Mastered
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Star className="w-4 h-4 text-yellow-500" />
            <span>{skillTreeData.user_stats.total_xp_earned.toLocaleString()} XP</span>
          </div>
          
          {!compact && (
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.1))}
                variant="outline"
                size="sm"
              >
                -
              </Button>
              <span className="text-sm text-gray-600">{Math.round(zoomLevel * 100)}%</span>
              <Button
                onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.1))}
                variant="outline"
                size="sm"
              >
                +
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className="h-3 bg-gradient-to-r from-primary to-gray-700 transition-all duration-500 rounded-full"
          style={{ width: `${skillTreeData.user_stats.completion_percentage}%` }}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Skill Tree Visualization */}
        <div className="xl:col-span-3">
          <Card className="p-4 overflow-hidden">
            <div className="relative bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg overflow-hidden">
              <svg
                ref={svgRef}
                width={treeWidth}
                height={treeHeight}
                viewBox={`0 0 ${treeWidth} ${treeHeight}`}
                className="w-full h-full"
                style={{
                  transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`
                }}
              >
                {/* Background grid */}
                <defs>
                  <pattern
                    id="grid"
                    width="40"
                    height="40"
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d="M 40 0 L 0 0 0 40"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="1"
                      opacity="0.3"
                    />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />

                {/* Skill nodes */}
                {skillTreeData.nodes.map(node => renderSkillNode(node))}
              </svg>
            </div>
          </Card>
        </div>

        {/* Selected Node Details */}
        <div className="space-y-4">
          {selectedNode ? (
            <Card className="p-4">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{getNodeIcon(selectedNode)}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{selectedNode.title}</h3>
                    <p className="text-sm text-gray-600">{selectedNode.description}</p>
                  </div>
                </div>

                {/* Status and Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Status:</span>
                    <span className={`font-medium capitalize ${
                      selectedNode.user_progress?.status === 'completed' ? 'text-green-600' :
                      selectedNode.user_progress?.status === 'mastered' ? 'text-purple-600' :
                      selectedNode.user_progress?.status === 'in_progress' ? 'text-yellow-600' :
                      selectedNode.user_progress?.status === 'available' ? 'text-blue-600' :
                      'text-gray-500'
                    }`}>
                      {selectedNode.user_progress?.status || 'locked'}
                    </span>
                  </div>

                  {selectedNode.user_progress && selectedNode.user_progress.progress_percentage > 0 && (
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">Progress:</span>
                        <span className="font-medium">{selectedNode.user_progress.progress_percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 bg-gradient-to-r from-primary to-gray-700 rounded-full"
                          style={{ width: `${selectedNode.user_progress.progress_percentage}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Skill Details */}
                <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Star className="w-4 h-4" />
                      <span>{selectedNode.xp_reward} XP</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{selectedNode.estimated_hours}h</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <TrendingUp className="w-4 h-4" />
                      <span>Level {selectedNode.node_level}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Target className="w-4 h-4" />
                      <span>Difficulty {selectedNode.difficulty_rating}/5</span>
                    </div>
                  </div>
                </div>

                {/* Prerequisites */}
                {selectedNode.prerequisites.length > 0 && (
                  <div className="pt-2 border-t">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Prerequisites:</h4>
                    <div className="space-y-1">
                      {selectedNode.prerequisites.map(prereq => (
                        <div key={prereq.id} className="flex items-center gap-2 text-xs">
                          {prereq.is_required ? (
                            <Lock className="w-3 h-3 text-red-500" />
                          ) : (
                            <Eye className="w-3 h-3 text-blue-500" />
                          )}
                          <span className={prereq.is_required ? 'text-red-600' : 'text-blue-600'}>
                            {prereq.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-2 border-t space-y-2">
                  {selectedNode.is_unlocked && selectedNode.user_progress?.status !== 'completed' && selectedNode.user_progress?.status !== 'mastered' && (
                    <Button
                      onClick={() => handleStartLearning(selectedNode.id)}
                      className="w-full"
                      size="sm"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {selectedNode.user_progress?.status === 'in_progress' ? 'Continue Learning' : 'Start Learning'}
                    </Button>
                  )}

                  {!selectedNode.is_unlocked && (
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <Lock className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                      <p className="text-xs text-gray-600">
                        Complete prerequisites to unlock
                      </p>
                    </div>
                  )}

                  {(selectedNode.user_progress?.status === 'completed' || selectedNode.user_progress?.status === 'mastered') && (
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <Award className="w-5 h-5 text-green-600 mx-auto mb-1" />
                      <p className="text-xs text-green-700 font-medium">
                        Skill {selectedNode.user_progress.status}!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-6">
              <div className="text-center text-gray-500">
                <Target className="w-8 h-8 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">Select a skill node to view details</p>
              </div>
            </Card>
          )}

          {/* Legend */}
          <Card className="p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Legend</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-gray-100 border border-gray-300"></div>
                <span>Locked</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-blue-50 border border-blue-400"></div>
                <span>Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-yellow-50 border border-yellow-400"></div>
                <span>In Progress</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-100 border border-green-500"></div>
                <span>Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-purple-100 border border-purple-600"></div>
                <span>Mastered</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SkillTreeViewer;