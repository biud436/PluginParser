class LineWatcher {
    constructor() {
        this._startList = [];
        this._endList = [];
    }

    watch(line) {
        this._startList.push(line);
        const myLine = line.line;
        if(myLine.indexOf("~struct~") >= 0) {
            console.warn("~struct~ 이 포함되어있습니다.");
        }
    }

    end(line) {
        this._endList.push(line);
    }
}

module.exports = new LineWatcher();