const settings = require("../src/intsettings");

if(settings.prodMode === true) process.exit(0);
else process.exit(1);