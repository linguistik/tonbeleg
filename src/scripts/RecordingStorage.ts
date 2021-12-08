import RecordingData from "./RecordingData"

import firebase from "@/backend/firebase-config";
import { Directory, Encoding, Filesystem } from "@capacitor/filesystem";
import {getLicense} from "@/scripts/UserSettingsStorage";

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

    }catch(error){//ignore error when file does not exist already, this happens on first login
        if(error.message == "File does not exist."){/**/}
        console.log("reading error: ", error);
    }
    console.log(recordings);
    //document.addEventListener('beforeunload', safeRecordings);//does not work
}
export function getRecordings(): RecordingData[] {
    return recordings;
}

export function insertRecordingEntry(recording: RecordingData) {
    recordings.push(recording);
    safeRecordings();
}

export function getRecordingEntry(timestamp: number): RecordingData{
    for(const recording of recordings){
        if(recording.timestamp ==timestamp)
            return recording;
    }
    console.log("\n\nFATAL ERROR: could not find recording with timestamp: " + timestamp + "\n\n");
    return new RecordingData(0,"ERROR", [],0, false, getLicense(), "NoUserAvailable");
}

export function setRecordingEntryName(timestamp: number, newName: string){
    const data = getRecordingEntry(timestamp);
    data.name = newName;
    safeRecordings();
}

export function setRecordingLicense(timestamp: number, newLicense: string){
    const data = getRecordingEntry(timestamp);
    data.license = newLicense;
    safeRecordings();
}

export function setRecordingEntryUploadBoolean(timestamp: number, uploadBoolean: boolean){
    const data = getRecordingEntry(timestamp);
    data.upload = uploadBoolean;
    safeRecordings();
}

export function getRecordingEntryUploadBoolean(timestamp: number): boolean{
    const data = getRecordingEntry(timestamp);
    return data.upload;
}

export function getRecordingLicense(timestamp: number): string{
    const data = getRecordingEntry(timestamp);
    return data.license;
}

export function removeRecordingEntry(recording: RecordingData) {
    const index = recordings.indexOf(getRecordingEntry(recording.timestamp), 0);
    if(index<0){
        console.log("\n\nERROR on deleting. Element could not be found\n\n");
        return;
    }
    recordings.splice(index,1);
    //delete actual folder

    const currentUser = firebase.auth().currentUser;
    if (currentUser == null) {
        return;
    }

    const userUID = currentUser.uid;
    Filesystem.rmdir({
        path: userUID + "/" + recording.timestamp,
        directory: Directory.Data,
        recursive: true
    })
    safeRecordings();
}

export function removeAllRecordingEntry() {
    recordings.splice(0,);
    //delete actual folder
    const currentUser = firebase.auth().currentUser;
    if (currentUser == null) {
        return;
    }
    const userUID = currentUser.uid;
    Filesystem.rmdir({
        path: userUID,
        directory: Directory.Data,
        recursive: true
    })
    safeRecordings();
}
