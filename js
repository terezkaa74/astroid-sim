import React, { useState, useRef, useEffect } from 'react';
import { Play, RotateCcw, Trophy, BookOpen, Target } from 'lucide-react';

const AsteroidArcade = () => {
  const [gameState, setGameState] = useState('setup'); // setup, launching, impact, results
  const [score, setScore] = useState(0);
  const [asteroidSize, setAsteroidSize] = useState(50);
  const [asteroidType, setAsteroidType] = useState('rock');
  const [angle, setAngle] = useState(45);
  const [speed, setSpeed] = useState(50);
  const [targetZone, setTargetZone] = useState({ x: 200, y: 200 });
  const [impactPoint, setImpactPoint] = useState(null);
  const [badge, setBadge] = useState(null);
  const [factCard, setFactCard] = useState(null);
  const [totalScore, setTotalScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const canvasRef = useRef(null);

  const asteroidTypes = {
    rock: { name: 'Rocky', color: '#8B4513', density: 3, emoji: '🪨' },
    ice: { name: 'Icy', color: '#87CEEB', density: 1, emoji: '❄️' },
    metal: { name: 'Metallic', color: '#C0C0C0', density: 8, emoji: '⚙️' }
  };

  const facts = [
    "Rocky asteroids are the most common type in our solar system!",
    "Icy asteroids often vaporize before reaching Earth's surface.",
    "Metallic asteroids contain valuable minerals like iron and nickel.",
    "NASA tracks over 30,000 near-Earth asteroids to keep us safe!",
    "The Chicxulub asteroid (which ended the dinosaurs) was about 10 km wide.",
    "Most asteroids burn up harmlessly in Earth's atmosphere every day!"
  ];

  const badges = {
    rookie: { name: "Space Rookie", icon: "🚀", desc: "First launch!" },
    defender: { name: "Earth Defender", icon: "🛡️", desc: "Minimal impact!" },
    master: { name: "Impact Master", icon: "🎯", desc: "Bullseye hit!" },
    scientist: { name: "NASA Ally", icon: "🔬", desc: "Tried all types!" }
  };

  useEffect(() => {
    if (gameState === 'launching') {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      let frame = 0;
      const maxFrames = 60;

      const animate = () => {
        frame++;
        const progress = frame / maxFrames;
        
        // Clear canvas
        ctx.fillStyle = '#0a0a1a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw stars
        for (let i = 0; i < 50; i++) {
          ctx.fillStyle = 'white';
          ctx.beginPath();
          ctx.arc((i * 37) % canvas.width, (i * 73) % canvas.height, 1, 0, Math.PI * 2);
          ctx.fill();
        }

        // Draw Earth
        const earthX = canvas.width / 2;
        const earthY = canvas.height - 100;
        ctx.fillStyle = '#4169E1';
        ctx.beginPath();
        ctx.arc(earthX, earthY, 80, 0, Math.PI * 2);
        ctx.fill();
        
        // Green continents
        ctx.fillStyle = '#228B22';
        ctx.beginPath();
        ctx.arc(earthX - 30, earthY - 20, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(earthX + 40, earthY + 10, 25, 0, Math.PI * 2);
        ctx.fill();

        // Target zone indicator
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(targetZone.x, targetZone.y, 30, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Asteroid trajectory
        const startX = 50;
        const startY = 50;
        const asteroidX = startX + (targetZone.x - startX) * progress;
        const asteroidY = startY + (targetZone.y - startY) * progress + Math.sin(progress * Math.PI) * 50;

        // Trail effect
        for (let i = 0; i < 5; i++) {
          const trailProgress = Math.max(0, progress - i * 0.05);
          const trailX = startX + (targetZone.x - startX) * trailProgress;
          const trailY = startY + (targetZone.y - startY) * trailProgress + Math.sin(trailProgress * Math.PI) * 50;
          ctx.fillStyle = `${asteroidTypes[asteroidType].color}${Math.floor((1 - i * 0.2) * 255).toString(16).padStart(2, '0')}`;
          ctx.beginPath();
          ctx.arc(trailX, trailY, asteroidSize / 10, 0, Math.PI * 2);
          ctx.fill();
        }

        // Main asteroid
        ctx.fillStyle = asteroidTypes[asteroidType].color;
        ctx.beginPath();
        ctx.arc(asteroidX, asteroidY, asteroidSize / 8, 0, Math.PI * 2);
        ctx.fill();

        // Impact effect
        if (progress > 0.95) {
          const impactSize = (progress - 0.95) * 20 * (asteroidSize / 50);
          ctx.strokeStyle = '#FF6347';
          ctx.lineWidth = 4;
          for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.arc(asteroidX, asteroidY, impactSize * 10 * (i + 1), 0, Math.PI * 2);
            ctx.stroke();
          }
          
          // Spark particles
          for (let i = 0; i < 12; i++) {
            const sparkAngle = (i / 12) * Math.PI * 2;
            const sparkDist = impactSize * 15;
            ctx.fillStyle = '#FFA500';
            ctx.beginPath();
            ctx.arc(
              asteroidX + Math.cos(sparkAngle) * sparkDist,
              asteroidY + Math.sin(sparkAngle) * sparkDist,
              3,
              0,
              Math.PI * 2
            );
            ctx.fill();
          }
        }

        if (frame < maxFrames) {
          requestAnimationFrame(animate);
        } else {
          setImpactPoint({ x: asteroidX, y: asteroidY });
          calculateScore(asteroidX, asteroidY);
        }
      };

      animate();
    }
  }, [gameState]);

  const calculateScore = (impactX, impactY) => {
    const distance = Math.sqrt(
      Math.pow(impactX - targetZone.x, 2) + 
      Math.pow(impactY - targetZone.y, 2)
    );
    
    // Scoring formula
    let points = 0;
    
    // Size score (0-500)
    points += asteroidSize * 10;
    
    // Accuracy bonus (0-500)
    const accuracyBonus = Math.max(0, 500 - distance * 5);
    points += accuracyBonus;
    
    // Angle difficulty bonus (0-300)
    const angleDifficulty = Math.abs(angle - 45) / 45;
    points += angleDifficulty * 300;
    
    // Type multiplier
    const typeMultiplier = asteroidTypes[asteroidType].density / 3;
    points = Math.floor(points * typeMultiplier);
    
    setScore(points);
    setTotalScore(prev => prev + points);
    setAttempts(prev => prev + 1);
    
    // Award badge
    if (attempts === 0) {
      setBadge(badges.rookie);
    } else if (distance < 30) {
      setBadge(badges.master);
    } else if (asteroidSize < 30) {
      setBadge(badges.defender);
    }
    
    // Show random fact
    setFactCard(facts[Math.floor(Math.random() * facts.length)]);
    
    setGameState('results');
  };

  const launch = () => {
    setGameState('launching');
    setBadge(null);
    setFactCard(null);
    // Randomize target zone slightly
    setTargetZone({
      x: 150 + Math.random() * 200,
      y: 150 + Math.random() * 200
    });
  };

  const reset = () => {
    setGameState('setup');
    setScore(0);
    setImpactPoint(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-black text-white p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-pink-500">
            ASTEROID IMPACT ARCADE
          </h1>
          <p className="text-xl text-blue-300">Learn Science • Have Fun • Save (or Hit) Earth! 🌍</p>
        </div>

        {/* Score Display */}
        <div className="flex justify-between items-center mb-6 bg-black bg-opacity-50 p-4 rounded-lg">
          <div className="flex gap-6">
            <div className="text-center">
              <div className="text-sm text-gray-400">LAST SCORE</div>
              <div className="text-3xl font-bold text-yellow-400">{score}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-400">TOTAL</div>
              <div className="text-3xl font-bold text-green-400">{totalScore}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-400">ATTEMPTS</div>
              <div className="text-3xl font-bold text-blue-400">{attempts}</div>
            </div>
          </div>
          {badge && (
            <div className="bg-yellow-500 bg-opacity-20 border-2 border-yellow-500 rounded-lg p-3 animate-pulse">
              <div className="text-3xl mb-1">{badge.icon}</div>
              <div className="font-bold text-sm">{badge.name}</div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls */}
          <div className="bg-gray-900 bg-opacity-80 p-6 rounded-xl border-2 border-blue-500">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Target className="w-6 h-6" />
              Mission Control
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2">Asteroid Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.keys(asteroidTypes).map(type => (
                    <button
                      key={type}
                      onClick={() => setAsteroidType(type)}
                      disabled={gameState !== 'setup'}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        asteroidType === type
                          ? 'border-yellow-400 bg-yellow-500 bg-opacity-20'
                          : 'border-gray-600 hover:border-gray-400'
                      } ${gameState !== 'setup' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="text-2xl mb-1">{asteroidTypes[type].emoji}</div>
                      <div className="text-xs">{asteroidTypes[type].name}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2">
                  Size: {asteroidSize}m
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={asteroidSize}
                  onChange={(e) => setAsteroidSize(Number(e.target.value))}
                  disabled={gameState !== 'setup'}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm mb-2">
                  Entry Angle: {angle}°
                </label>
                <input
                  type="range"
                  min="15"
                  max="90"
                  value={angle}
                  onChange={(e) => setAngle(Number(e.target.value))}
                  disabled={gameState !== 'setup'}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm mb-2">
                  Speed: {speed} km/s
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  disabled={gameState !== 'setup'}
                  className="w-full"
                />
              </div>

              {gameState === 'setup' && (
                <button
                  onClick={launch}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 py-3 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition-all transform hover:scale-105"
                >
                  <Play className="w-5 h-5" />
                  LAUNCH ASTEROID
                </button>
              )}

              {gameState === 'results' && (
                <button
                  onClick={reset}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 py-3 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition-all transform hover:scale-105"
                >
                  <RotateCcw className="w-5 h-5" />
                  TRY AGAIN
                </button>
              )}
            </div>
          </div>

          {/* Simulator Display */}
          <div className="lg:col-span-2 bg-gray-900 bg-opacity-80 p-6 rounded-xl border-2 border-purple-500">
            <canvas
              ref={canvasRef}
              width={600}
              height={400}
              className="w-full h-full rounded-lg"
            />
          </div>
        </div>

        {/* Results & Facts */}
        {gameState === 'results' && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-yellow-500 to-orange-500 p-6 rounded-xl text-black">
              <div className="flex items-center gap-3 mb-4">
                <Trophy className="w-8 h-8" />
                <h3 className="text-2xl font-bold">Impact Score</h3>
              </div>
              <div className="text-6xl font-bold mb-4">{score}</div>
              <div className="space-y-2 text-sm">
                <div>✓ Size Score: {asteroidSize * 10}</div>
                <div>✓ Accuracy Bonus: {Math.floor((500 - (impactPoint ? Math.sqrt(Math.pow(impactPoint.x - targetZone.x, 2) + Math.pow(impactPoint.y - targetZone.y, 2)) * 5 : 0)))}</div>
                <div>✓ Type: {asteroidTypes[asteroidType].name} (×{asteroidTypes[asteroidType].density / 3})</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-6 rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <BookOpen className="w-8 h-8" />
                <h3 className="text-2xl font-bold">Science Fact!</h3>
              </div>
              <p className="text-lg leading-relaxed">{factCard}</p>
            </div>
          </div>
        )}

        {/* Challenges */}
        <div className="mt-6 bg-gray-900 bg-opacity-80 p-6 rounded-xl border-2 border-green-500">
          <h3 className="text-xl font-bold mb-3">🎯 Today's Challenges</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-500 bg-opacity-20 p-4 rounded-lg border border-blue-400">
              <div className="font-bold mb-1">Ocean Strike</div>
              <div className="text-sm text-gray-300">Hit the blue zones</div>
            </div>
            <div className="bg-green-500 bg-opacity-20 p-4 rounded-lg border border-green-400">
              <div className="font-bold mb-1">NASA Data Match</div>
              <div className="text-sm text-gray-300">Use 60m rocky asteroid</div>
            </div>
            <div className="bg-yellow-500 bg-opacity-20 p-4 rounded-lg border border-yellow-400">
              <div className="font-bold mb-1">Atmosphere Skim</div>
              <div className="text-sm text-gray-300">Small asteroid, low angle</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AsteroidArcade;
