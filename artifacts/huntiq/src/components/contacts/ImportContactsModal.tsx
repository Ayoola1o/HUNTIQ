import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  CheckCircle2, 
  FileSpreadsheet, 
  AlertCircle, 
  Download, 
  Clipboard, 
  Trash2, 
  Loader2,
  FileText
} from 'lucide-react';
import type { ContactItem, DecisionRole } from '../../types/contact';

interface ImportContactsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (contacts: Partial<ContactItem>[]) => Promise<void> | void;
}

interface ParsedContactRow {
  name: string;
  email: string;
  companyName: string;
  role: string;
  location: string;
  phone?: string;
  decisionRole?: DecisionRole;
  influenceScore?: number;
}

export const ImportContactsModal: React.FC<ImportContactsModalProps> = ({
  isOpen,
  onClose,
  onImport
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [fileName, setFileName] = useState<string | null>(null);
  const [pastedText, setPastedText] = useState('');
  const [parsedRows, setParsedRows] = useState<ParsedContactRow[]>([]);
  const [skippedCount, setSkippedCount] = useState(0);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  // Simple, robust CSV string tokenizer supporting quotes and delimiter detection
  const parseCSVContent = (text: string) => {
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length < 2) {
      setParsedRows([]);
      setSkippedCount(0);
      setWarningMessage('CSV must contain a header row and at least one data row.');
      return;
    }

    // Detect delimiter from first row (comma, semicolon, or tab)
    const firstLine = lines[0];
    let delimiter = ',';
    if (firstLine.includes('\t')) delimiter = '\t';
    else if (firstLine.includes(';') && !firstLine.includes(',')) delimiter = ';';

    const parseLine = (line: string): string[] => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"' || char === "'") {
          if (inQuotes && line[i + 1] === char) {
            current += char;
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === delimiter && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    const rawHeaders = parseLine(lines[0]);
    const headers = rawHeaders.map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));

    // Map header indices
    const nameIdx = headers.findIndex(h => h === 'name' || h === 'fullname' || h === 'contactname' || h === 'contact');
    const firstNameIdx = headers.findIndex(h => h === 'firstname' || h === 'first');
    const lastNameIdx = headers.findIndex(h => h === 'lastname' || h === 'last');
    const emailIdx = headers.findIndex(h => h === 'email' || h === 'emailaddress' || h === 'workemail' || h === 'mail');
    const companyIdx = headers.findIndex(h => h === 'company' || h === 'companyname' || h === 'organization' || h === 'account' || h === 'employer');
    const roleIdx = headers.findIndex(h => h === 'role' || h === 'jobtitle' || h === 'title' || h === 'position' || h === 'designation');
    const locationIdx = headers.findIndex(h => h === 'location' || h === 'city' || h === 'country' || h === 'state' || h === 'address');
    const phoneIdx = headers.findIndex(h => h === 'phone' || h === 'phonenumber' || h === 'mobile' || h === 'telephone' || h === 'tel');
    const decisionRoleIdx = headers.findIndex(h => h === 'decisionrole' || h === 'decision' || h === 'seniority');
    const influenceIdx = headers.findIndex(h => h === 'influencescore' || h === 'influence' || h === 'score');

    const validContacts: ParsedContactRow[] = [];
    let skipped = 0;

    for (let i = 1; i < lines.length; i++) {
      const cols = parseLine(lines[i]);
      if (cols.every(c => !c)) {
        skipped++;
        continue;
      }

      // Resolve full name
      let fullName = '';
      if (nameIdx !== -1 && cols[nameIdx]) {
        fullName = cols[nameIdx];
      } else if (firstNameIdx !== -1 || lastNameIdx !== -1) {
        const fn = firstNameIdx !== -1 ? cols[firstNameIdx] || '' : '';
        const ln = lastNameIdx !== -1 ? cols[lastNameIdx] || '' : '';
        fullName = `${fn} ${ln}`.trim();
      }

      const email = emailIdx !== -1 ? cols[emailIdx] || '' : '';
      const company = companyIdx !== -1 ? cols[companyIdx] || '' : '';
      const role = roleIdx !== -1 ? cols[roleIdx] || '' : 'Business Executive';
      const location = locationIdx !== -1 ? cols[locationIdx] || '' : 'Nigeria';
      const phone = phoneIdx !== -1 ? cols[phoneIdx] || '' : '';

      // Skip row if it doesn't have at least a Name or an Email
      if (!fullName && !email) {
        skipped++;
        continue;
      }

      // Parse Decision Role
      let decisionRole: DecisionRole = 'Decision Maker';
      if (decisionRoleIdx !== -1 && cols[decisionRoleIdx]) {
        const rawRole = cols[decisionRoleIdx].toLowerCase();
        if (rawRole.includes('champion')) decisionRole = 'Champion';
        else if (rawRole.includes('influencer')) decisionRole = 'Influencer';
        else if (rawRole.includes('other')) decisionRole = 'Other';
      }

      // Parse Influence Score
      let influenceScore = 80;
      if (influenceIdx !== -1 && cols[influenceIdx]) {
        const parsed = parseInt(cols[influenceIdx].replace(/[^0-9]/g, ''), 10);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
          influenceScore = parsed;
        }
      }

      validContacts.push({
        name: fullName || email.split('@')[0],
        email,
        companyName: company || 'Enterprise Prospect',
        role,
        location,
        phone,
        decisionRole,
        influenceScore
      });
    }

    setParsedRows(validContacts);
    setSkippedCount(skipped);
    if (validContacts.length === 0) {
      setWarningMessage('Could not extract any valid contacts. Ensure columns include Name or Email.');
    } else {
      setWarningMessage(null);
    }
  };

  const handleFileUpload = (file: File) => {
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        parseCSVContent(content);
      }
    };
    reader.readAsText(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileUpload(file);
  };

  const handlePasteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setPastedText(val);
    setFileName(null);
    if (val.trim()) {
      parseCSVContent(val);
    } else {
      setParsedRows([]);
      setSkippedCount(0);
      setWarningMessage(null);
    }
  };

  const handleDownloadTemplate = () => {
    const template = 'Full Name,Email,Company,Role,Location,Decision Role,Influence Score\nChinedu Eze,chinedu.eze@kudabank.com,Kuda Bank,Chief Technology Officer,Lagos,Decision Maker,94\nAmina Bello,amina.bello@moniepoint.com,Moniepoint,Head of Compliance,Lagos,Decision Maker,90\nBabajide Adeleke,b.adeleke@accessbankplc.com,Access Bank,Head of Enterprise Architecture,Lagos,Influencer,86';
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'huntiq_contacts_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    setFileName(null);
    setPastedText('');
    setParsedRows([]);
    setSkippedCount(0);
    setWarningMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (parsedRows.length === 0 || isProcessing) return;
    setIsProcessing(true);
    try {
      const payload: Partial<ContactItem>[] = parsedRows.map(row => ({
        name: row.name,
        email: row.email,
        companyName: row.companyName,
        role: row.role,
        location: row.location,
        phone: row.phone,
        decisionRole: row.decisionRole,
        influenceScore: row.influenceScore,
        source: 'import'
      }));

      await onImport(payload);
      handleReset();
      onClose();
    } catch (err: any) {
      console.error('Import submission failed:', err);
      setWarningMessage(err?.message || 'Failed to submit contacts import.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(11, 15, 25, 0.7)',
      backdropFilter: 'blur(4px)',
      zIndex: 60,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        width: '560px',
        maxHeight: '90vh',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '7px',
              backgroundColor: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Upload size={15} color="#818cf8" />
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 800 }}>Import Contacts</div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                Upload or paste verified decision makers & corporate leads
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab & Template Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 20px',
          backgroundColor: '#f8fafc',
          borderBottom: '1px solid #eaecf0'
        }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '7px',
                fontSize: '12px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: activeTab === 'upload' ? '#ffffff' : 'transparent',
                color: activeTab === 'upload' ? '#4f46e5' : '#64748b',
                boxShadow: activeTab === 'upload' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
              }}
            >
              <FileSpreadsheet size={13} />
              <span>Upload CSV / TXT</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('paste')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '7px',
                fontSize: '12px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: activeTab === 'paste' ? '#ffffff' : 'transparent',
                color: activeTab === 'paste' ? '#4f46e5' : '#64748b',
                boxShadow: activeTab === 'paste' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
              }}
            >
              <Clipboard size={13} />
              <span>Paste Text / CSV</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleDownloadTemplate}
            title="Download CSV format template"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '5px 10px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 600,
              color: '#475569',
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              cursor: 'pointer'
            }}
          >
            <Download size={12} color="#64748b" />
            <span>Sample CSV</span>
          </button>
        </div>

        {/* Content Body */}
        <div style={{
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          overflowY: 'auto'
        }}>
          {activeTab === 'upload' && !fileName && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.txt,.tsv"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                style={{
                  border: isDragging ? '2px dashed #4f46e5' : '2px dashed #cbd5e1',
                  borderRadius: '12px',
                  padding: '36px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  backgroundColor: isDragging ? '#eef2ff' : '#f8fafc',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  backgroundColor: '#ede9fe',
                  color: '#6d28d9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FileSpreadsheet size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>
                    Click to select CSV file, or drag and drop here
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '3px' }}>
                    Supports .csv, .tsv, and standard CRM contact exports
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'paste' && (
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Paste CSV Lines (Header followed by rows)
              </label>
              <textarea
                value={pastedText}
                onChange={handlePasteChange}
                placeholder="Full Name,Email,Company,Role,Location&#10;Chinedu Eze,c.eze@example.com,Kuda Bank,CTO,Lagos&#10;Amina Bello,a.bello@example.com,Moniepoint,Head of Compliance,Lagos"
                rows={6}
                style={{
                  width: '100%',
                  fontFamily: 'monospace',
                  fontSize: '11.5px',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  outline: 'none',
                  backgroundColor: '#ffffff',
                  boxSizing: 'border-box',
                  resize: 'vertical'
                }}
              />
            </div>
          )}

          {/* Uploaded File Indicator */}
          {fileName && (
            <div style={{
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '10px',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle2 size={18} color="#16a34a" />
                <div>
                  <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#14532d' }}>
                    {fileName}
                  </div>
                  <div style={{ fontSize: '11px', color: '#166534' }}>
                    Parsed {parsedRows.length} valid contact row{parsedRows.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleReset}
                title="Remove file"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#15803d',
                  padding: '4px'
                }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}

          {/* Validation Warnings */}
          {warningMessage && (
            <div style={{
              backgroundColor: '#fffbeb',
              border: '1px solid #fef3c7',
              borderRadius: '10px',
              padding: '10px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '11.5px',
              color: '#92400e'
            }}>
              <AlertCircle size={15} color="#d97706" style={{ flexShrink: 0 }} />
              <span>{warningMessage}</span>
            </div>
          )}

          {/* Pre-Import Parsing Summary */}
          {parsedRows.length > 0 && (
            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '12px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              fontSize: '12px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>Pre-Import Validation:</span>
                <span style={{ fontSize: '11px', color: '#64748b' }}>
                  {parsedRows.length} ready • {skippedCount} skipped
                </span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669' }}>
                <span>✓ Valid contact rows to import</span>
                <span style={{ fontWeight: 700 }}>{parsedRows.length} contacts</span>
              </div>

              {skippedCount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#d97706' }}>
                  <span>⚠ Empty or unparseable rows excluded</span>
                  <span style={{ fontWeight: 600 }}>{skippedCount} rows</span>
                </div>
              )}

              {/* Data Preview (First 3-5 rows) */}
              <div style={{ marginTop: '6px', borderTop: '1px solid #eaecf0', paddingTop: '8px' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Preview (First {Math.min(parsedRows.length, 3)} rows):
                </div>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  maxHeight: '120px',
                  overflowY: 'auto'
                }}>
                  {parsedRows.slice(0, 3).map((row, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '6px 8px',
                        backgroundColor: '#ffffff',
                        border: '1px solid #eaecf0',
                        borderRadius: '6px',
                        fontSize: '11px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                        <FileText size={12} color="#6366f1" style={{ flexShrink: 0 }} />
                        <span style={{ fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap' }}>
                          {row.name}
                        </span>
                        <span style={{ color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {row.role} • {row.companyName}
                        </span>
                      </div>
                      <span style={{ color: '#4f46e5', fontWeight: 600, flexShrink: 0, marginLeft: '8px' }}>
                        {row.email || 'No email'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Action Footer */}
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
              disabled={isProcessing}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '12.5px',
                fontWeight: 600,
                color: '#334155',
                cursor: isProcessing ? 'not-allowed' : 'pointer'
              }}
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={parsedRows.length === 0 || isProcessing}
              onClick={handleSubmit}
              style={{
                backgroundColor: parsedRows.length > 0 ? '#4f46e5' : '#94a3b8',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 20px',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: parsedRows.length > 0 && !isProcessing ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {isProcessing && <Loader2 size={14} className="animate-spin" />}
              <span>
                {isProcessing
                  ? 'Importing...'
                  : parsedRows.length > 0
                  ? `Import ${parsedRows.length} Contact${parsedRows.length > 1 ? 's' : ''}`
                  : 'Import Contacts'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
