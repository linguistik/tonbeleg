import RecordingData from "../RecordingData";
import WaveSurfer from "wavesurfer.js";
import RegionPlugin from "wavesurfer.js/dist/plugin/wavesurfer.regions.js";
import { replayAudioData } from "../ReplayData";
import { Region } from "wavesurfer.js/src/plugin/regions";
import { ref, Ref } from "vue";

export default class RecordingPlayer{

    private recordingData: RecordingData;
    private playingPartsRef: Ref<boolean[]>;
    private mainPlayingRef: Ref<boolean>;
    private lastIndex = -1;

    private isPlayingPlayList: boolean;
    private currentRegion?: Region;
    private playList: Region[] = [];

    private wavesurfer: WaveSurfer= WaveSurfer.create({
        container: document.createElement('div'),
        plugins: [
            RegionPlugin.create(),
        ],
      });

    /**
     * 
     * @param {RecordingData} recordingData the recording meta data
     * @param {Ref<boolean>} mainPlayingRef the reference used to render play and stop button for the whole recording
     * @param {Ref<boolean[]>} playingPartsRef the reference used to render play and stp button for all parts
     */
    constructor(recordingData: RecordingData, mainPlayingRef: Ref<boolean> , playingPartsRef: Ref<boolean[]>){
        this.recordingData = recordingData;
        this.playingPartsRef = ref([false]);

        this.mainPlayingRef = mainPlayingRef;
        this.playingPartsRef = playingPartsRef;

        this.isPlayingPlayList = false;
        const _internalOnStop = ()=>{
            this.mainPlayingRef.value = false;
            if(this.lastIndex>=0){
                this.playingPartsRef.value[this.lastIndex] = false;
            }
        }
        
        const _internalOnPlay = ()=>{
            this.mainPlayingRef.value = true;
        }

        const _internalOnaudioProcess = (time)=>{
            if(!this.isPlayingPlayList || this.currentRegion == undefined){
                return;
            }
            if(time>this.currentRegion.end && this.playList.length>0){
                this.currentRegion = this.playList.shift();
                if (this.currentRegion != undefined){
                    this.wavesurfer.play(this.currentRegion.start);
                }
            }else if(time>this.currentRegion.end && this.playList.length == 0){
                this.wavesurfer.stop();
                this.isPlayingPlayList = false;
            }
        }

        const _internalRegionIn = (region: Region)=>{
            this.lastIndex = this.regionIdToPartNumber(region.id);
            this.playingPartsRef.value[this.lastIndex] = true;
        }
        const _internalRegionOut = (region: Region)=>{
            this.playingPartsRef.value[this.regionIdToPartNumber(region.id)] = false;
        }

        const audio = replayAudioData(this.recordingData.timestamp.toString(), this.recordingData.userID)
        .then((audio)=>this.wavesurfer.load(audio));
        for(const regionData of recordingData.parts){
            this.wavesurfer.addRegion(regionData);
        }
        
        this.wavesurfer.on('pause', _internalOnStop);
        this.wavesurfer.on('play', _internalOnPlay);
        this.wavesurfer.on('audioprocess', _internalOnaudioProcess);
        this.wavesurfer.on('region-in',_internalRegionIn);
        this.wavesurfer.on('region-out',_internalRegionOut);
    }//end constructor

    

    /**
     * starts playback of a specific region
     * @param {number} id the id in {@link recordingData.parts}
     */
    playRegionByIdInPartsArray(id: number){
        const wavesurferRegion: Region = this.wavesurfer.regions.list[this.recordingData.parts[id].id];
        this.isPlayingPlayList = false;
        //start playing this region
        wavesurferRegion.play();
    }

    /**
     * plays all regions in ascending order in terms of starting time
     */
    playAllRegions(){
        if(this.recordingData.parts.length ==0){
            this.wavesurfer.play();
            return;
        } 

        //https://github.com/katspaugh/wavesurfer.js/issues/1717
        this.playList = Object.values(this.wavesurfer.regions.list);
        this.playList.sort((a, b) => (a.start > b.start ? 1 : -1));
        const nextRegion = this.playList.shift();
        this.currentRegion = nextRegion;
        this.isPlayingPlayList = true;
        if(this.currentRegion == undefined)
            return;
        this.wavesurfer.play(this.currentRegion.start);
        this.playingPartsRef.value[this.regionIdToPartNumber(this.currentRegion.id)] = true;
    }

    /**
     * stop the playback
     */
    stopPlaying(){
        this.wavesurfer.stop();
    }

    /**
     * pauses the playback
     * at the moment this will be the same as stopPlaying
     */
    pausePlaying(){
        this.wavesurfer.pause();
    }

    /**
     * destroys this object
     */
    destroy(){
        this.wavesurfer.destroy();
    }

    /**
     * converts a region Id to the id in the {@link recordingData.parts}, i.e. the id in {@link playingPartsRef}
     * @param {string} regionId 
     * @returns {number} the id if found, -1 otherwise
     */
    private regionIdToPartNumber(regionId: string): number{
        for(let i=0;i<this.recordingData.parts.length;i++){
            const part = this.recordingData.parts[i];
            if(part.id == regionId)
                return i;
        }
        return -1;
    }
}
