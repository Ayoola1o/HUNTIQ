import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import type { TeamMember } from '../../types/settings';

interface TeamSettingsPanelProps {
  members: TeamMember[];
  onInviteMember: (email: string, role: TeamMember['role']) => void;
  onRemoveMember: (id: string) => void;
}

export const TeamSettingsPanel: React.FC<TeamSettingsPanelProps> = ({
  members,
  onInviteMember,
  onRemoveMember
}) => {
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<TeamMember['role']>('Sales Rep');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    onInviteMember(inviteEmail, inviteRole);
    setInviteEmail('');
    setIsInviteModalOpen(false);
  };

  return (
    <div style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Team & Members ({members.length})
          </h2>
          <p style={{ fontSize: '12px', color: '#64748b', margin: '3px 0 0 0' }}>
            Manage workspace seats, user roles, and security access levels.
          </p>
        </div>

        <button
          onClick={() => setIsInviteModalOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#4f46e5',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            padding: '7px 14px',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(79, 70, 229, 0.25)'
          }}
        >
          <Plus size={13} />
          <span>+ Invite Member</span>
        </button>
      </div>

      {/* Team Members Table */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #eaecf0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12.5px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #eaecf0', color: '#64748b', fontSize: '11px', textTransform: 'uppercase' }}>
              <th style={{ padding: '12px 16px', fontWeight: 700 }}>Member Name</th>
              <th style={{ padding: '12px 16px', fontWeight: 700 }}>Role</th>
              <th style={{ padding: '12px 16px', fontWeight: 700 }}>Status</th>
              <th style={{ padding: '12px 16px', fontWeight: 700 }}>Last Active</th>
              <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                {/* Name */}
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: member.avatarBg,
                      color: member.avatarColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11.5px',
                      fontWeight: 800
                    }}>
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <strong style={{ fontSize: '13px', color: '#0f172a', display: 'block' }}>{member.name}</strong>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>{member.email}</span>
                    </div>
                  </div>
                </td>

                {/* Role */}
                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: member.role === 'Owner' ? '#4338ca' : '#334155',
                    backgroundColor: member.role === 'Owner' ? '#eef2ff' : '#f8fafc',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0'
                  }}>
                    {member.role}
                  </span>
                </td>

                {/* Status */}
                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    fontSize: '10.5px',
                    fontWeight: 700,
                    color: member.status === 'Active' ? '#059669' : '#ea580c',
                    backgroundColor: member.status === 'Active' ? '#ecfdf5' : '#fff7ed',
                    padding: '2px 8px',
                    borderRadius: '6px'
                  }}>
                    ● {member.status}
                  </span>
                </td>

                {/* Last Active */}
                <td style={{ padding: '12px 16px', fontSize: '11.5px', color: '#64748b' }}>
                  {member.lastActive}
                </td>

                {/* Action */}
                <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                  {member.role !== 'Owner' && (
                    <button
                      onClick={() => onRemoveMember(member.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#dc2626',
                        cursor: 'pointer',
                        padding: '4px 8px',
                        fontSize: '11.5px'
                      }}
                    >
                      Remove
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Invite Modal */}
      {isInviteModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(5px)',
          zIndex: 1100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            width: '460px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Invite Team Member
            </h3>

            <form onSubmit={handleInviteSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="colleague@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '13px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Role Permission
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '12.5px'
                  }}
                >
                  <option value="Manager">Manager (Full Workspace Access)</option>
                  <option value="Sales Rep">Sales Rep (Assigned Accounts & Pipeline)</option>
                  <option value="Analyst">Analyst (Read & Reports Only)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '7px 12px',
                    fontSize: '12px',
                    color: '#475569',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  style={{
                    backgroundColor: '#4f46e5',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '7px 16px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
