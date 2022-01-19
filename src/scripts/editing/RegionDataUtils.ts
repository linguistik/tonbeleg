import { Region } from "wavesurfer.js/src/plugin/regions"

import firebase from "@/backend/firebase-config";
import { Directory, Encoding, Filesystem } from "@capacitor/filesystem";

import RegionData from "@/scripts/editing/RegionData";

/**
 * converts an array of regions and the idToNameMap to an array of regionData
 * @param {Region[]} regionArray the array containing the regionData
 * @param {Map<string,string>}idToNameMap the map that maps some ids to a name
 * @returns an array containing the regionData
 */
export function convertToRegionDataArray(regionArray: Region[], idToNameMap: Map<string,string>){
    const regionArrayData: RegionData[] = [];
    for(const region of regionArray){
        let name: string = region.id;
        const nameOrUndef = idToNameMap.get(region.id);
        if( nameOrUndef != undefined){
            name = nameOrUndef;
        }
        regionArrayData.push(new RegionData(region, name));
    }
    return regionArrayData;
}


/**
 * @deprecated
 * saves the regions to userId/folderName/regions.json in the data filesystem
 * @param {Region[]} regionArray the array containing the regions to be stored
 * @param {string} folderName the folder of the recording to set the regions for
 * @param {Map<string,string>} idToNameMap the map that maps some of the ids to the actual name
 */
export async function saveRegions(regionArray: Region[], folderName: string, idToNameMap: Map<string,string>){
    const regionArrayData = convertToRegionDataArray(regionArray, idToNameMap);    

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
 * @deprecated
 * loads the regionData in an array for a specific recording specified by the folderName
 * @param {string} folderName specifying the recording
 * @returns an array containing the regionData for that recording
 */
export async function loadRegionData(folderName: string): Promise<RegionData[]>{
    const currentUser = firebase.auth().currentUser;
    if (currentUser == null) {
        console.log("\n\nFATAL ERROR: no user logged in, so loading regions does not work\n\n");
        return [];
    }
    const userUID = currentUser.uid;
    try{
        const readFileResult = await Filesystem.readFile({
            path: userUID + "/" + folderName + "/regions.json",
            directory: Directory.Data,
            encoding: Encoding.UTF8
        });
        const regionArrayData: RegionData[] = JSON.parse(readFileResult.data);
        return regionArrayData;


    }catch(error){//ignore error when file does not exist already, this happens on first login
        if(error.message == "File does not exist."){/**/}
        console.log("reading error: ", error);
    }
    return [];//return empty when the file does not exist

}


/**
 * @deprecated
 * loads the region data and names into the wavesurfer object and idToNameMap respectivvly
 * NOTE: idToNameMap only contains names that differ from the regions id
 * @param wavesurfer the wavesurfer plugin to insert the regions into
 * @param {Map<string,string>} idToNameMap the Map of the names depending on the id
 * @param {string} folderName the folderName specifying the location of the data
 */
export async function importRegions(wavesurfer, idToNameMap: Map<string,string>, folderName: string){
    const regionArrayData = await loadRegionData(folderName);
    
    for(const regionData of regionArrayData){
        wavesurfer.addRegion(regionData);
        if(regionData.name != regionData.id){
            idToNameMap.set(regionData.id, regionData.name);
        }
    }
}
