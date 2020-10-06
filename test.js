const checkUpdate = require("./src/checkUpdate");

checkUpdate.getLatestVersion().then(res => {
    console.log(res);
})
