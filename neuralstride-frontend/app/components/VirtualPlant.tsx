'use client';

import { useEffect, useState, useRef } from 'react';

interface VirtualPlantProps {
  postureScore: number;
  isMonitoring: boolean;
}

export default function VirtualPlant({ postureScore, isMonitoring }: VirtualPlantProps) {
  const [plantHealth, setPlantHealth] = useState(50); // 0-100
  const [plantStage, setPlantStage] = useState(1); // 1-5 growth stages
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  // Update plant health based on posture
  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
  setPlantHealth(prev => {
    let newHealth = prev;
    
    if (postureScore >= 75) {
      // Good posture (75-100) - plant grows
      newHealth = Math.min(100, prev + 1.0);
    } else if (postureScore >= 50) {
      // Fair posture (50-74) - plant wilts slowly
      newHealth = Math.max(0, prev - 0.8);
    } else if (postureScore >= 30) {
      // Poor posture (30-49) - plant wilts faster
      newHealth = Math.max(0, prev - 2.0);
    } else {
      // Critical posture (0-29) - plant wilts VERY fast
      newHealth = Math.max(0, prev - 3.5);
    }
    
    return newHealth;
  });
}, 1000);

    return () => clearInterval(interval);
  }, [postureScore, isMonitoring]);

  // Determine plant stage based on health
  useEffect(() => {
    if (plantHealth >= 80) setPlantStage(5); // Full bloom
    else if (plantHealth >= 60) setPlantStage(4); // Flowering
    else if (plantHealth >= 40) setPlantStage(3); // Growing
    else if (plantHealth >= 20) setPlantStage(2); // Sprout
    else setPlantStage(1); // Seed/wilted
  }, [plantHealth]);

  // Draw plant on canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawPlant(ctx, plantStage, plantHealth);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [plantStage, plantHealth]);

  const drawPlant = (ctx: CanvasRenderingContext2D, stage: number, health: number) => {
    const centerX = 150;
    const groundY = 280;

    // Draw pot
    drawPot(ctx, centerX, groundY);

    // Draw soil
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(centerX - 50, groundY - 20, 100, 20);

    // Draw plant based on stage
    switch (stage) {
      case 1:
        drawSeed(ctx, centerX, groundY - 25);
        break;
      case 2:
        drawSprout(ctx, centerX, groundY - 30, health);
        break;
      case 3:
        drawGrowingPlant(ctx, centerX, groundY - 30, health);
        break;
      case 4:
        drawFloweringPlant(ctx, centerX, groundY - 30, health);
        break;
      case 5:
        drawFullBloom(ctx, centerX, groundY - 30, health);
        break;
    }

    // Draw health sparkles for good health
    if (health > 70) {
      drawSparkles(ctx, centerX, groundY - 80, health);
    }
  };

  const drawPot = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.fillStyle = '#CD853F';
    ctx.beginPath();
    ctx.moveTo(x - 60, y);
    ctx.lineTo(x - 50, y + 40);
    ctx.lineTo(x + 50, y + 40);
    ctx.lineTo(x + 60, y);
    ctx.closePath();
    ctx.fill();

    // Pot rim
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(x - 65, y - 5, 130, 5);
  };

  const drawSeed = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.fillStyle = '#D2691E';
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawSprout = (ctx: CanvasRenderingContext2D, x: number, y: number, health: number) => {
    // Stem
    const stemHeight = 20 + (health / 100) * 10;
    ctx.strokeStyle = health > 40 ? '#228B22' : '#8B4513';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y - stemHeight);
    ctx.stroke();

    // First leaf
    ctx.fillStyle = health > 40 ? '#32CD32' : '#9ACD32';
    ctx.beginPath();
    ctx.ellipse(x - 8, y - stemHeight / 2, 8, 5, -0.5, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawGrowingPlant = (ctx: CanvasRenderingContext2D, x: number, y: number, health: number) => {
    const stemHeight = 40 + (health / 100) * 20;
    const sway = Math.sin(Date.now() / 1000) * 3;

    // Stem
    ctx.strokeStyle = health > 40 ? '#228B22' : '#8B7355';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + sway, y - stemHeight / 2, x + sway, y - stemHeight);
    ctx.stroke();

    // Multiple leaves
    const leafColor = health > 40 ? '#32CD32' : '#9ACD32';
    drawLeaf(ctx, x - 10 + sway, y - 20, leafColor, -0.5);
    drawLeaf(ctx, x + 10 + sway, y - 30, leafColor, 0.5);
    drawLeaf(ctx, x - 8 + sway, y - 45, leafColor, -0.3);
  };

  const drawFloweringPlant = (ctx: CanvasRenderingContext2D, x: number, y: number, health: number) => {
    const stemHeight = 60 + (health / 100) * 30;
    const sway = Math.sin(Date.now() / 1000) * 5;

    // Stem
    ctx.strokeStyle = health > 40 ? '#228B22' : '#8B7355';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + sway, y - stemHeight / 2, x + sway, y - stemHeight);
    ctx.stroke();

    // Leaves
    const leafColor = health > 50 ? '#32CD32' : '#9ACD32';
    drawLeaf(ctx, x - 15 + sway, y - 25, leafColor, -0.5);
    drawLeaf(ctx, x + 15 + sway, y - 35, leafColor, 0.5);
    drawLeaf(ctx, x - 12 + sway, y - 50, leafColor, -0.3);
    drawLeaf(ctx, x + 12 + sway, y - 60, leafColor, 0.3);

    // Small flower bud
    ctx.fillStyle = health > 50 ? '#FF69B4' : '#C8A2C8';
    ctx.beginPath();
    ctx.arc(x + sway, y - stemHeight, 8, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawFullBloom = (ctx: CanvasRenderingContext2D, x: number, y: number, health: number) => {
    const stemHeight = 80 + (health / 100) * 40;
    const sway = Math.sin(Date.now() / 1000) * 5;

    // Stem
    ctx.strokeStyle = '#228B22';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + sway, y - stemHeight / 2, x + sway, y - stemHeight);
    ctx.stroke();

    // Leaves
    const leafColor = '#32CD32';
    drawLeaf(ctx, x - 20 + sway, y - 30, leafColor, -0.5, 1.2);
    drawLeaf(ctx, x + 20 + sway, y - 40, leafColor, 0.5, 1.2);
    drawLeaf(ctx, x - 18 + sway, y - 60, leafColor, -0.3, 1.1);
    drawLeaf(ctx, x + 18 + sway, y - 70, leafColor, 0.3, 1.1);

    // Beautiful flower
    const flowerX = x + sway;
    const flowerY = y - stemHeight;

    // Petals
    const petalColor = health > 80 ? '#FF1493' : '#FF69B4';
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI * 2) / 8;
      const petalX = flowerX + Math.cos(angle) * 12;
      const petalY = flowerY + Math.sin(angle) * 12;
      
      ctx.fillStyle = petalColor;
      ctx.beginPath();
      ctx.ellipse(petalX, petalY, 8, 6, angle, 0, Math.PI * 2);
      ctx.fill();
    }

    // Center
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(flowerX, flowerY, 6, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawLeaf = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    color: string,
    angle: number,
    scale: number = 1
  ) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(x, y, 10 * scale, 6 * scale, angle, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawSparkles = (ctx: CanvasRenderingContext2D, x: number, y: number, health: number) => {
    const sparkleCount = Math.floor((health - 70) / 10);
    
    for (let i = 0; i < sparkleCount; i++) {
      const angle = (Date.now() / 1000 + i) * 2;
      const distance = 30 + i * 10;
      const sparkleX = x + Math.cos(angle) * distance;
      const sparkleY = y + Math.sin(angle) * distance;
      
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(sparkleX, sparkleY, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const getHealthColor = () => {
    if (plantHealth >= 80) return 'text-green-400';
    if (plantHealth >= 60) return 'text-lime-400';
    if (plantHealth >= 40) return 'text-yellow-400';
    if (plantHealth >= 20) return 'text-orange-400';
    return 'text-red-400';
  };

  const getStatusMessage = () => {
    if (plantHealth >= 80) return '🌟 Thriving! Keep up the excellent posture!';
    if (plantHealth >= 60) return '🌱 Growing well! Your posture is helping!';
    if (plantHealth >= 40) return '🌿 Needs care. Improve your posture!';
    if (plantHealth >= 20) return '😟 Wilting! Sit up straight!';
    return '💀 Critical! Your plant needs help!';
  };

  return (
    <div className="bg-gradient-to-br from-green-900/30 to-blue-900/30 rounded-lg p-6 border border-green-700/50">
      <h3 className="text-white text-xl font-semibold mb-2">
        🌱 Your Posture Plant
      </h3>
      <p className="text-gray-400 text-sm mb-4">
        Good posture helps it grow, bad posture makes it wilt!
      </p>

      {/* Canvas */}
      <div className="bg-gradient-to-b from-sky-200 to-green-100 rounded-lg mb-4">
        <canvas
          ref={canvasRef}
          width={300}
          height={320}
          className="mx-auto"
        />
      </div>

      {/* Plant Stats */}
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-300">Plant Health</span>
            <span className={`font-bold ${getHealthColor()}`}>
              {Math.round(plantHealth)}%
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${
                plantHealth >= 80 ? 'bg-green-400' :
                plantHealth >= 60 ? 'bg-lime-400' :
                plantHealth >= 40 ? 'bg-yellow-400' :
                plantHealth >= 20 ? 'bg-orange-400' : 'bg-red-400'
              }`}
              style={{ width: `${plantHealth}%` }}
            />
          </div>
        </div>

        <div className="bg-white/10 rounded-lg p-3">
          <div className="text-sm">
            <div className="flex justify-between mb-1">
              <span className="text-gray-400">Growth Stage:</span>
              <span className="text-white font-semibold">
                {['🌰 Seed', '🌱 Sprout', '🌿 Growing', '🌸 Flowering', '🌺 Full Bloom'][plantStage - 1]}
              </span>
            </div>
            <div className="text-gray-300 text-xs mt-2">
              {getStatusMessage()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}