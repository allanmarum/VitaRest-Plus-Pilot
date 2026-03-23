const shellScreens = document.querySelectorAll('.screen');
const contentScreens = document.querySelectorAll('.content-screen');
const navItems = document.querySelectorAll('.nav-item');
const screenTitle = document.getElementById('screen-title');
const screenTitleMobile = document.getElementById('screen-title-mobile');
const selectedProfessional = document.getElementById('selected-professional');
const collectionProfessional = document.getElementById('collection-professional');
const resultProfessional = document.getElementById('result-professional');
const selectedQuestionnaire = document.getElementById('selected-questionnaire');
const mobileNavigation = document.getElementById('mobileNavigation');

const titleMap = {
  dashboard: 'Dashboard',
  professionals: 'Anonymous Professionals',
  'professional-detail': 'Professional Detail',
  questionnaires: 'Questionnaires',
  'questionnaire-detail': 'Questionnaire Detail',
  factors: 'Evaluation Factors',
  thresholds: 'Threshold Settings',
  collection: 'Data Collection',
  result: 'Evaluation Result',
  reports: 'Reports / Trends',
  settings: 'Admin / Settings'
};

function syncTitles(target) {
  const nextTitle = titleMap[target] || 'VitaRest Plus Pilot';

  if (screenTitle) {
    screenTitle.textContent = nextTitle;
  }

  if (screenTitleMobile) {
    screenTitleMobile.textContent = nextTitle;
  }
}

function showShell(screen) {
  shellScreens.forEach((item) => {
    item.classList.toggle('active', item.dataset.screen === screen);
  });
}

function showContent(target) {
  contentScreens.forEach((screen) => {
    screen.classList.toggle('active', screen.id === target);
  });

  navItems.forEach((item) => {
    item.classList.toggle('active', item.dataset.target === target);
  });

  syncTitles(target);
}

function updateProfessional(id) {
  if (!id) return;

  if (selectedProfessional) selectedProfessional.textContent = id;
  if (collectionProfessional) collectionProfessional.textContent = id;
  if (resultProfessional) resultProfessional.textContent = id;
}

function updateQuestionnaire(name) {
  if (!name || !selectedQuestionnaire) return;
  selectedQuestionnaire.textContent = name;
}

function closeMobileNavigation() {
  if (!mobileNavigation || typeof bootstrap === 'undefined') return;

  const offcanvas = bootstrap.Offcanvas.getInstance(mobileNavigation);
  if (offcanvas) {
    offcanvas.hide();
  }
}

function routeTo(target) {
  if (target === 'login') {
    showShell('login');
    closeMobileNavigation();
    return;
  }

  showShell('workspace');
  showContent(target || 'dashboard');
  closeMobileNavigation();
}

document.addEventListener('click', (event) => {
  const trigger = event.target.closest('[data-go], [data-target], [data-professional], [data-questionnaire]');
  if (!trigger) return;

  const goTarget = trigger.dataset.go;
  const contentTarget = trigger.dataset.target;
  const professionalId = trigger.dataset.professional;
  const questionnaireName = trigger.dataset.questionnaire;

  if (professionalId) {
    updateProfessional(professionalId);
  }

  if (questionnaireName) {
    updateQuestionnaire(questionnaireName);
  }

  if (goTarget) {
    routeTo(goTarget);
    return;
  }

  if (contentTarget) {
    routeTo(contentTarget);
  }
});

showShell('login');
showContent('dashboard');
