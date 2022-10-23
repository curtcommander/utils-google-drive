NAME=utils-google-drive
npx typedoc src/index.ts --name $NAME
node -e "
    const fs = require('fs');
    const path = 'docs/classes/UtilsGDrive.html';
    let html = fs.readFileSync(path).toString();
    html = html.replaceAll('this<span class=\"tsd-signature-symbol\">: <\/span><a href=\"UtilsGDrive.html\" class=\"tsd-signature-type\" data-tsd-kind=\"Class\">UtilsGDrive<\/a>, ', '');
    html = html.replaceAll('<li>\n<h5>this: <a href=\"UtilsGDrive.html\" class=\"tsd-signature-type\" data-tsd-kind=\"Class\">UtilsGDrive</a></h5></li>', '');
    fs.writeFileSync(path, html);
"