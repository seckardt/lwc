import { VCustomElement, VNode, VNodeData, VElement, Hooks } from '../../3rdparty/snabbdom/types';
import { getComponentVM, getCustomElementVM, VM } from '../vm';
import { createElement } from '../upgrade';
import { LightningElement } from '../base-lightning-element';
import { renderComponent, ComponentConstructor, ComponentInterface } from '../component';

import { serializeVNode } from './serialize';
import { isCustomElement } from './snabdom-utils';

type ShouldRender = (component: ComponentInterface, context: object) => boolean;
type AsyncPromiseResolver = (component: ComponentInterface, context: object) => Promise<any> | null;

/**
 * Rendering engine for SSR.
 */
export interface Options {
    is: ComponentConstructor;
    timeout?: number;
    shouldRender?: ShouldRender;
    asyncPromise?: AsyncPromiseResolver;
    context?: object;
}

/**
 * This class carries the ssr context while rendering the components, as well as
 * the promises that need to be resolved before the final rendering takes place.
 */
class RenderingContext {
    promises: Promise<any>[] = [];
    options: Options;
    timeout: number;

    constructor(options: Options) {
        this.options = options;
        this.timeout = (options && options.timeout) || 5 * 1000;
    }
    add(p: Promise<any>) {
        if (p) {
            this.promises.push(p);
        }
    }

    getPromise(): Promise<any> | null {
        if (this.promises.length > 0) {
            return Promise.all(this.promises);
        }
        return null;
    }
}

//
// SSR Rendering engine
//

function createCustomElement(vnode: VCustomElement) {
    // Ths use of a DOM element is temporary here until LWC engine is fixed
    const element = document.createElement(vnode.sel);
    vnode.elm = element;
    vnode.hook.create(vnode);
}

// Recursively render the embedded components
function renderRecursively(renderingContext: RenderingContext, nodes: (VNode | null)[]) {
    nodes.forEach(vnode => {
        if (vnode && isCustomElement(vnode)) {
            const cv = vnode as VCustomElement;
            createCustomElement(cv);
            const vm = getCustomElementVM(cv.elm as HTMLElement);
            ssrRenderComponent(renderingContext, cv, vm);
        }
    });
}

function ssrRenderComponent(renderingContext: RenderingContext, parent: VNode, vm: VM) {
    const { options } = renderingContext;
    const ssrContext = options.context || {};

    // Mark the component as connected
    const ce: LightningElement = vm.component as LightningElement;
    if (ce.connectedCallback) {
        ce.connectedCallback.call(ce);
    }

    //------
    // PHIL: Here is how async rendering can happen
    //------
    if (options.asyncPromise) {
        const p = options.asyncPromise.call(null, ce, ssrContext);
        if (p && p.then) {
            //console.log("Async rendering detected for component: "+ce.Ctor);
            renderingContext.add(p);
            // We stop here and we don't render the children
            // But the peers will be rendered in case there are rendered simultaneously
            return [];
        }
    }

    // Make the VM dirty to force the rendering
    // A check in debug mode will throw an error if it is false (renderComponent)
    if (!options.shouldRender || options.shouldRender(ce, ssrContext)) {
        vm.isDirty = true; // Make it dirty to force
        const children = renderComponent(vm);

        if (children) {
            renderRecursively(renderingContext, children);
        }

        parent.children = children;
    }
}

export function renderToString(sel: string, options: Options): string {
    const context = new RenderingContext(options);

    const is = options.is;
    if (!is) {
        throw new Error('Missing component type (options.is)');
    }

    // Create the component to render
    // Ths use of a DOM element is temporary here until LWC engine is fixed
    const comp: ComponentInterface = (createElement(sel, {
        is,
    }) as unknown) as ComponentInterface;

    // Create the main element
    const data: VNodeData = {
        attrs: {},
    };
    const parent: VElement = {
        sel,
        data,
        children: [],
        text: undefined,
        elm: undefined,
        key: 0,
        hook: (null as any) as Hooks,
        owner: (null as any) as VM,
    };

    ssrRenderComponent(context, parent, getComponentVM(comp));

    // Ok, in case there are some pending promises (async data), we throw an exception
    if (options.asyncPromise) {
        const p = context.getPromise();
        if (p) {
            throw p;
        }
    }

    // Serialize the result to HTML
    const html = serializeVNode(parent);
    return html;
}

// Temp export to the runtime
((global || window) as any).__lwc = {
    renderToString,
};
