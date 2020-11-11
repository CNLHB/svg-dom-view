import SvgUtils from './utils/createSVG'
import $ from 'jquery'
import SvgInfo from "./js/svgInfo";
import EditArea from "./js/editArea";
import {getProps, SVG_TAG, checkInter} from './config'
import {doubleTag} from './utils/utils'
import {singleTip} from "./js/singleTip";
import DomTree from './js/domTree'

let editArea: EditArea = new EditArea($('#edit'))
export let svgInfo: SvgInfo = new SvgInfo($('#graph').width() || 500, $('#graph').height() || 500, $('#graph-svg'))
let isChildTag: string[] = ["svg", 'g', 'text']
let domTree: DomTree = new DomTree($("#dom-view"))




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


let copyNode: any;
$("#menu").on('click', "li", function (event) {
    event.stopPropagation();
    let target = $(event.currentTarget);
    let type = target.attr("data-type")
    let oMenu = $("#menu")
    let cloneSvg: any;
    let selectSvg: any;
    if (type !== "paste-node" && type?.startsWith("paste")) {
        let copyUId = domTree.getSelectDom().attr("data-uid")
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
            domTree.getSelectDom().remove()
            oMenu.css({
                display: "none"
            })
            singleTip("删除节点成功")
            break;
        case "copy-node":
            oMenu.css({
                display: "none"
            })
            let uid = domTree.getSelectDom().attr("data-uid")
            if (uid) {
                let tag = uid.split("-")[0]
                if (tag == "svg" || domTree.getSelectDom()[0].tagName == "g") {
                    singleTip("所选内容不是节点")
                    return copyNode = null
                }
            }
            copyNode = domTree.getSelectDom().clone(true);
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
            domTree.getSelectDom().after(copyNode)
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
                domTree.getSelectDom().append(copyNode)
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


