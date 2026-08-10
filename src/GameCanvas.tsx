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

    function doPlayersOverlap(player1: Player, player2: Player): boolean {
        return !(
            player1.x + PLAYER_SIZE < player2.x ||
            player1.x > player2.x + PLAYER_SIZE ||
            player1.y + PLAYER_SIZE < player2.y ||
            player1.y > player2.y + PLAYER_SIZE
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
        for (let i = 0; i < PLAYERS; i++) {
            if (attemptCount > 100) {
                console.error('Could not place all players without overlap after 100 attempts.');
                break;
            }
            let newPlayer: Player = {
                x: Math.random() * (canvas.width - PLAYER_SIZE),
                y: Math.random() * (canvas.height - PLAYER_SIZE),
            };
            let overlapFound = false;
            for (const player of players) {
                if (doPlayersOverlap(newPlayer, player)) {
                    i--;
                    attemptCount++;
                    overlapFound = true;
                    break;
                }
            } 
            if (!overlapFound) {
                players.push(newPlayer);
            }
        }

        drawPlayers(ctx, players);
    }, []);




    return(<canvas ref={canvasRef}></canvas>);
}

export default GameCanvas;