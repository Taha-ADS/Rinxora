// Lightweight on-device HVAC receptionist brain used by the hero demo.
// Deterministic on purpose: it lets anyone test Rinxora instantly, with no
// keys or backend, while the real product runs on the live voice pipeline.

export type Stage = 'issue' | 'location' | 'name' | 'done';

export interface DialogState {
  stage: Stage;
  issue: string | null;
  urgent: boolean;
  location: string | null;
  name: string | null;
}

export interface Turn {
  reply: string;
  state: DialogState;
  /** Short chip shown in the UI describing what Rinxora just did. */
  action?: string;
}

export const COMPANY = 'Northstar Heating and Air';

export const initialState = (): DialogState => ({
  stage: 'issue',
  issue: null,
  urgent: false,
  location: null,
  name: null,
});

export const greeting = (agent: string) =>
  `Thanks for calling ${COMPANY}, this is ${agent}. What's going on with your system today?`;

const has = (t: string, re: RegExp) => re.test(t);

const cleanName = (t: string) => {
  const m = t.match(/(?:i'?m|i am|this is|name is|it'?s|call me)\s+([a-z'-]+)/i);
  const raw = m ? m[1] : t.trim().split(/\s+/)[0];
  return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
};

const cleanLocation = (t: string) =>
  t
    .replace(/^(we'?re|i'?m|it'?s|i live|we live|located|the address is)\s+(in|at|on)?\s*/i, '')
    .replace(/[.!?]+$/, '')
    .trim();

const prompts: Record<Stage, string> = {
  issue: 'Tell me what the system is doing and I’ll get the right technician moving.',
  location: 'What city or zip code is the property in?',
  name: 'And who am I speaking with?',
  done: 'Is there anything else I can help you with?',
};

export function respond(input: string, prev: DialogState, agent: string): Turn {
  const t = input.toLowerCase().trim();
  const state: DialogState = { ...prev };

  // 1. Safety always wins.
  if (has(t, /\bgas\b|carbon monoxide|\bco\b (alarm|detector)|smoke|burning smell|sparks?/)) {
    state.urgent = true;
    state.issue = state.issue ?? 'Possible gas / CO hazard';
    state.stage = state.location ? (state.name ? 'done' : 'name') : 'location';
    return {
      reply:
        'That’s a safety issue, so please step outside right now, leave the door open, and don’t touch any switches. If you smell gas strongly, call 911. I’m paging our emergency technician this second. What’s the address so I can send the truck?',
      state,
      action: 'Emergency page sent to on-call technician',
    };
  }

  // 2. Questions we answer without losing our place.
  if (has(t, /how much|price|cost|fee|charge|quote|expensive/)) {
    return {
      reply: `Our diagnostic visit is $89, and that’s credited back in full if you approve the repair. After hours it’s $149, and I’ll always get your okay before anyone rolls. ${prompts[state.stage]}`,
      state,
      action: 'Quoted diagnostic fee',
    };
  }
  if (has(t, /are you (a )?(real|human|robot|ai)|am i talking to/)) {
    return {
      reply: `I’m ${agent}, Northstar’s AI dispatcher. I can book and dispatch right now, and a real technician takes it from here. ${prompts[state.stage]}`,
      state,
    };
  }
  if (has(t, /hours|open|close|weekend|24|right now|tonight|today|how soon|how fast|available/) && state.stage !== 'name') {
    return {
      reply: `We’re on call 24/7, so someone can be out today. ${prompts[state.stage]}`,
      state,
      action: 'Checked on-call calendar',
    };
  }
  if (has(t, /thank|that'?s all|that is all|bye|goodbye|nothing else|no thanks|i'?m good/) && state.stage === 'done') {
    return {
      reply: 'Wonderful. You’ll get a text confirmation in a moment. Thanks for calling Northstar, stay comfortable!',
      state,
      action: 'Call completed and summarized',
    };
  }

  // 3. Stage progression.
  switch (state.stage) {
    case 'issue': {
      if (has(t, /no heat|furnace|heater|heating|boiler|pilot|cold|freez|won'?t (turn|start)|stopped/)) {
        state.issue = 'No heat / furnace failure';
        state.urgent = has(t, /freez|no heat|below|zero|baby|kid|elderly/);
        state.stage = 'location';
        return {
          reply:
            'I’m sorry, that’s rough. A no-heat call gets priority, and I’ll flag it urgent. Quick safety check: do you smell gas or have a carbon monoxide alarm going off? If not, what city or zip code is the property in?',
          state,
          action: 'Triage: No heat (priority)',
        };
      }
      if (has(t, /\bac\b|a\/c|air condition|cooling|warm air|lukewarm|hot|compressor|thermostat|leak|water|noise|noisy/)) {
        state.issue = 'AC / cooling issue';
        state.stage = 'location';
        return {
          reply:
            'Got it. That could be a capacitor or low refrigerant, but the technician will pinpoint it on site. What city or zip code is the property in?',
          state,
          action: 'Triage: Cooling issue',
        };
      }
      state.issue = input.trim();
      state.stage = 'location';
      return {
        reply: 'Understood, I’ve noted that for the technician. What city or zip code is the property in?',
        state,
        action: 'Issue logged',
      };
    }
    case 'location': {
      if (has(t, /^(no|nope|nah|nothing|none)\b/)) {
        return { reply: 'Good, that’s what I wanted to hear. What city or zip code is the property in?', state, action: 'Safety check: clear' };
      }
      state.location = cleanLocation(input) || input.trim();
      state.stage = 'name';
      return {
        reply: `Perfect, ${state.location} is inside our service area. And who am I speaking with?`,
        state,
        action: 'Service area verified',
      };
    }
    case 'name': {
      state.name = cleanName(input);
      state.stage = 'done';
      const window = state.urgent ? 'within the next 90 minutes' : 'between 2 and 6 this afternoon';
      return {
        reply: `Thank you, ${state.name}. You’re booked: a technician will arrive ${window}, and I’m texting you the confirmation now. Is there anything else I can help with?`,
        state,
        action: 'Job booked in ServiceTitan',
      };
    }
    default:
      return {
        reply: 'Of course. I’ve added that note to your job. Anything else?',
        state,
        action: 'Note added to job',
      };
  }
}
