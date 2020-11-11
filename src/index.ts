import SvgUtils from './utils/createSVG'
import $ from 'jquery'
import SvgInfo from "./js/svgInfo";
import EditArea from "./js/editArea";
import DomTree from './js/domTree'
import SelMenu from './js/selMenu'
import AtrrArea from "./js/attrArea";
import AddBtn from "./js/addBtn";
export let svgInfo: SvgInfo = new SvgInfo($('#graph').width() || 500, $('#graph').height() || 500, $('#graph-svg'))
export let domTree: DomTree = new DomTree($("#dom-view"))
let isChildTag: string[] = ["svg", 'g', 'text']
let editArea: EditArea = new EditArea($('#edit'))
let selMenu: SelMenu = new SelMenu($("#dom-view"))
let atrrArea: AtrrArea = new AtrrArea($("#attr-wrap"))
let addBtn: AddBtn = new AddBtn($("#add-btn"))




let circle = SvgUtils.createSVG(
    'circle',
    {
        cx: 100, cy: 50, r: 40, stroke: 'black',
        'stroke-width': 2, fill: 'red'
    });


