const main = require('./dist/cjs/main.js');

async function log(ctor, msg) {
    const html = await ctor();
    console.log(msg);
    console.log(html);
    console.log('---');
}

(async () => {
    await log(main.HelloWorld, 'Hello World');
    await log(main.HelloWorldContainer, 'Hello World Container');
    await log(main.LabelContainer, 'Label Container');
    await log(main.StyledContainer, 'Styled Container');
})();
