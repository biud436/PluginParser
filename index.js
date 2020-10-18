/**
 * node index.js -f="C:\Users\U\Desktop\TrashcanDungeon\gamedata\js\plugins\RS_Window_KorNameEdit.js"
 */

const { App } = require("./src/App");
const argv = require('minimist')(process.argv.slice(2));
const Color = require("./src/color");

if(argv.help) {
    console.log([
        `${Color.FgRed}-f=\"<경로>\"를 전달하세요${Color.Reset}`,
        `${Color.FgYellow}node index.js -f="*.js"가 되어야 합니다.${Color.Reset}`
    ].join("\r\n"));
    return;
}

const app = new App(argv);
app.start();

