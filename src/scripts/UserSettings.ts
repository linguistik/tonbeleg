
export default class RecordingData{ //Muss das nicht UserSettings heißen
    birthday: string;
    job: string;
    //Languages: string[];
    firstLanguage: string[];
    secondLanguage: string[];
    dialect: string;
    zipCode: number;
    license: string;
    wifi: boolean;
    firstStart: boolean;

    //uploadArray: string[];
    //alreadyUploadedArray: string[][];
    //inUploadArrayIdent: string[][];
    constructor(birthday: string,job: string, firstLanguage: string[], secondLanguage: string[], dialect: string, zipCode: number, license: string, wifi: boolean, firstStart: boolean){

        this.birthday = birthday;
        this.job = job;
        this.firstLanguage = firstLanguage;
        this.secondLanguage = secondLanguage;
        this.dialect = dialect;
        this.zipCode = zipCode;
        this.license = license;
        this.wifi = wifi;
        this.firstStart = firstStart;
        /*this.uploadArray = uploadArray;
        this.alreadyUploadedArray = alreadyUploadedArray;
        this.inUploadArrayIdent = inUploadArrayIdent;*/
    }
}
