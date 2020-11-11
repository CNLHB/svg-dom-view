import ClickEvent = JQuery.ClickEvent;
import $ from 'jquery'
import {getProps, SVG_TAG} from "../config";
import {svgInfo} from "../index";

class DomTree {
    private prev: any;
    private selectDomFlag: boolean = false
    private selectDom: any = null;

    constructor(private domView: any) {
        this.domView = domView
        this.bindIconClick()
        this.bindshowWrapClick()
        this.bindDomViewClick()
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
        this.domView.on('click', '.icon', this.domViewClickHandler)
    }

    bindIconClick() {
        this.domView.on('click', '.icon', this.iconClickHandler)
    }

    bindshowWrapClick() {
        this.domView.on('click', '.show-wrapper', this.showWrapClickHandler)
    }

    domViewClickHandler = (event: ClickEvent) => {
        if (this.getPrev() != null) {
            this.getPrev().removeClass("select-dom")
            this.setPrev(null)
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
        this.setSelectDom(null)
    }
    iconClickHandler = (event: ClickEvent) => {
        event.stopPropagation();
        let $target = $(event.target)
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
        let target = $(event.currentTarget)
        event.stopImmediatePropagation()
        if (this.prev != null) {
            this.prev.toggleClass("select-dom")
        }
        target.toggleClass("select-dom")
        let uid: string = target.attr("data-uid") as string
        $("#add-btn").attr("data-uid", uid)
        let selMark = $("#" + uid)
        if (selMark[0]) {
            let propsArr = selMark.get(0).getAttributeNames()
            let tag: string = selMark.get(0).tagName
            //固定属性加特有属性
            let tagArr: string[] = Array.from(new Set(getProps(tag as SVG_TAG).concat(propsArr)))
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

        this.prev = target
        if (this.prev != null && this.prev.hasClass("select-dom")) {
            this.selectDomFlag = true
        } else {
            this.selectDomFlag = false
        }
        let oMenu = $("#menu")
        if (oMenu.css("display") == "block") {
            oMenu.css({
                display: "none"
            })
        }
    }

}

export default DomTree;