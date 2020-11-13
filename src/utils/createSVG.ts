
export default class SvgUtils{
    constructor(){

    }
    static createSVG = (tag: string, attrs: any): SVGElement => {
        let el = document.createElementNS('http://www.w3.org/2000/svg', tag);
        for (let k in attrs)
            el.setAttribute(k, attrs[k]);
        return el;
    }

    static updateSVG = (tag: SVGElement, attrs: any): void => {
        for (let k in attrs)
            tag.setAttribute(k, attrs[k]);
    }
}