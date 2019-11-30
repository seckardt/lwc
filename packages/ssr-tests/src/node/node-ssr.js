//
// SSR utilities in the context of Node.js
//

// Looks like 'import' generates a warning with Node 10.x (12.x currently not supported by LWC)
//import { JSDOM } from 'jsdom';
const { JSDOM } = require('jsdom');
const nodeUrl = require('url');

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

function extractQuery(s) {
    const idx = s.indexOf('?');
    return idx >= 0 ? s.substring(idx) : '';
}

class SSRContext {
    constructor(options) {
        this.options = options.context;

        // Create the global window object
        // It has to be kept global as data retriever can store some data for future use
        const req = this.options && this.options.context && this.options.context && req;
        if (req) {
            const query = extractQuery(req.originalUrl);
            const url =
                (req &&
                    nodeUrl.format({
                        protocol: req.protocol,
                        host: req.get('host'),
                        pathname: req.path,
                    })) + query;
            this.window = new JSDOM('', { url }).window;
        } else {
            this.window = new JSDOM('', { url: 'http://localhost' }).window;
        }
        this.window['__lwc_ssr__'] = true;
    }

    install() {
        global.window = this.window;
        global.document = this.window.document;
    }
    uninstall() {
        delete global.document;
        delete global.window;
        // Restore the global ones...
        global.window = window;
        global.document = window.document;
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
