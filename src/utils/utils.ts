/**
 * 提醒框类型
 */
type TipType = "error" | "success" | "warning" | "default"
/**
 * 定义svg需闭合标签
 */
export let doubleTag: string[] = ["svg", "g", "text"]
/**
 * 定义svg标签
 */
export let svgType: string[] = ["svg", "g", "path", "text", "line", "rect", "ellipse", "circle", "polyline", "polygon"]

export interface IProps {
    [key: string]: string
}

/**
 * 定义虚拟节点
 */
export interface IVDomNode {
    tag?: string;
    props: IProps;
    children: IVDomNode[] | string
}


function Nullable() {

}


export function createSingleTips() {
    let instance: HTMLDivElement;
    let clear: number | null;
    return function (text: string, type: TipType = "default") {
        let color: string = ""
        switch (type) {
            case "default":
                color = "#409eff"
                break;
            case "success":
                color = "#67c23a"
                break;
            case "error":
                color = "#f56c6c"
                break;
            case "warning":
                color = "#e6a23c"
                break;
        }
        if (instance) {
            clear && clearTimeout(clear)
            instance.innerHTML = `
                <div role="alert" class="el-notification right" style="top: 16px; z-index: 2027;">
					<div class="el-notification__group">
						<h2 class="el-notification__title">提示</h2>
						<div class="el-notification__content">
							<p style="color:${color};">${text}</p></div>
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
							<p style="color:${color};">${text}</p></div>
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

/**
 *
 * @param vdom
 * return domStr
 */
export function createElementByVdom(vdom: IVDomNode): string {
    let isText: boolean = typeof vdom.children === 'string'
    let len: number = vdom.children.length;

    if (!Array.isArray(vdom.children)) {
        if (vdom.children.replace(/\s*/gm, "").length == 0) {
            return ''
        }
    }
    let isDobuleTag: boolean = doubleTag.indexOf(vdom.tag as string) != -1
    let str = '';
    // @ts-ignore
    Object.entries(vdom.props).forEach((item: string[]) => {

        if (item[0] !== "data-uid" && item[0].trim()) {
            str += `<span class="wrap-${item[0]}"><span class="props name-${item[0]}">${item[0]}</span>=<span class="props-value">${item[1]}</span></span>`
        }
    })
    let dom = `
    <div  data-uid=${vdom.props['data-uid']} id=${"dom-" + vdom.props['data-uid']} class="show-wrapper">
    ${len === 0 ? "" : '<icon  class="icon iconfont icon-sanjiaoright"></icon>'}
    <span class='${isDobuleTag ? "double-head" : "head"} head-wrap'>${vdom.tag}<span class="props-wrap">${str}</span>
    </span>
     ${isText == true ? `<div data-uid=${vdom.props['data-uid']} class="text-node show-wrapper tree-children">${vdom.children}</div>` :
        (len > 0 ? `<div class="tree-children">${createElemTextByVdom(vdom.children as [])}</div>` : '')
    }
    ${len == 0 ? "" : '<span class="hiddle">...</span>'}
    ${isDobuleTag ? `<span class=${len == 0 ? "foot-one" : "foot"}>${vdom.tag}</span>` : ''}
    </div>
    `
    return dom
}

export function createElemTextByVdom(vdom: IVDomNode[]): string {
    let strDom = ''
    vdom.forEach(item => {
        strDom += createElementByVdom(item)
    })
    return strDom
}

export function createPropsAndValue(item: string, value: string, uid: string, inputId: string, placeholder: string = "请输入内容"): string {
    let attrHtml = `
                    <div class="aiwa-input aiwa-input-group aiwa-input-group--prepend">
                        <div class="aiwa-input-group__prepend">${item}</div>
                        <input type="text" ${item == "id" ? "disabled" : ""} value='${value}' data-uid=${uid} id=${inputId} autocomplete="off"
                         placeholder=${placeholder} class="aiwa-input__inner">
                    </div>
                `
    return attrHtml
}


export function deepKeyValue(nodes: any): IVDomNode {
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


