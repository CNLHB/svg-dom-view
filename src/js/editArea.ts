//匹配标签
import $ from "jquery";
import {createElementByVdom, deepKeyValue} from "../utils/utils";
import validateXML from "../utils/checkXML";
import SvgUtils from "../utils/createSVG";
import {singleTip} from "./singleTip";
import {svgInfo} from "../index";
import {doubleTag, singleTag} from "../config";
import {attrArea} from '../index'


//匹配Tag
let matchTag: RegExp = /<(\S*?)[^>]*>.*?|<.*? \/>/g;
//匹配TagName
let regTag: RegExp = /(?<=<)[a-z]+(?= +)|[a-z]+(?=>)/g

/**
 * 编辑区域
 */
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
        let ret: RegExpExecArray | null = matchTag.exec(this.editText)
        if (ret == null) return singleTip("请输入正确的svg字符串", "error")
        let matchTagAll: string [] = []
        let inputSingleTag: Set<string> = new Set<string>()
        let inputDobuleTag: Set<string> = new Set<string>()
        let illegalTag: Set<string> = new Set<string>()
        /**
         * 循环遍历标签
         */
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
        if (matchTagAll[0] !== "svg") return singleTip("root标签必须是svg", "error")
        let showDom: JQuery = $("#dom-show")
        let checkXML = validateXML(this.editText)
        let errorFlag: boolean = false
        if (checkXML.error_code == 1) {
            if (checkXML.msg.indexOf("mismatch") > -1) {
                errorFlag = true
                singleTip(checkXML.msg)
            } else if (checkXML.msg.indexOf("attributes") > -1) {
                errorFlag = true
                singleTip(checkXML.msg, "error")
            } else if (checkXML.msg.indexOf("attribute") > -1) {
                errorFlag = true
                singleTip(checkXML.msg, "error")
            } else if (checkXML.msg.indexOf("&gt") > -1) {
                errorFlag = true
                singleTip(checkXML.msg, "error")
            } else if (checkXML.msg.indexOf("empty") > -1) {
                errorFlag = true
                singleTip(checkXML.msg, "error")
            } else {
                errorFlag = true
                singleTip(checkXML.msg, "error")
            }

        } else {
            console.log(validateXML(this.editText).msg)
            if (illegalTag.size > 0) {
                singleTip(`${Array.from(illegalTag).join(", ")} is not an svg tag`, "warning")
            } else {
                singleTip(checkXML.msg, "success")
            }
        }
        // @ts-ignore
        let fragment: DocumentFragment = document.createDocumentFragment();
        if (errorFlag) {
            svgInfo.svg.html()
            showDom.html()
            $("#graph-svg").html()
            attrArea.getAttrArea().html(null)
            return
        }
        fragment.appendChild($(this.editText)[0])
        let nodes: any;
        nodes = fragment.firstElementChild

        let vDom = deepKeyValue(nodes)
        svgInfo.svg.html(fragment)
        let rect = nodes.getBoundingClientRect()
        let rectTips = SvgUtils.createSVG(
            'rect',
            {
                x: 0, y: 0, width: 0, height: 0, stroke: '#89cff0',
                opacity: "0.5",
                id: 'rect-tip',
                'stroke-width': 2, fill: '#89cff0'
            });
        let svgTips = SvgUtils.createSVG(
            'rect',
            {
                x: 0, y: 0, width: rect.width, height: rect.height, stroke: 'greenyellow',
                opacity: "0.5",
                id: 'svg-tip',
                'stroke-width': 2, fill: 'transparent'
            });
        $("#graph-svg").append(svgTips)
        $("#graph-svg").append(rectTips)
        showDom.html(createElementByVdom(vDom))
        $(".add-container").css("display", 'none')
        attrArea.getAttrArea().html(null)

    }

}

export default EditArea