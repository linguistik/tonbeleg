
export default class UserSettings{
    birthday: string; //the birth date of the user
    job: string;      //area of work of the user
    firstLanguage: string[];//the users first language
    secondLanguage: string[];//the users second languages
    dialect: string;//the dialect a user speaks
    zipCode: number;//the region where a user lives
    license: string;//the license under which a user provides his recordings
    wifi: boolean;//wether the user wants to upload via wifi only
    firstStart: boolean;//wether a user has used the app before

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
    }
}
