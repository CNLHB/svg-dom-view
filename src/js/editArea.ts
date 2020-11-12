//匹配标签
import $ from "jquery";
import {createElementByVdom, deepKeyValue, IVDomNode, svgType} from "../utils/utils";
import validateXML from "../utils/checkXML";
import SvgUtils from "../utils/createSVG";
import {singleTip} from "./singleTip";
import {svgInfo} from "../index";
import {doubleTag, singleTag, SVG_TAG} from "../config";

let checkSvgTag: RegExp = /(?<=<)[a-z]+(?=[>| ])/g;
//匹配标签
let matchSvg: RegExp = /<[a-z]+([\s\S]*?) *?>|<!--([\s\S]*?)-->/g;
//匹配svg
let matchSvgTag: RegExp = /<svg([\s\S]*?)<\/svg>/g
let matchTag: RegExp = /<(\S*?)[^>]*>.*?|<.*? \/>/g;
let matchUpper: RegExp = /[A-Z]/

class EditArea {
    public editText: string = "";
    public editHtml: string = "";

    constructor(public edit: any) {
        this.edit = edit;
        this.bindInputChange()
    }

    bindInputChange = () => {
        this.edit.on('input', this.inputChangeHandler)
    }
    inputChangeHandler = (event: InputEvent) => {
        if (event.target) {
            this.editText = (event.target as HTMLDivElement).innerText.trim()
            this.editHtml = (event.target as HTMLDivElement).innerHTML
        }

        if (this.editText.length == 0) return
        this.editText = this.editText.replace(/\n/, " ")
        this.editText = this.editText.replace(/\n/gm, " ")
        this.editText = this.editText.replace(/\s+/g, " ").replace(/(?<=>) *(?=<)/g, `
        `)
        let svgArr = this.editText.match(matchSvgTag) == null ? [] : this.editText.match(matchSvgTag)
        let svgArrTag = this.editText.match(matchSvg) == null ? [] : this.editText.match(matchSvg)
        let tagNameArr = this.editText.match(checkSvgTag)
        let tagArr = this.editText.match(matchTag)
        let svgTagArr: string[] = []
        let ret: RegExpExecArray | null = matchTag.exec(this.editText)
        if (ret == null) return singleTip("请输入正确的svg字符串", "error")
        let regTag: RegExp = /(?<=<)[a-z]+(?= +)|[a-z]+(?=>)/g
        let matchTagAll: string [] = []
        let inputSingleTag: Set<string> = new Set<string>()
        let inputDobuleTag: Set<string> = new Set<string>()
        let illegalTag: Set<string> = new Set<string>()
        while (ret) {
            let retMatch = ret[0].match(regTag)
            if (retMatch == null) {
                ret = matchTag.exec(this.editText)
                continue
            }
            matchTagAll.push(retMatch[0])
            if (singleTag.indexOf(retMatch[0]) !== -1) {
                inputSingleTag.add(retMatch[0])
            } else if (doubleTag.indexOf(retMatch[0]) !== -1) {
                inputDobuleTag.add(retMatch[0])
            } else {
                illegalTag.add(retMatch[0])
            }
            ret = matchTag.exec(this.editText)
        }
        if (illegalTag.size > 0) {
            singleTip(`${Array.from(illegalTag).join(", ")} is not an svg tag`, "wraning")
        }

        let startTagArr = []
        let endTagArr = []
        let reg: RegExp = /(?<=<)[a-z]+(?= +)/g
        console.log(matchTagAll)
        console.log(this.editText)
        if (matchTagAll[0] !== "svg") return singleTip("root标签必须是svg", "error")
        // let len: number = matchTagAll.length
        // for (let i = 0; i < len; i++) {
        //     let value = matchTagAll[i]
        //     if (value.startsWith("/")) {
        //         endTagArr.push(value)
        //     } else {
        //         startTagArr.push(value)
        //     }
        // }
        // let startLen = startTagArr.length
        // let copyArr = startTagArr.slice()
        // for (let i = 0; i < startLen; i++) {
        //     if (inputSingleTag.has(startTagArr[i])) {
        //         copyArr.shift()
        //         continue
        //     }
        //     if (inputDobuleTag.has(startTagArr[i]) && ("/" + copyArr.shift() == endTagArr.pop())) {
        //
        //     } else {
        //         return singleTip(startTagArr[i] + " is not closing properly", "error")
        //     }
        // }

        let showDom: JQuery = $("#dom-show")

        let checkXML = validateXML(this.editText)
        let errorFlag: boolean = false
        if (checkXML.error_code == 1) {
            if (checkXML.msg.indexOf("mismatch") > -1) {
                errorFlag = true
                //error on line 3 at column 10: Opening and ending tag mismatch: svg1 line 0 and svg
                console.log("标签不匹配")
                console.log(checkXML.msg, "error")
                singleTip(checkXML.msg)
            } else if (checkXML.msg.indexOf("attributes") > -1) {
                errorFlag = true
                singleTip(checkXML.msg, "error")
                console.log("属性不正确")
            } else if (checkXML.msg.indexOf("attribute") > -1) {
                errorFlag = true
                singleTip(checkXML.msg, "error")
                console.log("错误解析属性名 circle cx")
            } else if (checkXML.msg.indexOf("&gt") > -1) {
                errorFlag = true
                singleTip(checkXML.msg, "error")
                console.log("标签未正确闭合empty")
            } else if (checkXML.msg.indexOf("empty") > -1) {
                errorFlag = true
                singleTip(checkXML.msg, "error")
                console.log("请输入正确的svg标签")
            } else {
                console.log(checkXML.msg)
                errorFlag = true
                singleTip(checkXML.msg, "error")
            }

        } else {
            console.log(validateXML(this.editText).msg)
            singleTip(checkXML.msg, "success")
        }
        // @ts-ignore
        let fragment: DocumentFragment = document.createDocumentFragment();
        if (errorFlag) {
            svgInfo.svg.html()
            showDom.html()
            $("#graph-svg").html()
            console.log(888)
            return
        }
        fragment.appendChild($(this.editText)[0])
        let nodes: any = null
        nodes = fragment.firstElementChild
        nodes.setAttribute("height", String(svgInfo.width))
        nodes.setAttribute("width", String(svgInfo.height))
        let vDom = deepKeyValue(nodes)
        svgInfo.svg.html(fragment)
        let rectTips = SvgUtils.createSVG(
            'rect',
            {
                x: 0, y: 0, width: 0, height: 0, stroke: '#89cff0',
                opacity: "0.5",
                id: 'rect-tip',
                'stroke-width': 2, fill: '#89cff0'
            });
        $("#graph-svg").append(rectTips)
        showDom.html(createElementByVdom(vDom))

    }

}

export default EditArea