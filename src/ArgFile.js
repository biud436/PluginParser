const fs = require('fs-extra');
const Color = require("./color");
const path = require("path");

/**
 * 파싱이 완료된 인자 값들을 JSON 파일로 출력합니다.
 *
 * @class ArgFile
 */
class ArgFile {
    constructor(pluginName, data) {
        this._name = pluginName;
        this._data = data;
    }

    create() {
        const data = JSON.stringify(this._data, null, "\t");
        const filepath = path.resolve("data", `${this._name}_arg.json`);
        console.log("output(arg) : %s%s%s", Color.BgRed, data, Color.Reset);
        if (!fs.existsSync( path.resolve("data") )) {
            fs.mkdirSync( path.resolve("data") );
        }        
        fs.writeFileSync(filepath, data, "utf8");
    }
}
exports.ArgFile = ArgFile;
