'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Users, Crown, Shield } from 'lucide-react';
import { Guild, GuildMembership, GuildType, GuildSkillFocus } from '../../types/gamification';
import { Card } from '../ui/card';
import GuildCard from './GuildCard';

interface GuildListProps {
  show_create_button?: boolean;
  show_join_functionality?: boolean;
  filter_type?: 'all' | 'user_guilds' | 'available';
  compact?: boolean;
}

const GuildList: React.FC<GuildListProps> = ({
  show_create_button = false,
  show_join_functionality = true,
  filter_type = 'all',
  compact = false
}) => {
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [userMemberships, setUserMemberships] = useState<GuildMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<GuildType | 'all'>('all');
  const [skillFilter, setSkillFilter] = useState<GuildSkillFocus | 'all'>('all');

  useEffect(() => {
    fetchGuilds();
  }, [filter_type]);

  const fetchGuilds = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/social/guilds', {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch guilds');
      }

      const result = await response.json();
      if (result.success) {
        setGuilds([...result.data.user_guilds, ...result.data.recommended_guilds]);
        setUserMemberships(result.data.user_memberships);
      } else {
        throw new Error(result.error || 'Failed to load guilds');
      }
    } catch (err) {
      console.error('Guild fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load guilds');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGuild = async (guildId: string) => {
    try {
      const response = await fetch('/api/social/guilds/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ guild_id: guildId })
      });

      if (!response.ok) {
        throw new Error('Failed to join guild');
      }

      const result = await response.json();
      if (result.success) {
        // Refresh guild data
        await fetchGuilds();
      } else {
        throw new Error(result.error || 'Failed to join guild');
      }
    } catch (err) {
      console.error('Join guild error:', err);
      alert(err instanceof Error ? err.message : 'Failed to join guild');
    }
  };

  const handleLeaveGuild = async (guildId: string) => {
    if (!confirm('Are you sure you want to leave this guild?')) {
      return;
    }

    try {
      const response = await fetch('/api/social/guilds/leave', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ guild_id: guildId })
      });

      if (!response.ok) {
        throw new Error('Failed to leave guild');
      }

      const result = await response.json();
      if (result.success) {
        // Refresh guild data
        await fetchGuilds();
      } else {
        throw new Error(result.error || 'Failed to leave guild');
      }
    } catch (err) {
      console.error('Leave guild error:', err);
      alert(err instanceof Error ? err.message : 'Failed to leave guild');
    }
  };

  const getFilteredGuilds = () => {
    let filtered = guilds;

    // Filter by membership status
    const userGuildIds = userMemberships.filter(m => m.is_active).map(m => m.guild_id);
    
    if (filter_type === 'user_guilds') {
      filtered = filtered.filter(guild => userGuildIds.includes(guild.id));
    } else if (filter_type === 'available') {
      filtered = filtered.filter(guild => !userGuildIds.includes(guild.id));
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(guild =>
        guild.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guild.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(guild => guild.guild_type === typeFilter);
    }

    // Apply skill filter
    if (skillFilter !== 'all') {
      filtered = filtered.filter(guild => guild.skill_focus === skillFilter);
    }

    return filtered;
  };

  const getUserMembership = (guildId: string): GuildMembership | undefined => {
    return userMemberships.find(m => m.guild_id === guildId && m.is_active);
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-6">
            <div className="h-6 bg-gray-200 rounded w-32"></div>
            <div className="h-8 bg-gray-200 rounded w-24"></div>
          </div>
          <div className="grid gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-gray-500">
          <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm">{error}</p>
          <button 
            onClick={fetchGuilds}
            className="mt-2 text-primary hover:text-primary/80 text-sm font-medium"
          >
            Try Again
          </button>
        </div>
      </Card>
    );
  }

  const filteredGuilds = getFilteredGuilds();

  return (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {filter_type === 'user_guilds' ? 'My Guilds' : 
             filter_type === 'available' ? 'Available Guilds' : 'All Guilds'}
          </h2>
          <p className="text-gray-600 text-sm">
            {filteredGuilds.length} guild{filteredGuilds.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {show_create_button && (
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
            <Plus className="w-4 h-4" />
            <span>Create Guild</span>
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search guilds..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          {/* Type Filter */}
          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as GuildType | 'all')}
              className="pl-8 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
            >
              <option value="all">All Types</option>
              <option value="study_squad">Study Squads</option>
              <option value="skill_guild">Skill Guilds</option>
              <option value="mentor_circle">Mentor Circles</option>
            </select>
            <Filter className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>

          {/* Skill Filter */}
          <div className="relative">
            <select
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value as GuildSkillFocus | 'all')}
              className="pl-8 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
            >
              <option value="all">All Skills</option>
              <option value="php">PHP</option>
              <option value="oracle">Oracle</option>
              <option value="general">General</option>
              <option value="full_stack">Full Stack</option>
            </select>
            <Shield className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>
      </Card>

      {/* Guild Grid */}
      {filteredGuilds.length === 0 ? (
        <Card className="p-12">
          <div className="text-center text-gray-500">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold mb-2">No guilds found</h3>
            <p className="text-sm mb-4">
              {searchQuery || typeFilter !== 'all' || skillFilter !== 'all'
                ? 'Try adjusting your search or filters.'
                : 'Be the first to create a guild and start building your community!'}
            </p>
            {show_create_button && (
              <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                <Plus className="w-4 h-4" />
                <span>Create First Guild</span>
              </button>
            )}
          </div>
        </Card>
      ) : (
        <div className={`grid gap-6 ${
          compact ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
        }`}>
          {filteredGuilds.map((guild) => (
            <GuildCard
              key={guild.id}
              guild={guild}
              user_membership={getUserMembership(guild.id)}
              show_join_button={show_join_functionality}
              onJoin={handleJoinGuild}
              onLeave={handleLeaveGuild}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default GuildList;