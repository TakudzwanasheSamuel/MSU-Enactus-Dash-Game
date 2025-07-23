"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { generateAdaptiveMessage } from '@/ai/flows/adaptive-message';
import { Pause, Play, StopCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type Item = {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'beer' | 'water';
};

type Player = {
  x: number;
  y: number;
  width: number;
  height: number;
  dy: number;
  gravity: number;
  jumpPower: number;
  isJumping: boolean;
};

const MAX_HEALTH = 100;
const BEER_DAMAGE = 34;
const WATER_HEAL = 15;
const PLAYER_WIDTH = 50;
const PLAYER_HEIGHT = 70;

const educationalMessages = [
    { score: 200, message: "Did you know? Alcohol is a depressant that slows down the brain and body." },
    { score: 500, message: "Underage drinking can lead to poor decision-making and long-term health problems." },
    { score: 1000, message: "The brain is still developing during the teen years, and alcohol can harm this process." },
    { score: 1500, message: "Mixing alcohol with energy drinks is a dangerous combination." },
    { score: 2000, message: "It's okay to say 'no' to peer pressure. True friends will respect your decision." },
    { score: 2500, message: "Alcohol can impair coordination and judgment, increasing the risk of accidents and injuries." },
    { score: 3000, message: "Binge drinking can lead to alcohol poisoning, a serious and sometimes deadly condition." },
];

export default function HealthRunGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gameContainerRef = useRef<HTMLDivElement | null>(null);

  const [score, setScore] = useState(0);
  const [highscore, setHighscore] = useState(0);
  const [health, setHealth] = useState(MAX_HEALTH);
  
  const [isGameOver, setIsGameOver] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const [adaptiveMessage, setAdaptiveMessage] = useState('');
  const [isLoadingMessage, setIsLoadingMessage] = useState(false);
  
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;

  const playerRef = useRef<Player>({
    x: 50,
    y: 0,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    dy: 0,
    gravity: 0.6,
    jumpPower: -13,
    isJumping: false,
  });

  const itemsRef = useRef<Item[]>([]);
  const gameSpeedRef = useRef(5);
  const itemTimerRef = useRef(0);
  const scoreRef = useRef(0);
  const animationFrameId = useRef<number>();
  const shownMessagesRef = useRef<Set<number>>(new Set());
  const { toast } = useToast();

  const resetGame = useCallback(() => {
    setScore(0);
    scoreRef.current = 0;
    gameSpeedRef.current = 5;
    itemsRef.current = [];
    itemTimerRef.current = 0;
    shownMessagesRef.current.clear();
    
    const canvas = canvasRef.current;
    if (canvas) {
        playerRef.current.y = canvas.height - playerRef.current.height;
    }
    playerRef.current.dy = 0;
    playerRef.current.isJumping = false;
    
    setHealth(MAX_HEALTH);
    setAdaptiveMessage('');
    setIsPaused(false);
  }, []);

  const endGame = useCallback(() => {
    setIsGameOver(true);
    setGameStarted(false);
    setIsPaused(false);
    if (scoreRef.current > highscore) {
      const newHighscore = scoreRef.current;
      setHighscore(newHighscore);
      localStorage.setItem('healthRunHighscore', String(newHighscore));
    }

    setIsLoadingMessage(true);
    generateAdaptiveMessage({ score: scoreRef.current, health })
      .then(result => setAdaptiveMessage(result.message))
      .catch(error => {
        console.error("Failed to generate message:", error);
        setAdaptiveMessage("Remember to always make healthy choices.");
      })
      .finally(() => setIsLoadingMessage(false));
  }, [highscore, health]);

  const startGame = useCallback(() => {
    resetGame();
    setGameStarted(true);
    setIsGameOver(false);
  }, [resetGame]);

  const handleJump = useCallback(() => {
    if (!gameStarted) {
      startGame();
    } else if (!playerRef.current.isJumping && !isGameOver && !isPaused) {
      playerRef.current.isJumping = true;
      playerRef.current.dy = playerRef.current.jumpPower;
    }
  }, [gameStarted, isGameOver, isPaused, startGame]);

  const updateHealth = (newHealth: number) => {
    const clampedHealth = Math.max(0, Math.min(MAX_HEALTH, newHealth));
    setHealth(clampedHealth);
    if (clampedHealth <= 0) {
      endGame();
    }
  }

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = gameContainerRef.current;
    if (canvas && container) {
      const maxWidth = 1024;
      const aspect = 16 / 9;
      let newWidth = Math.min(container.clientWidth, maxWidth);
      
      if (newWidth === 0 && container.parentElement) {
          newWidth = Math.min(container.parentElement.clientWidth, maxWidth)
      }

      let newHeight = newWidth / aspect;

      if (newHeight > window.innerHeight * 0.7) {
        newHeight = window.innerHeight * 0.7;
        newWidth = newHeight * aspect;
      }
      
      canvas.width = newWidth;
      canvas.height = newHeight;
      const player = playerRef.current;
      player.y = canvas.height - player.height;
    }
  }, []);

  useEffect(() => {
    const storedHighscore = localStorage.getItem('healthRunHighscore');
    if (storedHighscore) {
      setHighscore(Number(storedHighscore));
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [resizeCanvas]);

  const gameLoop = useCallback(() => {
    if (isGameOver || isPaused) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Ground
    ctx.fillStyle = '#228B22';
    ctx.fillRect(0, canvas.height - 10, canvas.width, 10);

    // Update & Draw Player
    const player = playerRef.current;
    if (player.isJumping) {
      player.dy += player.gravity;
      player.y += player.dy;
    }
    if (player.y > canvas.height - player.height - 10) {
      player.y = canvas.height - player.height - 10;
      player.dy = 0;
      player.isJumping = false;
    }
    ctx.fillStyle = '#333';
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Update & Draw Items
    itemTimerRef.current++;
    if (itemTimerRef.current > (120 - (scoreRef.current / 100)) && itemsRef.current.length < 7) {
        const itemType = Math.random() < 0.65 ? 'beer' : 'water';
        const height = itemType === 'beer' ? 30 : 40;
        const width = 20;
        itemsRef.current.push({
            x: canvas.width,
            y: canvas.height - height - 10,
            width,
            height,
            type: itemType,
        });
        itemTimerRef.current = 0;
    }
    
    itemsRef.current.forEach((item, index) => {
        item.x -= gameSpeedRef.current;
        if (item.type === 'beer') {
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(item.x, item.y, item.width, item.height);
            ctx.fillStyle = '#C0C0C0';
            ctx.fillRect(item.x, item.y, item.width, 4);
        } else {
            ctx.fillStyle = '#00BFFF';
            ctx.fillRect(item.x, item.y, item.width, item.height);
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(item.x, item.y, item.width, 5);
        }

        if (item.x + item.width < 0) {
            itemsRef.current.splice(index, 1);
        }
    });

    // Check Collisions
    const playerHitbox = { x: player.x + 10, width: player.width - 20, y: player.y, height: player.height };
    itemsRef.current.forEach((item, index) => {
      if (
        playerHitbox.x < item.x + item.width &&
        playerHitbox.x + playerHitbox.width > item.x &&
        playerHitbox.y < item.y + item.height &&
        playerHitbox.y + playerHitbox.height > item.y
      ) {
        if (item.type === 'beer') {
            updateHealth(health - BEER_DAMAGE);
        } else {
            updateHealth(health + WATER_HEAL);
        }
        itemsRef.current.splice(index, 1);
      }
    });
    
    // Update Score
    scoreRef.current++;
    setScore(scoreRef.current);
    gameSpeedRef.current = 5 + (scoreRef.current / 500);

    // Check for educational messages
    for (const msg of educationalMessages) {
        if (scoreRef.current >= msg.score && !shownMessagesRef.current.has(msg.score)) {
            toast({
                title: "Health Fact!",
                description: msg.message,
                duration: 5000,
            });
            shownMessagesRef.current.add(msg.score);
        }
    }

    animationFrameId.current = requestAnimationFrame(gameLoop);
  }, [isGameOver, health, endGame, isPaused, toast]);
  
  useEffect(() => {
    if (gameStarted && !isGameOver && !isPaused) {
      animationFrameId.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [gameStarted, isGameOver, gameLoop, isPaused]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleJump();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleJump]);
  
  const onTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientY);
  };

  const onTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };
  
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) {
      // It was a tap, not a swipe
      handleJump();
      return;
    }
    const distance = touchStart - touchEnd;
    const isSwipeUp = distance > minSwipeDistance;
    
    if (isSwipeUp) {
      handleJump();
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  const togglePause = () => {
      if (!isGameOver) {
          setIsPaused(!isPaused);
      }
  }
  
  return (
    <div ref={gameContainerRef} className="w-full max-w-4xl flex flex-col items-center font-headline">
        <div className="w-full grid grid-cols-3 gap-2 sm:gap-4 mb-4 text-center">
            <Card>
                <CardHeader className="p-2 sm:p-4">
                    <CardTitle className="text-sm sm:text-lg">Score</CardTitle>
                </CardHeader>
                <CardContent className="p-2 sm:p-4">
                    <p className="text-lg sm:text-2xl">{score}</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="p-2 sm:p-4">
                    <CardTitle className="text-sm sm:text-lg">Health</CardTitle>
                </CardHeader>
                <CardContent className="p-2 sm:p-4">
                    <Progress value={health} className="h-4 sm:h-6" />
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="p-2 sm:p-4">
                     <CardTitle className="text-sm sm:text-lg">High Score</CardTitle>
                </CardHeader>
                <CardContent className="p-2 sm:p-4">
                    <p className="text-lg sm:text-2xl">{highscore}</p>
                </CardContent>
            </Card>
        </div>
        <canvas 
          ref={canvasRef} 
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onClick={handleJump}
          className="w-full bg-background rounded-lg shadow-2xl" 
        />
        
        <div className="w-full flex justify-center gap-4 mt-4">
            {gameStarted && (
                <>
                    <Button onClick={togglePause} variant="outline">
                        {isPaused ? <Play className="mr-2 h-4 w-4" /> : <Pause className="mr-2 h-4 w-4" />}
                        {isPaused ? 'Resume' : 'Pause'}
                    </Button>
                    <Button onClick={endGame} variant="destructive">
                        <StopCircle className="mr-2 h-4 w-4" />
                        Stop
                    </Button>
                </>
            )}
        </div>

        <AlertDialog open={isGameOver} onOpenChange={setIsGameOver}>
            <AlertDialogContent className="font-headline text-center">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-3xl">
                        {!gameStarted ? "Welcome to Health Run!" : "Game Over!"}
                    </AlertDialogTitle>
                    <AlertDialogDescription asChild>
                      <div>
                        {!gameStarted ? (
                          <>
                            <p className="text-base pt-4">Avoid beer cans and collect water bottles to stay healthy.</p>
                            <br/>
                            <p className="text-base">Say NO to underage drinking!</p>
                            <br/>
                            <p className="font-bold text-base">Press Space or Tap/Swipe Up to Jump.</p>
                          </>
                        ) : isLoadingMessage ? (
                           <p className="text-base pt-4">Analyzing your performance for a tip...</p>
                        ) : (
                          <div>
                           <p className="mb-4 text-base">Your score: {score}</p>
                           <p className="font-bold text-primary text-base">{adaptiveMessage}</p>
                          </div>
                        )}
                        </div>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="sm:justify-center">
                    <AlertDialogAction asChild>
                         <Button onClick={startGame} className="text-lg p-6">
                            {!gameStarted ? "Start Game" : "Play Again"}
                        </Button>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}
