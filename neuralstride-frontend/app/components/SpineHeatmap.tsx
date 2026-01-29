'use client';

import { useEffect, useRef } from 'react';

interface SpineHeatmapProps {
  postureScore: number;
  cervicalAngle: number;
  isPersonDetected: boolean;
}

export default function SpineHeatmap({ postureScore, cervicalAngle, isPersonDetected }: SpineHeatmapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !isPersonDetected) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate stress levels for different spine regions
    const cervicalStress = calculateCervicalStress(cervicalAngle);
    const thoracicStress = calculateThoracicStress(postureScore);
    const lumbarStress = calculateLumbarStress(postureScore);

    // Draw spine
    drawSpine(ctx, cervicalStress, thoracicStress, lumbarStress);
    
    // Draw legend
    drawLegend(ctx);

  }, [postureScore, cervicalAngle, isPersonDetected]);

  const calculateCervicalStress = (angle: number): number => {
    // Ideal: 165-180°, calculate stress percentage
    if (angle >= 165) return 0; // No stress
    if (angle >= 155) return 25; // Low stress
    if (angle >= 140) return 50; // Medium stress
    if (angle >= 120) return 75; // High stress
    return 100; // Critical stress
  };

  const calculateThoracicStress = (score: number): number => {
    // Inverse of posture score
    return Math.max(0, 100 - score);
  };

  const calculateLumbarStress = (score: number): number => {
    // Similar to thoracic but slightly less sensitive
    return Math.max(0, 100 - score) * 0.8;
  };

  const getStressColor = (stress: number): string => {
    if (stress <= 25) return '#10B981'; // Green
    if (stress <= 50) return '#F59E0B'; // Yellow
    if (stress <= 75) return '#F97316'; // Orange
    return '#EF4444'; // Red
  };

  const drawSpine = (
    ctx: CanvasRenderingContext2D,
    cervicalStress: number,
    thoracicStress: number,
    lumbarStress: number
  ) => {
    const centerX = 150;
    const startY = 50;
    const vertebraHeight = 20;
    const vertebraWidth = 40;
    const spacing = 5;

    // Cervical vertebrae (7)
    for (let i = 0; i < 7; i++) {
      const y = startY + i * (vertebraHeight + spacing);
      const stress = cervicalStress + (Math.random() - 0.5) * 10; // Add slight variation
      drawVertebra(ctx, centerX, y, vertebraWidth - i * 2, vertebraHeight, stress);
    }

    // Thoracic vertebrae (12) - slightly wider
    for (let i = 0; i < 12; i++) {
      const y = startY + 7 * (vertebraHeight + spacing) + i * (vertebraHeight + spacing);
      const stress = thoracicStress + (Math.random() - 0.5) * 10;
      const width = vertebraWidth + Math.sin(i / 2) * 5; // Natural curve
      drawVertebra(ctx, centerX, y, width, vertebraHeight, stress);
    }

    // Lumbar vertebrae (5) - larger
    for (let i = 0; i < 5; i++) {
      const y = startY + 19 * (vertebraHeight + spacing) + i * (vertebraHeight + spacing);
      const stress = lumbarStress + (Math.random() - 0.5) * 10;
      drawVertebra(ctx, centerX, y, vertebraWidth + 5, vertebraHeight, stress);
    }

    // Draw spine line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX, startY);
    ctx.lineTo(centerX, startY + 24 * (vertebraHeight + spacing));
    ctx.stroke();
  };

  const drawVertebra = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    stress: number
  ) => {
    const color = getStressColor(stress);
    
    // Draw vertebra body
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    
    // Rounded rectangle
    const radius = 5;
    ctx.beginPath();
    ctx.moveTo(x - width / 2 + radius, y);
    ctx.lineTo(x + width / 2 - radius, y);
    ctx.quadraticCurveTo(x + width / 2, y, x + width / 2, y + radius);
    ctx.lineTo(x + width / 2, y + height - radius);
    ctx.quadraticCurveTo(x + width / 2, y + height, x + width / 2 - radius, y + height);
    ctx.lineTo(x - width / 2 + radius, y + height);
    ctx.quadraticCurveTo(x - width / 2, y + height, x - width / 2, y + height - radius);
    ctx.lineTo(x - width / 2, y + radius);
    ctx.quadraticCurveTo(x - width / 2, y, x - width / 2 + radius, y);
    ctx.closePath();
    ctx.fill();

    // Reset shadow
    ctx.shadowBlur = 0;

    // Add highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(x - width / 2 + 5, y + 3, width - 10, 5);
  };

  const drawLegend = (ctx: CanvasRenderingContext2D) => {
    const legendX = 20;
    const legendY = 50;
    const boxSize = 15;
    const spacing = 25;

    const legend = [
      { label: 'Optimal', color: '#10B981' },
      { label: 'Caution', color: '#F59E0B' },
      { label: 'Warning', color: '#F97316' },
      { label: 'Critical', color: '#EF4444' }
    ];

    ctx.font = '12px Arial';
    ctx.textAlign = 'left';

    legend.forEach((item, index) => {
      const y = legendY + index * spacing;

      // Color box
      ctx.fillStyle = item.color;
      ctx.fillRect(legendX, y, boxSize, boxSize);

      // Label
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(item.label, legendX + boxSize + 8, y + boxSize - 3);
    });

    // Add region labels
    ctx.font = 'bold 11px Arial';
    ctx.fillStyle = '#A0A0A0';
    ctx.textAlign = 'right';
    
    ctx.fillText('Cervical', 280, 100);
    ctx.fillText('Thoracic', 280, 280);
    ctx.fillText('Lumbar', 280, 520);
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-6 border border-gray-700">
      <h3 className="text-white text-xl font-semibold mb-4">
        🦴 Spine Stress Heatmap
      </h3>
      
      {!isPersonDetected ? (
        <div className="flex items-center justify-center h-[600px] text-gray-400">
          <p>Start monitoring to see spine visualization</p>
        </div>
      ) : (
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={300}
            height={600}
            className="mx-auto"
          />
          
          {/* Real-time status */}
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div className="bg-white/10 rounded p-2">
              <div className="text-gray-400 text-xs">Cervical</div>
              <div className="text-white font-semibold">
                {calculateCervicalStress(cervicalAngle)}%
              </div>
            </div>
            <div className="bg-white/10 rounded p-2">
              <div className="text-gray-400 text-xs">Thoracic</div>
              <div className="text-white font-semibold">
                {calculateThoracicStress(postureScore)}%
              </div>
            </div>
            <div className="bg-white/10 rounded p-2">
              <div className="text-gray-400 text-xs">Lumbar</div>
              <div className="text-white font-semibold">
                {Math.round(calculateLumbarStress(postureScore))}%
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}