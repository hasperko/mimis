import { useRef, useEffect } from 'react';

import './GameCanvas.css';


function GameCanvas() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const AnimationFrameIdRef = useRef<number | null>(null);

    const PLAYER_SIZE = 50;
    const PLAYERS = 4;

    const PADDING = 10; // Padding between players to prevent overlap

    const COLORS = ['red', 'green', 'blue', 'yellow', 'purple', 'orange', 'cyan', 'magenta'] as const;
    type Color = typeof COLORS[number];

    interface Player {
        x: number;
        y: number;
        color: Color;
    }

    const playersRef = useRef<Player[]>([]);

    function drawPlayers(ctx: CanvasRenderingContext2D, players: Player[]) {
        for (const player of players) {
            ctx.fillStyle = player.color;
            ctx.fillRect(player.x, player.y, PLAYER_SIZE, PLAYER_SIZE);
        }
    }
    function updatePlayerPosition(player: Player, canvasWidth: number, canvasHeight: number) {
        const speed = 2; // Adjust the speed as needed

        // Randomly change direction
        if (Math.random() < 0.02) {
            player.x += (Math.random() - 0.5) * speed * 10;
            player.y += (Math.random() - 0.5) * speed * 10;
        }

        // Keep the player within the canvas bounds
        player.x = Math.max(0, Math.min(player.x, canvasWidth - PLAYER_SIZE));
        player.y = Math.max(0, Math.min(player.y, canvasHeight - PLAYER_SIZE));
    }

    const render = (ctx: CanvasRenderingContext2D, players: Player[]) => {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        for(const player of players) {
            updatePlayerPosition(player, ctx.canvas.width, ctx.canvas.height);
        }
        drawPlayers(ctx, players);
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

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let attemptCount = 0;
        playersRef.current = [];
        for (let i = 0; i < PLAYERS; i++) {
            if (attemptCount > 100) {
                console.error('Could not place all players without overlap after 100 attempts.');
                break;
            }
            let newPlayer: Player = {
                x: Math.random() * (canvas.width - PLAYER_SIZE),
                y: Math.random() * (canvas.height - PLAYER_SIZE),
                color: COLORS[Math.floor(Math.random() * COLORS.length)]
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
        }
    }, []);




    return(<canvas ref={canvasRef}></canvas>);
}

export default GameCanvas;