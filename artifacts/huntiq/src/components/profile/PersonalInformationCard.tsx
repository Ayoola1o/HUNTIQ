import React from 'react';
import { Camera } from 'lucide-react';
import type { UserProfileData } from '../../types/profile';

interface PersonalInformationCardProps {
  data: UserProfileData;
  onChange: (updates: Partial<UserProfileData>) => void;
  onChangePhotoClick: () => void;
}

export const PersonalInformationCard: React.FC<PersonalInformationCardProps> = ({
  data,
  onChange,
  onChangePhotoClick
}) => {
  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      border: '1px solid #eaecf0',
      padding: '20px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
    }}>
      {/* Top Header with Change Photo Action */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: '16px',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div>
          <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Personal Information
          </h2>
          <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
            Update your personal details and how others see you in HUNTIQ.
          </p>
        </div>

        <button
          onClick={onChangePhotoClick}
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #d0d5dd',
            borderRadius: '8px',
            padding: '6px 14px',
            fontSize: '12px',
            fontWeight: 600,
            color: '#344054',
            cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(16, 24, 40, 0.05)',
            transition: 'all 0.15s ease'
          }}
        >
          Change Photo
        </button>
      </div>

      {/* Avatar & Input Fields Layout */}
      <div className="personal-info-grid">
        {/* Avatar with Camera Badge */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div 
            onClick={onChangePhotoClick}
            style={{
              position: 'relative',
              width: '96px',
              height: '96px',
              borderRadius: '50%',
              overflow: 'hidden',
              cursor: 'pointer',
              border: '2px solid #e2e8f0',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
            }}
          >
            <img
              src={data.avatarUrl}
              alt={`${data.firstName} ${data.lastName}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
            {/* Camera Overlay Icon */}
            <div style={{
              position: 'absolute',
              bottom: '4px',
              right: '4px',
              backgroundColor: '#090d16',
              color: '#ffffff',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1.5px solid #ffffff',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}>
              <Camera size={12} />
            </div>
          </div>
        </div>

        {/* 2-Column Fields Grid */}
        <div className="personal-info-fields">
          {/* First Name */}
          <div>
            <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#344054', display: 'block', marginBottom: '4px' }}>
              First Name
            </label>
            <input
              type="text"
              value={data.firstName}
              onChange={(e) => onChange({ firstName: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #d0d5dd',
                fontSize: '12.5px',
                color: '#101828',
                backgroundColor: '#ffffff',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Last Name */}
          <div>
            <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#344054', display: 'block', marginBottom: '4px' }}>
              Last Name
            </label>
            <input
              type="text"
              value={data.lastName}
              onChange={(e) => onChange({ lastName: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #d0d5dd',
                fontSize: '12.5px',
                color: '#101828',
                backgroundColor: '#ffffff',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Email */}
          <div>
            <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#344054', display: 'block', marginBottom: '4px' }}>
              Email
            </label>
            <input
              type="email"
              value={data.email}
              onChange={(e) => onChange({ email: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #d0d5dd',
                fontSize: '12.5px',
                color: '#101828',
                backgroundColor: '#ffffff',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Phone */}
          <div>
            <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#344054', display: 'block', marginBottom: '4px' }}>
              Phone
            </label>
            <input
              type="text"
              value={data.phone}
              onChange={(e) => onChange({ phone: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #d0d5dd',
                fontSize: '12.5px',
                color: '#101828',
                backgroundColor: '#ffffff',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Job Title */}
          <div>
            <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#344054', display: 'block', marginBottom: '4px' }}>
              Job Title
            </label>
            <input
              type="text"
              value={data.jobTitle}
              onChange={(e) => onChange({ jobTitle: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #d0d5dd',
                fontSize: '12.5px',
                color: '#101828',
                backgroundColor: '#ffffff',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Department */}
          <div>
            <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#344054', display: 'block', marginBottom: '4px' }}>
              Department
            </label>
            <input
              type="text"
              value={data.department}
              onChange={(e) => onChange({ department: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #d0d5dd',
                fontSize: '12.5px',
                color: '#101828',
                backgroundColor: '#ffffff',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Bio Full Width */}
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#344054', display: 'block', marginBottom: '4px' }}>
              Bio
            </label>
            <textarea
              rows={3}
              value={data.bio}
              onChange={(e) => onChange({ bio: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #d0d5dd',
                fontSize: '12px',
                color: '#101828',
                backgroundColor: '#ffffff',
                outline: 'none',
                resize: 'vertical',
                boxSizing: 'border-box',
                fontFamily: 'inherit'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
