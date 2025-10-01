'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Users,
  Check,
  DollarSign,
  TrendingUp,
  Gift,
  Copy,
  Share2,
  QrCode,
  ExternalLink,
  Calendar,
  UserPlus,
  Award
} from 'lucide-react';

interface InviteData {
  inviteCode: string;
  totalInvites: number;
  successfulInvites: number;
  totalEarnings: number;
  monthlyEarnings: number;
  inviteRate: number;
  inviteList: InviteRecord[];
  monthlyTrend: number[];
}

interface InviteRecord {
  id: string;
  username: string;
  email: string;
  status: 'pending' | 'registered' | 'active';
  registeredAt: string;
  earnings: number;
  avatar?: string;
}

export default function InviteTab() {
  const { t } = useLanguage();
  const [inviteData, setInviteData] = useState<InviteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'registered' | 'active'>('all');

  useEffect(() => {
    loadInviteData();
  }, []);

  const loadInviteData = async () => {
    try {
      setLoading(true);
      
      // 模拟API调用
      const mockData: InviteData = {
        inviteCode: 'AIICG2025',
        totalInvites: 23,
        successfulInvites: 18,
        totalEarnings: 156.80,
        monthlyEarnings: 45.20,
        inviteRate: 20,
        monthlyTrend: [12, 18, 25, 31, 28, 35, 42],
        inviteList: [
          {
            id: '1',
            username: '张三',
            email: 'zhangsan@example.com',
            status: 'active',
            registeredAt: '2025-01-15',
            earnings: 12.50,
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangsan'
          },
          {
            id: '2',
            username: '李四',
            email: 'lisi@example.com',
            status: 'registered',
            registeredAt: '2025-01-20',
            earnings: 8.75,
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisi'
          },
          {
            id: '3',
            username: '王五',
            email: 'wangwu@example.com',
            status: 'pending',
            registeredAt: '2025-01-25',
            earnings: 0,
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wangwu'
          }
        ]
      };

      setInviteData(mockData);
    } catch (error) {
      console.error('Failed to load invite data:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyInviteCode = async () => {
    if (!inviteData) return;
    
    try {
      await navigator.clipboard.writeText(inviteData.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  const shareInviteLink = () => {
    if (!inviteData) return;
    
    const inviteLink = `${window.location.origin}/register?ref=${inviteData.inviteCode}`;
    
    if (navigator.share) {
      navigator.share({
        title: t('inviteShareTitle'),
        text: t('inviteShareText'),
        url: inviteLink
      });
    } else {
      navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'registered': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'pending': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return t('inviteStatusActive');
      case 'registered': return t('inviteStatusRegistered');
      case 'pending': return t('inviteStatusPending');
      default: return t('inviteStatusUnknown');
    }
  };

  const filteredInvites = inviteData?.inviteList.filter(invite => 
    activeFilter === 'all' || invite.status === activeFilter
  ) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!inviteData) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-600 dark:text-neutral-400">{t('inviteNoData')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">{t('inviteTitle')}</h2>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">{t('inviteDescription')}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Gift className="h-5 w-5 text-green-500" />
          <span className="text-sm text-green-600 dark:text-green-400 font-medium">
            {inviteData.inviteRate}% {t('inviteRate')}
          </span>
        </div>
      </div>

      {/* Invite Code Section */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold mb-1">{t('inviteCode')}</h3>
            <p className="text-primary-100 text-sm">{t('inviteShare')}</p>
          </div>
          <QrCode className="h-12 w-12 text-primary-200" />
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex-1 bg-white/20 rounded-lg p-4">
            <div className="text-2xl font-mono font-bold tracking-wider">
              {inviteData.inviteCode}
            </div>
          </div>
          
          <button
            onClick={copyInviteCode}
            className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 rounded-lg px-4 py-3 transition-colors"
          >
            <Copy className="h-5 w-5" />
            <span>{copied ? t('inviteCopied') : t('inviteCopyCode')}</span>
          </button>
          
          <button
            onClick={shareInviteLink}
            className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 rounded-lg px-4 py-3 transition-colors"
          >
            <Share2 className="h-5 w-5" />
            <span>{t('inviteShare')}</span>
          </button>
        </div>
        
        <div className="mt-4 text-primary-100 text-sm">
          <p>{t('inviteInviteLink')}：{window.location.origin}/register?ref={inviteData.inviteCode}</p>
        </div>
      </div>

      {/* Invite Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Users className="h-8 w-8" />
            <span className="text-blue-100 text-sm">{t('inviteTotalInvites')}</span>
          </div>
          <div className="text-3xl font-bold mb-1">{inviteData.totalInvites}</div>
          <div className="text-blue-100 text-sm">{t('inviteTotalInvites')}</div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Check className="h-8 w-8" />
            <span className="text-green-100 text-sm">{t('inviteSuccessfulInvites')}</span>
          </div>
          <div className="text-3xl font-bold mb-1">{inviteData.successfulInvites}</div>
          <div className="text-green-100 text-sm">{t('inviteSuccessfulInvites')}</div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="h-8 w-8" />
            <span className="text-purple-100 text-sm">{t('inviteTotalEarnings')}</span>
          </div>
          <div className="text-3xl font-bold mb-1">${inviteData.totalEarnings}</div>
          <div className="text-purple-100 text-sm">{t('inviteTotalEarnings')}</div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="h-8 w-8" />
            <span className="text-orange-100 text-sm">{t('inviteMonthlyEarnings')}</span>
          </div>
          <div className="text-3xl font-bold mb-1">${inviteData.monthlyEarnings}</div>
          <div className="text-orange-100 text-sm">{t('inviteMonthlyEarnings')}</div>
        </div>
      </div>

      {/* Invite List */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">{t('inviteRecords')}</h3>
            <div className="flex space-x-2">
              {['all', 'pending', 'registered', 'active'].map(filter => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter as any)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    activeFilter === filter
                      ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                  }`}
                >
                  {filter === 'all' && t('inviteFilterAll')}
                  {filter === 'pending' && t('inviteFilterPending')}
                  {filter === 'registered' && t('inviteFilterRegistered')}
                  {filter === 'active' && t('inviteFilterActive')}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="p-6">
          {filteredInvites.length === 0 ? (
            <div className="text-center py-8">
              <UserPlus className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
              <p className="text-neutral-600 dark:text-neutral-400">{t('inviteNoInviteRecords')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredInvites.map(invite => (
                <div key={invite.id} className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <img
                      src={invite.avatar}
                      alt={invite.username}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <div className="font-medium text-neutral-900 dark:text-white">
                        {invite.username}
                      </div>
                      <div className="text-sm text-neutral-600 dark:text-neutral-400">
                        {invite.email}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invite.status)}`}>
                      {getStatusText(invite.status)}
                    </span>
                    
                    <div className="text-right">
                      <div className="font-medium text-neutral-900 dark:text-white">
                        ${invite.earnings}
                      </div>
                      <div className="text-xs text-neutral-600 dark:text-neutral-400">
                        {t('inviteCommissionEarnings')}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm text-neutral-600 dark:text-neutral-400">
                        {new Date(invite.registeredAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-neutral-500 dark:text-neutral-500">
                        {t('inviteRegistrationTime')}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Monthly Trend Chart */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">{t('inviteMonthlyTrend')}</h3>
          <Calendar className="h-5 w-5 text-neutral-400" />
        </div>
        
        <div className="h-64 flex items-end justify-between space-x-2">
          {inviteData.monthlyTrend.map((value, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div className="w-full bg-primary-100 dark:bg-primary-900/20 rounded-t-lg relative">
                <div
                  className="bg-primary-500 rounded-t-lg transition-all duration-500"
                  style={{ height: `${(value / Math.max(...inviteData.monthlyTrend)) * 100}%` }}
                ></div>
              </div>
              <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-2">
                {value}
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-between text-xs text-neutral-500 dark:text-neutral-500 mt-4">
          <span>1{t('month')}</span>
          <span>2{t('month')}</span>
          <span>3{t('month')}</span>
          <span>4{t('month')}</span>
          <span>5{t('month')}</span>
          <span>6{t('month')}</span>
          <span>7{t('month')}</span>
        </div>
      </div>
    </div>
  );
} 