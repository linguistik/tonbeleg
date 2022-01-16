import firebase from "@/backend/firebase-config";
//import {setAlreadyUploadedArray, setUploadArray, setInUploadArrayIdent} from "@/scripts/UserSettingsStorage";
import {
    setRecordingEntryUploadBoolean,
    getRecordings,
    loadRecordings,
    removeRecordingEntry
} from "@/scripts/RecordingStorage";
import { getWifi } from "@/scripts/UserSettingsStorage";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import { loadUserSettings } from "@/scripts/UserSettingsStorage";
import RecordingData from "@/scripts/RecordingData";
import { ConnectionStatus, Network } from "@capacitor/network";

import { trimAudio, playArrayBuffer, playAudioBuffer } from "./editing/AudioUtils";
import { getAudioData } from "@/scripts/ReplayData";

import { arrayBufferToBase64String } from "./Base64Utils";

export const RecordingUploadArray: RecordingData[] = [];
//export let inRecordingArrayIdent: string[][] = [];
//export let alreadyUploadedArray: string[][] = []; //müssen beide in der json datei gespeichert werden
let i

/*export function addToUploadArray(newRecord: string, userId: string, timestamp: string){
    const ident = userId.concat(timestamp);
    if(alreadyUploadedArray.indexOf([ident, timestamp]) == -1) {
        RecordingUploadArray.push(newRecord);
        inRecordingArrayIdent.push([ident, timestamp]);
        setUploadArray(RecordingUploadArray);
        setInUploadArrayIdent(inRecordingArrayIdent);
    }
    else{
        console.log("This was alreadyUploadedBefore");
    }
    console.log(alreadyUploadedArray);
}

export function deleteFromUploadArray(ident: string){
    for (i = 0; i < RecordingUploadArray.length; i = i + 1) {
        if(ident == inRecordingArrayIdent[i][0]){//ist kein 2-dim array deshlab aaas
            inRecordingArrayIdent[i].splice(0, 2);
            inRecordingArrayIdent.splice(i, 1);
            RecordingUploadArray.splice(i, 1);
            setUploadArray(RecordingUploadArray);
        }
    }
}


*/export async function deleteAllFromUploadArray() {
    RecordingUploadArray.splice(0,)
}

export async function deleteUploadedRecordsFromDevice() {
    for (i = 0; i < RecordingUploadArray.length; i = i + 1) {
        await removeRecordingEntry(RecordingUploadArray[i]);
    }
    RecordingUploadArray.splice(0,)
}


const db = firebase.firestore();
export async function UploadToFirebase() {
    const currentUser = firebase.auth().currentUser;
    if (currentUser == null) return;
    const networkStatus = await Network.getStatus().then(result => result);
    console.log("network Status:", networkStatus);

    if (getWifi() == true && networkStatus.connectionType != 'wifi') {
        console.log("Upload not possible due to wrong Connection Type")
        return;
    }
    const RecordingDataArr = await getRecordings();
    const RecordingUserID = [];
    const RecordingID = [];
    for (i = 0; i < RecordingDataArr.length; i = i + 1) {
        if (RecordingDataArr[i].upload == false && RecordingDataArr[i].selectedForUpload == true) {//not already uploaded, but selected for upload
            await db.collection("users").doc(currentUser.uid).collection("recordings").doc(RecordingDataArr[i].timestamp.toString()).set({
                userID: RecordingDataArr[i].userID,
                timestamp: RecordingDataArr[i].timestamp,
                name: RecordingDataArr[i].name,
                length: RecordingDataArr[i].length,
                license: RecordingDataArr[i].license,
            }, { merge: true });

            const recordingDataI = RecordingDataArr[i];
            getAudioData(RecordingDataArr[i].timestamp, "0.raw", async (completeAudioBuffer) => {

                //playAudioBuffer(completeAudioBuffer);
                for (let j = 0; j < recordingDataI.parts.length; j++) {
                    const part = recordingDataI.parts[j];
                    const cuttedArrayBuffer: ArrayBuffer = trimAudio(part,completeAudioBuffer);
                    //https://stackoverflow.com/questions/9267899/arraybuffer-to-base64-encoded-string
                    const base64String = arrayBufferToBase64String(cuttedArrayBuffer);

                    await db.collection("users").doc(currentUser.uid).collection("recordings")
                        .doc(recordingDataI.timestamp.toString()).collection("parts").doc(part.id).set({
                            data: base64String,
                            name: part.name,
                        })
                }
                RecordingUploadArray.push(recordingDataI);
            });
        }
    }

    console.log("wrote to database");
    //deleteAllFromUploadArray();
    
    for (i = 0; i < RecordingDataArr.length; i = i + 1) {
        if (RecordingDataArr[i].upload == false && RecordingDataArr[i].selectedForUpload == true)
            await setRecordingEntryUploadBoolean(RecordingDataArr[i].timestamp, true);
    }
    //deleteAllFromUploadArray();
}

export async function isConnected() {
    const Status = await Network.getStatus().then(result => result);
    console.log("is Connected?:", Status.connected);
    return Status.connected;
}
/*export function setUploadArrays(uploadArray: string[], alreadyUp: string[][], uploadArrayIdent: string[][]){
    RecordingUploadArray = uploadArray;
    //alreadyUploadedArray = alreadyUp;
    //inRecordingArrayIdent = uploadArrayIdent;
}*/
