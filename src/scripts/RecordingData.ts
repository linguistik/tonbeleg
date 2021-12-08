
export default class RecordingData{
    timestamp: number;
    name: string;
    parts: string[];
    length: number;
    upload: boolean;
    license: string;
    userID: string;

    constructor(timestamp: number, name: string, parts: string[], length: number, upload: boolean, license: string, userID: string){
        this.timestamp = timestamp;
        this.name = name;
        this.parts = parts;
        this.length = length;
        this.upload = upload;
        this.license = license;
        this.userID = userID;
    }
}
