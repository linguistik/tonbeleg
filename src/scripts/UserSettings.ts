
export default class RecordingData{
    birthday: string;
    job: string;
    //Languages: string[];
    firstLanguage: string[];
    secondLanguage: string[];
    dialect: string;
    zipCode: number;
    license: string;
    wifi: boolean;
    constructor(birthday: string,job: string, firstLanguage: string[], secondLanguage: string[], dialect: string, zipCode: number, license: string, wifi: boolean){
        this.birthday = birthday;
        this.job = job;
        this.firstLanguage = firstLanguage;
        this.secondLanguage = secondLanguage;
        this.dialect = dialect;
        this.zipCode = zipCode;
        this.license = license;
        this.wifi = wifi;
    }
}
