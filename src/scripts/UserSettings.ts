
export default class RecordingData{
    age: number;
    job: string;
    //Languages: string[];
    firstLanguage: string;
    secondLanguage: string;
    dialect: string;
    zipCode: number;
    license: string;
    constructor(age: number,job: string, firstLanguage: string, secondLanguage: string, dialect: string, zipCode: number, license: string){
        this.age = age;
        this.job = job;
        this.firstLanguage = firstLanguage;
        this.secondLanguage = secondLanguage;
        this.dialect = dialect;
        this.zipCode = zipCode;
        this.license = license;
    }
}
