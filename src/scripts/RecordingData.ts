
export default class RecordingData{
    timestamp: number;
    name: string;
    parts: string[];
    length: number;
    upload: boolean;

    constructor(timestamp: number, name: string, parts: string[], length: number, upload: boolean){
        this.timestamp = timestamp;
        this.name = name;
        this.parts = parts;
        this.length = length;
        this.upload = upload;
    }
}
