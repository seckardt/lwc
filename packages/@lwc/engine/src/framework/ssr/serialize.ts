import { VElement, VNode, VNodes } from '../../3rdparty/snabbdom/types';
import { isVoidElement, isElement, isText, isComment } from './snabdom-utils';

//
// Adapted from loadash 3.0
// https://github.com/lodash/lodash/tree/3.0.0-npm-packages/lodash.escape
// MIT license
//

/** Used to match HTML entities and HTML characters. */
const reUnescapedHtml = /[&<>"'`]/g,
    reHasUnescapedHtml = RegExp(reUnescapedHtml.source);
/** Used to map characters to HTML entities. */
const htmlEscapes = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '`': '&#96;',
};
function escapeHtmlChar(chr: string): string {
    return htmlEscapes[chr];
}
function escape(s: string): string {
    // Reset `lastIndex` because in IE < 9 `String#replace` does not.
    return s && reHasUnescapedHtml.test(s) ? s.replace(reUnescapedHtml, escapeHtmlChar) : s;
}

function serializeStartTag(nodeName: string, element: VElement): string {
    const attrs = element.data.attrs || {};
    const keys = Object.keys(attrs);
    if (process.env.NODE_ENV !== 'production') {
        keys.sort();
    }
    return `<${nodeName}${keys.map((a: string) => ` ${a}="${attrs[a]}"`).join('')}>`;
}

function serializeEndTag(nodeName: string): string {
    return `</${nodeName}>`;
}

function ɵserialize(vnode: VNode): string {
    //const _useSyntheticShadow = useSyntheticShadow();

    function serializeChildNodes(childNodes: VNodes): (string | null)[] {
        const strings = childNodes.map((_n: VNode | null) => (_n ? ɵserialize(_n) : null));
        return strings;
    }

    if (isText(vnode)) {
        return escape(vnode.text || '');
    }

    if (isComment(vnode)) {
        return '<!--' + vnode.text + '-->';
    }

    if (!isElement(vnode)) {
        throw new Error('Internal error: unknown node type, ' + JSON.stringify(vnode));
    }

    const element = <VElement>vnode;
    const nodeName = (element.sel || '').toLowerCase();

    if (isVoidElement(nodeName)) {
        const nodeName = (vnode.sel || '').toLowerCase();
        return serializeStartTag(nodeName, <VElement>vnode);
    }

    const buffer: string[] = [];

    buffer.push(serializeStartTag(nodeName, element));

    // if (element.shadowRoot) {
    //     const shadowRootChildNodes = _useSyntheticShadow
    //         ? element.shadowRoot.childNodes
    //         : childNodesGetter.call(element.shadowRoot);
    //     if (shadowRootChildNodes.length > 0) {
    //         const children = serializeChildNodes(shadowRootChildNodes);
    //         buffer.push(`<shadowroot>${children.join('')}</shadowroot>`);
    //     }
    // }

    //const childNodes = _useSyntheticShadow ? element.children : childNodesGetter.call(node);
    const childNodes = element.children;
    if (childNodes.length > 0) {
        const children = serializeChildNodes(childNodes);
        buffer.push(children.join(''));
    }

    buffer.push(serializeEndTag(nodeName));

    const result = buffer.join('');
    return result;
}

export function serializeVNode(node: VNode | null): string {
    return node ? ɵserialize(node) : '';
}

export function serializeVNodes(nodes: VNodes): string {
    return nodes.reduce((value: string, vnode: VNode) => {
        const s = serializeVNode(vnode);
        return value + s;
    }, '');
}
