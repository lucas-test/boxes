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


function auxStairsIntersectionDim(stairs: Array<Stair>, i: number, xIntervals: Array<[number,number]>, yIntervals: Array<[number, number]>, zIntervals: Array<[number, number]>): undefined | number{
    if ( i >= stairs.length ){
        return boxesIntersectionDim(xIntervals, yIntervals, zIntervals);
    }

    const stair = stairs[i];
    let currentd: undefined | number = undefined;
    for (const dim of stair.dims){
        xIntervals.push( [stair.c.x, stair.c.x + dim.x]);
        yIntervals.push( [stair.c.y, stair.c.y + dim.y]);
        zIntervals.push( [stair.c.z, stair.c.z + dim.z]);
        const d = auxStairsIntersectionDim(stairs, i+1, xIntervals, yIntervals, zIntervals);

        xIntervals.pop();
        yIntervals.pop();
        zIntervals.pop();

        if (typeof d == "undefined" ){
            return undefined;
        } else {
        
            if (typeof currentd == "undefined"){
                currentd = d;
            } else {
                if (currentd == -1){
                    currentd = d;
                } else if (d == -1){

                
                } else if (d != currentd){
                    return undefined;
                }
            }
        }
    }
    return currentd;
}

function stairsIntersectionDim(stairs: Array<Stair>): undefined | number{
    const xIntervals = [];
    const yIntervals = [];
    const zIntervals = [];
    return auxStairsIntersectionDim(stairs, 0, xIntervals, yIntervals, zIntervals )
}


function auxStairsIntersectionDimV2(stairs: Array<Stair>, i: number, xIntervals: Array<[number,number]>, yIntervals: Array<[number, number]>, zIntervals: Array<[number, number]>): number{
    if ( i >= stairs.length ){
        return boxesIntersectionDim(xIntervals, yIntervals, zIntervals);
    }

    const stair = stairs[i];
    let currentd = -1;
    for (const dim of stair.dims){
        xIntervals.push( [stair.c.x, stair.c.x + dim.x]);
        yIntervals.push( [stair.c.y, stair.c.y + dim.y]);
        zIntervals.push( [stair.c.z, stair.c.z + dim.z]);
        const d = auxStairsIntersectionDimV2(stairs, i+1, xIntervals, yIntervals, zIntervals);

        xIntervals.pop();
        yIntervals.pop();
        zIntervals.pop();

        if (d > currentd){
            currentd = d;
        }
    }
    return currentd;
}

function stairsIntersectionDimV2(stairs: Array<Stair>): number{
    const xIntervals = [];
    const yIntervals = [];
    const zIntervals = [];
    return auxStairsIntersectionDimV2(stairs, 0, xIntervals, yIntervals, zIntervals )
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
        // const interDim = boxesIntersectionDim(xIntervals, yIntervals, zIntervals);
        // if (interDim >= 0){
        //     console.log(interDim)
        // }
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




function auxComputeIC(stairs: Array<Stair>, clique: Set<number>, cliqueNeighbors: Set<number>): Set<Set<number>>{

    if (cliqueNeighbors.size == 0){
        const copyClique = new Set<number>(clique);
        return new Set([copyClique]);
    } 

    const maximalSuperClique = new Set<Set<number>>();
    
    for (const neighbor of cliqueNeighbors){

        clique.add(neighbor);
        
        const newNeighbors = new Set<number>();
        for (const n2 of cliqueNeighbors){
            if (clique.has(n2)) continue;

            const stairsClique = new Array<Stair>();
            for (let j = 0 ; j < stairs.length; j ++){
                if (clique.has(j)){
                    stairsClique.push(stairs[j]);
                }
            }
            stairsClique.push(stairs[n2]);
            if (stairsIntersection(stairsClique)){
                newNeighbors.add(n2);
            }
        }
        for (const c of auxComputeIC(stairs, clique, newNeighbors)){
            let found = false;
            for (const c2 of maximalSuperClique){
                if (eqSet(c, c2)){
                    found = true;
                    break;
                }
            }
            if (found == false) maximalSuperClique.add(c);
        }

        clique.delete(neighbor);
    }

    return maximalSuperClique;

}

export function computeIntersectionComplex(stairs: Array<Stair>){

    const neighbors = new Set<number>();
    for (let j = 0 ; j < stairs.length; j ++){
        neighbors.add(j);
    }
    const faces = auxComputeIC(stairs, new Set(), neighbors);

    return faces;

}


export function eqSet (xs: Set<number>, ys: Set<number>): boolean {
    return xs.size === ys.size && [...xs].every((x) => ys.has(x));
}




export function printASC(faces: Array<Set<number>>){
    console.log("faces:")
    for (const f of faces){
        console.log(f);
    }
}

export function isPacking(stairs: Array<Stair>): boolean{
    for (let i = 0 ; i < stairs.length; i ++){
        for (let j = i+1; j < stairs.length; j ++){
            const dim = stairsIntersectionDim([stairs[i], stairs[j]]);
            if (typeof dim == "undefined" || dim == 3){
                return false;
            }
        }
    }
    return true;
}


export function checkContactDimension(stairs: Array<Stair>): undefined | Array<number>{
    for (let i = 0 ; i < stairs.length; i ++){
        for (let j = i+1; j < stairs.length; j ++){
            const dim = stairsIntersectionDim([stairs[i], stairs[j]]);
            if (typeof dim == "undefined"){
                return [i,j];
            } else if (dim != 2 && dim >= 0){
                return [i,j];
            }
        }
    }

    for (let i = 0 ; i < stairs.length; i ++){
        for (let j = i+1; j < stairs.length; j ++){
            for (let k = j+1; k < stairs.length; k++){
                const dim = stairsIntersectionDim([stairs[i], stairs[j], stairs[k]]);
                if (typeof dim == "undefined"){
                    return [i,j,k];
                } else if (dim != 1 && dim >= 0){
                    return [i,j,k];
                }
            }
        }
    }

    for (let i = 0 ; i < stairs.length; i ++){
        for (let j = i+1; j < stairs.length; j ++){
            for (let k = j+1; k < stairs.length; k++){
                for (let l = k+1; l < stairs.length; l++){
                    const dim = stairsIntersectionDim([stairs[i], stairs[j], stairs[k], stairs[l]]);
                    if (typeof dim == "undefined"){
                        return [i,j,k,l];
                    } else if (dim != 0 && dim >= 0){
                        return [i,j,k,l];
                    }
                }
            }
        }
    }



    return undefined;
}


/*
LENT 
2 0 0
1 3 2
0 0 2
3 2 1
0 2 0
2 1 3
1 1 1
1 1 1
0 0 0
2 2 1 2 2 1 1 2 2
-1 -1 -1
1 4 4 4 4 1 4 1 4

PIRE : 5min
2 0 0
1 3 2
0 0 2
3 2 1
0 2 0
2 1 3
1 1 1
1 1 1
0 0 0
2 2 1 2 1 2 1 2 2
-1 -1 -1
1 4 4 4 4 1 4 1 4

*/