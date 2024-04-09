import { ComponentPropsWithoutRef, forwardRef, useImperativeHandle, useRef } from "react"
import { Image } from "./image"
import { useResourceWithParams } from "../utils";
import * as THREE from "three";
import { Signal } from "@preact/signals-core";

export const Video2 = forwardRef<HTMLVideoElement, Omit<ComponentPropsWithoutRef<typeof Image>, "src"> & { src: string | MediaStream}>((props: Omit<ComponentPropsWithoutRef<typeof Image>, "src"> & { src: string | MediaStream}, ref) => {
    let texture: Signal | THREE.VideoTexture | undefined = undefined;
    const video = document.createElement('video');
    const videoRef = useRef<HTMLVideoElement>(null); // Create a ref
    if(typeof props.src === 'string') {
        video.src = props.src;
        video.load();
        video.play();
    } else {
        video.srcObject = props.src;
        video.play();
    }
    texture = useResourceWithParams(loadVideoTextureAsync, video)
    
    useImperativeHandle(ref, () => video as HTMLVideoElement, [video]);
    return (
        <>
            <Image {...props} src={texture as unknown as string} />
        </>
    );
});

function loadVideoTextureAsync(video: HTMLVideoElement): Promise<THREE.VideoTexture> {
    return new Promise((resolve, reject) => {
        try {
            const textureLoader = new THREE.VideoTexture(video);
            resolve(textureLoader);
        } catch(err) {
            console.error(err)
            reject(err);
        }
    });
};