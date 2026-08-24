import React, { useState } from 'react';
import { X, Upload, Check, User } from 'lucide-react';

interface AvatarUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatar: string;
  onSaveAvatar: (newUrl: string) => void;
}

export const AvatarUploadModal: React.FC<AvatarUploadModalProps> = ({
  isOpen,
  onClose,
  currentAvatar,
  onSaveAvatar
}) => {
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar);

  if (!isOpen) return null;

  const presetAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'
  ];

  const handleApply = () => {
    onSaveAvatar(selectedAvatar);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '440px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid #f1f5f9'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: '#f5f3ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#7c3aed'
            }}>
              <User size={16} />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Update Profile Photo
              </h3>
              <p style={{ fontSize: '11.5px', color: '#64748b', margin: 0 }}>
                Select a preset or upload your high-resolution portrait.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Upload Drop Area */}
          <div style={{
            border: '2px dashed #cbd5e1',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center',
            backgroundColor: '#f8fafc',
            cursor: 'pointer'
          }}>
            <Upload size={24} color="#6366f1" style={{ margin: '0 auto 8px auto' }} />
            <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#0f172a', display: 'block' }}>
              Click to upload photo
            </span>
            <span style={{ fontSize: '11px', color: '#64748b' }}>
              SVG, PNG, JPG or GIF (max. 800x800px)
            </span>
          </div>

          {/* Preset Choices */}
          <div>
            <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#344054', display: 'block', marginBottom: '8px' }}>
              Or choose a preset portrait
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px' }}>
              {presetAvatars.map((url, idx) => {
                const isSelected = selectedAvatar === url;
                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedAvatar(url)}
                    style={{
                      position: 'relative',
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      border: isSelected ? '2.5px solid #4f46e5' : '1px solid #e2e8f0',
                      boxShadow: isSelected ? '0 0 0 2px rgba(79, 70, 229, 0.2)' : 'none'
                    }}
                  >
                    <img src={url} alt="Preset" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    {isSelected && (
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: 'rgba(79, 70, 229, 0.35)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff'
                      }}>
                        <Check size={16} strokeWidth={3} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #d0d5dd',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#344054',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              style={{
                backgroundColor: '#4f46e5',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 18px',
                fontSize: '12px',
                fontWeight: 700,
                color: '#ffffff',
                cursor: 'pointer'
              }}
            >
              Save Avatar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
