import React from 'react';
import { 
  Building2, 
  Tag, 
  Target, 
  Clock, 
  Globe2, 
  Building, 
  UserCheck, 
  Zap, 
  DollarSign, 
  Sparkles 
} from 'lucide-react';
import type { OnboardingData } from '../types/onboarding';

interface SummaryCardProps {
  data: OnboardingData;
  currentStep: number;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ data, currentStep }) => {
  const objectiveLabels: Record<string, string> = {
    generate_clients: 'Generate new clients',
    increase_pipeline: 'Increase pipeline',
    expand_accounts: 'Expand accounts',
    market_intelligence: 'Market intelligence',
  };

  const getActiveSignalsCount = () => {
    return Object.values(data.signals).filter(Boolean).length;
  };

  const summaryItems = [
    {
      id: 'business',
      label: 'Business',
      value: data.workspaceName || 'To be defined',
      icon: <Building2 size={16} color="#7c3aed" />,
      badgeBg: '#f3e8ff',
      isSet: !!data.workspaceName,
    },
    {
      id: 'whatYouSell',
      label: 'What you sell',
      value: data.whatYouSell || 'To be defined',
      icon: <Tag size={16} color="#0d9488" />,
      badgeBg: '#ccfbf1',
      isSet: !!data.whatYouSell,
    },
    {
      id: 'primaryObjective',
      label: 'Primary objective',
      value: objectiveLabels[data.primaryObjective] || 'Generate new clients',
      icon: <Target size={16} color="#e11d48" />,
      badgeBg: '#ffe4e6',
      isSet: true,
    },
    {
      id: 'icp',
      label: 'ICP',
      value: currentStep >= 2 && data.industries.length > 0 
        ? data.industries.slice(0, 2).join(', ') + (data.industries.length > 2 ? '...' : '')
        : 'To be defined',
      icon: <Clock size={16} color="#059669" />,
      badgeBg: '#d1fae5',
      isSet: currentStep >= 2 && data.industries.length > 0,
    },
    {
      id: 'targetMarkets',
      label: 'Target markets',
      value: currentStep >= 2 && data.geographicMarkets.length > 0 
        ? data.geographicMarkets.slice(0, 2).join(', ')
        : 'To be defined',
      icon: <Globe2 size={16} color="#0284c7" />,
      badgeBg: '#e0f2fe',
      isSet: currentStep >= 2 && data.geographicMarkets.length > 0,
    },
    {
      id: 'companySize',
      label: 'Company size',
      value: currentStep >= 2 ? data.companySize : 'To be defined',
      icon: <Building size={16} color="#2563eb" />,
      badgeBg: '#dbeafe',
      isSet: currentStep >= 2,
    },
    {
      id: 'targetRoles',
      label: 'Target roles',
      value: currentStep >= 3 && data.targetBuyerRoles.length > 0 
        ? data.targetBuyerRoles.slice(0, 2).join(', ')
        : 'To be defined',
      icon: <UserCheck size={16} color="#16a34a" />,
      badgeBg: '#dcfce7',
      isSet: currentStep >= 3 && data.targetBuyerRoles.length > 0,
    },
    {
      id: 'prioritySignals',
      label: 'Priority signals',
      value: currentStep >= 4 
        ? `${getActiveSignalsCount()} signals active`
        : 'To be defined',
      icon: <Zap size={16} color="#d97706" />,
      badgeBg: '#fef3c7',
      isSet: currentStep >= 4,
    },
    {
      id: 'avgDealValue',
      label: 'Average deal value',
      value: currentStep >= 3 ? `$${data.averageDealValue.toLocaleString()}` : 'To be defined',
      icon: <DollarSign size={16} color="#0284c7" />,
      badgeBg: '#e0f2fe',
      isSet: currentStep >= 3,
    },
  ];

  return (
    <div style={{
      width: '320px',
      maxWidth: '100%',
      minWidth: 0,
      flex: '1 1 300px',
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      border: '1px solid #eaecf0',
      padding: '20px',
      boxShadow: '0 4px 16px -2px rgba(16, 24, 40, 0.04)',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      height: 'fit-content',
    }}>
      {/* Header */}
      <div>
        <h3 style={{
          fontSize: '16px',
          fontWeight: 700,
          color: '#0f172a',
          margin: '0 0 4px 0',
          fontFamily: 'var(--font-primary)'
        }}>
          Your Hunting Summary
        </h3>
        <p style={{
          fontSize: '12.5px',
          color: '#64748b',
          margin: 0
        }}>
          Here's what we'll build for you.
        </p>
      </div>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
        {summaryItems.map((item) => (
          <div
            key={item.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '4px 0',
            }}
          >
            {/* Icon Box */}
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: item.badgeBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              {item.icon}
            </div>

            {/* Label & Value */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: '11.5px',
                color: '#64748b',
                fontWeight: 500,
                lineHeight: 1.2
              }}>
                {item.label}
              </div>
              <div style={{
                fontSize: '13px',
                color: item.isSet ? '#0f172a' : '#94a3b8',
                fontWeight: item.isSet ? 600 : 400,
                lineHeight: 1.3,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {item.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Purple Callout Card */}
      <div style={{
        marginTop: '8px',
        backgroundColor: '#faf5ff',
        borderRadius: '12px',
        border: '1px solid #f3e8ff',
        padding: '14px',
        display: 'flex',
        gap: '10px',
        alignItems: 'flex-start'
      }}>
        <div style={{
          color: '#7c3aed',
          flexShrink: 0,
          marginTop: '2px'
        }}>
          <Sparkles size={18} />
        </div>
        <div>
          <h4 style={{
            fontSize: '13px',
            fontWeight: 700,
            color: '#6b21a8',
            margin: '0 0 4px 0'
          }}>
            Ready to hunt smarter?
          </h4>
          <p style={{
            fontSize: '11.5px',
            color: '#7e22ce',
            lineHeight: 1.45,
            margin: 0
          }}>
            We'll use AI to find the right companies, people, and timing so you can win more deals.
          </p>
        </div>
      </div>
    </div>
  );
};
