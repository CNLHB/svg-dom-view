import $ from "jquery";
import {singleTip} from "./singleTip";
import {getProps, SVG_TAG} from "../config";
import ClickEvent = JQuery.ClickEvent;
import {createPropsAndValue} from "../utils/utils";

/**
 * 添加属性按钮
 */
class AddBtn {

    constructor(public addBtn: JQuery) {
        this.addBtn = addBtn
        this.bindAddBtnClick()
    }

    bindAddBtnClick() {
        this.addBtn.on('click', this.addBtnClickHandler)
    }

    addBtnClickHandler = (event: ClickEvent) => {
        let uid: string | undefined = $(event.currentTarget).attr("data-uid")
        let props: string = $("#add-props").val() as string
        let propsValue: string = $("#add-value").val() as string

        if (!uid) {
            singleTip("所选内容为空", "error")
            return
        }
        if (!props || !propsValue) {
            singleTip("属性名或属性值为空", "error")
            return
        }
        // if ($(event.currentTarget).hasClass("text-node")) {
        //     singleTip("文本节点不能添加属性", "error")
        //     return
        // }
        let domGraph: JQuery = $("#" + uid)
        let tag: string = domGraph.get(0).tagName
        let propsArr: string[] = domGraph.get(0).getAttributeNames()
        let tagArr: string[] = Array.from(new Set(getProps(tag as SVG_TAG).concat(propsArr)))
        if (tagArr.indexOf(props) !== -1) {
            singleTip("属性名不能重复")
            return
        }
        domGraph.attr(props, propsValue)
        let domView: JQuery = $("#dom-" + uid)
        let propsWrap: JQuery = domView.children(".head-wrap")
            .children(".props-wrap")
        let nameProps: JQuery = propsWrap.children(".wrap-" + props)
        if (propsValue == '' && nameProps.length !== 0) {
            return nameProps.remove()
        }
        if (nameProps.length === 0) {
            propsWrap.append(`<span class="wrap-${props}"><span class="props name-${props}">${props}</span>=<span class="props-value">${propsValue}</span></span>`)
        } else {
            nameProps.children(".name-" + props).next().text(propsValue)
        }
        let inputId: string = uid + "_" + props
        let attrHtml: string = createPropsAndValue(props, propsValue, uid, inputId)

        $("#attr-wrap").append(attrHtml)

    }
}

export default AddBtn