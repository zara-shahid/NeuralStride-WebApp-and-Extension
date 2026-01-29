console.log('NeuralStride extension loaded');

let isMonitoring = false;
let currentScore = 50;
let plantState = 'growing';

chrome.runtime.onInstalled.addListener(() => {
  console.log('NeuralStride installed');
  chrome.storage.local.set({
    settings: {
      voiceEnabled: true,
      voiceType: 'female',
      notifications: true,
      autoStart: true,
      updateInterval: 5
    },
    stats: {
      totalSessions: 0,
      totalMinutes: 0,
      bestScore: 0,
      currentStreak: 0
    }
  });
  updatePlantIcon(50);
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Message received:', request);
  
  if (request.action === 'startMonitoring') {
    startMonitoring();
    sendResponse({ success: true });
  }
  
  if (request.action === 'stopMonitoring') {
    stopMonitoring();
    sendResponse({ success: true });
  }
  
  if (request.action === 'getStatus') {
    sendResponse({
      isMonitoring: isMonitoring,
      currentScore: currentScore,
      plantState: plantState
    });
  }
  
  if (request.action === 'updateScore') {
    currentScore = request.score;
    updatePlantIcon(request.score);
    sendResponse({ success: true });
  }
  
  return true;
});

chrome.runtime.onMessageExternal.addListener((request, sender, sendResponse) => {
  console.log('External message from web app:', request);
  
  if (request.action === 'ping') {
    console.log('Ping received from web app');
    sendResponse({ status: 'connected' });
    return true;
  }
  
  if (request.action === 'updatePosture') {
    console.log('Posture data received:', request.data);
    currentScore = request.data.postureScore;
    isMonitoring = true;
    updatePlantIcon(currentScore);
    chrome.storage.local.set({
      lastPostureData: {
        score: request.data.postureScore,
        angle: request.data.cervicalAngle,
        detected: request.data.isPersonDetected,
        timestamp: Date.now()
      }
    });
    sendResponse({ status: 'updated' });
    return true;
  }
  
  if (request.action === 'sessionStatus') {
    console.log('Session status:', request.isActive);
    isMonitoring = request.isActive;
    if (!request.isActive) {
      updatePlantIcon(0);
    }
    sendResponse({ status: 'received' });
    return true;
  }
  
  return true;
});

function startMonitoring() {
  isMonitoring = true;
  console.log('Monitoring started');
  chrome.alarms.create('checkPosture', { periodInMinutes: 0.1 });
  chrome.notifications.create({
    type: 'basic',
    iconUrl: '../icons/plant-states/growing-48.png',
    title: 'NeuralStride Started',
    message: 'Your posture plant is now monitoring'
  });
}

function stopMonitoring() {
  isMonitoring = false;
  console.log('Monitoring stopped');
  chrome.alarms.clear('checkPosture');
  updatePlantIcon(0);
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'checkPosture' && isMonitoring) {
    simulatePostureCheck();
  }
});

function simulatePostureCheck() {
  currentScore = Math.max(0, Math.min(100, currentScore + (Math.random() - 0.5) * 10));
  updatePlantIcon(currentScore);
  if (currentScore < 30) {
    chrome.storage.local.get(['settings'], (result) => {
      if (result.settings && result.settings.notifications) {
        chrome.notifications.create({
          type: 'basic',
          iconUrl: '../icons/plant-states/wilting-48.png',
          title: 'Your Plant is Wilting',
          message: 'Your posture is poor. Sit up straight',
          priority: 2
        });
      }
    });
  }
}

function updatePlantIcon(score) {
  console.log('updatePlantIcon called with score:', score);
  let state;
  if (!isMonitoring) {
    state = 'dormant';
  } else if (score >= 85) {
    state = 'bloom';
  } else if (score >= 70) {
    state = 'flowering';
  } else if (score >= 50) {
    state = 'growing';
  } else if (score >= 30) {
    state = 'sprout';
  } else {
    state = 'wilting';
  }
  plantState = state;
  console.log('Plant state:', state);
  if (isMonitoring) {
    const badgeText = Math.round(score).toString();
    console.log('Setting badge text:', badgeText);
    chrome.action.setBadgeText({ text: badgeText });
    const badgeColor = score >= 70 ? '#10B981' : score >= 50 ? '#F59E0B' : '#EF4444';
    console.log('Setting badge color:', badgeColor);
    chrome.action.setBadgeBackgroundColor({ color: badgeColor });
  } else {
    console.log('Not monitoring - clearing badge');
    chrome.action.setBadgeText({ text: '' });
  }
  console.log('updatePlantIcon complete');
}

chrome.runtime.onConnect.addListener((port) => {
  console.log('Port connected');
});