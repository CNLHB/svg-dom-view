import $ from "jquery";
import ClickEvent = JQuery.ClickEvent;
import {checkInter} from "../config";
import {singleTip} from "./singleTip";

/**
 * 属性区域
 */
class AttrArea {
    private cacheText: string = ''
    private cacheId: string = ''

    constructor(public attrArea: any) {
        this.attrArea = attrArea
        this.bindDeleteBtnClick()
        this.bindInputChange()
    }

    bindDeleteBtnClick() {
        this.attrArea.on('click', '.delete-btn', this.deleteBtnClickHandler)
    }

    bindInputChange() {
        this.attrArea.on('input', 'input', this.inputChangeHandler)
    }

    inputChangeHandler = (event: ClickEvent) => {
        let target: JQuery = $(event.target)
        let id: string | undefined = target.attr('id')
        let propsValue: string = (target.val() as string).trim()

        if (id != null) {
            let uid = id.split('_')
            if (propsValue.length==0){
                this.cacheText = ''
                return
            }
            console.log()
            if (uid[1] && !checkInter(uid[1], propsValue)) {
                singleTip("请输入有效的数值", "error")
                target.val(this.cacheId === id  ? this.cacheText : "")
                this.cacheId = id
                return
            }
            if (uid[1] == "content") {
                $("#dom-" + uid[0]).children(".text-node").text(propsValue)
                $("#" + uid[0]).html(propsValue)
                this.cacheText = propsValue
                return
            }

            let domGraph: JQuery = $("#" + uid[0])
            // console.log(domGraph)
            if (target.val()) {
                domGraph.attr(uid[1], propsValue)
            } else {
                domGraph.removeAttr(uid[1])
            }
            let domView: JQuery = $("#dom-" + uid[0])
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
            this.cacheText = propsValue
            this.cacheId = id
        }
    }
    deleteBtnClickHandler = (event: ClickEvent) => {
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
    }
}

export default AttrArea