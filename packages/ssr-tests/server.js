const main = require('./public/cjs/main.js');

console.log('');

main.HelloWorld().then(html => {
    console.log('Hello World');
    console.log(html);
    console.log('');
});

main.HelloWorldContainer().then(html => {
    console.log('Hello World Container');
    console.log(html);
    console.log('');
});

main.LabelContainer().then(html => {
    console.log('Label Container');
    console.log(html);
    console.log('');
});

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
