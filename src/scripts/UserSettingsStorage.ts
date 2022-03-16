import UserSettings from "./UserSettings"

import firebase from "@/backend/firebase-config";
import { Directory, Encoding, Filesystem } from "@capacitor/filesystem";
import router from "@/router";


export let userSettings: UserSettings = new UserSettings("","",[],[],"",-1, "", false);

/**
 * saves user settings local in usersettings.json
 */
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

/**
 * loads all user settings from usersettings.json
 * if file doesnt exist do nothing here
 */
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
        if(error.message == "File does not exist.."){/**/}
        console.log("reading error: ", error);
    }
    console.log(userSettings);

}

/**
 * deletes all user setting by deleting the usersettings.json file
 */
export async function deleteUserSettings() {
    const currentUser = firebase.auth().currentUser; //authenticate user with firebase
    if (currentUser == null) {
        console.log("\n\nFATAL ERROR: no user logged in, so user data cannot be loaded\n\n");
        return;
    }
    const userUID = currentUser.uid;
    try {                                               //delete the users data, which is saved in the json file
        await Filesystem.deleteFile({
            path: userUID + "/usersettings.json",
            directory: Directory.Data,
        });
    }catch(error){//ignore error when file does not exist already, this happens on first login
        if(error.message == "File does not exist."){/**/}
        console.log("reading error: ", error);
    }
    await router.push("../tabs/tabpersonaldata");
    console.log("user Settings Deleted");
}

/**
 * saves the users birthday
 * @param newBirthday the birthday date as a string
 */
export function setBirthday(newBirthday: string){
    userSettings.birthday=newBirthday;
    safeUserSettings();
}

/**
 * saved the users job
 * @param newJob the users job
 */
export function setJob(newJob: string){
    userSettings.job=newJob;
    safeUserSettings();
}

/**
 * saves the users first languages
 * @param newFirstLanguage the users first languages
 */
export function setFirstLanguage(newFirstLanguage: string[]){
    userSettings.firstLanguage=newFirstLanguage;
    safeUserSettings();
}

/**
 * saves the users second languages
 * @param newSecondLanguage the users second languages
 */
export function setSecondLanguage(newSecondLanguage: string[]){
    userSettings.secondLanguage=newSecondLanguage;
    safeUserSettings();
}

/**
 * saves the users dialect
 * @param newDialect the users dialect
 */
export function setDialect(newDialect: string){
    userSettings.dialect=newDialect;
    safeUserSettings();
}

/**
 * saves the users zip code
 * @param newZipCode the users zip code(its just 3 digits for the area)
 */
export function setZipCode(newZipCode: number){
    userSettings.zipCode=newZipCode;
    safeUserSettings();
}

/**
 * saves the users license under which he uploads his recordings
 * @param newLicense the users license
 */
export function setLicense(newLicense: string){
    userSettings.license=newLicense;
    safeUserSettings();
}

/**
 * saves the users wifi settings(wifi-only upload)
 * @param newWifi if true wifi-only upload, false also uploads via mobile
 */
export function setWifi(newWifi: boolean){
    userSettings.wifi=newWifi;
    safeUserSettings();
}

/**
 * returns the wifi-settings(wifi-only upload)
 */
export function getWifi(): boolean{
    return userSettings.wifi;
}

/**
 * returns the birthday of the user
 */
export function getBirthday(): string{
    return userSettings.birthday;
}

/**
 * returns the users occupation
 */
export function getJob(): string{
    return userSettings.job;
}

/**
 * returns the users first languages
 */
export function getFirstLanguage(): string[]{
    return userSettings.firstLanguage;
}

/**
 * returns the users second languages
 */
export function getSecondLanguage(): string[]{
    return userSettings.secondLanguage;
}

/**
 * returns the users dialect
 */
export function getDialect(): string{
    return userSettings.dialect;
}

/**
 * returns the users zip code
 */
export function getZipCode(): number{
    return userSettings.zipCode;
}

/**
 * returns the users license
 */
export function getLicense(): string{
    return userSettings.license;
}