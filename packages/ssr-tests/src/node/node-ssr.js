//
// SSR utilities in the context of Node.js
//

import { JSDOM } from 'jsdom';

// The LWC library patches this classes, so we define it globally
//global.Element = domino.impl.Element;
//global.HTMLElement = domino.impl.HTMLElement;
// Very temporary for now to make the lWC initialization work
const window = (global.window = new JSDOM('').window);
global.document = window.document;
global.Element = window.Element;
global.HTMLElement = window.HTMLElement;
global.ShadowRoot = window.ShadowRoot;
global.EventTarget = window.EventTarget;
global.Event = window.Event;
global.Node = window.Node;

const MAX_ASYNC_LOOPS = 4;

//
// Context for a SSR request
// As of now, we do *not* execute in a VM, as it executes synchronously so we can setup the context on demand
// Note that this code do not depend on Node APIs, so it can be executed on a JVM as well, with a recent JS
// interpreter like GraalVM
//
const Talon = {
    isServer: true,
};

// function extractQuery(s) {
//     const idx = s.indexOf('?')
//     return idx>=0 ? s.substring(idx) : "";
// }

class SSRContext {
    constructor(options) {
        // const serverContext = options.context;
        // const req = serverContext.req;
        // if(req) {
        //     const query = extractQuery(req.originalUrl)
        //     const url = (req && nodeUrl.format({
        //         protocol: req.protocol,
        //         host: req.get('host'),
        //         pathname: req.path
        //       })) + query;
        //       this.window = createBrowserWindow(url);
        // } else {
        //     this.window = createBrowserWindow("http://locahost");
        // }
    }

    install() {
        // No URL handling for now
        const dom = new JSDOM('');

        global.window = dom.window;
        global.document = dom.window.document;
        global.Talon = Talon;
    }
    uninstall() {
        delete global.window;
        delete global.document;
        delete global.Talon;
    }
}

//
// Main Rendering function
//
export async function renderToString(sel, options) {
    const ssrContext = new SSRContext(options);

    // We could handle asyncData so we have to catch the exceptions send by the rendering engine
    // We a bound to maximum tries, by default 4
    // Note that the timeout apply for each pass -> should we make it total?
    let preventAsyncData = false;
    const asyncTry = options.prefetch
        ? 1
        : Math.min(MAX_ASYNC_LOOPS, Math.max(2, options.asyncLoops || 0));
    for (let i = 0; i < asyncTry; i++) {
        let dataPromise = null;
        ssrContext.install();
        try {
            // As exported by the LWC engine
            const lwcRenderToString = global.__lwc.renderToString;

            const asyncData = !preventAsyncData && i < asyncTry - 1;
            const result = lwcRenderToString(sel, { ...options, asyncData });
            return result;
        } catch (e) {
            // If the exception was a Promise, the wait for it to be completed
            // Else propagate the exception
            if (e.then) {
                dataPromise = e;
            } else {
                throw e;
            }
        } finally {
            ssrContext.uninstall();
        }
        // Await for the data promise.
        const timeout = await dataPromise;
        if (timeout) {
            // If it timed out, then we should not request asyncData anymore.
            preventAsyncData = true;
        }
    }
}
