/**
 * 
 * console.log(stringify({wow: 1, wow: {wow2: {wow: "뭐죠?"}, wow4: 5}}));
 * 
 * @function stringify
 * @param {Object} data
 * @return {String} 
 */
function stringify(data) {

    if(typeof(data) === "object") {
        for(let i in data) {
            data[i] = stringify(data[i]);
        }
    }

    return JSON.stringify(data);
}

module.exports = stringify;