// Основные переменные
let miningInProgress = false;
let currentProgress = 0;
let currentOffset = 440;
let miningStartedAt = 0;
let animationFrameId = null;
let mainScore = 0;
let experience = 0; // Новый счётчик опыта
let level = 1; // Новый уровень
let referralBonus = 0; // Новый бонус за приглашения
let remainingTime = 60; // Время до завершения майнинга (в секундах)
let countdownInterval = null; // Для отслеживания обратного отсчёта

// Получаем элементы вкладок
const mainTab = document.getElementById('mainTab');
const clickerTab = document.getElementById('clickerTab');
const tasksTab = document.getElementById('tasksTab');
const referralsTab = document.getElementById('referralsTab');

// Получаем контейнер для контента
const content = document.getElementById('content');

// Элемент переключателя темы
const themeSwitch = document.getElementById('themeSwitch');

// Переключение темы
themeSwitch.addEventListener('change', function() {
  if (this.checked) {
    document.body.classList.remove('light-theme');
    document.body.classList.add('dark-theme');
  } else {
    document.body.classList.remove('dark-theme');
    document.body.classList.add('light-theme');
  }
});

// Устанавливаем начальную тему
if (themeSwitch.checked) {
  document.body.classList.add('dark-theme');
} else {
  document.body.classList.add('light-theme');
}

// Функция для переключения вкладок
function switchTab(tabName) {
  // Снимаем класс active с других вкладок
  mainTab.classList.remove('active');
  clickerTab.classList.remove('active');
  tasksTab.classList.remove('active');
  referralsTab.classList.remove('active');

  // Добавляем класс active на выбранную вкладку
  if (tabName === 'main') {
    mainTab.classList.add('active');
  } else if (tabName === 'clicker') {
    clickerTab.classList.add('active');
  } else if (tabName === 'tasks') {
    tasksTab.classList.add('active');
  } else if (tabName === 'referrals') {
    referralsTab.classList.add('active');
  }

  // Меняем контент в зависимости от вкладки
  if (tabName === 'main') {
    content.innerHTML = `
      <div class="mining-container">
        <div class="score-display">Счёт: <span id="mainScore">${mainScore}</span></div>
        <div class="experience-display">Опыт: <span id="experience">${experience}</span></div>
        <div class="level-display">Уровень: <span id="level">${level}</span></div>
        <div class="circle-progress" id="circleProgress">
          <svg class="circle" width="150" height="150">
            <circle class="circle-background" cx="75" cy="75" r="70"></circle>
            <circle class="circle-progress-bar" cx="75" cy="75" r="70"></circle>
          </svg>
          <div class="percentage" id="percentage">${currentProgress}%</div>
          <div class="remaining-time" id="remainingTime">Оставшееся время: ${remainingTime}s</div>
        </div>
        <button id="startMiningButton" class="mining-button">${miningInProgress ? 'Остановить Майнинг' : 'Запустить Майнинг'}</button>
        <p id="miningStatus">${miningInProgress ? 'Майнинг в процессе...' : 'Майнинг не запущен'}</p>
      </div>
    `;

    // Обработчик для кнопки майнинга
    const startMiningButton = document.getElementById('startMiningButton');
    const progressBarCircle = document.querySelector('.circle-progress-bar');
    const percentageDisplay = document.getElementById('percentage');
    const miningStatus = document.getElementById('miningStatus');
    const remainingTimeDisplay = document.getElementById('remainingTime');

    startMiningButton.addEventListener('click', () => {
      if (miningInProgress) {
        resetMining(progressBarCircle, percentageDisplay, miningStatus, remainingTimeDisplay);
      } else if (currentProgress === 100) {
        collectReward();
        resetMining(progressBarCircle, percentageDisplay, miningStatus, remainingTimeDisplay);
      } else {
        startMining(progressBarCircle, percentageDisplay, miningStatus, remainingTimeDisplay);
      }
    });

    // Восстанавливаем состояние, если майнинг был активен
    if (miningInProgress) {
      const radius = 70;
      const circumference = 2 * Math.PI * radius;
      progressBarCircle.style.strokeDasharray = circumference;
      progressBarCircle.style.strokeDashoffset = currentOffset;
      percentageDisplay.textContent = `${currentProgress}%`;

      continueMining(progressBarCircle, percentageDisplay, miningStatus, remainingTimeDisplay);
    }
  } else if (tabName === 'clicker') {
    content.innerHTML = `
      <h2>Кликер</h2>
      <button id="clickButton" class="neon-button">¯\_(ツ)_/¯</button>
      <p id="clickCount">Кликов: 0</p>
    `;
    let clickCount = 0;
    const clickButton = document.getElementById('clickButton');
    const clickCountDisplay = document.getElementById('clickCount');
    clickButton.addEventListener('click', () => {
      clickCount++;
      clickCountDisplay.textContent = `Кликов: ${clickCount}`;
      gainExperience(1); // Добавляем опыт за клик
    });
  } else if (tabName === 'tasks') {
    content.innerHTML = '<h2>Задания</h2><p>Список заданий будет добавлен позже.</p>';
  } else if (tabName === 'referrals') {
    content.innerHTML = `
      <h2>Приглашённые</h2>
      <p>Приглашайте друзей и получайте бонусы!</p>
      <p>Ваш бонус за приглашения: ${referralBonus}</p>
    `;
  }
}

// Функции для майнинга, сброса и начисления награды
function startMining(progressBarCircle, percentageDisplay, miningStatus, remainingTimeDisplay) {
  miningInProgress = true;
  miningStatus.textContent = 'Майнинг в процессе...';
  miningStartedAt = Date.now();
  remainingTime = 60; // Начинаем с 60 секунд

  const radius = 70;
  const circumference = 2 * Math.PI * radius;

  progressBarCircle.style.strokeDasharray = circumference;
  progressBarCircle.style.strokeDashoffset = circumference;

  currentProgress = 0;
  currentOffset = circumference;

  countdownInterval = setInterval(() => {
    remainingTime--;
    remainingTimeDisplay.textContent = `Оставшееся время: ${remainingTime}s`;

    if (remainingTime <= 0) {
      clearInterval(countdownInterval);
      miningStatus.textContent = 'Майнинг завершён!';
      currentProgress = 100;
      currentOffset = 0;
      progressBarCircle.style.strokeDashoffset = currentOffset;
      percentageDisplay.textContent = `${currentProgress}%`;
      miningInProgress = false;
      const startMiningButton = document.getElementById('startMiningButton');
      startMiningButton.textContent = 'Забрать';
      gainExperience(10); // Получаем опыт за завершение майнинга
    }
  }, 1000); // Обновление каждую секунду

  continueMining(progressBarCircle, percentageDisplay, miningStatus, remainingTimeDisplay);
}

function continueMining(progressBarCircle, percentageDisplay, miningStatus, remainingTimeDisplay) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;

  function updateProgress() {
    const elapsedTime = (Date.now() - miningStartedAt) / 1000;

    if (elapsedTime >= 60) {
      currentProgress = 100;
      currentOffset = 0;
      miningStatus.textContent = 'Майнинг завершён!';
      progressBarCircle.style.strokeDashoffset = currentOffset;
      percentageDisplay.textContent = `${currentProgress}%`;
      miningInProgress = false;

      const startMiningButton = document.getElementById('startMiningButton');
      startMiningButton.textContent = 'Забрать';
      gainExperience(10); // Получаем опыт за завершение майнинга
    } else {
      currentProgress = Math.floor((elapsedTime / 60) * 100);
      currentOffset = circumference - (currentProgress / 100 * circumference);
      progressBarCircle.style.strokeDashoffset = currentOffset;
      percentageDisplay.textContent = `${currentProgress}%`;

      animationFrameId = requestAnimationFrame(updateProgress);
    }
  }

  updateProgress();
}

function resetMining(progressBarCircle, percentageDisplay, miningStatus, remainingTimeDisplay) {
  clearAnimationFrame();
  clearInterval(countdownInterval);

  const radius = 70;
  const circumference = 2 * Math.PI * radius;

  if (progressBarCircle) {
    progressBarCircle.style.strokeDasharray = circumference;
    progressBarCircle.style.strokeDashoffset = circumference;
  }
  if (percentageDisplay) {
    percentageDisplay.textContent = '0%';
  }
  if (miningStatus) {
    miningStatus.textContent = 'Майнинг не запущен';
  }
  if (remainingTimeDisplay) {
    remainingTimeDisplay.textContent = 'Оставшееся время: 60s';
  }

  currentProgress = 0;
  currentOffset = circumference;
  miningInProgress = false;
  miningStartedAt = 0;
  remainingTime = 60;

  const startMiningButton = document.getElementById('startMiningButton');
  startMiningButton.textContent = 'Запустить Майнинг';
}

function collectReward() {
  mainScore += 10;
  const mainScoreDisplay = document.getElementById('mainScore');
  mainScoreDisplay.textContent = mainScore;

  // Увеличиваем опыт за награду
  gainExperience(5);
}

function gainExperience(points) {
  experience += points;
  if (experience >= level * 10) {
    levelUp();
  }
  updateExperienceDisplay();
}

function levelUp() {
  level++;
  experience = 0;
  referralBonus += 5; // Бонус за повышение уровня
}

function updateExperienceDisplay() {
  document.getElementById('experience').textContent = experience;
  document.getElementById('level').textContent = level;
}

function clearAnimationFrame() {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
}

// Инициализация вкладок
mainTab.addEventListener('click', () => switchTab('main'));
clickerTab.addEventListener('click', () => switchTab('clicker'));
tasksTab.addEventListener('click', () => switchTab('tasks'));
referralsTab.addEventListener('click', () => switchTab('referrals'));

// Инициализация — показываем главную вкладку
switchTab('main');
