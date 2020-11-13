let fixedProps: string[] = ["id", "class", "style", "transform", "stroke", "stroke-width", "fill"]
export let singleTag: string [] = ["path", "line", "rect", "circle", "ellipse", "polyline", "polygon"]
export let doubleTag: string [] = ["svg", "text", "g"]
let checkSvgTag: RegExp = /(?<=<)[a-z]+(?=[>| ])/g;
//匹配标签
let matchSvg: RegExp = /<[a-z]+([\s\S]*?) *?>|<!--([\s\S]*?)-->/g;
let matchUpper: RegExp = /[A-Z]/g
interface IPropsState {
    [key: string]: string[]
}

let propsState: IPropsState = {
    svg: ["x", "y", "width", "height", "viewBox"],
    text: ["x", "y", "width", "height", "font-family", "font-size"],
    path: ["d"],
    line: ["x1", "y1", "x2", "y2"],
    rect: ["x", "y", "width", "height", "rx", "ry"],
    circle: ["cx", "cy", "r"],
    ellipse: ["cx", "cy", "rx", "ry"],
    polyline: ["points"],
    polygon: ["points"],
    g: ["x", "y", "width", "height", "viewBox"],
    "text-node": ["content"]
}

export type SVG_TAG =
    "svg"
    | "text"
    | "text-node"
    | "path"
    | "line"
    | "rect"
    | "circle"
    | "ellipse"
    | "polyline"
    | "polygon"
    | "g"
export const toCheckProps: string[] = [
    "stroke-width", "x", "y", "height",
    "cx", "cy", "rx", "ry", "width", "x1",
    "x2", "y2", "y1", "font-size"
]

export function getProps(tag: SVG_TAG): string[] {
    return fixedProps.concat(propsState[tag])
}

export function debounce(fn: new () => void, time: number) {
    let timer: number | null = null
    return function () {
        timer && clearTimeout(timer)
        timer = setTimeout(() => {
            // @ts-ignore
            fn.apply(this, arguments)
        }, time)
    }
}

export function isCheckNumber(str: string, val: string): boolean {
    if (toCheckProps.indexOf(str) !== -1) {
        let reg = /[A-Za-z_.]/g
        return !reg.test(val)
    }
    return true
}

