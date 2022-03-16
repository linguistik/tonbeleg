export default class VoiceActivityDetector{
    private windowSize = 60;//ms
    private threshhold = 1;

    private windowBufferSize;//calculate this from windowSize and audio.sampleRate

    private audio: AudioBuffer;
    private data: Float32Array;

    private onRegionEnded: Function;

    /**
     * constructs a new VoiceActivity Detector working on the audio
     * @param {AudioBuffer} audio the audio to detect voices in 
     * @param {(number,number)=>void}onRegionEnded the function called with (start, end) of a region
     */
    constructor(audio: AudioBuffer, onRegionEnded: Function){
        this.audio = audio;
        this.data = audio.getChannelData(0);
        this.onRegionEnded = onRegionEnded;
        
        this. windowBufferSize = Math.pow(2, Math.floor(Math.log(this.msToIndex(this.windowSize))/Math.log(2)));
        console.log(this.windowBufferSize);

    }

    /**
     * 
     * @param {number} time in milliseconds (ms) 
     * @returns {number} the index 
     */
    private msToIndex(time: number): number{
        return Math.round(this.audio.sampleRate/1000 * time);
    }

    /**
     * 
     * @param {number} start index
     * @param {number} end index
     * @returns {number} energy
     */
    private computeEnergy(start: number, end: number): number{
        let sum =0;
        for(let i =start; i<end;i++){
            sum += this.data[i] * this.data[i];
        }
        return sum;
    }

    /**
     * extract the regions 
     * calls the method registered before
     */
    extractRegions(){
        let regionStarted = false;
        let regionStartTime =0;//in ms
        for(let end = this.windowSize; end<this.audio.duration * 1000; end += this.windowSize){
            const start = end - this.windowSize;
            const energy = this.computeEnergy(this.msToIndex(start), this.msToIndex(end));
            if(regionStarted && energy<this.threshhold){
                //region end
                regionStarted = false;
                this.onRegionEnded(regionStartTime, end);
            }else if(!regionStarted && energy>this.threshhold){
                //region started
                regionStarted = true;
                regionStartTime = end- this.windowSize;
            }
        }
    }
}