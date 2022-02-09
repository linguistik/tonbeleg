import WaveSurfer from "wavesurfer.js";
import RegionData from "./editing/RegionData";
import RegionPlugin from "wavesurfer.js/dist/plugin/wavesurfer.regions.js"; //ok
import { replayAudioData } from "./ReplayData";


export default class RecordingData{
    timestamp: number;
    name: string;
    parts: RegionData[];
    length: number;
    upload: boolean;
    selectedForUpload: boolean;
    license: string;
    userID: string;
    languages: string[];
    transcription: string;

    constructor(timestamp: number, name: string, parts: RegionData[], length: number, upload: boolean, selectedForUpload: boolean, license: string, userID: string, languages: string[]){
        this.timestamp = timestamp;
        this.name = name;
        this.parts = parts;
        this.length = length;
        this.upload = upload;
        this.selectedForUpload = selectedForUpload;
        this.license = license;
        this.userID = userID;
        this.languages = languages;
        this.transcription = "";
    }
    

}
