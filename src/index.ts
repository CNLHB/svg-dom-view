import SvgUtils from './utils/createSVG'
import $ from 'jquery'
import validateXML from "./utils/checkXML";
import SvgInfo from "./js/svgInfo";
import EditArea from "./js/editArea";
import {getProps, SVG_TAG, checkInter} from './config'
import {createSingleTips, createElementByVdom, svgType, deepKeyValue, doubleTag} from './utils/utils'
import {singleTip} from "./js/singleTip";

let isChildTag: string[] = ["svg", 'g', 'text']
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
let prev: HTMLDivElement | null = null
let selectDomFlag: boolean = false
let editArea = new EditArea($('#edit'))
export let svgInfo = new SvgInfo($('#graph').width() || 500, $('#graph').height() || 500)
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
        console.log(selMark[0])
        let percentRect = $("#graph-svg")[0].getBoundingClientRect()
        let x: number = 0
        let y: number = 0
        let setX: number = 0
        let setY: number = 0
        let scale = Math.ceil(((svgInfo.getScale() - 1) * 1000)) / 1000
        let offsetX = currentRect.x - percentRect.x
        let offsetY = currentRect.y - percentRect.y
        //放大
        if (scale > 0) {
            x = scale * (currentRect.width / (1 + scale))
            y = scale * (currentRect.height / (1 + scale))
            setX = scale * (offsetX / (1 + scale))
            setY = scale * (offsetY / (1 + scale))
        } else {
            //缩小
            x = scale * (currentRect.width / (1 - Math.abs(scale)))
            y = scale * (currentRect.height / (1 - Math.abs(scale)))
            setX = scale * (offsetX / (1 - Math.abs(scale)))
            setY = scale * (offsetY / (1 - Math.abs(scale)))
        }
        let width = currentRect.width
        let height = currentRect.height

        $("#rect-tip").attr({
            x: offsetX - setX,
            y: offsetY - setY,
            width: width - x,
            height: height - y
        })
        $("#rect-tip").css("display", "block");
    }

    prev = target
    if (prev != null && prev.classList.contains("select-dom")) {
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
    let uid = $(this).attr("data-uid")
    let props = $("#add-props").val() as string
    let propsValue = $("#add-value").val() as string
    if (!uid) {
        singleTip("所选内容为空", "error")
        return
    }
    if (!props || !propsValue) {
        singleTip("属性名或属性值为空", "error")
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
    let menuChild = $("#child-menu")
    if (oMenu.css("display") == "block") {
        oMenu.css({
            display: "none"
        })
    }
    menuChild.css({
        display: "none"
    })
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
    let cloneSvg: any;
    let selectSvg: any;
    if (type !== "paste-node" && type?.startsWith("paste")) {
        let copyUId = selectDom.attr("data-uid")
        let id = copyUId + Math.ceil(Math.random() * 1000)
        selectSvg = $("#" + copyUId)
        cloneSvg = selectSvg.clone(true);
        cloneSvg.attr("id", id)
        copyNode.attr("data-uid", id)
        copyNode.attr("id", "dom-" + id)
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
            oMenu.css("display", "none");
            singleTip("粘贴节点成功")
            break;
        case "paste-before":
            //之前
            singleTip("粘贴节点成功")
            $("#child-menu").css("display", "none");
            oMenu.css("display", "none");
            break;
        case "paste-child":
            $("#child-menu").css("display", "none");
            oMenu.css("display", "none");
            let tag = selectSvg.get(0).tagName;
            if (doubleTag.indexOf(tag) !== -1) {
                selectSvg.append(cloneSvg)
                selectDom.append(copyNode)
                singleTip("粘贴节点成功")
            } else {
                singleTip("所选节点没有子节点", "error")
            }

            break;
    }
    console.log(type)

})


let circle = SvgUtils.createSVG(
    'circle',
    {
        cx: 100, cy: 50, r: 40, stroke: 'black',
        'stroke-width': 2, fill: 'red'
    });


