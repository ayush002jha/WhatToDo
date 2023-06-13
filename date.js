
let today = new Date();
let options = {
    weekday: "long",
    day: "numeric",
    month: "long"
}
let day = today.toLocaleDateString("en-US",options)
// CJS
// module.exports.Day = day;
exports.Day = day;

// ESM
// export default day  -- import day from "...."
// export {day as DAY} -- import {DAY} from "..."