document.addEventListener('DOMContentLoaded', () => {
  const namesInput = document.querySelector('.names-input');
  const startDrawButton = document.querySelector('.start-draw-button');
  const currentNameContainer = document.querySelector('.current-name');
  const winnersList = document.querySelector('.winners-list');
  const settingsButton = document.querySelector('.settings-button');
  const settingsPanel = document.querySelector('.settings-panel');
  const winnerCountInput = document.querySelector('.winner-count-input');
  const durationSlider = document.querySelector('.duration-slider');
  const durationValue = document.querySelector('.duration-value');
  const nameIntervalSlider = document.querySelector('.name-interval-slider');
  const nameIntervalValue = document.querySelector('.name-interval-value');
  const sequentialCheckbox = document.querySelector('.sequential-checkbox');

  let names = [];
  let winners = [];
  let isDrawing = false;
  let currentName = '';
  let duration = 5;
  let winnerCount = 1;
  let sequential = true;
  let nameInterval = 150;

  // Fonksiyonlar
  const shuffleArray = (array) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const drawOne = (availableNames) => {
    return new Promise((resolve) => {
      const durationMs = duration * 1000;
      const startTime = Date.now();

      const intervalId = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * availableNames.length);
        currentName = availableNames[randomIndex];
        currentNameContainer.textContent = currentName;

        const elapsed = Date.now() - startTime;
        if (elapsed >= durationMs) {
          clearInterval(intervalId);
          resolve(currentName);
        }
      }, nameInterval);
    });
  };

  const startDraw = async () => {
    const cleanedNames = namesInput.value
      .split('\n')
      .map(name => name.trim())
      .filter(name => name.length > 0);

    if (cleanedNames.length < winnerCount) {
      alert('Yeterli isim yok (tekrarsız seçim için)!');
      return;
    }

    names = cleanedNames;
    winners = [];
    isDrawing = true;
    startDrawButton.disabled = true;

    let availableNames = shuffleArray(names);
    const drawnWinners = [];

    if (sequential) {
      for (let i = 0; i < winnerCount; i++) {
        const winner = await drawOne(availableNames);
        drawnWinners.push(winner);
        winners = [...drawnWinners];
        availableNames = availableNames.filter(n => n !== winner);
        updateWinnersList();
      }
    } else {
      const promises = Array.from({ length: winnerCount }, () => drawOne(availableNames));
      const result = await Promise.all(promises);
      winners = result;
      updateWinnersList();
    }

    isDrawing = false;
    startDrawButton.disabled = false;
  };

  const updateWinnersList = () => {
    winnersList.innerHTML = '';
    winners.forEach((name, idx) => {
      const listItem = document.createElement('li');
      listItem.textContent = `${idx + 1}. ${name}`;
      winnersList.appendChild(listItem);
    });
  };

  // Olay dinleyicileri
  namesInput.addEventListener('input', () => {
    startDrawButton.disabled = !namesInput.value.trim();
  });

  startDrawButton.addEventListener('click', startDraw);

  settingsButton.addEventListener('click', () => {
    settingsPanel.classList.toggle('active');
    settingsButton.querySelector('.chevron-down').classList.toggle('rotate-180');
  });

  winnerCountInput.addEventListener('change', (e) => {
    winnerCount = Number(e.target.value);
  });

  durationSlider.addEventListener('input', (e) => {
    duration = Number(e.target.value);
    durationValue.textContent = `${duration} saniye`;
  });

  nameIntervalSlider.addEventListener('input', (e) => {
    nameInterval = Number(e.target.value);
    nameIntervalValue.textContent = `${nameInterval} ms`;
  });

  sequentialCheckbox.addEventListener('change', (e) => {
    sequential = e.target.checked;
  });
});
