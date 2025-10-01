'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Trophy,
  Star,
  Award,
  Target,
  Zap,
  Flame,
  Crown,
  Gem,
  Medal,
  Gift,
  Calendar,
  TrendingUp,
  Users,
  Heart,
  Download,
  Image,
  Eye,
  Share2,
  Clock,
  CheckCircle,
  Lock
} from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'generation' | 'social' | 'exploration' | 'mastery' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  unlockedAt?: string;
  reward?: {
    type: 'credits' | 'vip_days' | 'badge' | 'title';
    value: number | string;
  };
  xpReward: number;
}

interface AchievementStats {
  totalAchievements: number;
  unlockedAchievements: number;
  totalXP: number;
  earnedXP: number;
  level: number;
  nextLevelXP: number;
  progressToNextLevel: number;
  categories: {
    generation: { total: number; unlocked: number };
    social: { total: number; unlocked: number };
    exploration: { total: number; unlocked: number };
    mastery: { total: number; unlocked: number };
    special: { total: number; unlocked: number };
  };
  recentUnlocks: Achievement[];
}

export default function AchievementsTab() {
  const { t } = useLanguage();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<AchievementStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'generation' | 'social' | 'exploration' | 'mastery' | 'special'>('all');
  const [selectedRarity, setSelectedRarity] = useState<'all' | 'common' | 'rare' | 'epic' | 'legendary'>('all');

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      setLoading(true);
      
      // 模拟成就数据
      const mockAchievements: Achievement[] = [
        // 生成类成就
        {
          id: 'first_generation',
          title: t('achievements.data.firstGeneration.title'),
          description: t('achievements.data.firstGeneration.description'),
          icon: '🎨',
          category: 'generation',
          rarity: 'common',
          progress: 1,
          maxProgress: 1,
          unlocked: true,
          unlockedAt: '2024-01-15T10:30:00Z',
          xpReward: 10
        },
        {
          id: 'generation_master',
          title: t('achievements.data.generationMaster.title'),
          description: t('achievements.data.generationMaster.description'),
          icon: '🎭',
          category: 'generation',
          rarity: 'rare',
          progress: 67,
          maxProgress: 100,
          unlocked: false,
          xpReward: 50
        },
        {
          id: 'speed_demon',
          title: t('achievements.data.speedDemon.title'),
          description: t('achievements.data.speedDemon.description'),
          icon: '⚡',
          category: 'generation',
          rarity: 'epic',
          progress: 8,
          maxProgress: 10,
          unlocked: false,
          xpReward: 100
        },
        {
          id: 'creative_genius',
          title: t('achievements.data.creativeGenius.title'),
          description: t('achievements.data.creativeGenius.description'),
          icon: '👑',
          category: 'generation',
          rarity: 'legendary',
          progress: 1247,
          maxProgress: 1000,
          unlocked: true,
          unlockedAt: '2024-03-20T15:45:00Z',
          xpReward: 500
        },
        
        // 社交类成就
        {
          id: 'first_like',
          title: t('achievements.data.firstLike.title'),
          description: t('achievements.data.firstLike.description'),
          icon: '❤️',
          category: 'social',
          rarity: 'common',
          progress: 1,
          maxProgress: 1,
          unlocked: true,
          unlockedAt: '2024-01-16T14:20:00Z',
          xpReward: 10
        },
        {
          id: 'popular_creator',
          title: t('achievements.data.popularCreator.title'),
          description: t('achievements.data.popularCreator.description'),
          icon: '🔥',
          category: 'social',
          rarity: 'rare',
          progress: 892,
          maxProgress: 100,
          unlocked: true,
          unlockedAt: '2024-02-28T09:15:00Z',
          xpReward: 75
        },
        {
          id: 'viral_sensation',
          title: t('achievements.data.viralSensation.title'),
          description: t('achievements.data.viralSensation.description'),
          icon: '📢',
          category: 'social',
          rarity: 'epic',
          progress: 234,
          maxProgress: 1000,
          unlocked: false,
          xpReward: 200
        },
        {
          id: 'community_leader',
          title: t('achievements.data.communityLeader.title'),
          description: t('achievements.data.communityLeader.description'),
          icon: '👥',
          category: 'social',
          rarity: 'legendary',
          progress: 12,
          maxProgress: 50,
          unlocked: false,
          xpReward: 300
        },
        
        // 探索类成就
        {
          id: 'style_explorer',
          title: t('achievements.data.styleExplorer.title'),
          description: t('achievements.data.styleExplorer.description'),
          icon: '🎪',
          category: 'exploration',
          rarity: 'common',
          progress: 8,
          maxProgress: 10,
          unlocked: false,
          xpReward: 25
        },
        {
          id: 'prompt_master',
          title: '提示词大师',
          description: '使用100个不同的提示词',
          icon: '📝',
          category: 'exploration',
          rarity: 'rare',
          progress: 87,
          maxProgress: 100,
          unlocked: false,
          xpReward: 60
        },
        {
          id: 'category_collector',
          title: '分类收集者',
          description: '在每个分类中生成至少10张壁纸',
          icon: '📚',
          category: 'exploration',
          rarity: 'epic',
          progress: 4,
          maxProgress: 6,
          unlocked: false,
          xpReward: 150
        },
        {
          id: 'experimenter',
          title: '实验家',
          description: '连续30天每天生成壁纸',
          icon: '🧪',
          category: 'exploration',
          rarity: 'legendary',
          progress: 15,
          maxProgress: 30,
          unlocked: false,
          xpReward: 400
        },
        
        // 精通类成就
        {
          id: 'quality_seeker',
          title: '品质追求者',
          description: '生成10张高质量壁纸（评分4.5+）',
          icon: '⭐',
          category: 'mastery',
          rarity: 'common',
          progress: 7,
          maxProgress: 10,
          unlocked: false,
          xpReward: 30
        },
        {
          id: 'efficiency_expert',
          title: '效率专家',
          description: '平均生成时间少于30秒',
          icon: '⏱️',
          category: 'mastery',
          rarity: 'rare',
          progress: 25,
          maxProgress: 50,
          unlocked: false,
          xpReward: 80
        },
        {
          id: 'perfectionist',
          title: '完美主义者',
          description: '连续生成20张高质量壁纸',
          icon: '💎',
          category: 'mastery',
          rarity: 'epic',
          progress: 12,
          maxProgress: 20,
          unlocked: false,
          xpReward: 180
        },
        {
          id: 'ai_whisperer',
          title: 'AI驯兽师',
          description: '掌握所有高级功能',
          icon: '🤖',
          category: 'mastery',
          rarity: 'legendary',
          progress: 3,
          maxProgress: 5,
          unlocked: false,
          xpReward: 600
        },
        
        // 特殊成就
        {
          id: 'early_adopter',
          title: '早期采用者',
          description: '在平台发布首月注册',
          icon: '🚀',
          category: 'special',
          rarity: 'rare',
          progress: 1,
          maxProgress: 1,
          unlocked: true,
          unlockedAt: '2024-01-01T00:00:00Z',
          xpReward: 100
        },
        {
          id: 'vip_member',
          title: 'VIP会员',
          description: '升级到VIP会员',
          icon: '👑',
          category: 'special',
          rarity: 'epic',
          progress: 1,
          maxProgress: 1,
          unlocked: true,
          unlockedAt: '2024-02-01T12:00:00Z',
          xpReward: 200
        },
        {
          id: 'beta_tester',
          title: '测试先锋',
          description: '参与Beta测试',
          icon: '🔬',
          category: 'special',
          rarity: 'legendary',
          progress: 1,
          maxProgress: 1,
          unlocked: false,
          xpReward: 500
        }
      ];

      const mockStats: AchievementStats = {
        totalAchievements: mockAchievements.length,
        unlockedAchievements: mockAchievements.filter(a => a.unlocked).length,
        totalXP: mockAchievements.reduce((sum, a) => sum + a.xpReward, 0),
        earnedXP: mockAchievements.filter(a => a.unlocked).reduce((sum, a) => sum + a.xpReward, 0),
        level: Math.floor(mockAchievements.filter(a => a.unlocked).reduce((sum, a) => sum + a.xpReward, 0) / 100) + 1,
        nextLevelXP: 100,
        progressToNextLevel: (mockAchievements.filter(a => a.unlocked).reduce((sum, a) => sum + a.xpReward, 0) % 100),
        categories: {
          generation: {
            total: mockAchievements.filter(a => a.category === 'generation').length,
            unlocked: mockAchievements.filter(a => a.category === 'generation' && a.unlocked).length
          },
          social: {
            total: mockAchievements.filter(a => a.category === 'social').length,
            unlocked: mockAchievements.filter(a => a.category === 'social' && a.unlocked).length
          },
          exploration: {
            total: mockAchievements.filter(a => a.category === 'exploration').length,
            unlocked: mockAchievements.filter(a => a.category === 'exploration' && a.unlocked).length
          },
          mastery: {
            total: mockAchievements.filter(a => a.category === 'mastery').length,
            unlocked: mockAchievements.filter(a => a.category === 'mastery' && a.unlocked).length
          },
          special: {
            total: mockAchievements.filter(a => a.category === 'special').length,
            unlocked: mockAchievements.filter(a => a.category === 'special' && a.unlocked).length
          }
        },
        recentUnlocks: mockAchievements.filter(a => a.unlocked).slice(-3).reverse()
      };

      setAchievements(mockAchievements);
      setStats(mockStats);
    } catch (error) {
      console.error('Failed to load achievements data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'text-neutral-600 dark:text-neutral-400';
      case 'rare':
        return 'text-blue-600 dark:text-blue-400';
      case 'epic':
        return 'text-purple-600 dark:text-purple-400';
      case 'legendary':
        return 'text-yellow-600 dark:text-yellow-400';
      default:
        return 'text-neutral-600 dark:text-neutral-400';
    }
  };

  const getRarityBgColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'bg-neutral-100 dark:bg-neutral-700';
      case 'rare':
        return 'bg-blue-100 dark:bg-blue-900/20';
      case 'epic':
        return 'bg-purple-100 dark:bg-purple-900/20';
      case 'legendary':
        return 'bg-yellow-100 dark:bg-yellow-900/20';
      default:
        return 'bg-neutral-100 dark:bg-neutral-700';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'generation':
        return <Image className="h-4 w-4" />;
      case 'social':
        return <Users className="h-4 w-4" />;
      case 'exploration':
        return <Target className="h-4 w-4" />;
      case 'mastery':
        return <Star className="h-4 w-4" />;
      case 'special':
        return <Crown className="h-4 w-4" />;
      default:
        return <Trophy className="h-4 w-4" />;
    }
  };

  const filteredAchievements = achievements.filter(achievement => {
    const categoryMatch = selectedCategory === 'all' || achievement.category === selectedCategory;
    const rarityMatch = selectedRarity === 'all' || achievement.rarity === selectedRarity;
    return categoryMatch && rarityMatch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Trophy className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-neutral-600 dark:text-neutral-400">{t('achievements.loading')}</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <Trophy className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">{t('achievements.noAchievements')}</h3>
        <p className="text-neutral-600 dark:text-neutral-400">{t('achievements.noAchievementsDesc')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">{t('achievements.title')}</h2>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">{t('achievements.description')}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
            {stats.unlockedAchievements}/{stats.totalAchievements}
          </span>
        </div>
      </div>

      {/* Level Progress */}
      <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">{t('achievements.level')} {stats.level}</h3>
            <p className="text-primary-100">{t('achievements.continueUnlock')}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{stats.earnedXP}</div>
            <div className="text-primary-100">{t('achievements.totalXP')}</div>
          </div>
        </div>
        <div className="w-full bg-white/20 rounded-full h-3 mb-2">
          <div
            className="bg-white h-3 rounded-full transition-all duration-300"
            style={{ width: `${(stats.progressToNextLevel / stats.nextLevelXP) * 100}%` }}
          ></div>
        </div>
        <div className="text-sm text-primary-100">
          {t('achievements.nextLevelNeed')} {stats.nextLevelXP - stats.progressToNextLevel} {t('achievements.experiencePoints')}
        </div>
      </div>

      {/* Category Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {Object.entries(stats.categories).map(([category, data]) => (
          <div key={category} className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-4">
            <div className="flex items-center space-x-2 mb-2">
              {getCategoryIcon(category)}
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 capitalize">
                {category === 'generation' ? t('achievements.filterGeneration') : 
                 category === 'social' ? t('achievements.filterSocial') :
                 category === 'exploration' ? t('achievements.filterExploration') :
                 category === 'mastery' ? t('achievements.filterMastery') : t('achievements.filterSpecial')}
              </span>
            </div>
            <div className="text-lg font-bold text-neutral-900 dark:text-white">
              {data.unlocked}/{data.total}
            </div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400">
              {Math.round((data.unlocked / data.total) * 100)}% {t('achievements.completion')}
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{t('achievements.category')}:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as any)}
            className="px-3 py-1 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
          >
            <option value="all">{t('achievements.filterAll')}</option>
            <option value="generation">{t('achievements.filterGeneration')}</option>
            <option value="social">{t('achievements.filterSocial')}</option>
            <option value="exploration">{t('achievements.filterExploration')}</option>
            <option value="mastery">{t('achievements.filterMastery')}</option>
            <option value="special">{t('achievements.filterSpecial')}</option>
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{t('achievements.rarity')}:</span>
          <select
            value={selectedRarity}
            onChange={(e) => setSelectedRarity(e.target.value as any)}
            className="px-3 py-1 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
          >
            <option value="all">{t('achievements.filterAll')}</option>
                          <option value="common">{t('achievements.rarityCommon')}</option>
              <option value="rare">{t('achievements.rarityRare')}</option>
              <option value="epic">{t('achievements.rarityEpic')}</option>
              <option value="legendary">{t('achievements.rarityLegendary')}</option>
          </select>
        </div>
      </div>

      {/* Recent Unlocks */}
      {stats.recentUnlocks.length > 0 && (
        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">{t('achievements.recentUnlocks')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.recentUnlocks.map((achievement) => (
              <div key={achievement.id} className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl">{achievement.icon}</div>
                <div className="flex-1">
                  <h4 className="font-medium text-neutral-900 dark:text-white">{achievement.title}</h4>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">{achievement.description}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-green-600 dark:text-green-400">+{achievement.xpReward} XP</span>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                      {new Date(achievement.unlockedAt!).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAchievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`bg-white dark:bg-neutral-800 rounded-xl border transition-all duration-300 ${
              achievement.unlocked
                ? 'border-green-200 dark:border-green-800'
                : 'border-neutral-200 dark:border-neutral-700'
            }`}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="text-3xl">{achievement.icon}</div>
                <div className="flex items-center space-x-2">
                  {achievement.unlocked ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <Lock className="h-5 w-5 text-neutral-400" />
                  )}
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${getRarityBgColor(achievement.rarity)} ${getRarityColor(achievement.rarity)}`}>
                    {achievement.rarity === 'common' ? t('achievements.rarityCommon') :
                     achievement.rarity === 'rare' ? t('achievements.rarityRare') :
                     achievement.rarity === 'epic' ? t('achievements.rarityEpic') : t('achievements.rarityLegendary')}
                  </span>
                </div>
              </div>
              
              <h3 className={`font-semibold mb-2 ${
                achievement.unlocked
                  ? 'text-neutral-900 dark:text-white'
                  : 'text-neutral-400 dark:text-neutral-500'
              }`}>
                {achievement.title}
              </h3>
              
              <p className={`text-sm mb-4 ${
                achievement.unlocked
                  ? 'text-neutral-600 dark:text-neutral-400'
                  : 'text-neutral-500 dark:text-neutral-500'
              }`}>
                {achievement.description}
              </p>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600 dark:text-neutral-400">{t('achievements.progress')}</span>
                  <span className="font-medium text-neutral-900 dark:text-white">
                    {achievement.progress}/{achievement.maxProgress}
                  </span>
                </div>
                
                <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      achievement.unlocked
                        ? 'bg-green-500'
                        : 'bg-primary-500'
                    }`}
                    style={{ width: `${Math.min((achievement.progress / achievement.maxProgress) * 100, 100)}%` }}
                  ></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-500 dark:text-neutral-500">
                    +{achievement.xpReward} XP
                  </span>
                  {achievement.unlocked && achievement.unlockedAt && (
                    <span className="text-xs text-neutral-500 dark:text-neutral-500">
                      {new Date(achievement.unlockedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 