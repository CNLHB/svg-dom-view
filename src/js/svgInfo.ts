import $ from 'jquery'
import MouseMoveEvent = JQuery.MouseMoveEvent;
import MouseDownEvent = JQuery.MouseDownEvent;

/**
 * 创建图形区域
 */
class SvgInfo {
    private readonly width: number;
    private readonly height: number;
    private scrollIndex: number = 0
    private scrollPower: number = 0.25
    private scale: number = 1
    private viewBox: string = "0,0,"
    private startX: number = 0
    private startY: number = 0

    constructor(width: number, height: number, public svg: JQuery) {
        this.width = width;
        this.height = height;
        this.svg = svg;
        this.svg.attr({
            width, height
        });
        this.bindMousewheel()
        this.bindMouseup()
        this.bindMousedown()

    }

    setScale(scale: number) {
        this.scale = scale
    }

    getScale(): number {
        return this.scale
    }


    updateSVG(type: string) {
        //放大
        if (type === 'magnify') {
            if (this.scrollIndex <= -3) {
                console.log("max")
                return
            }
            this.scrollIndex = Number(this.scrollIndex) - 1
        }
        //缩小
        if (type === 'shrink') {
            if (this.scrollIndex >= 8) {
                console.log("min")
                return
            }
            this.scrollIndex = Number(this.scrollIndex) + 1
        }
        let width = this.width * this.scrollIndex * this.scrollPower
        let height = this.height * this.scrollIndex * this.scrollPower
        if (this.scrollIndex === 0) {
            console.log("画图复原")
            this.setScale(1)
            this.svg.removeAttr("viewBox")
            return
        }
        let viewBox: string;
        let tmp: number[] = [0, 0, 0, 0];
        let str: string | undefined = this.svg.attr("viewBox")
        if (str != null) {
            tmp = str.split(',').map(Number)
            viewBox = `${tmp[0]},${tmp[1]},`
        } else {
            viewBox = this.viewBox
        }
        let w: string = (Number(this.svg.width()) + width).toFixed(6)
        let h: string = (Number(this.svg.height()) + height).toFixed(6)
        let scale: number = Number((Number(this.svg.width()) / Number(w)).toFixed(2))
        this.setScale(scale)
        this.svg.attr("viewBox", `${viewBox}${w}, ${h}`)
    }

    /**
     * 在图形区绑定鼠标滚轮事件
     */
    bindMousewheel(): void {
        //DOMMouseScroll
        this.svg.on('mousewheel', (event: any): void => {
            if (event.originalEvent != null) {
                if (event.originalEvent.wheelDelta > 0) {
                    this.updateSVG("shrink")
                } else {
                    //放大
                    this.updateSVG("magnify")
                }
            }
        })
    }

    /**
     * 在document绑定鼠标抬起事件
     */
    bindMouseup(): void {
        $(document).on('mouseup', this.mouseupHandler)
    }

    /**
     * 在图形区绑定绑定鼠标按下事件
     */
    bindMousedown(): void {
        this.svg.on('mousedown', this.mousedownHandler)
    }

    /**
     * 鼠标按下事件处理函数
     */
    mousedownHandler = (event: MouseDownEvent): void => {
        this.startX = event.pageX
        this.startY = event.pageY
        $(document).on('mousemove', this.mousemoveHandler)
    }
    /**
     * 鼠标抬起事件处理函数
     */
    mouseupHandler = (): void => {
        $(document).off('mousemove')
    }

    mousemoveHandler = (event: MouseMoveEvent) => {
        let translateX: number = event.pageX - this.startX
        let translateY: number = event.pageY - this.startY
        let str: string | undefined = this.svg.attr("viewBox")
        let tmp: number[] = [0, 0, 0, 0];
        if (str != null) {
            tmp = str.split(',').map(Number)
        }
        if (this.scrollIndex >= 0) {
            console.log('已经是画布完成区域')
        } else {
            let x = (tmp[0] - translateX)
            let y = (tmp[1] - translateY)
            tmp[0] = x > tmp[3] ? tmp[3] : x
            tmp[1] = y > tmp[4] ? tmp[4] : y
            this.svg.attr("viewBox", tmp.join(","))
        }
        this.startX = event.pageX
        this.startY = event.pageY
    }
}


export default SvgInfo