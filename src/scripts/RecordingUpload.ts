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

import { trimAudio, playArrayBuffer, playAudioBuffer, convertToMp3 } from "./editing/AudioUtils";
import { getAudioData } from "@/scripts/ReplayData";
import {ref} from "vue";
import { arrayBufferToBase64String } from "./Base64Utils";
import { callUpdateFunction } from "@/scripts/RecordingStorage";

export const RecordingUploadArray: RecordingData[] = [];//stores the most recently uploaded recordings
export const newUploads = ref(true);
let i

/**
 * deletes all the recordings from the array with the most recent uploaded recordings
 */
export async function deleteAllFromUploadArray() {
    RecordingUploadArray.splice(0,)
}

/**
 * deletes the recordings that have been uploaded from the device
 */
export async function deleteUploadedRecordsFromDevice() {
    for (i = 0; i < RecordingUploadArray.length; i = i + 1) {
        await removeRecordingEntry(RecordingUploadArray[i]);
    }
    RecordingUploadArray.splice(0,) //clear the array with the most recently uploaded recordings
}


const db = firebase.firestore();

/**
 * upload the selected recordings to firebase
 * @constructor
 */
export async function UploadToFirebase() {
    const networkStatus = await Network.getStatus().then(result => result);
    console.log("network Status:", networkStatus);

    if ((getWifi() == true && networkStatus.connectionType != 'wifi') || networkStatus.connectionType == "none") { //checks wether the wifi is available in case wifi only upload is selected
        console.log("Upload not possible due to wrong Connection Type")
        return;
    }

    const currentUser = firebase.auth().currentUser; //authenticate user with firebase
    if (currentUser == null) return;

    const RecordingDataArr = await getRecordings();
    const RecordingUserID = [];
    const RecordingID = [];
    for (i = 0; i < RecordingDataArr.length; i = i + 1) {
        if (RecordingDataArr[i].upload == false && RecordingDataArr[i].selectedForUpload == true) {//selects the recordings that are not uploaded, but selected for upload
            newUploads.value = true;
            console.log("selected");
            await db.collection("users").doc(currentUser.uid).collection("recordings").doc(RecordingDataArr[i].timestamp.toString()).set({//writes the meta data to a recording into firebase
                userID: RecordingDataArr[i].userID,
                timestamp: RecordingDataArr[i].timestamp,
                name: RecordingDataArr[i].name,
                length: RecordingDataArr[i].length,
                license: RecordingDataArr[i].license,
            }, { merge: true });

            const recordingDataI = RecordingDataArr[i];
            await getAudioData(RecordingDataArr[i].timestamp, "0.raw", async (completeAudioBuffer) => {
                //playAudioBuffer(completeAudioBuffer);
                if (recordingDataI.parts.length > 0) { //if the recording has been split into parts
                    for (let j = 0; j < recordingDataI.parts.length; j++) { //upload each part to firebase
                        const part = recordingDataI.parts[j];
                        const cuttedArrayBuffer: ArrayBuffer = trimAudio(part, completeAudioBuffer);
                        //https://stackoverflow.com/questions/9267899/arraybuffer-to-base64-encoded-string
                        const base64String = arrayBufferToBase64String(cuttedArrayBuffer);

                        await db.collection("users").doc(currentUser.uid).collection("recordings")
                            .doc(recordingDataI.timestamp.toString()).collection("parts").doc(part.id).set({
                                data: base64String,
                                name: part.name,
                            })
                        console.log("wrote to database");
                    }
                } else { //if a recording has not been cut into parts
                    const base64String = arrayBufferToBase64String(convertToMp3(completeAudioBuffer)); //convert it to mp3(has been done to the parts above in the cutting process)
                    await db.collection("users").doc(currentUser.uid).collection("recordings") //upload the converted recording to firebase
                            .doc(recordingDataI.timestamp.toString()).collection("parts").doc("complete").set({
                                data: base64String,
                                name: "complete",
                            });
                }
                RecordingUploadArray.push(recordingDataI);
            });
        }
    }

    for (i = 0; i < RecordingDataArr.length; i = i + 1) { //set the properties of the recordings to display they have been uploaded
        if (RecordingDataArr[i].upload == false && RecordingDataArr[i].selectedForUpload == true) {
            await setRecordingEntryUploadBoolean(RecordingDataArr[i].timestamp, true);
            callUpdateFunction(RecordingDataArr[i].timestamp);
        }
    }
}

/**
 * returns the connection status of the device
 */
export async function isConnected() {
    const Status = await Network.getStatus().then(result => result);
    console.log("is Connected?:", Status.connected);
    return Status.connected;
}