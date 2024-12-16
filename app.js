// Основные переменные
let miningInProgress = false;
let currentProgress = 0; // Текущий прогресс майнинга
let currentOffset = 440; // Начальный сдвиг прогресса
let miningStartedAt = 0; // Время начала майнинга
let animationFrameId = null; // ID для анимации
let mainScore = 0; // Основной счёт пользователя

// Функция для переключения вкладок
function switchTab(tabName) {
  if (tabName === 'main') {
    content.innerHTML = `
      <div class="mining-container">
        <!-- Отображение счета -->
        <div class="score-display">Счёт: <span id="mainScore">${mainScore}</span></div>
        <div class="circle-progress" id="circleProgress">
          <svg class="circle" width="150" height="150">
            <circle class="circle-background" cx="75" cy="75" r="70"></circle>
            <circle class="circle-progress-bar" cx="75" cy="75" r="70"></circle>
          </svg>
          <div class="percentage" id="percentage">${currentProgress}%</div>
        </div>
        <button id="startMiningButton" class="mining-button">${miningInProgress ? 'Остановить Майнинг' : 'Запустить Майнинг'}</button>
        <p id="miningStatus">${miningInProgress ? 'Майнинг в процессе...' : 'Майнинг не запущен'}</p>
      </div>
    `;

    // Привязываем обработчик кнопки для майнинга
    const startMiningButton = document.getElementById('startMiningButton');
    const progressBarCircle = document.querySelector('.circle-progress-bar');
    const percentageDisplay = document.getElementById('percentage');
    const miningStatus = document.getElementById('miningStatus');

    startMiningButton.addEventListener('click', () => {
      if (miningInProgress) {
        resetMining(progressBarCircle, percentageDisplay, miningStatus);
      } else if (currentProgress === 100) {
        collectReward();
        resetMining(progressBarCircle, percentageDisplay, miningStatus);
      } else {
        startMining(progressBarCircle, percentageDisplay, miningStatus);
      }
    });

    // Восстанавливаем состояние прогресса, если майнинг был активен
    if (miningInProgress) {
      const radius = 70;
      const circumference = 2 * Math.PI * radius;
      progressBarCircle.style.strokeDasharray = circumference;
      progressBarCircle.style.strokeDashoffset = currentOffset;
      percentageDisplay.textContent = `${currentProgress}%`;

      // Восстановить анимацию
      continueMining(progressBarCircle, percentageDisplay, miningStatus);
    }
  } else if (tabName === 'clicker') {
    content.innerHTML = `
      <h2>Кликер</h2>
      <button id="clickButton" class="neon-button">Нажми на кнопку</button>
      <p id="clickCount">Кликов: 0</p>
    `;
    let clickCount = 0;
    const clickButton = document.getElementById('clickButton');
    const clickCountDisplay = document.getElementById('clickCount');
    clickButton.addEventListener('click', () => {
      clickCount++;
      clickCountDisplay.textContent = `Кликов: ${clickCount}`;
    });
  } else if (tabName === 'tasks') {
    content.innerHTML = '<h2>Задания</h2><p>Список заданий будет добавлен позже.</p>';
  } else if (tabName === 'referrals') {
    content.innerHTML = '<h2>Приглашённые</h2><p>Приглашайте друзей и зарабатывайте бонусы!</p>';
  }
}

// Функция для начала майнинга
function startMining(progressBarCircle, percentageDisplay, miningStatus) {
  miningInProgress = true;
  miningStatus.textContent = 'Майнинг в процессе...';
  miningStartedAt = Date.now(); // Зафиксируем время начала

  const radius = 70;
  const circumference = 2 * Math.PI * radius;

  progressBarCircle.style.strokeDasharray = circumference;
  progressBarCircle.style.strokeDashoffset = circumference;

  currentProgress = 0;
  currentOffset = circumference;

  continueMining(progressBarCircle, percentageDisplay, miningStatus);
}

// Функция для продолжения майнинга
function continueMining(progressBarCircle, percentageDisplay, miningStatus) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;

  function updateProgress() {
    const elapsedTime = (Date.now() - miningStartedAt) / 1000; // Время в секундах

    if (elapsedTime >= 60) {
      currentProgress = 100; // Прогресс завершается на 100%
      currentOffset = 0; // Сдвиг прогресса обнуляется
      miningStatus.textContent = 'Майнинг завершён!';
      progressBarCircle.style.strokeDashoffset = currentOffset;
      percentageDisplay.textContent = `${currentProgress}%`;
      miningInProgress = false; // Завершаем процесс майнинга

      // Меняем текст кнопки на "Забрать"
      const startMiningButton = document.getElementById('startMiningButton');
      startMiningButton.textContent = 'Забрать';
    } else {
      currentProgress = Math.floor((elapsedTime / 60) * 100); // Рассчитываем прогресс
      currentOffset = circumference - (currentProgress / 100 * circumference);
      progressBarCircle.style.strokeDashoffset = currentOffset;
      percentageDisplay.textContent = `${currentProgress}%`;

      // Запускаем следующий кадр анимации
      animationFrameId = requestAnimationFrame(updateProgress);
    }
  }

  // Стартуем анимацию
  updateProgress();
}

// Функция для сброса майнинга
function resetMining(progressBarCircle, percentageDisplay, miningStatus) {
  clearAnimationFrame(); // Останавливаем анимацию

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

  // Сброс состояния майнинга
  currentProgress = 0;
  currentOffset = circumference;
  miningInProgress = false;
  miningStartedAt = 0;

  // Сбрасываем текст кнопки
  const startMiningButton = document.getElementById('startMiningButton');
  startMiningButton.textContent = 'Запустить Майнинг';
}

// Функция для начисления награды
function collectReward() {
  mainScore += 10; // Начисляем фиксированное количество очков
  const mainScoreDisplay = document.getElementById('mainScore');
  mainScoreDisplay.textContent = mainScore;
}

// Функция для очистки анимации
function clearAnimationFrame() {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
}

// Добавляем обработчики событий для кнопок вкладок
mainTab.addEventListener('click', () => switchTab('main'));
clickerTab.addEventListener('click', () => switchTab('clicker'));
tasksTab.addEventListener('click', () => switchTab('tasks'));
referralsTab.addEventListener('click', () => switchTab('referrals'));

// Инициализация — показываем главную вкладку
switchTab('main');
