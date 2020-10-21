const fs = require('fs-extra');
const path = require('path');
const readline = require('readline');
const { ArgFile } = require("./ArgFile");
const { ArgParams } = require("./ArgParams");
const Color = require("./color");
const { ParamFile } = require("./ParamFile");
const { Parser } = require("./Parser");
const { PluginParams } = require("./PluginParams");
const EventEmitter = require('events');

class App extends EventEmitter {

    constructor(args) {
        super();

        this._args = args;

        this._list = [];
        this._targetDir = "";
        this._isValid = false;

        this._commands = [];
        this._lastComment = "";
        this._lastCommand = "";
        this._commandIndex = -1;
        this._lastCommandIndex = -1;

        this._argsData = [];
        this._allArgsData = [];

        this._startOfLine = [];
        this._endOfLine = [];

        /**
         * @type{{arg: ArgParams[], param: PluginParams}}
         */
        this._flushData = {
            arg: [],
            param: new PluginParams()
        };

        this._allData = [];

        this._unknownData = [];

        this._lineWatcher = require("./LineWatcher");
    }
    
    /**
     * 플러그인 파일을 읽습니다.
     */
    readPluginFiles() {
        const targetFile = this._args.f.replace(/\\/g, '/');
        const stat = fs.lstatSync(targetFile);

        // 타겟 파일이 루트 폴더라면 모든 플러그인 목록을 리스트로 반환합니다.
        // 아니라면 단일 파일만 목록으로 반환합니다.
        if (stat.isDirectory()) {
            this._targetDir = path.join(targetFile, "js", "plugins");
            this._list = fs.readdirSync(this._targetDir.replace(/\\/g, '/'));
        } else {
            this._targetDir = path.dirname(targetFile);
            this._list.push(Parser.ready(targetFile).splitOnLast("/"));
        }
    }

    processLine(line, lineNumber) {

        // 라인이 /*: 으로 시작할 경우를 찾습니다.
        if (line.indexOf("/*:") >= 0) {
            this._isValid = true;
            this._lineWatcher.watch({
                line,
                lineNumber,
            });
        }

        if (this._isValid) {
            const cmt = Parser.parse(line);

            if (!cmt) {
                return;
            }

            this.parseComments(cmt, lineNumber);

            if (line.indexOf("*/") >= 0) {
                this._isValid = false;
                this._lineWatcher.end({
                    line,
                    lineNumber,
                });
            }
        }
    }

    setParams(type, data) {
        this._lastCommand = "param";
        this._flushData.param[type] = data;
    }

    getParams(type) {
        return this._flushData.param[type];
    }

    setOutputParamData(key, value) {
        this._flushData.param.data[key] = value;
    }

    isValidParam(type) {
        return !!this._flushData.param[type];
    }

    createCommand(data) {
        const args = this._flushData.arg;
        const pluginName = this._flushData.param.name.split(".")[0];
        if (args.length > 0) {
            this.flushArgData(pluginName);
        }
        this._lastCommand = "command";
        this._commands.push(data);
        this._flushData.arg.push(new ArgParams());
        this._commandIndex++;
        this._lastCommandIndex = this._flushData.arg.length - 1;
    }

    setArgs(type, data) {
        const index = this._lastCommandIndex;
        this._flushData.arg[index][type] = data;
        this._flushData.arg[index].texts.push(data);
    }

    setOutputArgsData(key, value) {
        const index = this._lastCommandIndex;
        this._flushData.arg[index].data[key] = value;
    }

    isValidArgs(type) {
        const index = this._lastCommandIndex;
        return !!this._flushData.arg[index][type];
    }

    getArgs(type) {
        const index = this._lastCommandIndex;
        return this._flushData.arg[index][type];
    }

    setCommandArgsText(data) {
        if (this._lastCommand === "command" || this._lastComment === "args") {
            const index = this._lastCommandIndex;
            this._flushData.arg[index].texts.push(data);
        }
    }

    /**
     * @param {Parser} cmt
     */
    parseComments(cmt, lineNumber) {
        this._lastComment = cmt.type;

        this._allData.push(Object.assign(cmt.toJson(), {
            lineNumber
        }));

        switch (cmt.type) {
            case "target":
                if(cmt.name.toUpperCase() === "MZ") {
                    console.log("@target %s%s%s [MZ 플러그인입니다]", Color.BgRed, cmt.desc, Color.Reset);
                }
                break;
            case "author":
                console.log("@author %s%s%s", Color.BgRed, cmt.desc, Color.Reset);
                break;
            case "plugindesc":
                console.log("@plugindesc %s%s%s", Color.BgRed, cmt.desc, Color.Reset);
                this.setParams("description", cmt.desc.slice(0));
                break;
            case "param":
                // TODO: 마지막 매개변수에 @default 태그가 없는 경우가 있다 (BUG #1)
                console.log("@param %s%s%s", Color.BgBlack, cmt.desc, Color.Reset);
                this.setParams("lastKey", cmt.desc.slice(0));
                this.setParams("lastValue", "");
                this.setParams("description", "");
                break;
            case "command":
                // 다중 커맨드 파싱 필요
                console.log("@command %s%s%s", Color.BgRed, cmt.desc, Color.Reset);
                this.createCommand(cmt.desc);
                break;
            case "arg":
                console.log("@arg %s%s%s", Color.BgGreen, cmt.name, Color.Reset);
                this.setArgs("lastKey", cmt.desc.slice(0));
                break;
            case "text":
                console.log("@text %s%s%s", Color.FgRed, cmt.desc, Color.Reset);
                this.setCommandArgsText(cmt.desc.slice(0));
                break;
            case "type":
                // TODO: @type struct<>는 파싱이 안된다.
                if (["command", "param"].includes(this._lastCommand)) {
                    console.log("@type %s%s%s", Color.FgRed, cmt.desc, Color.Reset);
                }
                break;
            case "desc":
                // 한 줄만 지원.
                console.log("@desc %s%s%s", Color.FgWhite, cmt.desc, Color.Reset);
                break;
            case "default":
                console.log("@default %s%s%s", Color.FgYellow, cmt.desc, Color.Reset);

                let outputData;
                let type = "";

                const index = this._commandIndex;
                const data = this._flushData;

                if (this._lastCommand === "param") { // 플러그인 매개변수
                    let key = "";

                    if (this.isValidParam("lastKey")) {
                        this.setParams("lastValue", cmt.desc.slice(0));
                    }

                    if ((key = this.getParams("lastKey")) != "") {
                        const value = this.getParams("lastValue");
                        this.setOutputParamData(key, value);
                        this.setParams("lastKey", "");
                        this.setParams("lastValue", "");
                    }

                } else if (this._lastCommand === "command") { // 플러그인 명령
                    let key = "";

                    if (this.isValidArgs("lastKey")) {
                        this.setArgs("lastValue", cmt.desc.slice(0));
                    }

                    if ((key = this.getArgs("lastKey")) != "") {
                        const value = this.getArgs("lastValue");
                        this.setOutputArgsData(key, value);
                        this.setArgs("lastKey", "");
                        this.setArgs("lastValue", "");
                    }
                }

                break;
        }
    }

    flushArgData(pluginName, flushToFile = true) {
        for (let i = 0; i < this._commandIndex; i++) {
            const commandIndex = i;
            if (!this._flushData.arg[i]) {
                console.warn("ARGS 출력 데이터가 없습니다.");
            }

            const tempJsonData = this._flushData.arg[i].data;

            // 맵 데이터의 이벤트 인터프리터 데이터를 생성합니다.
            let temp = [{
                "code": 357,
                "indent": 0,
                "parameters": [
                    pluginName,
                    this._commands[i],
                    "",
                    tempJsonData,
                ]
            }];

            if (flushToFile) {
                const outputFile = new ArgFile(pluginName, temp);
                outputFile.create();
            } else {
                this._argsData.push(temp);
                this._allArgsData.push(temp);
            }

        }
    }

    processEndOfFile(index) {
        const pluginName = this._flushData.param.name.split(".")[0];

        for (const type in this._flushData) {
            let data = JSON.stringify(this._flushData[type].data);

            if (type === "param") {
                const outputFile = new ParamFile(pluginName, {
                    name: pluginName,
                    status: true,
                    description: this._flushData.param.description,
                    parameters: this._flushData[type].data,
                });
                outputFile.create();

                this._unknownData.push({
                    name: pluginName,
                    status: true,
                    description: this._flushData.param.description,
                    parameters: this._flushData[type].data,
                });

            } else if (type === "arg") {
                this.flushArgData(pluginName);
            }
        }

        console.log("%s [ 인덱스 %d %s ]까지 읽었음 %s", Color.BgBlue, index, pluginName, Color.Reset);
    }

    /**
     * 플러그인 파일 목록을 읽습니다.
     */
    readList(cb) {
        
        // 리스트에 있는 모든 파일의 라인을 차례로 읽습니다.
        this._list.forEach((f, index) => {
            const filename = path.join(this._targetDir, f);
            const fileStream = fs.createReadStream(filename, 'utf8');
            const rl = readline.createInterface({
                input: fileStream,
                crlfDelay: Infinity,
            });
            console.log("%s%s%s", Color.BgBlue, filename, Color.Reset);
            this._flushData.param.name = f;

            // 현재 라인의 번호를 가져오는 람다 함수입니다.
            const lineNumber = ((i = 0) => () => ++i)();

            // 마지막 파일인지 확인하는 람다 함수입니다.
            const endOfList = ((i = 0) => () => this._list.length === (index + 1))();

            rl.on('line', (input, lineIndex = lineNumber()) => {
                this.processLine(input, lineIndex);
            });
            
            rl.on('close', () => {
                this.processEndOfFile(index);
                
                // 플러그인 이름으로 된 전체 매개변수 데이터 파일을 생성합니다.
                if(endOfList()) {
                    fs.writeFileSync(
                        path.resolve("data", path.basename(filename).split(".")[0] + ".json"), 
                        JSON.stringify(this._allData, null, "\t"), 
                        "utf8"
                    );
                    cb();

                }

            });
        });
    }

    start(cb) {
        this.readPluginFiles();
        this.readList(cb);
    }
}

exports.App = App;
