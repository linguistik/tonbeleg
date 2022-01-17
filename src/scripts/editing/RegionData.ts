


export default class RegionData {
    id: string;
    start: number;
    end: number;
    color: string;
    name: string;

    constructor(region, name: string) {
        if (region != null) {
            this.id = region.id;
            this.start = region.start;
            this.end = region.end;
            this.color = region.color;
        }else{
            this.id = "";
            this.start = 0;
            this.end = 0;
            this.color = "";
        }
        this.name = name;
    }
}