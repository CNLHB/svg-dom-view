//匹配标签
import $ from "jquery";
import {createElementByVdom, deepKeyValue, svgType} from "../utils/utils";
import validateXML from "../utils/checkXML";
import SvgUtils from "../utils/createSVG";
import {singleTip} from "./singleTip";
import {svgInfo} from "../index";

let checkSvgTag: RegExp = /(?<=<)[a-z]+(?=[>| ])/g;
//匹配标签
let matchSvg: RegExp = /<[a-z]+([\s\S]*?)>|<!--([\s\S]*?)-->/g;
//匹配svg
let matchSvgTag: RegExp = /<svg([\s\S]*?)<\/svg>/g

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
        let svgArr = this.editText.match(matchSvgTag) == null ? [] : this.editText.match(matchSvgTag)
        let svgArrTag = this.editText.match(matchSvg) == null ? [] : this.editText.match(matchSvg)
        let tagNameArr = this.editText.match(checkSvgTag)
        // console.log(tagNameArr)
        // console.log(svgArrTag)
        let showDom = $("#dom-show")
        tagNameArr?.forEach((item: string) => {
            if (svgType.indexOf(item) == -1) {
                // editHtml = editHtml.replace(RegExp(`<${item}`,'g'),`<${item} style='color:red'`)
                singleTip(`${item} is not an svg tag`)
                console.warn(`${item} is not an svg tag`)
            }
        })
        let checkXML = validateXML(this.editText)

        if (checkXML.error_code == 1) {
            if (checkXML.msg.indexOf("mismatch") > -1) {
                //error on line 3 at column 10: Opening and ending tag mismatch: svg1 line 0 and svg
                console.log("标签不匹配")
                console.log(checkXML.msg)
                singleTip(checkXML.msg)
            } else if (checkXML.msg.indexOf("attributes") > -1) {
                singleTip(checkXML.msg)
                console.log("属性不正确")
            } else if (checkXML.msg.indexOf("attribute") > -1) {
                singleTip(checkXML.msg)
                console.log(checkXML.msg)
                console.log("错误解析属性名 circlecx")
            } else if (checkXML.msg.indexOf("&gt") > -1) {
                singleTip(checkXML.msg)
                console.log("标签未正确闭合empty")
            } else if (checkXML.msg.indexOf("empty") > -1) {
                singleTip(checkXML.msg)
                console.log("请输入正确的svg标签")
            } else {
                console.log(checkXML.msg)
            }

        } else {
            console.log(validateXML(this.editText).msg)
        }
        // @ts-ignore
        let fragment: DocumentFragment = document.createDocumentFragment();

        fragment.appendChild($(this.editText)[0])
        let nodes: any = null
        nodes = fragment.firstElementChild
        nodes.setAttribute("height", String(svgInfo.width))
        nodes.setAttribute("width", String(svgInfo.height))
        let vdom = deepKeyValue(nodes)
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
        showDom.html(createElementByVdom(vdom))
        // edit&&(edit.innerHTML = editHtml)

    }

}

export default EditArea