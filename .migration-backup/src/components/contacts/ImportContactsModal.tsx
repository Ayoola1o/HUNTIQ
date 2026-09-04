import React, { useState } from 'react';
import { X, Upload, CheckCircle2, FileSpreadsheet } from 'lucide-react';

interface ImportContactsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (count: number) => void;
}

export const ImportContactsModal: React.FC<ImportContactsModalProps> = ({
  isOpen,
  onClose,
  onImportComplete
}) => {
  const [fileSelected, setFileSelected] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleSimulatedUpload = () => {
    setFileSelected(true);
  };

  const handleStartImport = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onImportComplete(417);
      onClose();
    }, 900);
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
        width: '500px',
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
            <Upload size={16} color="#818cf8" />
            <div style={{ fontSize: '15px', fontWeight: 800 }}>Import Contacts</div>
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
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {!fileSelected ? (
            <div
              onClick={handleSimulatedUpload}
              style={{
                border: '2px dashed #cbd5e1',
                borderRadius: '12px',
                padding: '30px 20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                backgroundColor: '#f8fafc',
                cursor: 'pointer',
                textAlign: 'center'
              }}
            >
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: '#ede9fe',
                color: '#6d28d9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FileSpreadsheet size={20} />
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                  Click to upload CSV or Excel spreadsheet
                </div>
                <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                  Supports .csv, .xlsx, HubSpot, and Salesforce lead exports
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '10px',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <CheckCircle2 size={18} color="#16a34a" />
                <div>
                  <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#14532d' }}>
                    lagos_enterprise_leads.csv (432 contacts)
                  </div>
                  <div style={{ fontSize: '11px', color: '#166534' }}>
                    Auto-mapped columns: First Name, Last Name, Email, Role, Company, Location
                  </div>
                </div>
              </div>

              {/* Deduplication & Validation Summary */}
              <div style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '12px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                fontSize: '12px'
              }}>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>Pre-Import Validation:</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669' }}>
                  <span>✓ 417 New verified contacts</span>
                  <span style={{ fontWeight: 700 }}>Ready</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#d97706' }}>
                  <span>⚠ 12 Duplicate contacts merged</span>
                  <span style={{ fontWeight: 600 }}>Updated</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#dc2626' }}>
                  <span>✕ 3 Invalid email syntaxes skipped</span>
                  <span style={{ fontWeight: 600 }}>Excluded</span>
                </div>
              </div>
            </div>
          )}

          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            marginTop: '4px',
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
              type="button"
              disabled={!fileSelected || isProcessing}
              onClick={handleStartImport}
              style={{
                backgroundColor: fileSelected ? '#4f46e5' : '#94a3b8',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 20px',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: fileSelected ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>{isProcessing ? 'Enriching...' : 'Import 417 Contacts'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
