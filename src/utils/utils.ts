function getElementToPageLeft(el: any, key: string) {
    let offset = key == 'top' ? 'offsetTop' : 'offsetLeft'
    let actualTop = el[offset]
    let current = el.offsetParent
    while (current !== null) {
        actualTop += current[offset]
        current = current.offsetParent
    }
    return actualTop
}


interface Nullable {

}

let clientWidth = document.documentElement.clientWidth,
    clientHeight = document.documentElement.clientHeight;

 export default getElementToPageLeft
