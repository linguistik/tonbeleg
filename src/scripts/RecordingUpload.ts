import firebase from "@/backend/firebase-config";
//import {setAlreadyUploadedArray, setUploadArray, setInUploadArrayIdent} from "@/scripts/UserSettingsStorage";
import {
    setRecordingEntryUploadBoolean,
    getRecordings,
    loadRecordings,
    removeRecordingEntry
} from "@/scripts/RecordingStorage";
import {getWifi} from "@/scripts/UserSettingsStorage";
import {Filesystem, Directory, Encoding} from "@capacitor/filesystem";
import {loadUserSettings} from "@/scripts/UserSettingsStorage";
import RecordingData from "@/scripts/RecordingData";
import {ConnectionStatus, Network} from "@capacitor/network";

export const RecordingUploadArray: RecordingData[] = [];

let i

export async function deleteAllFromUploadArray(){
    RecordingUploadArray.splice(0,)
}

export async function deleteUploadedRecordsFromDevice(){
        for (i = 0; i < RecordingUploadArray.length; i = i + 1) {
            await removeRecordingEntry(RecordingUploadArray[i]);
        }
        RecordingUploadArray.splice(0, )
}


const db = firebase.firestore();
export async function UploadToFirebase() {
    const currentUser = firebase.auth().currentUser;
    if (currentUser == null) return;
    const networkStatus = await Network.getStatus().then(result => result);

    if(getWifi()==true && networkStatus.connectionType != 'wifi'){
        console.log("Upload not possible due to wrong Connection Type", networkStatus)
        return;
    }
    if(networkStatus.connected == true) {
        const RecordingDataArr = await getRecordings();
        const RecordingUserID = [];
        const RecordingID = [];
        for (i = 0; i < RecordingDataArr.length; i = i + 1) {
            if (RecordingDataArr[i].upload == false && RecordingDataArr[i].selectedForUpload == true) {
                await db.collection("users").doc(currentUser.uid).collection("recordings").doc(RecordingDataArr[i].timestamp.toString()).set({
                    data: (await Filesystem.readFile({
                        path: "/" + currentUser.uid + "/" + RecordingDataArr[i].timestamp + "/" + "0.raw",
                        directory: Directory.Data,
                        encoding: Encoding.UTF8,
                    })).data,
                    userID: RecordingDataArr[i].userID,
                    timestamp: RecordingDataArr[i].timestamp,
                    name: RecordingDataArr[i].name,
                    length: RecordingDataArr[i].length,
                    license: RecordingDataArr[i].license,
                }, {merge: true});
                RecordingUploadArray.push(RecordingDataArr[i]);
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
}

export async function isConnected(){
    const Status = await Network.getStatus().then(result => result);
    console.log("is Connected?:" ,Status.connected);
    return Status.connected;
}

