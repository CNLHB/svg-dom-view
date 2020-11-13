import ClickEvent = JQuery.ClickEvent;
import $ from "jquery";
import {singleTip} from "./singleTip";
import {doubleTag} from "../utils/utils";
import {domTree} from '../index'

/**
 * 创建dom Tree menu
 */
class SelMenu {
    private copyNode: JQuery<HTMLElement> | null = null;

    constructor(public menu: JQuery) {
        this.menu = menu;
        this.bindMenuClick()
    }

    bindMenuClick() {
        this.menu.on('click', "li", this.menuClickHandler)
    }

    menuClickHandler = (event: ClickEvent) => {
        event.stopPropagation();
        let target = $(event.currentTarget);
        let type = target.attr("data-type")
        let oMenu: JQuery = $("#menu")
        let cloneSvg: JQuery = $();
        let selectSvg: JQuery = $();
        if (type !== "paste-node" && type?.startsWith("paste")) {
            let copyUId = domTree.getSelectDom().attr("data-uid")
            let id = copyUId + Math.ceil(Math.random() * 1000)
            selectSvg = $("#" + copyUId)
            if (selectSvg.get(0).tagName == 'text') {
                selectSvg.html(selectSvg.html() + `
                ${selectSvg.html()}
                `)
            } else {
                cloneSvg = selectSvg.clone(true);
                cloneSvg.attr("id", id)
            }
            if (this.copyNode!=null){
                this.copyNode.attr("data-uid", id)
                this.copyNode.attr("id", "dom-" + id)
                this.copyNode.removeClass("select-dom")
            }

        }

        switch (type) {
            case "remove-node":
                domTree.getSelectDom().remove()
                $("#" + domTree.getSelectDom().attr("data-uid")).remove()
                $("#svg-tip").remove()
                $("#rect-tip").remove()

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
                        singleTip("所选内容不是节点", "error")
                        return this.copyNode = null
                    }
                }
                this.copyNode = domTree.getSelectDom().clone(true);
                singleTip("复制节点成功")
                break;
            case "paste-node":
                if (!this.copyNode) return singleTip("没有复制内容", "error")
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
                domTree.getSelectDom().after(this.copyNode)
                $("#child-menu").css("display", "none");
                oMenu.css("display", "none");
                singleTip("粘贴节点成功")
                break;
            case "paste-before":
                //之前
                selectSvg.before(cloneSvg)
                domTree.getSelectDom().before(this.copyNode)
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
                    domTree.getSelectDom().append(this.copyNode)
                    singleTip("粘贴节点成功")
                } else {
                    singleTip("所选节点没有子节点", "error")
                }

                break;
        }
        console.log(type)
    }

}

export default SelMenu
