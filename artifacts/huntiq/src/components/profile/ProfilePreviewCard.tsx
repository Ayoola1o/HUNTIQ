import React from 'react';
import { MapPin, Globe } from 'lucide-react';
import type { UserProfileData } from '../../types/profile';

interface ProfilePreviewCardProps {
  data: UserProfileData;
}

export const ProfilePreviewCard: React.FC<ProfilePreviewCardProps> = ({ data }) => {
  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      border: '1px solid #eaecf0',
      overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
    }}>
      {/* Title */}
      <div style={{ padding: '16px 16px 12px 16px' }}>
        <h3 style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
          Profile Preview
        </h3>
      </div>

      {/* Purple Gradient Cover Banner */}
      <div style={{
        height: '96px',
        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #6366f1 100%)',
        position: 'relative'
      }} />

      {/* Avatar Container with Online Indicator */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginTop: '-44px',
        padding: '0 16px 20px 16px',
        textAlign: 'center'
      }}>
        <div style={{ position: 'relative' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            overflow: 'hidden',
            border: '3px solid #ffffff',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.12)',
            backgroundColor: '#ffffff'
          }}>
            <img
              src={data.avatarUrl}
              alt={`${data.firstName} ${data.lastName}`}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          {/* Online green indicator */}
          <div style={{
            position: 'absolute',
            bottom: '4px',
            right: '4px',
            width: '14px',
            height: '14px',
            borderRadius: '50%',
            backgroundColor: '#10b981',
            border: '2px solid #ffffff'
          }} />
        </div>

        {/* Name & Title */}
        <h4 style={{ fontSize: '15.5px', fontWeight: 800, color: '#0f172a', margin: '10px 0 2px 0' }}>
          {data.firstName} {data.lastName}
        </h4>
        <p style={{ fontSize: '11.5px', color: '#64748b', margin: '0 0 2px 0', fontWeight: 600 }}>
          {data.jobTitle}
        </p>
        <span style={{ fontSize: '11px', color: '#4f46e5', fontWeight: 700 }}>
          {data.companyName}
        </span>

        {/* Location */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '11px',
          color: '#64748b',
          marginTop: '6px'
        }}>
          <MapPin size={12} color="#64748b" />
          <span>{data.location}</span>
        </div>

        {/* Social Link Buttons */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
          <a
            href={data.linkedinUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0a66c2',
              backgroundColor: '#f8fafc',
              textDecoration: 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.6 1.6 0 0 0 1.6-1.6 1.6 1.6 0 0 0-1.6-1.6 1.6 1.6 0 0 0-1.6 1.6 1.6 1.6 0 0 0 1.6 1.6m1.4 9.74v-8.37H5.06v8.37h2.8z"/>
            </svg>
          </a>

          <a
            href={data.twitterUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#1da1f2',
              backgroundColor: '#f8fafc',
              textDecoration: 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </a>

          <a
            href={data.websiteUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#475569',
              backgroundColor: '#f8fafc',
              textDecoration: 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <Globe size={14} />
          </a>
        </div>
      </div>
    </div>
  );
};
