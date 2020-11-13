import ClickEvent = JQuery.ClickEvent;
import $ from 'jquery'
import {getProps, SVG_TAG} from "../config";
import {svgInfo} from "../index";
import ContextMenuEvent = JQuery.ContextMenuEvent;
import {createPropsAndValue} from "../utils/utils";

class DomTree {
    /**
     * 上一个选择的标签
     * @private prev
     */
    private prev: JQuery | null = null;
    /**
     * 判断DOM区域是否选择dom
     */
    private selectDomFlag: boolean = false
    /**
     * 当前选择的标签
     * @private selectDom
     */
    private selectDom: JQuery | null = null

    constructor(private domView: any) {
        this.domView = domView
        this.bindIconClick()
        this.bindShowWrapClick()
        this.bindDomViewClick()
        this.bindDomViewContextmenu()
    }

    setPrev(prev: any): void {
        this.prev = prev
    }

    getPrev(): any {
        return this.prev
    }

    setSelectDom(selectDom: any): void {
        this.selectDom = selectDom
    }

    getSelectDom(): any {
        return this.selectDom
    }


    setSelectDomFlag(selectDomFlag: boolean): void {
        this.selectDomFlag = selectDomFlag
    }

    getSelectDomFlag(): boolean {
        return this.selectDomFlag
    }

    bindDomViewClick() {
        this.domView.on('click', this.domViewClickHandler)
    }

    bindDomViewContextmenu() {
        this.domView.on('contextmenu', '.show-wrapper', this.domViewContextmenuHandler)
    }

    bindIconClick() {
        this.domView.on('click', '.icon', this.iconClickHandler)
    }

    bindShowWrapClick() {
        this.domView.on('click', '.show-wrapper', this.showWrapClickHandler)
    }

    domViewContextmenuHandler = (event: ContextMenuEvent) => {
        event.preventDefault();
        event.stopPropagation();
        if (!this.selectDomFlag) return
        this.setSelectDom($(event.currentTarget))
        let _x = event.clientX,
            _y = event.clientY;
        let oMenu = $("#menu")
        oMenu.css({
            display: "block",
            left: _x + "px",
            top: _y + "px"
        })
    }

    domViewClickHandler = () => {
        if (this.getPrev() != null) {
            this.getPrev().removeClass("select-dom")
            this.setPrev(null)
        }
        let oMenu: JQuery = $("#menu")
        let menuChild: JQuery = $("#child-menu")
        if (oMenu.css("display") == "block") {
            oMenu.css({display: "none"})
        }
        menuChild.css({display: "none"})

        $("#rect-tip").css("display", "none");
        this.setSelectDom(null)
    }
    iconClickHandler = (event: ClickEvent) => {
        event.stopPropagation();
        let $target: JQuery = $(event.target)

        $target.parent().toggleClass("show-active")
        if ($target.hasClass("icon-xiajiantou")) {
            $target.removeClass("icon-xiajiantou")
            $target.addClass("icon-sanjiaoright")
        } else {
            $target.removeClass("icon-sanjiaoright")
            $target.addClass("icon-xiajiantou")
        }
    }
    showWrapClickHandler = (event: ClickEvent) => {
        event.stopImmediatePropagation()
        let target: JQuery = $(event.currentTarget)
        if (this.prev != null) {
            this.prev.toggleClass("select-dom")
        }
        target.toggleClass("select-dom")
        let uid: string = target.attr("data-uid") as string
        $(".add-container").css("display", "block");
        let addBtn: JQuery = $("#add-btn")
        addBtn.attr("data-uid", uid)
        addBtn.addClass("text-node")
        let selMark: JQuery = $("#" + uid)
        if (selMark[0]) {
            let propsArr: string[] = selMark.get(0).getAttributeNames()
            let tag: string = selMark.get(0).tagName
            let tagArr: string[] = [];
            if (target.hasClass("text-node")) {
                tagArr.push("content")

            } else {
                tagArr = Array.from(new Set(getProps(tag as SVG_TAG).concat(propsArr)))
            }
            //固定属性加特有属性

            let attrHtml = ''
            tagArr.forEach((item: string) => {
                if (item && item.trim() !== '') {
                    let value: string | undefined = selMark.attr(item) != null ? selMark.attr(item) : ""
                    value = value == undefined ? "" : value
                    value = item == "content" ? target.text() : value
                    let placeholder = selMark.attr(item) ? "请输入内容" : "未指定"
                    let inputId = uid + "_" + item
                    attrHtml += createPropsAndValue(item, value, uid, inputId, placeholder)
                }
            })
            $("#attr-wrap").html(attrHtml)
            let svg: JQuery = $("#graph-svg")
            let currentRect = selMark.get(0).getBoundingClientRect()
            let percentRect = svg.get(0).getBoundingClientRect()
            let x: number,
                y: number,
                setX: number,
                setY: number,
                dargX: number = 0,
                dargY: number = 0
            let viewBox: string | undefined = svg.attr("viewBox")
            let tmp: number[] = [0, 0, 0, 0];
            if (viewBox != null) {
                tmp = viewBox.split(',').map(Number)
                dargX = tmp[0]
                dargY = tmp[1]
            }


            let scale: number = Math.ceil(((svgInfo.getScale() - 1) * 100000)) / 100000
            let offsetX: number = currentRect.x - percentRect.x
            let offsetY: number = currentRect.y - percentRect.y
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
            let rectTip: JQuery = $("#rect-tip")
            rectTip.attr({
                x: offsetX - setX + dargX,
                y: offsetY - setY + dargY,
                width: width - x,
                height: height - y
            })
            rectTip.css("display", "block");
        }

        this.prev = target
        this.selectDomFlag = target.hasClass("select-dom")
        let oMenu: JQuery = $("#menu")
        if (oMenu.css("display") == "block") {
            oMenu.css({
                display: "none"
            })
        }
    }

}

export default DomTree;