import { useRef, useEffect } from 'react';
import {colord} from 'colord';

import './GameCanvas.css';


function GameCanvas() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const AnimationFrameIdRef = useRef<number | null>(null);
    const keyRef = useRef<{[key: string]: boolean}>({});

    const cameraRef = useRef<Camera>({ x: 0, y: 0 });

    const PLAYER_SIZE = 50;
    const PLAYERS = 100;

    const WORLD_WIDTH = 2000; // Width of the world
    const WORLD_HEIGHT = 2000; // Height of the world

    const PADDING = 10; // Padding between players to prevent overlap

    const COLORS = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#ffaa00', '#00ffff', '#ff00aa'] as const;
    const NAMES = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Heidi'] as const;
    type Name = typeof NAMES[number];
    type Color = typeof COLORS[number];

    interface Camera {
        x: number;
        y: number;
    }


    interface Player {
        name: Name;
        showNameTimer?: number; // Optional timer for showing name
        x: number;
        y: number;
        color: Color;
        asleepTimer?: number; // Optional timer for sleeping state
    }


    const playersRef = useRef<Player[]>([]);

    function drawPlayers(ctx: CanvasRenderingContext2D, players: Player[]) {
        for (const player of players) {
            ctx.fillStyle = player.asleepTimer !== undefined ? colord(player.color).darken(0.5).toHex() : player.color;
            ctx.fillRect(player.x, player.y, PLAYER_SIZE, PLAYER_SIZE);
            if (player.showNameTimer !== undefined) {
                ctx.fillStyle = '#000';
                ctx.font = '16px Arial';
                ctx.fillText(player.name, player.x, player.y - 10);
            }
        }
    }
    function updatePlayerPosition(player: Player) {
        if (player.asleepTimer !== undefined) {
            return; // Do not update position if the player is asleep
        }

        const speed = 2; // Adjust the speed as needed

        // Randomly change direction
        if (Math.random() < 0.02) {
            player.x += (Math.random() - 0.5) * speed * 10;
            player.y += (Math.random() - 0.5) * speed * 10;
        }

        // Keep the player within the canvas bounds
        player.x = Math.max(0, Math.min(player.x, WORLD_WIDTH - PLAYER_SIZE));
        player.y = Math.max(0, Math.min(player.y, WORLD_HEIGHT - PLAYER_SIZE));
    }

    function updatePlayerState(player: Player) {
        if(player.showNameTimer !== undefined) {
            player.showNameTimer--;
            if(player.showNameTimer <= 0) {
                delete player.showNameTimer;
            }
        }
        if(player.asleepTimer !== undefined) {
            player.asleepTimer--;
            if(player.asleepTimer <= 0) {
                delete player.asleepTimer;
            }
        } else {
            if(Math.random() < 0.0005) { // 0.05% chance to fall asleep
                player.asleepTimer = 200; // Sleep for 200 frames (~3.3 seconds at 60fps)
            }
        }
    }

    const render = (ctx: CanvasRenderingContext2D, players: Player[]) => {
        ctx.save();
        if(keyRef.current['ArrowUp']) {
            cameraRef.current.y -= 5;
        }
        if(keyRef.current['ArrowDown']) {
            cameraRef.current.y += 5;
        }
        if(keyRef.current['ArrowLeft']) {
            cameraRef.current.x -= 5;
        }
        if(keyRef.current['ArrowRight']) {
            cameraRef.current.x += 5;
        }
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.translate(-cameraRef.current.x, -cameraRef.current.y);
        for(const player of players) {
            updatePlayerPosition(player);
            updatePlayerState(player);
        }
        drawPlayers(ctx, players);
        ctx.restore();
        AnimationFrameIdRef.current = requestAnimationFrame(() => render(ctx, players));
    }

    function doPlayersOverlap(player1: Player, player2: Player): boolean {
        return !(
            player1.x + PLAYER_SIZE + PADDING < player2.x ||
            player1.x > player2.x + PLAYER_SIZE + PADDING ||
            player1.y + PLAYER_SIZE + PADDING < player2.y ||
            player1.y > player2.y + PLAYER_SIZE + PADDING
        );
    }

    function handleClick(e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const camera = cameraRef.current;

        const rect = canvas.getBoundingClientRect();
        const worldX = e.clientX - rect.left + camera.x;
        const worldY = e.clientY - rect.top + camera.y;
        for (const player of playersRef.current) {
            if (player.x <= worldX && worldX <= player.x + PLAYER_SIZE &&
                player.y <= worldY && worldY <= player.y + PLAYER_SIZE) {
                player.showNameTimer = 100; // Show name for 100 frames (~1.7 seconds at 60fps)
            }
        }
    }

    function handleKeyDown(e: KeyboardEvent) {
        e.preventDefault();
        keyRef.current[e.key] = true;
    }

    function handleKeyUp(e: KeyboardEvent) {
        e.preventDefault();
        keyRef.current[e.key] = false;
    }


    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        let attemptCount = 0;
        playersRef.current = [];
        for (let i = 0; i < PLAYERS; i++) {
            if (attemptCount > 100) {
                console.error('Could not place all players without overlap after 100 attempts.');
                break;
            }
            let newPlayer: Player = {
                x: Math.random() * (WORLD_WIDTH - PLAYER_SIZE),
                y: Math.random() * (WORLD_HEIGHT - PLAYER_SIZE),
                color: COLORS[Math.floor(Math.random() * COLORS.length)],
                name: NAMES[Math.floor(Math.random() * NAMES.length)],
            };
            let overlapFound = false;
            for (const player of playersRef.current) {
                if (doPlayersOverlap(newPlayer, player)) {
                    i--;
                    attemptCount++;
                    overlapFound = true;
                    break;
                }
            } 
            if (!overlapFound) {
                playersRef.current.push(newPlayer);
            }
        }

        AnimationFrameIdRef.current = requestAnimationFrame(() => render(ctx, playersRef.current));

        return () => {
            if (AnimationFrameIdRef.current !== null) {
                cancelAnimationFrame(AnimationFrameIdRef.current);
            }
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        }
    }, []);




    return(<canvas ref={canvasRef} onClick={handleClick}></canvas>);
}

export default GameCanvas;