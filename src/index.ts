import $ from 'jquery'
import SvgInfo from "./js/svgInfo";
import EditArea from "./js/editArea";
import DomTree from './js/domTree'
import SelMenu from './js/selMenu'
import AttrArea from "./js/attrArea";
import AddBtn from "./js/addBtn";


export let svgInfo: SvgInfo = new SvgInfo($('#graph').width() || 500, $('#graph').height() || 500, $('#graph-svg'))
let domView: JQuery = $("#dom-view")
export let domTree: DomTree = new DomTree(domView)
let selMenu: SelMenu = new SelMenu(domView)
let editArea: EditArea = new EditArea($('#edit'))
export let attrArea: AttrArea = new AttrArea($("#attr-wrap"))
let addBtn: AddBtn = new AddBtn($("#add-btn"))




