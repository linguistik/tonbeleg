import RecordingData from "./RecordingData"

import firebase from "@/backend/firebase-config";
import { Directory, Encoding, Filesystem } from "@capacitor/filesystem";
import { parseStringStyle } from "@vue/shared";

//const r = new RecordingData(1,"a", ["a","b"],22);

export let recordings: RecordingData[] = [];

export function safeRecordings() {//call this function on closing or on every change
    const dataString = JSON.stringify(recordings);
    const currentUser = firebase.auth().currentUser;
    if (currentUser == null) {
        console.log("\n\nFATAL ERROR: no user logged in, so safing recordings does not work\n\n");
        return;
    }
    const userUID = currentUser.uid;
    try{
        Filesystem.writeFile({
            data: dataString,
            path: userUID + "/recordings.json",
            directory: Directory.Data,
            encoding: Encoding.UTF8
        });
    }catch(error){
        console.log(error);
    }
    console.log("writeData:",dataString);
    console.log("wrote data");
}

export async function loadRecordings() {
    const currentUser = firebase.auth().currentUser;
    if (currentUser == null) {
        console.log("\n\nFATAL ERROR: no user logged in, so loading recordings does not work\n\n");
        return;
    }
    const userUID = currentUser.uid;
    try {
        const readFileResult = await Filesystem.readFile({
            path: userUID + "/recordings.json",
            directory: Directory.Data,
            encoding: Encoding.UTF8
        });
        console.log("readData:",readFileResult.data);
        recordings = JSON.parse(readFileResult.data);

    }catch(error){//TODO ignore error when file does not exist already, this happens on first login
        //if(error.message == "File does not exist."){/**/}
        console.log("reading error: ", error);
    }
    console.log(recordings);
    document.addEventListener('beforeunload', safeRecordings);
}
export function getRecordings(): RecordingData[] {
    return recordings;
}

export function insertRecordingEntry(recording: RecordingData) {
    recordings.push(recording);
}

export function getRecordingEntry(timestamp: number): RecordingData{
    for(const recording of recordings){
        if(recording.timestamp ==timestamp)
            return recording;
    }
    console.log("\n\nFATAL ERROR: could not find recording with timestamp: " + timestamp + "\n\n");
    return new RecordingData(0,"ERROR", [],0);
}

export function removeRecordingEntry(recording: RecordingData) {
    const index = recordings.indexOf(recording, 0);
    if(index<0){
        console.log("\n\nERROR on deleting. Element could not be found\n\n");
        recordings.splice(index,1);
    }
}
