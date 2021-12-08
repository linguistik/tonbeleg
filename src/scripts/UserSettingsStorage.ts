import UserSettings from "./UserSettings"

import firebase from "@/backend/firebase-config";
import { Directory, Encoding, Filesystem } from "@capacitor/filesystem";

//const r = new RecordingData(1,"a", ["a","b"],22);

export let userSettings: UserSettings = new UserSettings("","",[],[],"",-1, "", false);


export async function safeUserSettings() {//call this function on closing or on every change
    const dataString = JSON.stringify(userSettings);
    const currentUser = firebase.auth().currentUser;
    if (currentUser == null) {
        console.log("\n\nFATAL ERROR: no user logged in, so user data cannot be safed\n\n");
        return;
    }
    const userUID = currentUser.uid;
    try{
        Filesystem.writeFile({
            data: dataString,
            path: userUID + "/usersettings.json",
            directory: Directory.Data,
            encoding: Encoding.UTF8
        });
    }catch(error){
        console.log(error);
    }
    console.log("writeData:",dataString);
    console.log("wrote data");
}

export async function loadUserSettings() {
    const currentUser = firebase.auth().currentUser;
    if (currentUser == null) {
        console.log("\n\nFATAL ERROR: no user logged in, so user data cannot be loaded\n\n");
        return;
    }
    const userUID = currentUser.uid;
    try {
        const readFileResult = await Filesystem.readFile({
            path: userUID + "/usersettings.json",
            directory: Directory.Data,
            encoding: Encoding.UTF8
        });
        console.log("readData:",readFileResult.data);
        userSettings = JSON.parse(readFileResult.data);

    }catch(error){//ignore error when file does not exist already, this happens on first login
        if(error.message == "File does not exist."){/**/}
        console.log("reading error: ", error);
    }
    console.log(userSettings);
    //document.addEventListener('beforeunload', safeRecordings);//does not work
}
/*
export function getUserSettings(): UserSettings {
    return userSettings;
}
*/


export function setBirthday(newBirthday: string){
    userSettings.birthday=newBirthday;
    safeUserSettings();
}
export function setJob(newName: string){
    userSettings.job=newName;
    safeUserSettings();
}
export function setFirstLanguage(newFirstLanguage: string[]){
    userSettings.firstLanguage=newFirstLanguage;
    safeUserSettings();
}
export function setSecondLanguage(newSecondLanguage: string[]){
    userSettings.secondLanguage=newSecondLanguage;
    safeUserSettings();
}
export function setDialect(newDialect: string){
    userSettings.dialect=newDialect;
    safeUserSettings();
}

export function setZipCode(newZipCode: number){
    userSettings.zipCode=newZipCode;
    safeUserSettings();
}
export function setLicense(newLicense: string){
    userSettings.license=newLicense;
    safeUserSettings();
}

export function setWifi(newWifi: boolean){
    userSettings.wifi=newWifi;
    safeUserSettings();
}

export function getWifi(): boolean{
    return userSettings.wifi;
}

export function getBirthday(): string{
    return userSettings.birthday;
}

export function getJob(): string{
    return userSettings.job;
}

export function getFirstLanguage(): string[]{
    return userSettings.firstLanguage;
}
export function getSecondLanguage(): string[]{
    return userSettings.secondLanguage;
}
export function getDialect(): string{
    return userSettings.dialect;
}

export function getZipCode(): number{
    return userSettings.zipCode;
}

export function getLicense(): string{
    return userSettings.license;
}