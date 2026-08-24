import { useRef, useEffect } from 'react';
import {colord} from 'colord';
import { SHOW_NAMES, PLAYER_SIZE, WORLD_WIDTH, WORLD_HEIGHT, CAMERA_BORDER, BACKGROUND_COLOR, BORDER_COLOR, BORDER_WIDTH, INACTIVE_THRESHOLD } from './constants'
import type { Camera, Player } from './types';
import { moveCamera } from './camera';

import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';

import './GameCanvas.css';


function GameCanvas(props: {username: string, onError: () => void},) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const AnimationFrameIdRef = useRef<number | null>(null);
    const imageCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());
    const worldRef = useRef<{width: number, height: number}>({width: WORLD_WIDTH, height: WORLD_HEIGHT});

    const socketRef = useRef<Socket | null>(null);

    const keyRef = useRef<{[key: string]: boolean}>({});
    const touchStartRef = useRef<{x: number, y: number} | null>(null);

    const cameraRef = useRef<Camera>({ x: 0, y: 0 });
    const playersRef = useRef<Player[]>([]);

    function getImage(url: string): HTMLImageElement {
        const cache = imageCacheRef.current;
        let img = cache.get(url);
        if (!img) {
            img = new Image();
            img.src = url;
            cache.set(url, img);
        }
        return img;
    }



    function drawPlayers(ctx: CanvasRenderingContext2D, players: Player[]) {
        for (const player of players) {
            const img = player.url ? getImage(player.url) : null;
            // if(player.asleepTimer !== undefined) {
            if(player.inactiveTimer >= INACTIVE_THRESHOLD) {
                ctx.fillStyle = colord(player.color).darken(0.5).toHex();
                ctx.fillRect(player.x, player.y, player.scale, player.scale);
            }
            else if (img && img.complete && img.naturalWidth !== 0) {
                ctx.drawImage(img, player.x, player.y, player.scale, player.scale);
            }
            if(SHOW_NAMES) {
                ctx.fillStyle = '#000';
                ctx.font = '16px Arial';
                if (player.suffix) {
                    ctx.fillText(`${player.name} ${player.suffix}`, player.x, player.y - 10);
                } else {
                    ctx.fillText(`${player.name} ${player.inactiveTimer}`, player.x, player.y - 10);
                }
            }
            else if (player.showNameTimer !== undefined) {
                ctx.fillStyle = '#000';
                ctx.font = '16px Arial';
                if (player.suffix) {
                    ctx.fillText(`${player.name} ${player.suffix}`, player.x, player.y - 10);
                } else {
                    ctx.fillText(player.name, player.x, player.y - 10);
                }
            } 
        }
    }


    const render = (ctx: CanvasRenderingContext2D) => {
        ctx.save();
        moveCamera(cameraRef.current, keyRef, canvasRef, worldRef);
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.translate(-cameraRef.current.x, -cameraRef.current.y);
        ctx.fillStyle = BACKGROUND_COLOR;
        ctx.fillRect(0, 0, worldRef.current.width, worldRef.current.height);
        ctx.strokeStyle = BORDER_COLOR;
        ctx.lineWidth = BORDER_WIDTH;
        ctx.strokeRect(0, 0, worldRef.current.width, worldRef.current.height);
        drawPlayers(ctx, playersRef.current);
        ctx.restore();
        AnimationFrameIdRef.current = requestAnimationFrame(() => render(ctx));
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
                if (socketRef.current) {
                    console.log(`Clicked on player ${player.name} with id ${player.id}`);
                    socketRef.current.emit('showName', player.id);
                }
            }
        }
    }

    function handleResize() {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        if (cameraRef.current.y + canvas.height >= worldRef.current.height + CAMERA_BORDER) {
            cameraRef.current.y = worldRef.current.height + CAMERA_BORDER - canvas.height;
        }
        if (cameraRef.current.x + canvas.width >= worldRef.current.width + CAMERA_BORDER) {
            cameraRef.current.x = worldRef.current.width + CAMERA_BORDER - canvas.width;
        }
    }

    function handleTouchStart(e: TouchEvent) {
        touchStartRef.current = {x: e.touches[0].clientX, y: e.touches[0].clientY};
    }
    function handleTouchMove(e: TouchEvent) {
        e.preventDefault(); // Prevent scrolling    
        let dx = touchStartRef.current ? e.touches[0].clientX - touchStartRef.current.x : 0;
        let dy = touchStartRef.current ? e.touches[0].clientY - touchStartRef.current.y : 0;
        if (cameraRef.current.x - dx < 0 - CAMERA_BORDER) {
            dx = cameraRef.current.x + CAMERA_BORDER;
        }
        if (cameraRef.current.y - dy < 0 - CAMERA_BORDER) {
            dy = cameraRef.current.y + CAMERA_BORDER;
        }
        if (cameraRef.current.x + canvasRef.current!.width - dx > worldRef.current.width + CAMERA_BORDER) {
            dx = cameraRef.current.x + canvasRef.current!.width - (worldRef.current.width + CAMERA_BORDER);
        }
        if (cameraRef.current.y + canvasRef.current!.height - dy > worldRef.current.height + CAMERA_BORDER) {
            dy = cameraRef.current.y + canvasRef.current!.height - (worldRef.current.height + CAMERA_BORDER);
        }
        cameraRef.current.x -= dx;
        cameraRef.current.y -= dy;
        touchStartRef.current = {x: e.touches[0].clientX, y: e.touches[0].clientY};
    }
    function handleTouchEnd() {
        touchStartRef.current = null;
    }

    function handleKeyDown(e: KeyboardEvent) {
        if(e.key.startsWith('Arrow')) {
            e.preventDefault();
        }
        keyRef.current[e.key] = true;
    }

    function handleKeyUp(e: KeyboardEvent) {
        if(e.key.startsWith('Arrow')) {
            e.preventDefault();
        }
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
        window.addEventListener('resize', handleResize);
        window.addEventListener('touchstart', handleTouchStart);
        window.addEventListener('touchmove', handleTouchMove, { passive: false });
        window.addEventListener('touchend', handleTouchEnd);

        socketRef.current = io('http://localhost:3000');
        socketRef.current.on('players', (data: Player[]) => {
            console.log('Received players from server');
            playersRef.current = data;
        })
        socketRef.current.on('worldDimensions', (data: {width: number, height: number}) => {
            console.log('Received world dimensions from server');
            worldRef.current = data;
        }); 
        socketRef.current.emit('tiktokUsername', props.username);
        socketRef.current.on('tiktokError', (e: string) => {
            console.error('TikTok error:', e);
            props.onError();
            window.alert('Error fetching TikTok data. Please check the username and try again.');
        });
        AnimationFrameIdRef.current = requestAnimationFrame(() => render(ctx));

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
            if (AnimationFrameIdRef.current !== null) {
                cancelAnimationFrame(AnimationFrameIdRef.current);
            }
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
        }
    }, []);

    return(<canvas ref={canvasRef} onClick={handleClick}></canvas>);
}

export default GameCanvas;