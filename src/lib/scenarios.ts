import { EdgeCaseScenario } from '../types/call';

export const HVAC_SCENARIOS: EdgeCaseScenario[] = [
  {
    id: 'ac-diagnostic-dfw',
    title: 'AC Blowing Warm Air (Plano, TX) — Full Flow',
    subtitle: 'Standard dispatch flow: qualification, coverage check, $89 fee credit, and booking',
    category: 'de-escalation',
    difficultyBadge: 'Standard Dispatch',
    audioDuration: '1m 02s',
    customerProblem: 'Homeowner in Plano with AC blowing lukewarm air in 94°F heat. Wondering about technician availability and costs.',
    receptionistStrategy: 'Warm empathy under 30 words, verifies Plano service territory, explains $89 diagnostic fee credited 100% into approved repair, captures contact info, and locks 2:00 PM – 6:00 PM window.',
    dialogue: [
      {
        speaker: 'receptionist',
        text: 'Thanks for calling Vocalis Heating and Air, this is Sarah! How can I help you today?',
        note: 'Start node: Under 30 words, warm tone, natural greeting.'
      },
      {
        speaker: 'caller',
        text: 'Hi Sarah, our AC started blowing warm air this afternoon and our house is getting really uncomfortable. Can someone come look at it today?',
      },
      {
        speaker: 'receptionist',
        text: 'Oh no, let’s get that looked at! That could be a capacitor, contactor, or low refrigerant, but our technician will pinpoint it. What city or zip code is the property located in?',
        note: 'Qualify issue + Area check: Doesn’t lecture mechanics, asks 1 clear question.'
      },
      {
        speaker: 'caller',
        text: 'We are in Plano, off Spring Creek Parkway.',
      },
      {
        speaker: 'receptionist',
        text: 'Gotcha. Our standard diagnostic trip fee is $89, which covers a multi-point inspection. If you approve the repair, that $89 fee is credited directly into the repair cost. Does that work for you?',
        note: 'Explain fee: Transparent $89 credit policy.'
      },
      {
        speaker: 'caller',
        text: 'Yes, that sounds very fair. Let’s do it.',
      },
      {
        speaker: 'receptionist',
        text: 'Great! May I have your full name, street address, and the best callback phone number?',
        note: 'Collect contact info: Accepts details cleanly.'
      },
      {
        speaker: 'caller',
        text: 'Brian Miller, 3421 Spring Creek Parkway in Plano, and my cell is 214-555-0194.',
      },
      {
        speaker: 'receptionist',
        text: 'Thanks Brian! For today, I have an arrival window this afternoon between 2 and 6. Does that window work for you?',
        note: 'Schedule window: Dynamic Chicago time window rule.'
      },
      {
        speaker: 'caller',
        text: '2 to 6 PM works perfectly for me.',
      },
      {
        speaker: 'receptionist',
        text: 'Just to confirm: Brian Miller at 3421 Spring Creek Parkway, Plano, callback 214-555-0194 for this afternoon between 2 and 6 — is that correct?',
        note: 'Confirm and close: Exact read-back verification.'
      },
      {
        speaker: 'caller',
        text: 'That is correct, thank you Sarah.',
      },
      {
        speaker: 'receptionist',
        text: 'You’re all set for 2 to 6 PM, Brian! Our technician will give you a courtesy call 30 minutes before arriving. Stay cool, and we’ll see you then!',
        note: 'End node: Professional closing with 30-min courtesy call promise.'
      }
    ],
    technicalSafeguards: [
      'Strict 30-word limit per turn enforced for human-like conversational brevity',
      'DFW Service Territory validation: Dallas, Plano, Frisco, McKinney, Richardson',
      'Upfront $89 diagnostic fee transparency with 100% repair cost credit commitment'
    ],
    crmOutput: {
      intent: 'AC Diagnostic / Breakdown',
      action: 'Booked 2:00 PM - 6:00 PM Window (Tech En Route)',
      urgency: 'Same-Day Service',
      calendarStatus: 'ServiceTitan Ticket #AC-7104 (Plano, TX)'
    }
  },
  {
    id: 'gas-co-emergency',
    title: 'Gas / CO Alarm Evacuation Override',
    subtitle: 'Life-safety global interrupt protocol triggering immediate outdoor evacuation',
    category: 'emergency-dispatch',
    difficultyBadge: 'Life-Safety Override',
    audioDuration: '44s',
    customerProblem: 'Panicked homeowner in Frisco hears carbon monoxide detector beeping and smells faint rotten eggs near utility room.',
    receptionistStrategy: 'Global interrupt immediately triggers mandatory evacuation script. Bypasses all pricing, sales, and diagnostic questions. Captures address & cell in one breath and alerts on-call emergency tech.',
    dialogue: [
      {
        speaker: 'receptionist',
        text: 'Thanks for calling Vocalis Heating and Air, this is Sarah! How can I help you today?',
      },
      {
        speaker: 'caller',
        text: 'I think our heater has a problem... our carbon monoxide alarm started chirping and there is a weird rotten egg smell near the closet!',
        note: 'Trigger detected: "carbon monoxide alarm", "rotten egg smell".'
      },
      {
        speaker: 'receptionist',
        text: 'Please evacuate the house right away and call your gas utility or 911 from outside. Once you are safe, we can dispatch an emergency tech.',
        note: 'MANDATORY GLOBAL SCRIPT: Immediate life-safety evacuation protocol.'
      },
      {
        speaker: 'caller',
        text: 'Okay, we just walked out the front door, we are on the driveway now.',
      },
      {
        speaker: 'receptionist',
        text: 'What is the street address for the property, and the best number to reach you?',
        note: 'Emergency capture: Zero fluff, captures address and callback number instantly.'
      },
      {
        speaker: 'caller',
        text: '8104 Legacy Drive in Frisco, and reach me at 469-555-8821.',
      },
      {
        speaker: 'receptionist',
        text: 'We’re notifying our emergency on-call technician immediately. Please remain in a safe location outside. Thank you for calling Vocalis Heating & Air.',
        note: 'Emergency end: PagerDuty / priority dispatch alert pushed to on-call tech.'
      }
    ],
    technicalSafeguards: [
      'Global Intent Listener: Overrides current flow node instantly upon detecting gas or CO trigger words',
      'Zero Friction Protocol: Suppresses diagnostic fees, customer names, and mechanical questions',
      'Automated P1 Dispatch: Sends high-priority push notification and SMS to on-call master technician'
    ],
    crmOutput: {
      intent: 'P1 Gas/CO Life-Safety Emergency',
      action: 'Evacuation Advised + On-Call Tech Notified Immediately',
      urgency: 'P1 Critical',
      calendarStatus: 'Immediate Truck Route: 8104 Legacy Dr, Frisco'
    }
  },
  {
    id: 'ceiling-water-leak',
    title: 'Active Ceiling Water Leak (Drywall Collapse Risk)',
    subtitle: 'Emergency priority override for clogged drain line flooding through ceiling',
    category: 'emergency-dispatch',
    difficultyBadge: 'Urgent Property Damage',
    audioDuration: '52s',
    customerProblem: 'Homeowner notices water actively dripping through master bedroom ceiling from the attic air handler drain pan.',
    receptionistStrategy: 'Recognizes active ceiling leak urgency, flags caller as immediate priority for earliest on-call technician between jobs, explains $89 credited fee, and books emergency inspection.',
    dialogue: [
      {
        speaker: 'receptionist',
        text: 'Thanks for calling Vocalis Heating and Air, this is Sarah! How can I help you today?',
      },
      {
        speaker: 'caller',
        text: 'Hi Sarah, water is literally leaking through my ceiling drywall right now underneath the attic AC unit! The sheetrock is bulging!',
        note: 'Active ceiling leak trigger: urgent risk of structural drywall collapse.'
      },
      {
        speaker: 'receptionist',
        text: 'Oh no, let’s get that looked at right away to protect your ceiling! What city or zip code is the property located in?',
      },
      {
        speaker: 'caller',
        text: 'We are in McKinney, zip code 75070.',
      },
      {
        speaker: 'receptionist',
        text: 'Since you have an active ceiling leak, I’m flagging this as an immediate priority for our on-call technician right now. If they’re between jobs, they’ll head straight over.',
        note: 'Ceiling leak override: skips standard non-urgent scheduling windows.'
      },
      {
        speaker: 'caller',
        text: 'Thank you, how much is the visit?',
      },
      {
        speaker: 'receptionist',
        text: 'Our standard diagnostic trip fee is $89, which is credited 100% into your repair cost if approved. May I get your name, address, and callback number?',
      },
      {
        speaker: 'caller',
        text: 'Sarah Jennings, 512 Elm Creek Lane, McKinney, cell is 214-555-3390.',
      },
      {
        speaker: 'receptionist',
        text: 'You’re all set as our top emergency priority, Sarah! Our technician will call you 30 minutes before arriving at 512 Elm Creek Lane. We’re on it!',
      }
    ],
    technicalSafeguards: [
      'Drywall Hazard Priority Tagging: Bypasses standard multi-window scheduling to lock earliest slot',
      'Condensate Overflow Rule: Flags tech truck to carry nitrogen blowers and condensate pumps',
      'ServiceTitan Priority Webhook: Auto-sets urgency flag to "Critical - Water Damage"'
    ],
    crmOutput: {
      intent: 'Active Ceiling Leak (Condensate Overflow)',
      action: 'Emergency Priority Ticket Dispatched to Tech Carlos',
      urgency: 'Critical - Water Damage',
      calendarStatus: 'Priority #1 En Route: 512 Elm Creek Ln, McKinney'
    }
  }
];
