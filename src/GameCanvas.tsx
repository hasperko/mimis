import { useRef, useEffect } from 'react';

import './GameCanvas.css';


function GameCanvas() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const PLAYER_SIZE = 50;
    const PLAYERS = 4;

    interface Player {
        x: number;
        y: number;
    }

    const players: Player[] = [];

    function drawPlayers(ctx: CanvasRenderingContext2D, players: Player[]) {
        for (const player of players) {
            ctx.fillStyle = 'blue';
            ctx.fillRect(player.x, player.y, PLAYER_SIZE, PLAYER_SIZE);
        }
    }

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        for (let i = 0; i < PLAYERS; i++) {
            players.push({
                x: Math.random() * (canvas.width - PLAYER_SIZE),
                y: Math.random() * (canvas.height - PLAYER_SIZE),
            });
        }

        drawPlayers(ctx, players);
    }, []);




    return(<canvas ref={canvasRef}></canvas>);
}

export default GameCanvas;