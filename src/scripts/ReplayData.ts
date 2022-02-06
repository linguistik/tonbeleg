import {Directory, Encoding, Filesystem} from "@capacitor/filesystem";
import firebase from "@/backend/firebase-config";


import WaveSurfer from "wavesurfer.js"; //BSD-3 ok
import ExportAudioPlugin from "wavesurfer-export-audio-plugin"; //MIT ok

/**
 * an HTMlAudioElement which can be accessed from everywhere in the application
 */
export let audioDaten: HTMLAudioElement = new Audio()

/**
 * creates an HTMLAudioElement from the recordings data string
 * @param timestamp used to identify the recording to read
 * @param userID used to identify which users data to read
 */
export async function replayAudioData(timestamp: string, userID: string){
    const audioRef = await Filesystem.readFile({       //reads the recordings data
        path: "/" + userID + "/" + timestamp + "/" + "0.raw",
        directory: Directory.Data,
        encoding: Encoding.UTF8,
    });
    const audioString = new Audio(audioRef.data);  //creates an AudioElement
    audioDaten = audioString;                      //assigns an AudioElement to the AudioElement which can be accessed anywhere
    return audioString;                            //returns the AudioElement
}

/**
 * reads the recording and returns it as a string
 * @param timestamp used to identify the recording to read
 * @param userID used to identify which users data to read
 */
export async function getAudioString(timestamp: string, userID: string){
    const audioRef = await Filesystem.readFile({        //reads the recording data
        path: "/" + userID + "/" + timestamp + "/" + "0.raw",
        directory: Directory.Data,
        encoding: Encoding.UTF8,
    });
    return audioRef.data;                                       //returns the recording data as a string
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


