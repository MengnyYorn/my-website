const courseNames = ['HTML', 'CSS', 'JS', 'JavaScript', 'Java', 'SQL', 'Database', 'Network', 'React', 'Node.js', 'Bootstrap'];
const progressKey = 'myWebcodeCompletedCourses';
const userKey = 'myWebcodeUser';
const codeKey = 'myWebcodePlaygroundCode';

function readCompletedCourses() {
    try { return new Set(JSON.parse(localStorage.getItem(progressKey)) || []); }
    catch { return new Set(); }
}

function saveCompletedCourses(courses) {
    localStorage.setItem(progressKey, JSON.stringify([...courses]));
}

function getUser() {
    try { return JSON.parse(localStorage.getItem(userKey)); }
    catch { return null; }
}

function showMessage(text) {
    const message = document.querySelector('[data-message]');
    if (!message) return;
    message.textContent = text;
    message.classList.add('visible');
    window.setTimeout(() => message.classList.remove('visible'), 5000);
}

function updateAccountButton() {
    const user = getUser();
    const button = document.querySelector('[data-sign-in-button]');
    if (user && button) button.textContent = 'Signed in';
}

function updateExerciseProgress() {
    const completed = readCompletedCourses();
    document.querySelectorAll('[data-exercise]').forEach((button) => {
        const course = button.dataset.exercise;
        if (!completed.has(course)) return;
        button.disabled = true;
        button.textContent = 'Exercise completed';
        button.closest('.course-card').classList.add('complete');
    });
    const progress = document.querySelector('[data-exercise-progress]');
    if (progress) progress.textContent = `${completed.size} / ${courseNames.length} completed`;
    document.querySelectorAll('[data-dashboard-progress]').forEach((item) => {
        item.textContent = `${completed.size} / ${courseNames.length}`;
    });
    updateDashboardData();
}

function updateCertificateStatus() {
    const completed = readCompletedCourses();
    const button = document.querySelector('[data-certificate-button]');
    const status = document.querySelector('[data-certificate-status]');
    if (!button || !status) return;
    const remaining = courseNames.length - completed.size;
    button.disabled = remaining > 0;
    status.textContent = remaining === 0
        ? 'All exercises are complete. Sign in or register, then request your certificate.'
        : `Complete ${remaining} more exercise${remaining === 1 ? '' : 's'} to unlock certificate registration.`;
}

function updateDashboardData() {
    const completed = readCompletedCourses();
    const total = courseNames.length;
    const percent = Math.round((completed.size / total) * 100);
    const user = getUser();
    const name = user?.name || user?.email?.split('@')[0] || 'Learner';
    document.querySelectorAll('[data-dashboard-name]').forEach((item) => item.textContent = name);
    document.querySelectorAll('[data-dashboard-count]').forEach((item) => item.textContent = `${completed.size} / ${total}`);
    document.querySelectorAll('[data-dashboard-percent]').forEach((item) => item.textContent = `${percent}%`);
    document.querySelectorAll('[data-progress-bar]').forEach((item) => item.style.width = `${percent}%`);
    document.querySelectorAll('[data-certificate-ready]').forEach((item) => {
        item.textContent = completed.size === total ? 'Certificate unlocked' : `${total - completed.size} exercises remaining`;
    });
}

document.addEventListener('DOMContentLoaded', () => {
    updateAccountButton();
    updateExerciseProgress();
    updateCertificateStatus();
    updateDashboardData();

    document.querySelectorAll('[data-open-dialog]').forEach((button) => button.addEventListener('click', () => {
        document.querySelector(`#${button.dataset.openDialog}`).showModal();
    }));
    document.querySelectorAll('[data-close-dialog]').forEach((button) => button.addEventListener('click', () => {
        document.querySelector(`#${button.dataset.closeDialog}`).close();
    }));

    const searchButton = document.querySelector('[data-toggle-search]');
    const searchPanel = document.querySelector('[data-search-panel]');
    const searchInput = document.querySelector('[data-site-search]');
    const searchStatus = document.querySelector('[data-search-status]');
    if (searchButton && searchPanel && searchInput) {
        searchButton.addEventListener('click', () => {
            const visible = searchPanel.classList.toggle('visible');
            searchButton.setAttribute('aria-expanded', visible);
            if (visible) searchInput.focus();
        });
        searchInput.addEventListener('input', () => {
            const query = searchInput.value.trim().toLowerCase();
            const items = [...document.querySelectorAll('[data-search-item]')];
            const matching = items.filter((item) => item.textContent.toLowerCase().includes(query));
            items.forEach((item) => item.hidden = Boolean(query) && !matching.includes(item));
            if (searchStatus) searchStatus.textContent = query ? `${matching.length} result${matching.length === 1 ? '' : 's'}` : 'Start typing';
        });
        searchPanel.addEventListener('submit', (event) => event.preventDefault());
    }

    const heroSearch = document.querySelector('[data-hero-search]');
    if (heroSearch) heroSearch.addEventListener('submit', (event) => {
        event.preventDefault();
        const query = new FormData(heroSearch).get('course').trim().toLowerCase().replace(/\s+/g, '');
        const courseIds = { html: 'html', css: 'css', js: 'js', javascript: 'javascript', java: 'java', sql: 'sql', database: 'database', network: 'network', react: 'react', node: 'nodejs', 'node.js': 'nodejs', nodejs: 'nodejs', bootstrap: 'bootstrap' };
        const course = courseIds[query];
        window.location.href = course ? `tutorials.html#${course}` : 'tutorials.html';
    });

    const courseFilterButtons = [...document.querySelectorAll('[data-course-filter]')];
    const courseCards = [...document.querySelectorAll('[data-course-level]')];
    courseFilterButtons.forEach((button) => button.addEventListener('click', () => {
        const level = button.dataset.courseFilter;
        courseCards.forEach((card) => card.hidden = level !== 'all' && card.dataset.courseLevel !== level);
        courseFilterButtons.forEach((item) => item.setAttribute('aria-pressed', item === button));
    }));

    const resetProgressButton = document.querySelector('[data-reset-progress]');
    if (resetProgressButton) resetProgressButton.addEventListener('click', () => {
        localStorage.removeItem(progressKey);
        updateExerciseProgress();
        updateCertificateStatus();
        updateDashboardData();
        showMessage('Your learning progress has been reset in this browser.');
    });

    const codeEditor = document.querySelector('[data-code-editor]');
    const previewFrame = document.querySelector('[data-preview-frame]');
    if (codeEditor && previewFrame) {
        const savedCode = localStorage.getItem(codeKey);
        if (savedCode) codeEditor.value = savedCode;
        const runCode = () => {
            previewFrame.srcdoc = codeEditor.value;
            localStorage.setItem(codeKey, codeEditor.value);
            showMessage('Preview updated and code saved in this browser.');
        };
        document.querySelector('[data-run-code]').addEventListener('click', runCode);
        document.querySelector('[data-reset-code]').addEventListener('click', () => {
            codeEditor.value = codeEditor.defaultValue;
            localStorage.removeItem(codeKey);
            previewFrame.srcdoc = codeEditor.value;
            showMessage('Editor reset to the starter example.');
        });
        previewFrame.srcdoc = codeEditor.value;
    }

    const createForm = document.querySelector('[data-create-form]');
    if (createForm) createForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const name = new FormData(createForm).get('project-name').trim();
        createForm.reset();
        createForm.closest('dialog').close();
        showMessage(`${name} is ready for you to start coding.`);
    });

    const signInForm = document.querySelector('[data-sign-in-form]');
    if (signInForm) signInForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const email = new FormData(signInForm).get('email');
        localStorage.setItem(userKey, JSON.stringify({ email }));
        signInForm.reset();
        signInForm.closest('dialog').close();
        updateAccountButton();
        showMessage('You are signed in. Your progress is saved in this browser.');
    });

    const registerForm = document.querySelector('[data-register-form]');
    if (registerForm) registerForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(registerForm);
        localStorage.setItem(userKey, JSON.stringify({ name: formData.get('name'), email: formData.get('email') }));
        registerForm.reset();
        registerForm.closest('dialog').close();
        updateAccountButton();
        showMessage('Your account is registered. Your progress is saved in this browser.');
    });

    document.querySelectorAll('[data-exercise]').forEach((button) => button.addEventListener('click', () => {
        const completed = readCompletedCourses();
        completed.add(button.dataset.exercise);
        saveCompletedCourses(completed);
        updateExerciseProgress();
        showMessage(`${button.dataset.exercise} exercise marked as completed.`);
    }));

    const certificateButton = document.querySelector('[data-certificate-button]');
    if (certificateButton) certificateButton.addEventListener('click', () => {
        if (!getUser()) {
            showMessage('Please sign in or register before requesting your certificate.');
            document.querySelector('#sign-in-dialog').showModal();
            return;
        }
        showMessage('Your certificate request has been registered.');
    });
});
