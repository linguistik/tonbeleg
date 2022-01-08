import {Directory, Encoding, Filesystem} from "@capacitor/filesystem";
import firebase from "@/backend/firebase-config";

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
 * returns the audioData of the specified file
 * NOTE: the return type may depend on the fileName ending for this call
 * NOTE: do not forget to AWAIT for this call to return
 * 
 * @param {string} timestamp used to identify the specific recording the file belongs to
 * @param {string} fileName used to identify the specific file
 * @returns {ArrayBuffer} containing the actual encoded data (at least for .wav files)
 */
export async function getAudioData(timestamp: string, fileName: string){
    const currentUser = firebase.auth().currentUser;
    if (currentUser == null) {
        console.error("FATAL ERROR. Currently no user logged in");
        return null;
    }
    const currentUserUID = currentUser.uid;

    const audioRef = await Filesystem.readFile({
        path: "/" + currentUserUID + "/" + timestamp + "/" + fileName,
        directory: Directory.Data,
        encoding: Encoding.UTF8,
    });
    return audioRef.data;
}


