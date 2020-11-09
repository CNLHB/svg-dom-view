import SvgUtils from './utils/createSVG'
import $ from 'jquery'
import validateXML from "./utils/checkXML";
import SvgInfo from "./utils/svgInfo";

let svgType: string[] = ["svg", "g", "path", "text", "line", "rect", "ellipse", "circle", "polyline", "polygon"]
let doubleTag: string[] = ["svg", "g", "text"]
$("#dom-view").on("click", '.icon', function (event) {
    event.stopPropagation();
    event.target.parentElement.classList.toggle("show-active")
    if (event.target.classList.contains("icon-xiajiantou")) {
        event.target.classList.remove("icon-xiajiantou")
        event.target.classList.add("icon-sanjiaoright")
    } else {
        event.target.classList.remove("icon-sanjiaoright")
        event.target.classList.add("icon-xiajiantou")
    }

})
let prev = null
let selectDomFlag: boolean = false
//选择dom区标签
$("#dom-view").on("click", '.show-wrapper', function (event) {
    let target = event.currentTarget
    event.stopImmediatePropagation()
    if (prev != null) {
        prev.classList.toggle("select-dom")
    }
    target.classList.toggle("select-dom")
    //graph
    prev = target
    if (prev.classList.contains("select-dom")) {
        selectDomFlag = true
    } else {
        selectDomFlag = false
    }
    let oMenu = $("#menu")
    if (oMenu.css("display") == "block") {
        oMenu.css({
            display: "none"
        })
    }
})
$("#dom-view").on('click', function () {
    if (prev != null) {
        prev.classList.remove("select-dom")
        prev = null
    }
    let oMenu = $("#menu")
    if (oMenu.css("display") == "block") {
        oMenu.css({
            display: "none"
        })
        selectDom = null
    }

})
let selectDom: any = null;
$("#dom-show").on('contextmenu ', '.show-wrapper', function (event) {
    event.preventDefault();
    if (!selectDomFlag) return
    selectDom = $(event.target)
    let _x = event.clientX,
        _y = event.clientY;
    let oMenu = $("#menu")
    oMenu.css({
        display: "block",
        left: _x + "px",
        top: _y + "px"
    })
    console.log('comtextmenu')

})
let copyNode: any;
$("#menu").on('click', "li", function (event) {
    event.stopPropagation();
    let target = $(event.currentTarget);
    let type = target.attr("class")
    let oMenu = $("#menu")
    switch (type) {
        case "remove-node":
            selectDom.remove()
            oMenu.css({
                display: "none"
            })
            singleTip("删除节点成功")
            break;
        case "copy-node":
            oMenu.css({
                display: "none"
            })
            copyNode = selectDom.clone(true);
            singleTip("复制节点成功")
            break;
        case "paste-node":
            if (copyNode) {
                let id = copyNode.attr("id") + "1"
                copyNode.attr("id", id)
                copyNode.removeClass("select-dom")
                selectDom.after(copyNode)
            }
            oMenu.css({
                display: "none"
            })
            singleTip("粘贴节点成功")
            break;
        case "copy-svg":
            oMenu.css({
                display: "none"
            })
            singleTip("复制SVG成功")
            break;
    }
    console.log(type)

})
//匹配标签
let checkSvgTag = /(?<=<)[a-z]+(?=[>| ])/g;
//匹配标签
let matchSvg = /<[a-z]+([\s\S]*?)>|<!--([\s\S]*?)-->/g;
//匹配svg
let matchSvgTag = /<svg([\s\S]*?)<\/svg>/g
let singleTip = createSingleTips()
let edit: HTMLDivElement | null;
let graph: HTMLDivElement | null;
let menu: HTMLDivElement | null = document.querySelector("#menu");
let editText: string = '';
let editHtml: string = '';
let svgInfo: SvgInfo;
edit = document.querySelector("#edit");
graph = document.querySelector('#graph')
if (graph !== null) {
    svgInfo = new SvgInfo(graph.clientWidth, graph.clientHeight)
}
if (edit !== null) {
    edit.addEventListener('input', keyupChangeHandler)
}
let editT: string = `
<svg xmlns="http://www.w3.org/2000/svg" version="1.1">
   <circle cx="100" cy="50" r="40" stroke="black" stroke-width="2" fill="red" />
</svg> 
<svg xmlns="http://www.w3.org/2000/svg" version="1.1">
   <circle cx="50" cy="50" r="40" stroke="black" stroke-width="2" fill="red" />
</svg> 
`

function keyupChangeHandler(event: Event) {
    if (event.target) {
        editText = (event.target as HTMLDivElement).innerText.trim()
        editHtml = (event.target as HTMLDivElement).innerHTML
    }
    let svgArr = editText.match(matchSvgTag) == null ? [] : editText.match(matchSvgTag)
    let svgArrTag = editText.match(matchSvg) == null ? [] : editText.match(matchSvg)
    let tagNameArr = editText.match(checkSvgTag)
    // console.log(tagNameArr)
    console.log(svgArrTag)
    let showDom = $("#dom-show")
    tagNameArr?.forEach((item: string) => {
        if (svgType.indexOf(item) == -1) {
            // editHtml = editHtml.replace(RegExp(`<${item}`,'g'),`<${item} style='color:red'`)
            singleTip(`${item} is not an svg tag`)
            console.warn(`${item} is not an svg tag`)
        }
    })
    let checkXML = validateXML(editText)
    // console.log(editText)

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
        console.log(validateXML(editText).msg)
    }
    // @ts-ignore
    let fragment: DocumentFragment = document.createDocumentFragment();

    fragment.appendChild($(editText)[0])
    let nodes: any = null
    nodes = fragment.firstElementChild
    let vdom = deepKeyValue(nodes)
    $(svgInfo.svg).append(fragment)

    showDom.html(createElementByVdom(vdom))
    // edit&&(edit.innerHTML = editHtml)

}

/**
 *
 * @param vdom
 * return dom
 */
function createElementByVdom(vdom: IVDomNode) {
    let isText = typeof vdom.children === 'string'
    let len = vdom.children.length;
    let child;
    if (isText && len == 0) {
        return ''
    }
    let isDobuleTag = doubleTag.indexOf(vdom.tag as string) != -1
    let str = '';
    // @ts-ignore
    Object.entries(vdom.props).forEach((item) => {
        if (item[0] !== "id" && item[0].trim()) {
            str += `<span class="props">${item[0]}</span>=<span class="props-value">${item[1]}</span>`
        }
    })
    let isShriColumn = false;
    var dom = `
    <div  id=${vdom.props.id} class="show-wrapper">
    ${len === 0 ? "" : '<icon  class="icon iconfont icon-sanjiaoright"></icon>'}
    <span class=${isDobuleTag ? "double-head" : "head"}>${vdom.tag}<span class="props-wrap">${str}</span>
    </span>
        <div class="tree-children">
         ${isText == true ? vdom.children :
        (Array.isArray(vdom.children) ? createElemTextByVdom(vdom.children) : '')}
         </div>
    ${len == 0 ? "" : '<span class="hiddle">...</span>'}
   ${isDobuleTag ? `<span class=${len == 0 ? "foot-one" : "foot"}>${vdom.tag}</span>` : ''}
    </div>
    `

    return dom
}

function createElemTextByVdom(vdom: IVDomNode[]) {
    let strDom = ''
    vdom.forEach(item => {
        strDom += createElementByVdom(item)
    })
    return strDom
}


interface IProps {
    [key: string]: string
}

interface IVDomNode {
    tag?: string;
    props: IProps;
    children: IVDomNode[] | string
}

function deepKeyValue(nodes: any) {

    let obj: IVDomNode = {
        props: {},
        children: []
    }
    let tag = nodes.nodeName
    obj.tag = tag
    let props = nodes.getAttributeNames()
    if (tag === "text") {
        obj.children = nodes.innerHTML
    }

    props.forEach((item: string) => {
        obj.props[item] = nodes.getAttribute(item).trim()
    })
    if (props.indexOf("id") == -1) {
        let id = tag + "-" + parseInt((Math.random() * 10000).toString()).toString()
        nodes.setAttribute("id", id)
        obj.props["id"] = id
    }
    if (nodes.childNodes.length == 0) return obj
    let child = nodes.childNodes
    for (let i = 0; i < child.length; i++) {
        if (child[i].nodeType === 1 && svgType.indexOf(child[i].nodeName) > -1) {
            if (typeof obj.children !== "string") {
                obj.children.push(deepKeyValue(child[i]))
            }
        }
    }
    return obj
}

let circle = SvgUtils.createSVG(
    'circle',
    {
        cx: 100, cy: 50, r: 40, stroke: 'black',
        'stroke-width': 2, fill: 'red'
    });

function createSingleTips() {
    let instance: HTMLDivElement;
    let clear: number | null;
    return function (text: string) {
        if (instance) {
            clear && clearTimeout(clear)
            instance.innerHTML = `
                <div role="alert" class="el-notification right" style="top: 16px; z-index: 2027;">
					<div class="el-notification__group">
						<h2 class="el-notification__title">提示</h2>
						<div class="el-notification__content">
							<p>${text}</p></div>
						<div class="el-notification__closeBtn el-icon-close"></div>
					</div>
				</div>
                `
            instance.style.display = 'block'
        } else {
            instance = document.createElement("div");
            instance.id = "tips"
            instance.innerHTML = `
                <div role="alert" class="el-notification right" style="top: 16px; z-index: 2027;">
					<div class="el-notification__group">
						<h2 class="el-notification__title">提示</h2>
						<div class="el-notification__content">
							<p>${text}</p></div>
						<div class="el-notification__closeBtn el-icon-close"></div>
					</div>
				</div>
                `
            instance.style.display = 'block'
            document.body.appendChild(instance)
        }
        clear = setTimeout(() => {
            instance && (instance.style.display = 'none')
            clear && clearTimeout(clear)
            clear = null
        }, 5000)

    }

}

