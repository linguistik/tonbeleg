import {Directory, Encoding, Filesystem} from "@capacitor/filesystem";

export let audioDaten: HTMLAudioElement = new Audio()

export async function replayAudioData(timestamp: string, userID: string){
    const audioRef = await Filesystem.readFile({
        path: "/" + userID + "/" + timestamp + "/" + "0.raw",
        directory: Directory.Data,
        encoding: Encoding.UTF8,
    });
    const audioString = new Audio(audioRef.data);
    audioDaten = audioString;
    return audioString;
}

