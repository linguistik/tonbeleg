import RecordingData from "./RecordingData"

import firebase from "@/backend/firebase-config";
import { Directory, Encoding, Filesystem } from "@capacitor/filesystem";
import {getLicense} from "@/scripts/UserSettingsStorage";

import { Region } from "wavesurfer.js/src/plugin/regions"
import {convertToRegionDataArray} from "@/scripts/editing/RegionDataUtils";

/**
 * an array of all recordings
 */
export let recordings: RecordingData[] = [];

/**
 * save the recordings on the device
 */
export function saveRecordings() {//call this function on closing or on every change
    const dataString = JSON.stringify(recordings);  //create a string from the recording array
    const currentUser = firebase.auth().currentUser; //confirm the users identify in firebase
    if (currentUser == null) {
        console.log("\n\nFATAL ERROR: no user logged in, so saving recordings does not work\n\n");
        return;
    }
    const userUID = currentUser.uid;
    try{                                //write the string in the devices storage
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


/**
 * reads the recordings on the device into an array at the start of the application
 */
export async function loadRecordings() {
    const currentUser = firebase.auth().currentUser;  //confirm the users identity in firebase
    if (currentUser == null) {
        console.log("\n\nFATAL ERROR: no user logged in, so loading recordings does not work\n\n");
        return;
    }
    const userUID = currentUser.uid;
    try {                                                           //read the recording data
        const readFileResult = await Filesystem.readFile({
            path: userUID + "/recordings.json",
            directory: Directory.Data,
            encoding: Encoding.UTF8
        });
        console.log("readData:",readFileResult.data);
        recordings = JSON.parse(readFileResult.data);                //store the recording data in an array

    }catch(error){//ignore error when file does not exist already, this happens on first login
        if(error.message == "File does not exist."){/**/}
        console.log("reading error: ", error);
    }
    console.log(recordings);
}
export function getRecordings(): RecordingData[] {
    return recordings;
}

export function insertRecordingEntry(recording: RecordingData) {
    recordings.push(recording);
    saveRecordings();
}

export function getRecordingEntry(timestamp: number): RecordingData{
    for(const recording of recordings){
        if(recording.timestamp ==timestamp)
            return recording;
    }
    console.log("\n\nFATAL ERROR: could not find recording with timestamp: " + timestamp + "\n\n");
    return new RecordingData(0,"ERROR", [],0, false, false,getLicense(), "NoUserAvailable", []);
}

export function setRecordingEntryLanguage(timestamp: number, languages: string[]){
    const data = getRecordingEntry(timestamp);
    data.languages = languages;
    saveRecordings();
}

export function setRecordingEntryName(timestamp: number, newName: string){
    const data = getRecordingEntry(timestamp);
    data.name = newName;
    saveRecordings();
}

export function getRecordingEntryLanguage(timestamp: number): string[]{
    const data = getRecordingEntry(timestamp);
    return data.languages;
}

export function setSelectedForUpload(timestamp: number, newBool: boolean){
    const data = getRecordingEntry(timestamp);
    data.selectedForUpload = newBool;
    saveRecordings();
}

export function setRecordingLicense(timestamp: number, newLicense: string){
    const data = getRecordingEntry(timestamp);
    data.license = newLicense;
    saveRecordings();
}

export function setRecordingEntryUploadBoolean(timestamp: number, uploadBoolean: boolean){
    const data = getRecordingEntry(timestamp);
    data.upload = uploadBoolean;
    saveRecordings();
}

export function setRecordingEntryTranscription(timestamp: number, transcription: string){
    const data = getRecordingEntry(timestamp);
    data.transcription = transcription;
    saveRecordings();
}

export function getRecordingEntryTranscription(timestmap: number): string{
    const data = getRecordingEntry(timestmap);
    return data.transcription;
}

export function getRecordingEntryUploadBoolean(timestamp: number): boolean{
    const data = getRecordingEntry(timestamp);
    return data.upload;
}

export function getRecordingLicense(timestamp: number): string{
    const data = getRecordingEntry(timestamp);
    return data.license;
}

export function getSelectedForUpload(timestamp: number): boolean{
    const data = getRecordingEntry(timestamp);
    return data.selectedForUpload;
}

/**
 * removes a specified recording from the device
 * @param recording the recording to be removed
 */
export function removeRecordingEntry(recording: RecordingData) {
    const index = recordings.indexOf(getRecordingEntry(recording.timestamp), 0); //find the index of the recording in the recordings array
    if(index<0){
        console.log("\n\nERROR on deleting. Element could not be found\n\n");
        return;
    }
    recordings.splice(index,1); //remove the recording from the array of recordings
    //delete actual folder

    const currentUser = firebase.auth().currentUser; //confirm the users identity in firebase
    if (currentUser == null) {
        return;
    }

    const userUID = currentUser.uid;
    Filesystem.rmdir({                      //delete the recording and its folder from the device
        path: userUID + "/" + recording.timestamp,
        directory: Directory.Data,
        recursive: true
    })
    saveRecordings();
}

/**
 * deletes all recordings on the device
 */
export function removeAllRecordingEntry() {
    recordings.splice(0,); //clear all recordings from the recordings array
    //delete actual folder
    const currentUser = firebase.auth().currentUser; //confirm the users identity with firebase
    if (currentUser == null) {
        return;
    }

    const userUID = currentUser.uid; //delete the recordings folder and therefore all recordings
    Filesystem.rmdir({
        path: userUID,
        directory: Directory.Data,
        recursive: true
    })
    saveRecordings();
}



const idToUpdateFunctionMap = new Map<number, Function>()
/**
 * inserts a function that should be called on recording entry change into {@link idToUpdateFunctionMap}
 * 
 * NOTE: currently only observer can be set
 * @param {number} id the id to register that id for
 * @param {Function} updateFunction the function to be called with the changed recordingData
 */
export function insertUpdateFunction(id: number, updateFunction: Function){
    idToUpdateFunctionMap.set(id, updateFunction);
}
/**
 * calls the function in {@link idToUpdateFunctionMap} of the specified recoringData with the changed recordingData 
 * @param id 
 */
export function callUpdateFunction(id: number){
    const updateFunction = idToUpdateFunctionMap.get(getRecordingEntry(id).timestamp);
    if(updateFunction != undefined){
        updateFunction(getRecordingEntry(id));
    }
}

/**
 * converts the regionArray to an array of regionData using RegionDataUtils
 * assigns the regionData array to the specified recording
 * saves the recordings to the filesystem @see saveRecordings
 * @param {number} recordingId 
 * @param {Region[]} regionArray 
 * @param {Map<string,string>} idToNameMap 
 */
export function setRecordingEntryRegionDataArray(recordingId: number, regionArray: Region[], idToNameMap: Map<string,string>){
    const recordingEntry = getRecordingEntry(recordingId);
    recordingEntry.parts = convertToRegionDataArray(regionArray,idToNameMap);
    saveRecordings();
    callUpdateFunction(recordingId);
}
/**
 * 
 * @param {number} recordingId 
 * @returns {RecordingData[]} the recordingData array of the specified recording
 */
export function getRecordingEntryRegionDataArray(recordingId: number){
    const recordingEntry = getRecordingEntry(recordingId);
    return recordingEntry.parts;
}


