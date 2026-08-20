import { SUFFIXES, NAMES, COLORS } from './constants';

export type Suffix = typeof SUFFIXES[number];
export type Name = typeof NAMES[number];
export type Color = typeof COLORS[number];

export interface Camera {
    x: number;
    y: number;
}


export interface Player {
    id: number;
    name: Name;
    suffix?: Suffix; // Optional suffix for the name
    showNameTimer?: number; // Optional timer for showing name
    x: number;
    y: number;
    color: Color;
    asleepTimer?: number; // Optional timer for sleeping state
}