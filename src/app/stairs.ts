import { Vector3 } from "three";

function intervalIntersection(a: number, b: number, c: number, d: number): boolean {
    // return (c <= a && a <= d) || (a <= c && c <= b)
    return d >= a && c <= b; 
}

function intervalsIntersection(intervals: Array<[number, number]>): boolean{
    let left = intervals[0][0];
    let right = intervals[0][1];
    for (let i = 1 ; i < intervals.length ; i ++){
        left = Math.max(intervals[i][0], left);
        right = Math.min(intervals[i][1], right)
    }
    return left <= right;
}


function intervalsIntersectionDim(intervals: Array<[number, number]>): number{
    let left = intervals[0][0];
    let right = intervals[0][1];
    for (let i = 1 ; i < intervals.length ; i ++){
        left = Math.max(intervals[i][0], left);
        right = Math.min(intervals[i][1], right)
    }
    if (left < right){
        return 1;
    } else if (left == right){
        return 0;
    } else {
        return -1;
    }
}


function boxesIntersectionDim(xIntervals: Array<[number, number]>, yIntervals: Array<[number, number]>, zIntervals: Array<[number, number]>): number{
    const xdim = intervalsIntersectionDim(xIntervals);
    const ydim = intervalsIntersectionDim(yIntervals);
    const zdim = intervalsIntersectionDim(zIntervals);

    if (xdim == -1 || ydim == -1 || zdim == -1){
        return -1;
    } else {
        return xdim + ydim + zdim;
    }
}




export class Stair {
    readonly c: Vector3;
    readonly dims: Array<Vector3>;

    constructor(c: Vector3, dims: Array<Vector3>){
        this.c = c;
        this.dims = dims;
    }
}



function auxStairsIntersection(stairs: Array<Stair>, i: number, xIntervals: Array<[number,number]>, yIntervals: Array<[number, number]>, zIntervals: Array<[number, number]>){
    if ( i >= stairs.length ){
        const interDim = boxesIntersectionDim(xIntervals, yIntervals, zIntervals);
        if (interDim >= 0){
            console.log(interDim)
        }
        return intervalsIntersection(xIntervals)
        && intervalsIntersection(yIntervals)
        && intervalsIntersection(zIntervals);
    }
    

    const stair = stairs[i];
    for (const dim of stair.dims){
        xIntervals.push( [stair.c.x,stair.c.x + dim.x]);
        yIntervals.push( [stair.c.y,stair.c.y + dim.y]);
        zIntervals.push( [stair.c.z,stair.c.z + dim.z]);
        if (auxStairsIntersection(stairs, i+1, xIntervals, yIntervals, zIntervals)){
            return true;
        }

        xIntervals.pop();
        yIntervals.pop();
        zIntervals.pop();
    }
}

export function stairsIntersection(stairs: Array<Stair>){
    const xIntervals = [];
    const yIntervals = [];
    const zIntervals = [];
    return auxStairsIntersection(stairs, 0, xIntervals, yIntervals, zIntervals);
}


export function computeSimplicialComplex(stairs: Array<Stair>): Array<Set<number>>{
    console.log("compute complex:")
    const faces = new Array<Set<number>>();
    for (let i = 0 ; i < stairs.length ; i ++){
        for (let j = i+1 ; j < stairs.length; j ++){
            if (stairsIntersection([stairs[i], stairs[j]])){
                faces.push( new Set([i,j]));
            }
        }
    }
    for (let i = 0 ; i < stairs.length ; i ++){
        for (let j = i+1 ; j < stairs.length; j ++){
            for (let k = j+1; k < stairs.length; k ++){
                if (stairsIntersection([stairs[i], stairs[j], stairs[k]])){
                    faces.push( new Set([i,j,k]));
                }
            }
        }
    }
    return faces;
}



export function printASC(faces: Array<Set<number>>){
    console.log("faces:")
    for (const f of faces){
        console.log(f);
    }
}
