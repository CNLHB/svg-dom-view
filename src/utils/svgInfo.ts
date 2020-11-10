import $ from 'jquery'
import MouseMoveEvent = JQuery.MouseMoveEvent;


export default class SvgInfo {
    // public svg: SVGElement = document.querySelector('#graph') as SVGElement;
    public svg: SVGElement = document.querySelector('#graph-svg') as SVGElement;
    public clientWidth = document.documentElement.clientWidth
    public clientHeight = document.documentElement.clientHeight
    public scrollIndex: number = 0
    public scrollPower: number = 0.25
    public widthScale: number = 1
    public heightScale: number = 1
    public viewBox: string = "0, 0, "
    public offsetLeft: number = 0
    public offsetTop: number = 0
    public startX: number = 0
    public startY: number = 0

    constructor(public width: number, public heigth: number) {
        this.width = width;
        this.heigth = heigth;
        this.widthScale = this.clientWidth / width;
        this.heightScale = this.clientHeight / heigth;
        // @ts-ignore
        this.offsetLeft = $('#graph-svg') && $('#graph-svg').offset().left;
        // @ts-ignore
        this.offsetTop = $('#graph-svg') && $('#graph-svg').offset().top;

        this.bindMousewheel()
        this.bindMouseup()
        this.bindMousedown()

    }

    setWidthScale(widthScale: number) {
        this.widthScale = widthScale
    }

    setHeightScale(heightScale: number) {
        this.heightScale = heightScale;
    }

    updateSVG(type: string) {
        //放大
        if (type === 'magnify') {
            this.scrollIndex >= 3 ? 3 : this.scrollIndex++
        }
        //缩小
        if (type === 'shrink') {
            this.scrollIndex <= -4 ? -4 : this.scrollIndex--
        }
        let scale = this.widthScale / this.heightScale
        let width = this.width * this.scrollIndex * this.scrollPower
        let heigth = this.heigth * this.scrollIndex * this.scrollPower
        this.svg.setAttribute("viewBox",
            `${this.viewBox}${Math.round(this.width - width)}, ${Math.round(this.heigth - heigth)}`)
        width > 0 ? this.svg.setAttribute("width", width.toString()) : ""
        heigth > 0 ? this.svg.setAttribute("heigth", heigth.toString()) : ""
    }

    bindMousewheel() {
        $(this.svg).on('mousewheel DOMMouseScroll', (event) => {
            if (event.originalEvent != null) {
                // @ts-ignore
                if (event.originalEvent.wheelDelta > 0) {
                    console.log("放小")
                    this.updateSVG("shrink")
                } else {
                    //放大
                    console.log("放大")
                    this.updateSVG("magnify")
                }

            }
        })
    }

    bindMouseup() {
        $(document).on('mouseup', this.mouseupHandler)
    }

    bindMousedown() {
        $(this.svg).on('mousedown', this.mousedownHandler)
    }

    mousedownHandler = (event: any) => {
        this.startX = event.pageX
        this.startY = event.pageY
        let target = event.target as any
        let offset = $(target).offset()
        $(document).on('mousemove', (event: MouseMoveEvent) => {
            let translateX = event.pageX - this.startX
            let translateY = event.pageY - this.startY

            let str = this.svg.getAttribute("viewBox")
            let tmp: number[] = [0, 0, 0, 0];
            if (str !== null) {
                tmp = str.split(',').map(Number)
            }
            if (this.scrollIndex <= 0) {
                console.log('已经是画布完成区域')

            } else {
                tmp[0] = (tmp[0] - translateX) > tmp[3] ? tmp[3] : (tmp[0] - translateX)
                tmp[1] = (tmp[1] - translateY) > tmp[4] ? tmp[4] : (tmp[1] - translateY)
                // tmp[0] < 0 ? tmp[0] = 0 : ""
                // tmp[1] < 0 ? tmp[1] = 0 : ""
                this.svg.setAttribute("viewBox", tmp.join(","))

            }
            this.startX = event.pageX
            this.startY = event.pageY

            // this.svg.setAttribute("viewBox", `1`)
            // this.startX = event.pageX
            // this.startY = event.pageY


            // let str = this.svg.getAttribute("transform")
            // let tmp: number[] = [0, 0];
            // if (str !== null) {
            //     tmp = str.split('(')[1].split(')')[0].split(',').map(Number)
            // }
            // this.svg.setAttribute("transform", `translate(${tmp[0] + translateX},${tmp[1] + translateY})`)
            // this.startX = event.pageX
            // this.startY = event.pageY
        })
    }

    mouseupHandler = (event: any) => {
        let offsetX = event.pageX
        let offsetY = event.pageY
        let target = event.target as any
        let offset = $(target).offset()

        $(document).off('mousemove')
    }

    mousemoveHandler = (event: any) => {
        console.log('move')
    }
}
