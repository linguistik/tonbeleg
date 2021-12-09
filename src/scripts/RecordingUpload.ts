import firebase from "@/backend/firebase-config";
//import {setAlreadyUploadedArray, setUploadArray, setInUploadArrayIdent} from "@/scripts/UserSettingsStorage";
import {setRecordingEntryUploadBoolean, getRecordings} from "@/scripts/RecordingStorage";
import {Filesystem, Directory, Encoding} from "@capacitor/filesystem";

export const RecordingUploadArray: string[] = [];
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


function deleteAllFromUploadArray(){
    if(RecordingUploadArray.length > 0) {
        for (i = 0; i < RecordingUploadArray.length; i = i + 1) {
            alreadyUploadedArray.push([inRecordingArrayIdent[i][0], inRecordingArrayIdent[i][1]]);
            RecordingUploadArray.pop();
            inRecordingArrayIdent.pop();
            setAlreadyUploadedArray(alreadyUploadedArray);
            setUploadArray(RecordingUploadArray);
        }
    }
}*/

const db = firebase.firestore();

export async function UploadToFirebase(){
    const currentUser = firebase.auth().currentUser;
    if (currentUser == null) return;

    const RecordingDataArr = await getRecordings();
    for(i=0; i<RecordingDataArr.length; i=i+1){
        if(RecordingDataArr[i].upload == false && RecordingDataArr[i].selectedForUpload == true) {
            RecordingUploadArray.push((await Filesystem.readFile({
                path: "/" + currentUser.uid + "/" + RecordingDataArr[i].timestamp + "/" + "0.raw",
                directory: Directory.Data,
                encoding: Encoding.UTF8,
            })).data)
        }
    }

    await db.collection("users").doc(currentUser.uid).set({
        Recordings: RecordingUploadArray
    },{merge: true});
    console.log("wrote to database");

    for(i=0; i<RecordingDataArr.length; i=i+1){
        if(RecordingDataArr[i].upload == false && RecordingDataArr[i].selectedForUpload == true)
        setRecordingEntryUploadBoolean(RecordingDataArr[i].timestamp, true);
    }

    //deleteAllFromUploadArray();
}

/*export function setUploadArrays(uploadArray: string[], alreadyUp: string[][], uploadArrayIdent: string[][]){
    RecordingUploadArray = uploadArray;
    //alreadyUploadedArray = alreadyUp;
    //inRecordingArrayIdent = uploadArrayIdent;
}*/
