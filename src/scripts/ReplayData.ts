import {Directory, Encoding, Filesystem} from "@capacitor/filesystem";
import firebase from "@/backend/firebase-config";


import WaveSurfer from "wavesurfer.js"; //BSD-3 ok
import ExportAudioPlugin from "wavesurfer-export-audio-plugin"; //MIT ok


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

export async function getAudioString(timestamp: string, userID: string){
    const audioRef = await Filesystem.readFile({
        path: "/" + userID + "/" + timestamp + "/" + "0.raw",
        directory: Directory.Data,
        encoding: Encoding.UTF8,
    });
    return audioRef.data;
}
/**
 * 
 * @param {number} recordingId used to identify the specific recording the file belongs to
 * @param {string} fileName used to identify the specific file
 * @param {(AudioBuffer) => void} callback - this function will be called with the {@link AudioBuffer} as parameter
 */
export async function getAudioData(recordingId: number, fileName: string, callback: Function){
    const currentUser = firebase.auth().currentUser;
    if (currentUser == null) {
        console.error("FATAL ERROR. Currently no user logged in");
        return;//empty buffer
    }
    const currentUserUID = currentUser.uid;

    const audioRef: any = await Filesystem.readFile({
        path: "/" + currentUserUID + "/" + recordingId + "/" + fileName,
        directory: Directory.Data,
        encoding: Encoding.UTF8,
    });
    const wavesurfer = WaveSurfer.create({
        container: document.createElement('div'),
        plugins: [
          ExportAudioPlugin.create(),
        ],
      });

      wavesurfer.on("ready", async () => {
        const renderedBuffer = await wavesurfer.getRenderedAudioBuffer();
        callback(renderedBuffer);
        wavesurfer.destroy();
      });


      wavesurfer.load(new Audio(audioRef.data));
}


