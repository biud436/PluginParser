/**
 * 플러그인 주석 값을 획득하는 기능을 가집니다.
 * At Sigh 토큰(@)이 머릿말에 있을 경우에만 값을 가지고 올 수 있습니다.
 *
 * @parent String
 * @class Parser
 */
class Parser extends String {
    constructor(str) {
        super(str);
        this._data = this.splitOnLast("@");

        const item = this._data.split(" ");
        try {
            this._type = item[0];
            this._name = item[1];
            this._desc = item.slice(1).join(" ");
                        
        } catch {
            this._type = "";
            this._name = "";
            this._desc = "";
        }



    }

    splitOnLast(e) {
        let t = this.lastIndexOf(e) + 1;
        return 0 > t ? this : this.substr(t);
    }

    get type() {
        return this._type;
    }

    /**
     * 공백이 포함되지 않는 이름 값입니다.
     */
    get name() {
        return this._name;
    }

    /**
     * 공백(white-space)까지 포함된 문자열 값입니다.
     */
    get desc() {
        return this._desc;
    }

    toJson() {
        const { _type, _name, _desc } = this;
        return {
            name: _name,
            type: _type,
            desc: _desc
        };
    }

    /**
     * @param {String} line
     * @return {Parser|null}
     */
    static parse(line) {
        if (line.trim().includes("@")) {
            return new Parser(line);
        }
    }

    /**
     * @param {String} line
     * @return {Parser} parser
     */
    static ready(line) {
        return new Parser(line);
    }
}
exports.Parser = Parser;
