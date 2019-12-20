const fs = require('fs');
const path = require('path');
const http = require('http');
const main = require('./dist/cjs/main.js');

http.createServer((req, res) => {
    const content = fs.readFileSync(path.resolve(__dirname, 'server.html'), 'utf-8').trim();
    Promise.all([main.StyledContainer(), main.HelloWorldContainer(), main.LabelContainer()]).then(
        ([styled, hello, label]) => {
            const html = `
<section id="StyledContainer">${styled}</section>
<section id="HelloWorldContainer">${hello}</section>
<section id="LabelContainer">${label}</section>
`;
            res.write(content.replace('<section></section>', html));
            res.end();
        }
    );
}).listen(8080);

// if (context.options.asyncData && (ce.constructor as any).prefetchAsyncData) {
//     // The component properties are added to the context
//     const ctx = { ...context.options.asyncContext, props: ce };
//     const p = (ce.constructor as any).prefetchAsyncData.call(ce, ctx);
//     if (p && p.then) {
//         //console.log("Async rendering detected for component: "+ce.Ctor);
//         context.add(p);
//         // We stop here and we don't render the children
//         // But the peers will be rendered in case there are rendered simultaneously
//         return [];
//     }
// }
