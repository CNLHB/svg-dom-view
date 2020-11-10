import SvgUtils from './utils/createSVG'
import $ from 'jquery'
import validateXML from "./utils/checkXML";
import SvgInfo from "./utils/svgInfo";
import {getProps, SVG_TAG, checkInter} from './config'
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
    let uid: string = target.getAttribute("data-uid")
    $("#add-btn").attr("data-uid", uid)
    let selMark = $("#" + uid)

    if (selMark[0]) {
        let propsArr = selMark.get(0).getAttributeNames()
        let tag = selMark.get(0).tagName
        //固定属性加特有属性
        let tagArr = Array.from(new Set(getProps(tag as SVG_TAG).concat(propsArr)))
        let attrHtml = ''
        tagArr.forEach((item: string) => {
            if (item.trim() !== '') {
                let value = selMark.attr(item) ? selMark.attr(item) : ""
                let placeholder = selMark.attr(item) ? "请输入内容" : "未指定"
                let inputId = uid + "_" + item
                attrHtml += `
                    <div class="aiwa-input aiwa-input-group aiwa-input-group--prepend">
                        <div class="aiwa-input-group__prepend">${item}</div>
                        <input type="text" ${item == "id" ? "disabled" : ""} value='${value}' data-uid=${uid} id=${inputId} autocomplete="off"
                         placeholder=${placeholder} class="aiwa-input__inner">
                    </div>
                `
            }

        })
        $("#attr-wrap").html(attrHtml)
        let currentRect = selMark[0].getBoundingClientRect()
        let percentRect = $("#graph-svg")[0].getBoundingClientRect()
        $("#rect-tip").attr({
            x: currentRect.x - percentRect.x,
            y: currentRect.y - percentRect.y,
            width: currentRect.width,
            height: currentRect.height
        })
        $("#rect-tip").css("display", "block");
    }

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
$("#add-btn").on('click', function (event) {
    console.log()
    let uid = $(this).attr("data-uid")
    let props = $("#add-props").val() as string
    let propsValue = $("#add-value").val() as string
    if (!props || !propsValue) {
        singleTip("属性名或属性值为空")
        return
    }
    let domGraph = $("#" + uid)
    let tag = domGraph.get(0).tagName
    let propsArr = domGraph.get(0).getAttributeNames()
    let tagArr = Array.from(new Set(getProps(tag as SVG_TAG).concat(propsArr)))
    if (tagArr.indexOf(props) !== -1) {
        singleTip("属性名不能重复")
        return
    }
    domGraph.attr(props, propsValue)
    let domView = $("#dom-" + uid)
    let propsWrap = domView.children(".head-wrap")
        .children(".props-wrap")
    let nameProps = propsWrap.children(".wrap-" + props)
    if (propsValue == '' && nameProps.length !== 0) {
        return nameProps.remove()
    }
    if (nameProps.length === 0) {
        propsWrap.append(`<span class="wrap-${props}"><span class="props name-${props}">${props}</span>=<span class="props-value">${propsValue}</span></span>`)
    } else {
        nameProps.children(".name-" + props).next().text(propsValue)
    }
    let inputId = uid + "_" + props
    let attrHtml = `
                    <div class="aiwa-input aiwa-input-group aiwa-input-group--prepend">
                        <div class="aiwa-input-group__prepend">${props}</div>
                        <input type="text"  value='${propsValue}' data-uid=${uid} id=${inputId} autocomplete="off"
                         placeholder='请输入内容' class="aiwa-input__inner">
                        <div class="delete-attr delete-btn" data-uid=${inputId}>删除</div>
                    </div>
                `
    $("#attr-wrap").append(attrHtml)

})
$("#attr-wrap").on("click", ".delete-btn", function (event) {
    let $target = $(event.target)
    let uid = $target.attr("data-uid")
    if (uid != null) {
        let id_attrName = uid.split("_")
        let id = id_attrName[0]
        let attrName = id_attrName[1]
        let domGraph = $("#" + id)
        domGraph.removeAttr(attrName)
        let domView = $("#dom-" + id)
        let propsWrap = domView.children(".head-wrap")
            .children(".props-wrap")
        let nameProps = propsWrap.children(".wrap-" + attrName)
        if (nameProps.length !== 0) {
            nameProps.remove()
        }
    }
    $target.parent().remove()
})


$("#attr-wrap").on("input", "input", function (event) {
    let target = $(event.target)
    let id = target.attr('id')
    let propsValue: string = target.val() as string
    if (id != null) {
        let uid = id.split('_')
        if (uid[1] && !checkInter(uid[1], propsValue)) {
            singleTip("请输入有效的数值")
            return
        }
        let domGraph = $("#" + uid[0])
        console.log(domGraph)
        if (target.val()) {
            domGraph.attr(uid[1], propsValue)
        } else {
            domGraph.removeAttr(uid[1])
        }
        let domView = $("#dom-" + uid[0])
        let propsWrap = domView.children(".head-wrap")
            .children(".props-wrap")
        let nameProps = propsWrap.children(".wrap-" + uid[1])
        if (propsValue == '' && nameProps.length !== 0) {
            return nameProps.remove()
        }
        if (nameProps.length === 0) {
            propsWrap.append(`<span class="wrap-${uid[1]}"><span class="props name-${uid[1]}">${uid[1]}</span>=<span class="props-value">${propsValue}</span></span>`)
        } else {
            nameProps.children(".name-" + uid[1]).next().text(propsValue)
        }
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
    }
    $("#rect-tip").css("display", "none");
    selectDom = null
})
let selectDom: any = null;
$("#dom-show").on('contextmenu ', '.show-wrapper', function (event) {
    event.preventDefault();
    event.stopPropagation();
    if (!selectDomFlag) return
    selectDom = $(event.currentTarget)
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
    let type = target.attr("data-type")
    let oMenu = $("#menu")
    let cloneSvg:any;
    let selectSvg:any;
    if(type !== "paste-node"&&type?.startsWith("paste")){
        let copyUId = selectDom.attr("data-uid")
        let id = copyUId + Math.ceil(Math.random()*1000)
        selectSvg = $("#" + copyUId)
        cloneSvg = selectSvg.clone(true);
        cloneSvg.attr("id", id)
        copyNode.attr("data-uid", id)
        // copyNode.attr("id",id)
        copyNode.removeClass("select-dom")
    }
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
            let uid = selectDom.attr("data-uid")
            if (uid) {
                let tag = uid.split("-")[0]
                if (tag == "svg" || selectDom[0].tagName == "g") {
                    singleTip("所选内容不是节点")
                    return copyNode = null
                }
            }
            copyNode = selectDom.clone(true);
            singleTip("复制节点成功")
            break;
        case "paste-node":
            if (!copyNode) return singleTip("没有复制内容")
            $("#child-menu").css("display", "block");

            break;
        case "copy-svg":
            oMenu.css({
                display: "none"
            })
            singleTip("复制SVG成功")
            break;
        case "paste-after":
            selectSvg.after(cloneSvg)
            selectDom.after(copyNode)
            $("#child-menu").css("display", "none");
            oMenu.css({
                display: "none"
            })
            singleTip("粘贴节点成功")
            break;
        case "paste-before":
            //之前
            selectSvg.before(cloneSvg)
            selectDom.before(copyNode)
            singleTip("粘贴节点成功")
            $("#child-menu").css("display", "none");
            oMenu.css({
                display: "none"
            })
            break;
        case "paste-child":
            $("#child-menu").css("display", "none");
            oMenu.css({
                display: "none"
            })
            let tag = selectSvg.get(0).tagName;

            console.log(selectSvg);
            // selectSvg.append(cloneSvg)
            // selectDom.append(copyNode)
            singleTip("粘贴节点成功")
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

function keyupChangeHandler(event: Event) {
    if (event.target) {
        editText = (event.target as HTMLDivElement).innerText.trim()
        editHtml = (event.target as HTMLDivElement).innerHTML
    }
    let svgArr = editText.match(matchSvgTag) == null ? [] : editText.match(matchSvgTag)
    let svgArrTag = editText.match(matchSvg) == null ? [] : editText.match(matchSvg)
    let tagNameArr = editText.match(checkSvgTag)
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
    $(svgInfo.svg).html(fragment)
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
        if (item[0] !== "data-uid" && item[0].trim()) {
            str += `<span class="wrap-${item[0]}"><span class="props name-${item[0]}">${item[0]}</span>=<span class="props-value">${item[1]}</span></span>`
        }
    })
    let isShriColumn = false;
    var dom = `
    <div  data-uid=${vdom.props['data-uid']} id=${"dom-" + vdom.props['data-uid']} class="show-wrapper">
    ${len === 0 ? "" : '<icon  class="icon iconfont icon-sanjiaoright"></icon>'}
    <span class='${isDobuleTag ? "double-head" : "head"} head-wrap'>${vdom.tag}<span class="props-wrap">${str}</span>
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
        if (item.trim() !== '') {
            obj.props[item] = nodes.getAttribute(item).trim()
        }
    })
    if (props.indexOf("id") == -1) {
        let id = tag + "-" + parseInt((Math.random() * 10000).toString()).toString()
        nodes.setAttribute("id", id)
        obj.props["data-uid"] = id
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

