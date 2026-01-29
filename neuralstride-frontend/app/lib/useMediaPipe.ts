'use client';

import { useState, useEffect, useRef } from 'react';
import { PoseLandmarker, FilesetResolver, DrawingUtils } from '@mediapipe/tasks-vision';

export interface PostureMetrics {
  postureScore: number;
  cervicalAngle: number;
  isPersonDetected: boolean;
}

export function useMediaPipe() {
  const [poseLandmarker, setPoseLandmarker] = useState<PoseLandmarker | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState('');
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    initializeMediaPipe();
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const initializeMediaPipe = async () => {
    try {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );

      const landmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
          delegate: 'GPU'
        },
        runningMode: 'VIDEO',
        numPoses: 1,
        minPoseDetectionConfidence: 0.5,
        minPosePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      setPoseLandmarker(landmarker);
      setIsReady(true);
    } catch (err) {
      setError('Failed to initialize MediaPipe: ' + (err as Error).message);
      console.error(err);
    }
  };

  const calculateCervicalAngle = (landmarks: any[]): number => {
    // Use ear, shoulder, and hip - classic posture assessment method
    const leftEar = landmarks[7];
    const rightEar = landmarks[8];
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];

    // Average positions
    const ear = {
      x: (leftEar.x + rightEar.x) / 2,
      y: (leftEar.y + rightEar.y) / 2
    };
    const shoulder = {
      x: (leftShoulder.x + rightShoulder.x) / 2,
      y: (leftShoulder.y + rightShoulder.y) / 2
    };
    const hip = {
      x: (leftHip.x + rightHip.x) / 2,
      y: (leftHip.y + rightHip.y) / 2
    };

    // Create vectors
    const shoulderToEar = {
      x: ear.x - shoulder.x,
      y: ear.y - shoulder.y
    };
    
    const shoulderToHip = {
      x: hip.x - shoulder.x,
      y: hip.y - shoulder.y
    };

    // Calculate angle using dot product formula
    const dotProduct = (shoulderToEar.x * shoulderToHip.x) + (shoulderToEar.y * shoulderToHip.y);
    
    const magnitudeA = Math.sqrt(shoulderToEar.x ** 2 + shoulderToEar.y ** 2);
    const magnitudeB = Math.sqrt(shoulderToHip.x ** 2 + shoulderToHip.y ** 2);
    
    // Prevent division by zero
    if (magnitudeA === 0 || magnitudeB === 0) return 90;
    
    const cosTheta = dotProduct / (magnitudeA * magnitudeB);
    
    // Clamp value to prevent Math.acos errors
    const clampedCos = Math.max(-1, Math.min(1, cosTheta));
    
    const angleRad = Math.acos(clampedCos);
    const angleDeg = angleRad * (180 / Math.PI);
    
    return angleDeg;
  };

  const calculatePostureScore = (angle: number): number => {
  // More strict scoring based on cervical angle
  // Ideal: 170-180 degrees (nearly straight)
  // Good: 160-170 degrees
  // Fair: 145-160 degrees
  // Poor: 130-145 degrees
  // Critical: < 130 degrees
  
  if (angle >= 170) {
    // Excellent posture
    return 100;
  } else if (angle >= 165) {
    // Very good - small deduction
    return 95 - Math.round((170 - angle) * 2);
  } else if (angle >= 160) {
    // Good posture
    return 85 - Math.round((165 - angle) * 2);
  } else if (angle >= 150) {
    // Fair posture - starting to slouch
    return 70 - Math.round((160 - angle) * 2);
  } else if (angle >= 140) {
    // Poor posture - definite slouching
    return 50 - Math.round((150 - angle) * 2);
  } else if (angle >= 130) {
    // Bad posture
    return 30 - Math.round((140 - angle) * 2);
  } else if (angle >= 120) {
    // Very bad posture
    return 20 - Math.round((130 - angle) * 1.5);
  } else {
    // Critical - extreme forward head
    return Math.max(0, 10 - Math.round((120 - angle) * 0.5));
  }
};

  const detectPose = (
    video: HTMLVideoElement,
    canvas: HTMLCanvasElement
  ): PostureMetrics | null => {
    if (!poseLandmarker || !isReady) return null;

    const startTimeMs = performance.now();
    const results = poseLandmarker.detectForVideo(video, startTimeMs);

    // Draw on canvas
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (results.landmarks && results.landmarks.length > 0) {
        const drawingUtils = new DrawingUtils(ctx);
        
        for (const landmarks of results.landmarks) {
          // Draw skeleton
          drawingUtils.drawLandmarks(landmarks, {
            radius: 5,
            color: '#00FF00',
            fillColor: '#00FF00'
          });
          drawingUtils.drawConnectors(landmarks, PoseLandmarker.POSE_CONNECTIONS, {
            color: '#00FFFF',
            lineWidth: 2
          });
        }

        // Calculate metrics
        const cervicalAngle = calculateCervicalAngle(results.landmarks[0]);
        const postureScore = calculatePostureScore(cervicalAngle);

        return {
          postureScore: Math.round(postureScore),
          cervicalAngle: Math.round(cervicalAngle * 10) / 10,
          isPersonDetected: true
        };
      }
    }

    return {
      postureScore: 0,
      cervicalAngle: 0,
      isPersonDetected: false
    };
  };

  return {
    isReady,
    error,
    detectPose
  };
}