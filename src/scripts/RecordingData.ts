
export default class RecordingData{
    timestamp: number;
    name: string;
    parts: string[];
    length: number;
    upload: boolean;
    selectedForUpload: boolean;
    license: string;
    userID: string;

    constructor(timestamp: number, name: string, parts: string[], length: number, upload: boolean, selectedForUpload: boolean, license: string, userID: string){
        this.timestamp = timestamp;
        this.name = name;
        this.parts = parts;
        this.length = length;
        this.upload = upload;
        this.selectedForUpload = selectedForUpload;
        this.license = license;
        this.userID = userID;
    }
}
