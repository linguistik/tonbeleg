

export default class RecordingData{
    timestamp: number;
    name: string;
    parts: string[];
    length: number;

    constructor(timestamp: number, name: string, parts: string[], length: number){
        this.timestamp = timestamp;
        this.name = name;
        this.parts = parts;
        this.length = length;
    }
}
