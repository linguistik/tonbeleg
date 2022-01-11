import { Region } from "wavesurfer.js/src/plugin/regions"

import firebase from "@/backend/firebase-config";
import { Directory, Encoding, Filesystem } from "@capacitor/filesystem";


class RegionData{
    id: string;
    start: number;
    end: number;
    color: string;

    constructor(region){
        this.id = region.id;
        this.start = region.start;
        this.end = region.end;
        this.color = region.color;
    }
}




/**
 * saves the regions to the filesystem
 * @param {Region[]} regionArray the array containing the regions to be stored
 * @param {string} folderName 
 */
export async function saveRegions(regionArray: Region[], folderName: string){
    const regionArrayData: RegionData[] = [];
    for(const region of regionArray){
        regionArrayData.push(new RegionData(region));
    }

    const regionArrayDataString = JSON.stringify(regionArrayData);
    const currentUser = firebase.auth().currentUser;
    if (currentUser == null) {
        console.log("\n\nFATAL ERROR: no user logged in, so saving recordings does not work\n\n");
        return;
    }
    const userUID = currentUser.uid;
    try{
        Filesystem.writeFile({
            data: regionArrayDataString,
            path: userUID + "/" + folderName + "/regions.json",
            directory: Directory.Data,
            encoding: Encoding.UTF8
        });
    }catch(error){
        console.log(error);
    }
}
/**
 * loads the region data
 * @param {string} folderName the folderName specifying the location of the data
 * @returns {Region[]} the decoded region data
 */
export async function importRegions(wavesurfer, folderName: string){
    const currentUser = firebase.auth().currentUser;
    if (currentUser == null) {
        console.log("\n\nFATAL ERROR: no user logged in, so saving recordings does not work\n\n");
        return;
    }
    const userUID = currentUser.uid;
    try{
        const readFileResult = await Filesystem.readFile({
            path: userUID + "/" + folderName + "/regions.json",
            directory: Directory.Data,
            encoding: Encoding.UTF8
        });
        const regionArrayData: RegionData[] = JSON.parse(readFileResult.data);
        for(const regionData of regionArrayData){
            wavesurfer.addRegion(regionData);
        }


    }catch(error){//ignore error when file does not exist already, this happens on first login
        if(error.message == "File does not exist."){/**/}
        console.log("reading error: ", error);
    }
}