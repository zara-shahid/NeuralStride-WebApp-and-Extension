'use client';

import { useRef, useEffect, useState } from 'react';
import { useMediaPipe, PostureMetrics } from '../lib/useMediaPipe';
import { useVoiceCoach } from '../lib/useVoiceCoach';
import SpineHeatmap from './SpineHeatmap';
import VirtualPlant from './VirtualPlant';
import { extensionBridge } from '../lib/extensionBridge';
// import PostureGhost from './PostureGhost';
// import SignLanguageLearning from './SignLanguageLearning';

export default function VideoFeed() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState('');
  const [metrics, setMetrics] = useState<PostureMetrics>({
    postureScore: 0,
    cervicalAngle: 0,
    isPersonDetected: false
  });

  const { isReady, detectPose, error: mediaPipeError } = useMediaPipe();
//   const [showGhost, setShowGhost] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  // const [showSignLanguage, setShowSignLanguage] = useState(false);
  const voiceCoach = useVoiceCoach({
    enabled: voiceEnabled,
    voice: 'female',
    frequency: 'medium'
  });

  // 🔗 ADD THIS NEW useEffect HERE
  useEffect(() => {
    console.log('🔗 VideoFeed mounted, initializing extension bridge...');
    extensionBridge.checkExtension();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720 } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
        extensionBridge.sendSessionStatus(true);
voiceCoach.announceSessionStart();
        // Announce session start
        voiceCoach.announceSessionStart();
      }
    } catch (err) {
      setError('Camera access denied. Please allow camera permissions.');
      console.error(err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      setIsStreaming(false);
      extensionBridge.sendSessionStatus(false);
    }
  };

  useEffect(() => {
    if (!isStreaming || !isReady || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const processFrame = () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        const result = detectPose(video, canvas);
        if (result) {
          setMetrics(result);

          // Send to extension
  extensionBridge.sendPostureData({
    postureScore: result.postureScore,
    cervicalAngle: result.cervicalAngle,
    isPersonDetected: result.isPersonDetected
  });
          // Provide voice feedback based on posture
          if (result.isPersonDetected) {
            voiceCoach.providePostureFeedback(result.postureScore);
          }
        }
      }
      requestAnimationFrame(processFrame);
    };

    // Start processing when video is ready
    video.onloadeddata = () => {
      processFrame();
    };

  }, [isStreaming, isReady, detectPose, voiceCoach]);

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      {/* Video Container */}
      <div className="relative w-full max-w-4xl bg-black rounded-lg overflow-hidden shadow-2xl">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-auto"
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full"
        />
        {/* <PostureGhost
  isActive={showGhost && isStreaming && metrics.isPersonDetected}
  canvasWidth={canvasRef.current?.width || 1280}
  canvasHeight={canvasRef.current?.height || 720}
/> */}
        {!isStreaming && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <p className="text-white text-lg">Camera Off</p>
          </div>
        )}

        {/* Status Badge */}
        {isStreaming && (
          <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm px-4 py-2 rounded-lg">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${metrics.isPersonDetected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
              <span className="text-white text-sm font-semibold">
                {metrics.isPersonDetected ? 'Detecting' : 'No Person'}
              </span>
            </div>
          </div>
        )}

        {/* Voice Status Indicator */}
        {isStreaming && voiceEnabled && (
          <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm px-4 py-2 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎤</span>
              <span className="text-white text-sm font-semibold">
                Voice Coach Active
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Metrics and Heatmap Display */}
      {isStreaming && metrics.isPersonDetected && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full max-w-7xl">
          {/* Metrics Cards */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <div className="text-gray-300 text-sm mb-2">Posture Score</div>
              <div className={`text-5xl font-bold ${getScoreColor(metrics.postureScore)}`}>
                {metrics.postureScore}
                <span className="text-2xl">/100</span>
              </div>
              <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all ${
                    metrics.postureScore >= 70 ? 'bg-green-400' :
                    metrics.postureScore >= 40 ? 'bg-yellow-400' : 'bg-red-400'
                  }`}
                  style={{ width: `${metrics.postureScore}%` }}
                />
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <div className="text-gray-300 text-sm mb-2">Cervical Angle</div>
              <div className="text-5xl font-bold text-cyan-400">
                {metrics.cervicalAngle}
                <span className="text-2xl">°</span>
              </div>
              <div className="text-gray-400 text-sm mt-2">
                Ideal: 165-180°
              </div>
            </div>
          </div>

          {/* Spine Heatmap */}
          <div className="lg:col-span-1">
            <SpineHeatmap
              postureScore={metrics.postureScore}
              cervicalAngle={metrics.cervicalAngle}
              isPersonDetected={metrics.isPersonDetected}
            />
          </div>
        </div>
      )}

      {/* Virtual Plant */}
      <div className="lg:col-span-1">
        <VirtualPlant
          postureScore={metrics.postureScore}
          isMonitoring={isStreaming && metrics.isPersonDetected}
        />
      </div>

      {/* Sign Language Learning Mode */}
      {/* {showSignLanguage && isStreaming && (
        <div className="w-full max-w-7xl mt-6">
          <SignLanguageLearning
            isActive={showSignLanguage}
            videoRef={videoRef}
          />
        </div>
      )} */}

      {/* Errors */}
      {(error || mediaPipeError) && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-4xl w-full">
          {error || mediaPipeError}
        </div>
      )}

      {/* MediaPipe Loading */}
      {!isReady && !mediaPipeError && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded max-w-4xl w-full">
          Loading AI models... Please wait (5-10 seconds)
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-4 flex-wrap justify-center">
        <button
          onClick={startCamera}
          disabled={isStreaming || !isReady}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-semibold text-lg shadow-lg transition-all"
        >
          {isReady ? 'Start Monitoring' : 'Loading AI...'}
        </button>
        <button
          onClick={stopCamera}
          disabled={!isStreaming}
          className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-semibold text-lg shadow-lg transition-all"
        >
          Stop
        </button>
        <button
          onClick={() => setVoiceEnabled(!voiceEnabled)}
          disabled={!isStreaming}
          className={`${voiceEnabled ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'} disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-semibold text-lg shadow-lg transition-all flex items-center gap-2`}
        >
          <span>{voiceEnabled ? '🔊' : '🔇'}</span>
          <span>Voice {voiceEnabled ? 'On' : 'Off'}</span>
        </button>

        {/* <button
  onClick={() => setShowGhost(!showGhost)}
  disabled={!isStreaming}
  className={`${showGhost ? 'bg-cyan-600 hover:bg-cyan-700' : 'bg-gray-600 hover:bg-gray-700'} disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-semibold text-lg shadow-lg transition-all flex items-center gap-2`}
>
  <span>{showGhost ? '👻' : '👤'}</span>
  <span>Ghost {showGhost ? 'On' : 'Off'}</span>
</button> */}
      </div>
    </div>
  );
}