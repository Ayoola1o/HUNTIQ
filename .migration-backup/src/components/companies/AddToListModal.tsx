import React, { useState } from 'react';
import type { CompanyItem } from '../../types/company';
import { X, Plus, FolderPlus, Check } from 'lucide-react';

interface AddToListModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: CompanyItem | null;
  onSave: (listName: string) => void;
}

export const AddToListModal: React.FC<AddToListModalProps> = ({
  isOpen,
  onClose,
  company,
  onSave
}) => {
  const [selectedList, setSelectedList] = useState('Lagos Prospects');
  const [newListName, setNewListName] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  if (!isOpen || !company) return null;

  const existingLists = [
    { name: 'Lagos Prospects', count: 48 },
    { name: 'High Priority Targets', count: 18 },
    { name: 'HR Consulting Pipeline', count: 26 },
    { name: 'Series B Tech Scaleups', count: 12 },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = isCreatingNew ? newListName.trim() : selectedList;
    if (finalName) {
      onSave(finalName);
      onClose();
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(11, 15, 25, 0.65)',
      backdropFilter: 'blur(4px)',
      zIndex: 60,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        width: '460px',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 20px 40px -10px rgba(0,0,0,0.25)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          backgroundColor: '#0b0f19',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FolderPlus size={16} color="#818cf8" />
            <div style={{ fontSize: '15px', fontWeight: 800 }}>Add to List</div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '6px'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ fontSize: '13px', color: '#475569' }}>
            Add <strong>{company.name}</strong> to an existing company list or create a new one.
          </div>

          {!isCreatingNew ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                Select List:
              </label>
              {existingLists.map((list) => (
                <div
                  key={list.name}
                  onClick={() => setSelectedList(list.name)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: selectedList === list.name ? '1.5px solid #6366f1' : '1px solid #e2e8f0',
                    backgroundColor: selectedList === list.name ? '#f5f3ff' : '#ffffff',
                    cursor: 'pointer'
                  }}
                >
                  <span style={{ fontSize: '13px', fontWeight: 600, color: selectedList === list.name ? '#4f46e5' : '#1e293b' }}>
                    {list.name}
                  </span>
                  <span style={{ fontSize: '11.5px', color: '#94a3b8' }}>
                    {list.count} companies
                  </span>
                </div>
              ))}

              <button
                type="button"
                onClick={() => setIsCreatingNew(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'none',
                  border: '1px dashed #cbd5e1',
                  borderRadius: '8px',
                  padding: '9px 14px',
                  color: '#6366f1',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginTop: '4px'
                }}
              >
                <Plus size={14} />
                <span>Create New List</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                New List Name:
              </label>
              <input
                type="text"
                required
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="e.g. West Africa Enterprise Scaleups"
                style={{
                  height: '38px',
                  padding: '0 12px',
                  borderRadius: '8px',
                  border: '1px solid #6366f1',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
              <button
                type="button"
                onClick={() => setIsCreatingNew(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  fontSize: '12px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  padding: 0
                }}
              >
                ← Choose existing list
              </button>
            </div>
          )}

          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            marginTop: '8px',
            borderTop: '1px solid #eaecf0',
            paddingTop: '16px'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '12.5px',
                fontWeight: 600,
                color: '#334155',
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
                padding: '8px 20px',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Check size={14} />
              <span>Add to List</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
