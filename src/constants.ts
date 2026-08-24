export const PLAYERS = 500;
export const PLAYER_SIZE = 50;

export const COLORS = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#ffaa00', '#00ffff', '#ff00aa'] as const;
// export const NAMES = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Heidi', 'Ivan', 'Julia', 'Kevin', 'Linda', 'Mike', 'Nina', 'Oscar', 'Paula', 'Quinn', 'Rachel', 'Steve', 'Tina'] as const;
export const SUFFIXES = ['Jr.', 'Sr.', 'III', 'IV', 'V'] as const;

export const WORLD_WIDTH = 4000; // Width of the world
export const WORLD_HEIGHT = 4000; // Height of the world

export const CAMERA_SPEED = 10; // Speed of camera movement
export const CAMERA_BORDER = 100; // Distance from the edge of the canvas before the camera starts moving

export const PADDING = 10; // Padding between players to prevent overlap
export const BACKGROUND_COLOR = '#83c7ff';
export const BORDER_COLOR = '#000000';
export const BORDER_WIDTH = 10;

export const SHOW_NAMES = true; // Set to true to show player names, false to hide them

export const INACTIVE_THRESHOLD = 1000; // Time in milliseconds after which a player is considered inactive