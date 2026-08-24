import type { SignalItem } from '../types/signal';
import type { SignalCategory } from './types';

export class SignalEngine {
  private signals: SignalItem[] = [
    {
      id: 'sig-1',
      title: 'Paystack expands merchant acquisition across Francophone West Africa',
      subtitle: 'Opening hubs in Côte d’Ivoire & Senegal',
      companyName: 'Paystack',
      location: 'Lagos, Nigeria',
      type: 'expansion',
      impactLevel: 'Very High',
      impactScore: 94,
      detectedTime: '2 hours ago',
      detectedTimestamp: '2 hours ago',
      whyItMatters: 'Scaling regional operations requires localized compliance, hiring, and new operational infrastructure.',
      whatHappened: 'Launched operational hubs across Abidjan and Dakar.',
      source: 'TechCabal & Regulatory Gazette',
      sourceType: 'news',
      confidence: '94%',
      firstDetected: '2 hours ago',
      lastUpdated: 'Just now',
      recommendedAction: 'Engage VP of Expansion with localized regional playbooks.',
      targetRole: 'Head of Regional Expansion'
    },
    {
      id: 'sig-2',
      title: 'Flutterwave appoints former Stripe VP as Global Head of Compliance',
      subtitle: 'Executive Compliance & Regulatory scaling',
      companyName: 'Flutterwave',
      location: 'Lagos / SF',
      type: 'leadership',
      impactLevel: 'Very High',
      impactScore: 96,
      detectedTime: '4 hours ago',
      detectedTimestamp: '4 hours ago',
      whyItMatters: 'Leadership hires signal new strategic roadmaps, vendor reviews, and budget reallocation.',
      whatHappened: 'Brought on veteran compliance executive ahead of global licensing.',
      source: 'Executive Wire',
      sourceType: 'linkedin',
      confidence: '96%',
      firstDetected: '4 hours ago',
      lastUpdated: '1 hour ago',
      recommendedAction: 'Send congratulatory brief with enterprise governance solutions.',
      targetRole: 'Global Head of Compliance'
    },
    {
      id: 'sig-3',
      title: 'Kuda Bank secures $55M Series B for digital credit infrastructure',
      subtitle: 'Core banking & lending expansion',
      companyName: 'Kuda Bank',
      location: 'London / Lagos',
      type: 'funding',
      impactLevel: 'High',
      impactScore: 92,
      detectedTime: '1 day ago',
      detectedTimestamp: '1 day ago',
      whyItMatters: 'Capital injection fuels 80+ engineering hires and new commercial vendor contracts.',
      whatHappened: 'Closed $55M Series B led by global venture partners.',
      source: 'Venture Disclosures',
      sourceType: 'news',
      confidence: '98%',
      firstDetected: '1 day ago',
      lastUpdated: 'Yesterday',
      recommendedAction: 'Introduce workforce scaling and risk analytics platforms.',
      targetRole: 'Chief Technology Officer'
    }
  ];

  public getAllSignals(): SignalItem[] {
    return this.signals;
  }

  public getSignalsForCompany(companyName: string): SignalItem[] {
    const target = companyName.toLowerCase();
    return this.signals.filter(s => 
      s.companyName?.toLowerCase().includes(target)
    );
  }

  public getSignalsByCategory(category: SignalCategory): SignalItem[] {
    return this.signals.filter(s => s.type === category);
  }

  public detectNewSignal(signal: Omit<SignalItem, 'id' | 'detectedTime' | 'detectedTimestamp'>): SignalItem {
    const created: SignalItem = {
      ...signal,
      id: `sig-${Date.now()}`,
      detectedTime: 'Just now',
      detectedTimestamp: 'Just now'
    };
    this.signals = [created, ...this.signals];
    return created;
  }
}

export const signalEngine = new SignalEngine();
