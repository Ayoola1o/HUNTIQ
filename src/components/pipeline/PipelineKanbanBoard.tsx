import React from 'react';
import { 
  ArrowRight, 
  ArrowLeft, 
  AlertTriangle, 
  Clock, 
  Plus
} from 'lucide-react';
import type { PipelineDealItem, PipelineStage } from '../../types/pipeline';
import { useHuntiq } from '../../context/HuntiqContext';

interface PipelineKanbanBoardProps {
  deals: PipelineDealItem[];
  onSelectDeal: (deal: PipelineDealItem) => void;
  onMoveDealStage: (dealId: string, newStage: PipelineStage) => void;
  onQuickAddDeal: (stage: PipelineStage) => void;
}

export const PipelineKanbanBoard: React.FC<PipelineKanbanBoardProps> = ({
  deals,
  onSelectDeal,
  onMoveDealStage,
  onQuickAddDeal
}) => {
  const { formatCurrency } = useHuntiq();
  const columns: { id: PipelineStage; label: string; color: string; bg: string }[] = [
    { id: 'contacted', label: 'Contacted', color: '#2563eb', bg: '#eff6ff' },
    { id: 'meeting', label: 'Meeting Scheduled', color: '#7c3aed', bg: '#f5f3ff' },
    { id: 'proposal', label: 'Proposal Sent', color: '#d97706', bg: '#fffbeb' },
    { id: 'negotiation', label: 'Negotiation', color: '#ea580c', bg: '#fff7ed' },
    { id: 'won', label: 'Closed Won', color: '#059669', bg: '#ecfdf5' }
  ];

  const getStageDeals = (stage: PipelineStage) => deals.filter((d) => d.stage === stage);

  const getNextStage = (stage: PipelineStage): PipelineStage | null => {
    switch (stage) {
      case 'contacted': return 'meeting';
      case 'meeting': return 'proposal';
      case 'proposal': return 'negotiation';
      case 'negotiation': return 'won';
      default: return null;
    }
  };

  const getPrevStage = (stage: PipelineStage): PipelineStage | null => {
    switch (stage) {
      case 'won': return 'negotiation';
      case 'negotiation': return 'proposal';
      case 'proposal': return 'meeting';
      case 'meeting': return 'contacted';
      default: return null;
    }
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(5, minmax(280px, 1fr))',
      gap: '16px',
      padding: '0 32px 32px 32px',
      overflowX: 'auto',
      alignItems: 'flex-start'
    }}>
      {columns.map((col) => {
        const stageDeals = getStageDeals(col.id);
        const stageTotalValue = stageDeals.reduce((sum, d) => sum + d.dealValue, 0);

        return (
          <div
            key={col.id}
            style={{
              backgroundColor: '#f8fafc',
              borderRadius: '14px',
              border: '1px solid #eaecf0',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: 'calc(100vh - 270px)',
              overflow: 'hidden'
            }}
          >
            {/* Column Header */}
            <div style={{
              padding: '14px 16px',
              borderBottom: '1px solid #eaecf0',
              backgroundColor: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: col.color
                  }} />
                  <h3 style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    {col.label}
                  </h3>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    backgroundColor: col.bg,
                    color: col.color,
                    padding: '1px 6px',
                    borderRadius: '10px'
                  }}>
                    {stageDeals.length}
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', fontWeight: 600 }}>
                  {formatCurrency(stageTotalValue)} volume
                </div>
              </div>

              <button
                onClick={() => onQuickAddDeal(col.id)}
                title="Add deal to this stage"
                style={{
                  background: 'none',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '3px 6px',
                  color: '#64748b',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <Plus size={13} />
              </button>
            </div>

            {/* Cards List */}
            <div style={{
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              overflowY: 'auto'
            }}>
              {stageDeals.length === 0 ? (
                <div style={{
                  padding: '32px 16px',
                  textAlign: 'center',
                  color: '#94a3b8',
                  fontSize: '11.5px',
                  border: '1.5px dashed #cbd5e1',
                  borderRadius: '10px'
                }}>
                  No deals in {col.label}
                </div>
              ) : (
                stageDeals.map((deal) => {
                  const nextSt = getNextStage(deal.stage);
                  const prevSt = getPrevStage(deal.stage);

                  return (
                    <div
                      key={deal.id}
                      onClick={() => onSelectDeal(deal)}
                      style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '12px',
                        border: deal.isAtRisk ? '1.5px solid #fca5a5' : '1px solid #e2e8f0',
                        boxShadow: '0 2px 6px rgba(16, 24, 40, 0.03)',
                        padding: '14px',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#818cf8';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = deal.isAtRisk ? '#fca5a5' : '#e2e8f0';
                        e.currentTarget.style.boxShadow = '0 2px 6px rgba(16, 24, 40, 0.03)';
                      }}
                    >
                      {/* Top Deal Title & Value */}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
                            {deal.companyName}
                          </span>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{
                              fontSize: '10px',
                              fontWeight: 800,
                              backgroundColor: deal.opportunityScore >= 90 ? '#ecfdf5' : '#eff6ff',
                              color: deal.opportunityScore >= 90 ? '#047857' : '#1d4ed8',
                              padding: '1px 5px',
                              borderRadius: '4px'
                            }}>
                              Opp {deal.opportunityScore}
                            </span>
                          </div>
                        </div>

                        <div style={{
                          fontSize: '13px',
                          fontWeight: 800,
                          color: '#0f172a',
                          marginTop: '2px',
                          lineHeight: 1.3
                        }}>
                          {deal.dealTitle}
                        </div>

                        <div style={{
                          fontSize: '15px',
                          fontWeight: 900,
                          color: '#059669',
                          marginTop: '4px'
                        }}>
                          {formatCurrency(deal.dealValue)}
                          <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', marginLeft: '6px' }}>
                            ({deal.probability}% close prob)
                          </span>
                        </div>
                      </div>

                      {/* Contact Info */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        backgroundColor: '#f8fafc',
                        padding: '6px 8px',
                        borderRadius: '6px'
                      }}>
                        <div style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          backgroundColor: deal.contactAvatarBg,
                          color: deal.contactAvatarColor,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '10px',
                          fontWeight: 800
                        }}>
                          {deal.contactName.split(' ').map(n => n[0]).join('')}
                        </div>

                        <div style={{ fontSize: '11px', color: '#334155' }}>
                          <strong>{deal.contactName}</strong>
                          <span style={{ color: '#94a3b8', marginLeft: '4px' }}>• {deal.contactRole}</span>
                        </div>
                      </div>

                      {/* Next Action Callout */}
                      <div style={{
                        backgroundColor: deal.isAtRisk ? '#fef2f2' : '#f5f3ff',
                        color: deal.isAtRisk ? '#991b1b' : '#5b21b6',
                        fontSize: '10.5px',
                        fontWeight: 700,
                        padding: '5px 8px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {deal.isAtRisk ? <AlertTriangle size={11} color="#dc2626" /> : <Clock size={11} color="#6366f1" />}
                          <span>Next: {deal.nextAction}</span>
                        </span>
                        <span style={{ color: '#94a3b8', fontSize: '9.5px' }}>{deal.nextActionDueDate}</span>
                      </div>

                      {/* Quick Move Buttons */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingTop: '6px',
                        borderTop: '1px solid #f1f5f9'
                      }}>
                        <button
                          disabled={!prevSt}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (prevSt) onMoveDealStage(deal.id, prevSt);
                          }}
                          style={{
                            background: 'none',
                            border: '1px solid #cbd5e1',
                            borderRadius: '4px',
                            padding: '2px 6px',
                            color: prevSt ? '#475569' : '#cbd5e1',
                            cursor: prevSt ? 'pointer' : 'default',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                            fontSize: '10px'
                          }}
                        >
                          <ArrowLeft size={10} />
                          <span>Prev</span>
                        </button>

                        <span style={{ fontSize: '10px', color: '#94a3b8' }}>
                          {deal.lastActivity}
                        </span>

                        <button
                          disabled={!nextSt}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (nextSt) onMoveDealStage(deal.id, nextSt);
                          }}
                          style={{
                            background: nextSt ? '#eff6ff' : 'none',
                            border: '1px solid',
                            borderColor: nextSt ? '#bfdbfe' : '#cbd5e1',
                            borderRadius: '4px',
                            padding: '2px 6px',
                            color: nextSt ? '#1d4ed8' : '#cbd5e1',
                            cursor: nextSt ? 'pointer' : 'default',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                            fontSize: '10px',
                            fontWeight: 700
                          }}
                        >
                          <span>Next</span>
                          <ArrowRight size={10} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
