const fs = require('fs-extra');
const Color = require("./Color");
const path = require("path");

/**
 * 매개변수 값을 JSON 파일로 출력합니다.
 *
 * @class ParamFile
 */
class ParamFile {
    /**
     *
     * @param {String} pluginName
     * @param {{
        lastKey: "",
        lastValue: "",
        data : {},
        name: "",
        description: "",
    }} data
     */
    constructor(pluginName, data) {
        this._name = pluginName;
        this._data = data;
    }

    create() {
        const data = JSON.stringify(this._data);
        const filepath = path.resolve("data", `${this._name}_param.json`);
        console.log("output(param) : %s%s%s", Color.BgRed, data, Color.Reset);
        if (!fs.existsSync( path.resolve("data") )) {
            fs.mkdirSync( path.resolve("data") );
        }
        fs.writeFileSync(filepath, JSON.stringify(this._data), "utf8");
    }
}
exports.ParamFile = ParamFile;
