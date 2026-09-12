import type { GeneratedOutreach } from './types';

export class OutreachEngine {
  /**
   * Generates highly contextualized, multi-channel outreach copy tailored to a specific contact, company, and signal.
   */
  public generateOutreach(
    companyName: string,
    recipientName: string = 'Decision Maker',
    recipientRole: string = 'Head of Operations',
    topSignalTitle?: string,
    tone: 'Executive & Direct' | 'Consultative' | 'Warm' = 'Executive & Direct'
  ): GeneratedOutreach {
    const signalReference = topSignalTitle 
      ? `Saw the announcement regarding "${topSignalTitle}"`
      : `Noticed ${companyName}'s rapid growth and market momentum`;

    let emailSubject = `${companyName} scaling & operational readiness`;
    if (tone === 'Executive & Direct') {
      emailSubject = `Quick question re: ${companyName}'s expansion`;
    } else if (tone === 'Consultative') {
      emailSubject = `Ideas for ${companyName}'s team during this growth phase`;
    }

    const emailBody = `Hi ${recipientName.split(' ')[0]},

${signalReference} — congratulations on the momentum!

Typically, when companies scale at this pace, leaders in your position face bottlenecks around team coordination, speed of execution, and managing operational complexity across new initiatives.

We’ve helped similar enterprise leaders unlock 30%+ efficiency improvements without adding overhead.

Do you have 10 minutes this Thursday or Friday for a brief conversation on how we can support ${companyName}?

Best regards,
Ayoola Ade
HUNTIQ Growth Team`;

    const followUpBody = `Hi ${recipientName.split(' ')[0]},

Following up on my previous note. Thought you might find this relevant given ${companyName}'s recent milestones.

Would you be open to a quick 5-minute sanity check later this week?

Best,
Ayoola`;

    const connectionNote = `Hi ${recipientName.split(' ')[0]}, ${signalReference.toLowerCase()}. Would love to connect and follow ${companyName}'s journey!`;

    const inMailMessage = `Hi ${recipientName.split(' ')[0]},

I noticed your work leading ${recipientRole} at ${companyName}. Given your recent expansion, I wanted to share how similar teams are accelerating execution and eliminating scaling friction.

Open to a brief exchange?

Best,
Ayoola`;

    const callScript = {
      opening: `“Hi ${recipientName.split(' ')[0]}, this is Ayoola from HUNTIQ. I know I’m catching you in the middle of a busy week — do you have 60 seconds?”`,
      elevatorPitch: `“I’m reaching out because we saw ${companyName}’s recent expansion. We work specifically with fast-scaling teams to solve operational bottlenecks and accelerate revenue execution.”`,
      qualifyingQuestions: [
        `“As you scale headcount this quarter, what’s your primary challenge in keeping execution velocity high?”`,
        `“Are you currently using internal tools or looking at specialized intelligence workflows to manage this?”`
      ],
      closingAsk: `“I’d love to show you a 5-minute workflow tailored specifically to ${companyName}. Would Tuesday at 10 AM or Thursday at 2 PM suit your calendar better?”`
    };

    return {
      email: {
        subject: emailSubject,
        body: emailBody,
        followUpBody
      },
      linkedin: {
        connectionNote,
        inMailMessage
      },
      callScript
    };
  }
}

export const outreachEngine = new OutreachEngine();
