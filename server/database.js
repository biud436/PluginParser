const path = require('path');
const fs = require('fs-extra');

// 간이 데이터베이스 객체 생성
const database = {
    init() {
        this._userTable = {};

        // 업로드 파일이 없으면 새로 만듭니다.
        if (!fs.existsSync(path.resolve("uploads"))) {
            fs.mkdirSync(path.resolve("uploads"));
        }
    },

    new(address, id) {
        this._userTable[address] = id;
    },

    remove(address) {
        delete this._userTable[address];
    }
};
exports.database = database;
database.init();
