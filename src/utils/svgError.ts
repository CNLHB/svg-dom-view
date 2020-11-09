
export default class SvgError{
    constructor(private line: string, private col:string,private msg:string){
        this.line = line;
        this.col = col;
        this.msg = msg;
    }
    setCol(col:string){
        this.col = col;
    }
    getCol(){
        return this.col
    }
    setLine(line:string){
        this.line = line;
    }
    getLine(){
        return this.line
    }
    setMsg(msg:string){
        this.msg = msg;
    }
    getMsg(){
        return this.msg
    }
}