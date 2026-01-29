'use client';

import { useState, useRef } from 'react';

interface VoiceCoachSettings {
  enabled: boolean;
  voice: 'male' | 'female';
  frequency: 'low' | 'medium' | 'high';
}

export function useVoiceCoach(settings: VoiceCoachSettings) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const lastPostureState = useRef<'good' | 'fair' | 'poor' | null>(null);
  const consecutivePoorCount = useRef(0);
  const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;

  const getVoice = () => {
    if (!synth) return null;
    const voices = synth.getVoices();
    
    if (settings.voice === 'female') {
      return voices.find(v => v.name.includes('Female') || v.name.includes('Samantha')) || voices[0];
    } else {
      return voices.find(v => v.name.includes('Male') || v.name.includes('Daniel')) || voices[0];
    }
  };

  const speak = (text: string) => {
  if (!synth || !settings.enabled) return;

  // Cancel any ongoing speech
  try {
    synth.cancel();
  } catch (e) {
    console.log('Cancel failed, continuing...');
  }

  const utterance = new SpeechSynthesisUtterance(text);
  const voice = getVoice();
  if (voice) utterance.voice = voice;
  
  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  utterance.volume = 0.9;

  utterance.onstart = () => {
    setIsSpeaking(true);
    console.log('🎤 Speaking:', text);
  };

  utterance.onend = () => {
    setIsSpeaking(false);
    console.log('✅ Speech ended');
  };

  utterance.onerror = (event) => {
    setIsSpeaking(false);
    // Ignore "interrupted" and "canceled" errors - they're normal
    if (event.error !== 'interrupted' && event.error !== 'canceled') {
      console.warn('Speech warning:', event.error);
    }
  };

  console.log('📢 Attempting to speak:', text);
  
  // Small delay to ensure synthesis is ready
  setTimeout(() => {
    try {
      synth.speak(utterance);
    } catch (error) {
      console.warn('Speech failed:', error);
      setIsSpeaking(false);
    }
  }, 100);
};

  const providePostureFeedback = (postureScore: number) => {
    if (!settings.enabled) return;

    let currentState: 'good' | 'fair' | 'poor';
    
    if (postureScore >= 75) {
      currentState = 'good';
    } else if (postureScore >= 50) {
      currentState = 'fair';
    } else {
      currentState = 'poor';
    }

    // DEBUG: Log state changes
    console.log('Posture Score:', postureScore, '| Current State:', currentState, '| Last State:', lastPostureState.current);

    // IMMEDIATE feedback on state change (excluding first detection)
    if (currentState !== lastPostureState.current && lastPostureState.current !== null) {
      console.log('STATE CHANGED! Speaking now...');
      switch (currentState) {
        case 'poor':
          speak("Your posture is declining. Sit up straighter.");
          break;
        case 'fair':
          if (lastPostureState.current === 'poor') {
            speak("Better! Keep improving.");
          } else {
            speak("Your posture needs adjustment.");
          }
          break;
        case 'good':
          if (lastPostureState.current !== 'good') {
            speak("Excellent posture! Well done.");
          }
          break;
      }
      lastPostureState.current = currentState;
    } else if (lastPostureState.current === null) {
      // First time - just set the state without speaking
      console.log('First detection - setting initial state:', currentState);
      lastPostureState.current = currentState;
    } else {
      console.log('No state change - not speaking');
    }
    
    // Additional check for very poor posture
    if (postureScore < 35) {
      consecutivePoorCount.current++;
      if (consecutivePoorCount.current === 5) {
        console.log('CRITICAL posture detected!');
        speak("Critical! Your posture needs immediate correction.");
        consecutivePoorCount.current = 0;
      }
    } else {
      consecutivePoorCount.current = 0;
    }
  };

  const provideBreakReminder = () => {
    if (!settings.enabled) return;
    
    const messages = [
      "Time for a quick break. Stand up and stretch for 30 seconds.",
      "You've been working hard. Take a moment to stretch your neck and shoulders.",
      "Break time! Roll your shoulders back and take a deep breath.",
      "Let's take a neural reset. Stand up and move around for a bit."
    ];
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    speak(randomMessage);
  };

  const provideEncouragement = (avgScore: number) => {
    if (!settings.enabled) return;

    if (avgScore >= 90) {
      speak("Outstanding work today! Your posture has been excellent.");
    } else if (avgScore >= 75) {
      speak("Great job maintaining good posture. Keep up the healthy habits.");
    } else if (avgScore >= 60) {
      speak("You're doing well, but there's room for improvement. Stay mindful of your posture.");
    }
  };

  const announceSessionStart = () => {
    if (!settings.enabled) return;
    speak("Neural stride monitoring activated. I'll help you maintain healthy posture throughout your session.");
  };

  const announceSessionEnd = (duration: number, avgScore: number) => {
    if (!settings.enabled) return;
    
    const minutes = Math.floor(duration / 60);
    speak(`Session complete. You worked for ${minutes} minutes with an average posture score of ${Math.round(avgScore)}. Great effort!`);
  };

  return {
    isSpeaking,
    speak,
    providePostureFeedback,
    provideBreakReminder,
    provideEncouragement,
    announceSessionStart,
    announceSessionEnd
  };
}