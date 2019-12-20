import { VCustomElement, VNode, VNodeData, VElement, Hooks } from '../../3rdparty/snabbdom/types';
import { getComponentVM, getCustomElementVM, VM } from '../vm';
import { createElement } from '../upgrade';
import { LightningElement } from '../base-lightning-element';
import { renderComponent, ComponentConstructor, ComponentInterface } from '../component';

import { serializeVNode } from './serialize';
import { isCustomElement } from './snabdom-utils';

type ShouldRender = (component: ComponentInterface) => boolean;

/**
 * Rendering engine for SSR.
 */
export interface Options {
    is: ComponentConstructor;
    shouldRender?: ShouldRender;
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
function renderRecursively(nodes: (VNode | null)[], shouldRender?: ShouldRender) {
    nodes.forEach(vnode => {
        if (vnode && isCustomElement(vnode)) {
            const cv = vnode as VCustomElement;
            createCustomElement(cv);
            const vm = getCustomElementVM(cv.elm as HTMLElement);
            ssrRenderComponent(cv, vm, shouldRender);
        }
    });
}

function ssrRenderComponent(parent: VNode, vm: VM, shouldRender?: ShouldRender) {
    // Mark the component as connected
    const ce: LightningElement = vm.component as LightningElement;
    if (ce.connectedCallback) {
        ce.connectedCallback.call(ce);
    }

    // Make the VM dirty to force the rendering
    // A check in debug mode will throw an error if it is false (renderComponent)
    if (!shouldRender || shouldRender(ce)) {
        vm.isDirty = true; // Make it dirty to force
        const children = renderComponent(vm);

        if (children) {
            renderRecursively(children, shouldRender);
        }

        parent.children = children;
    }
}

export function renderToString(sel: string, options: Options): string {
    const is = options.is;
    if (!is) {
        throw new Error('Missing component type (options.is)');
    }

    // Create the component to render
    // The use of a DOM element is temporary here until LWC engine is fixed
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

    ssrRenderComponent(parent, getComponentVM(comp), options.shouldRender);

    // Serialize the result to HTML
    return serializeVNode(parent);
}

// Temp export to the runtime
((global || window) as any).__lwc = {
    renderToString,
};
