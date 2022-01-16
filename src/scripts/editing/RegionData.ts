


export default class RegionData{
    id: string;
    start: number;
    end: number;
    color: string;
    name: string;

    constructor(region, name: string){
        this.id = region.id;
        this.start = region.start;
        this.end = region.end;
        this.color = region.color;
        this.name = name;
    }
}