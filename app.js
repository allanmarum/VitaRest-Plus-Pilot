const DATASET = {
  data: [
    {
      Phase: 'Before Exposure',
      Guideline: 'Awareness',
      'Reflection Prompt': 'Understanding of vicarious trauma and learning needs',
      'Personalised Response':
        'Yes, no[ this option will link them to a basic vicarious trauma tutorial] , Patially'
    },
    {
      Phase: 'Before Exposure',
      Guideline: 'Acknowledge Personal Risk Factors',
      'Reflection Prompt': 'My known emotional triggers/sensitivities:',
      'Personalised Response': 'write here your own triggers/risks:'
    },
    {
      Phase: 'Before Exposure',
      Guideline: 'Early warning signs',
      'Reflection Prompt': 'My early signs of strain are',
      'Personalised Response': 'Other: Irritability Sleep disturbance Detachment Cynicism'
    },
    {
      Phase: 'Before Exposure',
      Guideline: 'Adopt Effective Coping Mechanisms',
      'Reflection Prompt': 'Healthy coping strategies/habits',
      'Personalised Response':
        'write here your regulation practice: Sleep hours Exercise Sessions per week Social contact Levels My peer support person Supervisor Nuanced Detachment Self Care'
    },
    {
      Phase: 'Before Exposure',
      Guideline: 'Promoting Leadership Improvement',
      'Reflection Prompt': 'Collaboration and leadership readiness',
      'Personalised Response':
        'If compromised I will escalate to: Structured debrief Protected supervision Safe staffing Psychological safety'
    },
    {
      Phase: 'During Exposure',
      Guideline: 'Be Aware of Vicarious Trauma Signs',
      'Reflection Prompt': 'Daily monitoring - Average End-of-shift rating',
      'Personalised Response':
        'if score Imoderate strain 2 days → I will: __________ If score overwhelmed → I will: __________ Emotional load Energy'
    },
    {
      Phase: 'During Exposure',
      Guideline: 'Strengthen Protective Factors',
      'Reflection Prompt': 'Real time regulation',
      'Personalised Response':
        'During distressing exposure I will ____________ Pause and do breathe work Ground Physically Name Emotion Seek collegue'
    },
    {
      Phase: 'During Exposure',
      Guideline: 'Maintain Constant Awareness',
      'Reflection Prompt': 'Workload Protection',
      'Personalised Response':
        'If workload exceed capacity ---> 1. Inform supervisor; 2. request redistribuition; 3- document concern Other:'
    },
    {
      Phase: 'After Exposure',
      Guideline: 'Continue Self-Monitoring',
      'Reflection Prompt': 'Lingering trauma signs and monitoring practices',
      'Personalised Response': 'Other: Intrusive Memories Emotional numbing Avoidance Hyperarousal Reduced Emphaty'
    },
    {
      Phase: 'After Exposure',
      Guideline: 'Engage in Reflection and Processing',
      'Reflection Prompt': 'Structured reflection post-exposure',
      'Personalised Response':
        '• What affected me most? • What strengths did I use? • What do I need now? What practices encourage mutual assistance with my peers and collective self-care?'
    },
    {
      Phase: 'After Exposure',
      Guideline: 'Meaning & growth',
      'Reflection Prompt': 'The exposures experiences',
      'Personalised Response':
        'Reinforced my values of__________ Strengths I demonstrated: __________'
    },
    {
      Phase: 'Organisation Role',
      Guideline: 'Organisation Role',
      'Reflection Prompt': 'What support is needed from the organisation',
      'Personalised Response': ''
    }
  ]
};

const jsonSource = document.getElementById('json-source');
const phaseNav = document.getElementById('phase-nav');
const phaseContent = document.getElementById('phase-content');
const entryTemplate = document.getElementById('entry-template');

const groupedByPhase = DATASET.data.reduce((accumulator, item) => {
  const phase = item.Phase;
  if (!accumulator[phase]) {
    accumulator[phase] = [];
  }
  accumulator[phase].push(item);
  return accumulator;
}, {});

const phaseOrder = Object.keys(groupedByPhase);
let activePhase = phaseOrder[0] || '';

jsonSource.textContent = JSON.stringify(DATASET, null, 2);

function createPhaseButton(phase) {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = `${phase} (${groupedByPhase[phase].length})`;
  button.className = phase === activePhase ? 'phase-btn active' : 'phase-btn';
  button.addEventListener('click', () => {
    activePhase = phase;
    renderPhaseButtons();
    renderPhaseContent();
  });
  return button;
}

function renderPhaseButtons() {
  phaseNav.innerHTML = '';
  phaseOrder.forEach((phase) => {
    phaseNav.appendChild(createPhaseButton(phase));
  });
}

function renderPhaseContent() {
  phaseContent.innerHTML = '';

  const entries = groupedByPhase[activePhase] || [];
  entries.forEach((entry, index) => {
    const fragment = entryTemplate.content.cloneNode(true);
    fragment.querySelector('.entry-guideline').textContent = `Guideline ${index + 1}: ${entry.Guideline}`;
    fragment.querySelector('.entry-prompt').textContent = entry['Reflection Prompt'];

    const responseValue = entry['Personalised Response'] || '(sem resposta personalizada preenchida no dado base)';
    fragment.querySelector('.entry-response').textContent = `Personalised Response: ${responseValue}`;

    phaseContent.appendChild(fragment);
  });
}

renderPhaseButtons();
renderPhaseContent();
