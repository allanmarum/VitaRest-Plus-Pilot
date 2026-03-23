const shellScreens = document.querySelectorAll('.screen');
const contentScreens = document.querySelectorAll('.content-screen');
const navItems = document.querySelectorAll('.nav-item');
const screenTitle = document.getElementById('screen-title');
const selectedProfessional = document.getElementById('selected-professional');
const collectionProfessional = document.getElementById('collection-professional');
const resultProfessional = document.getElementById('result-professional');
const selectedQuestionnaire = document.getElementById('selected-questionnaire');

const titleMap = {
  dashboard: 'Dashboard',
  professionals: 'Anonymous Professionals List',
  'professional-detail': 'Professional Detail / History',
  questionnaires: 'Questionnaires List',
  'questionnaire-detail': 'Questionnaire Detail',
  factors: 'Evaluation Factors',
  thresholds: 'Threshold Settings',
  collection: 'Data Collection',
  result: 'Evaluation Result',
  reports: 'Reports / Trends',
  settings: 'Admin / Settings'
};

function showShell(screen) {
  shellScreens.forEach((item) => item.classList.toggle('active', item.dataset.screen === screen));
}

function showContent(target) {
  contentScreens.forEach((screen) => screen.classList.toggle('active', screen.id === target));
  navItems.forEach((item) => item.classList.toggle('active', item.dataset.target === target));
  screenTitle.textContent = titleMap[target] || 'VitaRest Plus Pilot';
}

function updateProfessional(id) {
  if (!id) return;
  selectedProfessional.textContent = id;
  collectionProfessional.textContent = id;
  resultProfessional.textContent = id;
}

function updateQuestionnaire(name) {
  if (!name) return;
  selectedQuestionnaire.textContent = name;
}

function routeTo(target) {
  if (target === 'login') {
    showShell('login');
    return;
  }

  if (target === 'dashboard') {
    showShell('workspace');
  }

  showShell('workspace');
  showContent(target);
}

document.addEventListener('click', (event) => {
  const goTarget = event.target.dataset.go;
  const contentTarget = event.target.dataset.target;
  const professionalId = event.target.dataset.professional;
  const questionnaireName = event.target.dataset.questionnaire;

  if (professionalId) {
    updateProfessional(professionalId);
  }

  if (questionnaireName) {
    updateQuestionnaire(questionnaireName);
  }

  if (goTarget) {
    routeTo(goTarget);
  }

  if (contentTarget) {
    routeTo(contentTarget);
  }
});

showShell('login');
showContent('dashboard');
