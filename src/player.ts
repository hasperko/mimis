import { PLAYERS, PLAYER_SIZE, WORLD_WIDTH, WORLD_HEIGHT, PADDING, BORDER_WIDTH, COLORS, NAMES, SUFFIXES } from './constants.ts'
import type { Player } from './types';

export function updatePlayerPosition(player: Player) {
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
    player.x = Math.max(0+BORDER_WIDTH, Math.min(player.x, WORLD_WIDTH - PLAYER_SIZE -BORDER_WIDTH));
    player.y = Math.max(0+BORDER_WIDTH, Math.min(player.y, WORLD_HEIGHT - PLAYER_SIZE -BORDER_WIDTH));
}

export function updatePlayerState(player: Player) {
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

export function doPlayersOverlap(player1: Player, player2: Player): boolean {
    return !(
        player1.x + PLAYER_SIZE + PADDING < player2.x ||
        player1.x > player2.x + PLAYER_SIZE + PADDING ||
        player1.y + PLAYER_SIZE + PADDING < player2.y ||
        player1.y > player2.y + PLAYER_SIZE + PADDING
    );
}

export function spawnPlayers(): Player[] {
    const players: Player[] = [];
    let attemptCount = 0;
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
        if (Math.random() < 0.5) { // 50% chance to have a suffix
            newPlayer.suffix = SUFFIXES[Math.floor(Math.random() * SUFFIXES.length)];
        }
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
    return players;
}