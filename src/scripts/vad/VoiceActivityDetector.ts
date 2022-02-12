

export default class VoiceActivityDetector{
    private windowSize = 60;//ms
    private threshhold = 5;

    private audio: AudioBuffer;
    private data: Float32Array;

    private onRegionEnded: Function;

    constructor(audio: AudioBuffer, onRegionEnded){
        this.audio = audio;
        this.data = audio.getChannelData(0);
        this.onRegionEnded = onRegionEnded;
    }

    private msToIndex(time: number): number{
        return Math.round(this.audio.sampleRate/1000 * time);
    }

    private computeEnergy(start: number, end: number): number{
        let sum =0;
        for(let i =start; i<end;i++){
            sum += this.data[i] * this.data[i];
        }
        return sum;
    }

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