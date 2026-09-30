import React from 'react';
import { LEGAL } from '../lib/config';

export interface LegalDoc {
  title: string;
  intro: React.ReactNode;
  sections: { id: string; h: string; body: React.ReactNode }[];
}

const Email = () => (
  <a href={LEGAL.email.startsWith('[') ? undefined : `mailto:${LEGAL.email}`} className="legal-link">
    {LEGAL.email}
  </a>
);

export const PRIVACY: LegalDoc = {
  title: 'Privacy Policy',
  intro: (
    <>
      This policy explains what {LEGAL.company} (“Rinxora”, “we”, “us”) collects when you visit this website, request a demo or talk to our
      voice demo, and what we do with it. It covers this website only. When a business uses Rinxora to answer its own customers’ calls,
      that business’s privacy notice applies to those calls (see “Calls we answer for our customers” below).
    </>
  ),
  sections: [
    {
      id: 'collect',
      h: 'What we collect',
      body: (
        <>
          <h3>Information you give us</h3>
          <p>
            When you request a demo we collect your name, business name, email address, phone number, trade, the plan you are interested in
            and anything you choose to write in the message field.
          </p>
          <h3>Your voice, when you use the demo</h3>
          <p>
            The voice demo only uses your microphone after you start a call, and stops when the call ends. During a live call your audio is
            streamed to our voice technology provider so the AI assistant can hear and answer you, and a transcript is shown on screen. Audio and
            transcripts of demo calls may be stored by us and that provider to run the demo, keep it secure and improve it.
          </p>
          <p>
            If the live line is unavailable, the demo can fall back to your browser’s built-in speech recognition and speech features. In that
            case your browser may send your audio to its own vendor (for example Google for Chrome, or Apple for Safari) under that vendor’s
            terms. You can always type instead of speaking.
          </p>
          <h3>Information collected automatically</h3>
          <p>
            We use Google Analytics to understand how the site is used: pages viewed, buttons pressed (for example “played a call” or
            “requested a demo”), approximate location, device and browser type, and how you arrived. We do not send the contents of the demo
            form to analytics. Google Analytics uses cookies or similar technologies. In the European Economic Area, the United Kingdom and
            Switzerland, analytics cookies are off by default.
          </p>
        </>
      ),
    },
    {
      id: 'use',
      h: 'How we use it',
      body: (
        <ul>
          <li>To respond to your demo request, set up your demo and contact you about it.</li>
          <li>To run the voice demo and keep it working, safe and free of abuse.</li>
          <li>To understand how the site is used and make it better.</li>
          <li>To comply with the law and protect our rights and the rights of others.</li>
        </ul>
      ),
    },
    {
      id: 'texts',
      h: 'Phone calls and text messages',
      body: (
        <>
          <p>
            If you tick the consent box on the demo form, we may call or text the number you give us about your demo. Consent is not a
            condition of purchase. Message frequency varies, and message and data rates may apply. Reply STOP to stop texts and HELP for help.
          </p>
          <p>We do not sell or share your mobile number or your text-messaging consent with third parties for their own marketing.</p>
        </>
      ),
    },
    {
      id: 'share',
      h: 'Who we share it with',
      body: (
        <>
          <p>We do not sell your personal information. We share it only with:</p>
          <ul>
            <li>
              Service providers who work for us: website hosting, form handling, scheduling, our voice technology provider (Retell AI) and
              Google Analytics. They may only use it to provide their service to us.
            </li>
            <li>Authorities or others when the law requires it, or to protect people, property or our rights.</li>
            <li>A buyer or successor if our business is merged, acquired or reorganised, under this policy.</li>
          </ul>
        </>
      ),
    },
    {
      id: 'retention',
      h: 'How long we keep it',
      body: (
        <p>
          We keep demo requests for as long as we are talking with you and for a reasonable period after, and demo call audio and transcripts
          only as long as needed for the purposes above. We then delete or anonymise them, unless the law requires us to keep them longer.
        </p>
      ),
    },
    {
      id: 'choices',
      h: 'Your choices and rights',
      body: (
        <>
          <p>
            You can ask us to access, correct or delete the personal information we hold about you, or to stop contacting you, by emailing{' '}
            <Email />. Depending on where you live (for example California or other U.S. states, the EEA or the UK) you may have further
            rights, such as to object to or restrict processing, or to receive a copy of your data. We will not treat you differently for using
            them.
          </p>
          <p>
            You can block or delete cookies in your browser settings, or use Google’s{' '}
            <a href="https://tools.google.com/dlpage/gaoptout" className="legal-link" rel="noopener noreferrer" target="_blank">
              Analytics opt-out add-on
            </a>
            .
          </p>
        </>
      ),
    },
    {
      id: 'customers',
      h: 'Calls we answer for our customers',
      body: (
        <p>
          When a business uses Rinxora to answer its phone, we process its callers’ information on that business’s behalf and under its
          instructions. If you called a business that uses Rinxora, please contact that business about your information. We will help it
          respond.
        </p>
      ),
    },
    {
      id: 'security',
      h: 'Security, children and international visitors',
      body: (
        <>
          <p>
            We use reasonable technical and organisational measures to protect personal information, but no method of transmission or storage
            is completely secure.
          </p>
          <p>This site is meant for businesses and is not directed at children under 16. We do not knowingly collect their information.</p>
          <p>
            We and our providers may process information in the United States and other countries, with safeguards where the law requires
            them.
          </p>
        </>
      ),
    },
    {
      id: 'changes',
      h: 'Changes and contact',
      body: (
        <p>
          We will post any changes here and update the date at the top. Questions or requests: <Email />, or write to {LEGAL.company},{' '}
          {LEGAL.address}.
        </p>
      ),
    },
  ],
};

export const TERMS: LegalDoc = {
  title: 'Terms of Use',
  intro: (
    <>
      These terms apply when you use the {LEGAL.company} (“Rinxora”, “we”, “us”) website, including its voice demo. By using the site you
      agree to them. A paid Rinxora subscription is covered by a separate agreement, which takes priority over these terms for that service.
    </>
  ),
  sections: [
    {
      id: 'demo',
      h: 'The voice demo',
      body: (
        <>
          <p>
            The demo is a sample of Rinxora for you to evaluate. It is an AI assistant, not a person, and it can make mistakes. Prices, times,
            technicians and bookings mentioned in the demo or in examples on this site are illustrative, not offers.
          </p>
          <p className="legal-callout">
            The demo is not an emergency line. If you smell gas, see smoke or have any emergency, leave the area and call 911 or your utility.
          </p>
        </>
      ),
    },
    {
      id: 'use',
      h: 'Using the site',
      body: (
        <>
          <p>You agree not to:</p>
          <ul>
            <li>use the site or demo unlawfully, or to harass, deceive or harm anyone;</li>
            <li>overload, probe or disrupt the site or demo, or try to get around its limits or security;</li>
            <li>use automated tools to access the demo, or to copy the site’s content in bulk;</li>
            <li>record or share another person’s voice through the demo without their permission.</li>
          </ul>
          <p>We may limit or stop access to the demo at any time, for example to prevent abuse.</p>
        </>
      ),
    },
    {
      id: 'info',
      h: 'Information on this site',
      body: (
        <p>
          We work to keep the information on this site accurate, but features, integrations, plans and prices can change and are confirmed
          only in your subscription agreement. Estimates such as the savings calculator are based on the numbers you enter and are not a
          guarantee of results.
        </p>
      ),
    },
    {
      id: 'ip',
      h: 'Our content',
      body: (
        <p>
          The site, the Rinxora name and logo, and the content and software on the site belong to us or our licensors. You may use the site
          for evaluating Rinxora, but not copy, modify or resell it without our written permission.
        </p>
      ),
    },
    {
      id: 'third',
      h: 'Other services',
      body: (
        <p>
          The site relies on third-party services, such as our voice technology provider and scheduling tools, and may link to other websites.
          We are not responsible for their content or practices, and their own terms apply to your use of them.
        </p>
      ),
    },
    {
      id: 'warranty',
      h: 'No warranty and limits on liability',
      body: (
        <>
          <p>
            The site and demo are provided “as is” and “as available”, without warranties of any kind, to the fullest extent the law allows.
          </p>
          <p>
            To the fullest extent the law allows, we are not liable for any indirect, incidental, special or consequential damages, or for lost
            profits, revenue or data, arising from your use of the site or demo. Our total liability for any claim about the site or demo is
            limited to one hundred U.S. dollars. Some places do not allow these limits, so they may not all apply to you.
          </p>
        </>
      ),
    },
    {
      id: 'law',
      h: 'Governing law, changes and contact',
      body: (
        <p>
          These terms are governed by the laws of {LEGAL.governingLaw}, without regard to its conflict-of-laws rules. We may update them by
          posting a new version here with a new date. Questions: <Email />, or write to {LEGAL.company}, {LEGAL.address}.
        </p>
      ),
    },
  ],
};
