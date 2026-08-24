import { CAMERA_SPEED, CAMERA_BORDER } from './constants'
import type {Camera} from './types';

export function moveCamera(camera: Camera, keyRef: React.RefObject<{[key: string]: boolean}>, canvasRef: React.RefObject<HTMLCanvasElement | null>, worldRef: React.RefObject<{width: number, height: number}>) {
    if(keyRef.current['ArrowUp']) {
        if (camera.y - CAMERA_SPEED >= 0 - CAMERA_BORDER) {
            camera.y -= CAMERA_SPEED;
        }
    }
    if(keyRef.current['ArrowDown']) {
        if (camera.y + canvasRef.current!.height + CAMERA_SPEED <= worldRef.current.height + CAMERA_BORDER) {
            camera.y += CAMERA_SPEED;
        }
    }
    if(keyRef.current['ArrowLeft']) {
        if (camera.x - CAMERA_SPEED >= 0 - CAMERA_BORDER) {
            camera.x -= CAMERA_SPEED;
        }   
    }
    if(keyRef.current['ArrowRight']) {
        if (camera.x + canvasRef.current!.width + CAMERA_SPEED <= worldRef.current.width + CAMERA_BORDER) {
            camera.x += CAMERA_SPEED;
        }
    }
}