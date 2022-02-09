import RecordingData from "../RecordingData";
import WaveSurfer from "wavesurfer.js";
import RegionPlugin from "wavesurfer.js/dist/plugin/wavesurfer.regions.js"; //ok
import { replayAudioData } from "../ReplayData";
import RegionData from "../editing/RegionData";
import { Region } from "wavesurfer.js/src/plugin/regions";
import { EventHandler } from "wavesurfer.js/types/util";

export default class RecordingObj{

    recordingData: RecordingData;
    lastOnStopFunction: EventHandler;
    private lastOnStopFunctionHasBeenCalled: boolean;

    private _internalOnStop: EventHandler;

    wavesurfer: WaveSurfer= WaveSurfer.create({
        container: document.createElement('div'),
        plugins: [
            RegionPlugin.create(),
        ],
      });;

    constructor(recordingData){
        this.recordingData = recordingData;
        this.lastOnStopFunction = ()=>{/*do nothing*/};
        this.lastOnStopFunctionHasBeenCalled = false;

        this._internalOnStop = ()=>{
            if(!this.lastOnStopFunctionHasBeenCalled){
                this.lastOnStopFunction();
                this.lastOnStopFunctionHasBeenCalled= true;
            }
        }

        const audio = replayAudioData(this.recordingData.timestamp.toString(), this.recordingData.userID)
        .then((audio)=>this.wavesurfer.load(audio));
        for(const regionData of recordingData.parts){
            this.wavesurfer.addRegion(regionData);
        }
        
        this.wavesurfer.on('pause', this._internalOnStop);
    }

    

    playRegionByIdInPartsArray(id: number, onStop: EventHandler){
        this.playRegion(this.recordingData.parts[id], onStop);
    }

    playRegion(region: RegionData, onStop: EventHandler){
        if(!this.lastOnStopFunctionHasBeenCalled){
            this.lastOnStopFunction();
            this.lastOnStopFunctionHasBeenCalled = true;
        }
        this.lastOnStopFunction = onStop;
        this.lastOnStopFunctionHasBeenCalled = false;
        //find correct region
        const wavesurferRegion: Region = this.wavesurfer.regions.list[region.id];

        //start playing this region
        wavesurferRegion.play();
        console.log(this.wavesurfer);
    }

    stopPlaying(){
        this.wavesurfer.stop();
    }

    pausePlaying(){
        this.wavesurfer.pause();
    }

    destroy(){
        this.wavesurfer.destroy();
    }
}
