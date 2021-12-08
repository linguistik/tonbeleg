import firebase from "@/backend/firebase-config";
import {setAlreadyUploadedArray, setUploadArray} from "@/scripts/UserSettingsStorage";


export let RecordingUploadArray: string[] = [];
export let inRecordingArrayIdent: string[] = [];
export let alreadyUploadedArray: string[] = []; //müssen beide in der json datei gespeichert werden
let i
export function addToUploadArray(newRecord: string, ident: string){
    if(alreadyUploadedArray.indexOf(ident) == -1) {
        RecordingUploadArray.push(newRecord);
        inRecordingArrayIdent.push(ident);
        setUploadArray(RecordingUploadArray);
    }
    else{
        console.log("alreadyUploadedBefore")
    }
    console.log(alreadyUploadedArray);
}

export function deleteFromUploadArray(ident: string){
    for (i = 0; i < RecordingUploadArray.length; i = i + 1) {
        if(ident == inRecordingArrayIdent[i]){//ist kein 2-dim array deshlab aaas
            inRecordingArrayIdent.splice(i, 1);
            RecordingUploadArray.splice(i, 1);
            setUploadArray(RecordingUploadArray);
        }
    }
}


function deleteAllFromUploadArray(){
    if(RecordingUploadArray.length > 0) {
        for (i = 0; i < RecordingUploadArray.length; i = i + 1) {
            alreadyUploadedArray.push(inRecordingArrayIdent[i]);
            RecordingUploadArray.pop();
            inRecordingArrayIdent.pop();
        }
    }
    setAlreadyUploadedArray(alreadyUploadedArray);
    setUploadArray(RecordingUploadArray);
}
const db = firebase.firestore();

export async function UploadToFirebase(){
    const currentUser = firebase.auth().currentUser;
    if (currentUser == null) return;
    await db.collection("users").doc(currentUser.uid).set({
        Recordings: RecordingUploadArray
    },{merge: true});
    console.log("wrote to database");
    deleteAllFromUploadArray();
}

export function setUploadArrays(uploadArray: string[], alreadyUp: string[], uploadArrayIdent: string[]){
    RecordingUploadArray = uploadArray;
    alreadyUploadedArray = alreadyUp;
    inRecordingArrayIdent = uploadArrayIdent;
}

function clearArray(){
    for (i = 0; i < alreadyUploadedArray.length; i = i + 1) {
        alreadyUploadedArray.pop();
    }
}