import { VNode, VCustomElement } from '../../3rdparty/snabbdom/types';

/**
 * Void elements can't have any contents (since there's no end tag, no content can be put between the start tag and the end tag).
 *
 * @see https://html.spec.whatwg.org/multipage/syntax.html#elements-2
 */
const VOID_ELEMENTS = [
    'area',
    'base',
    'br',
    'col',
    'embed',
    'hr',
    'img',
    'input',
    'link',
    'meta',
    'param',
    'source',
    'track',
    'wbr',
];

export function isVoidElement(nodeName: string): boolean {
    return VOID_ELEMENTS.includes(nodeName);
}

export function isElement(node: VNode): boolean {
    return !!node.sel && node.sel !== '!';
}

export function isCustomElement(node: VNode): boolean {
    return isElement(node) && !!(<VCustomElement>node).mode;
}

export function isComment(node: VNode): boolean {
    return node.sel === '!';
}

export function isText(node: VNode): boolean {
    return node.sel === undefined;
}
