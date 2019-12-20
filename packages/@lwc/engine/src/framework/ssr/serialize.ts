import * as d from '../../3rdparty/snabbdom/types';
import { StylesheetFactory } from '../stylesheet';
import { VM } from '../vm';
import * as u from './snabdom-utils';

//
// Adapted from loadash 3.0
// https://github.com/lodash/lodash/tree/3.0.0-npm-packages/lodash.escape
// MIT license
//

/** Used to match HTML entities and HTML characters. */
const reUnescapedHtml = /[&<>"'`]/g;
const reHasUnescapedHtml = new RegExp(reUnescapedHtml.source);

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

interface StylesheetInfo {
    isHost: boolean;
    stylesheets: StylesheetFactory[];
    hostAttribute: string;
    shadowAttribute: string;
}

function serializeStartTag(
    nodeName: string,
    vnode: d.VNode,
    stylesheetInfo: StylesheetInfo
): string {
    const classMap = vnode.data.classMap || {};
    const styleMap = vnode.data.styleMap || {};
    const props = vnode.data.props || {};
    const attrs = vnode.data.attrs || {};
    const classKeys = Object.keys(classMap);
    const styleKeys = Object.keys(styleMap);
    const propsKeys = Object.keys(props);
    const attrsKeys = Object.keys(attrs);
    if (process.env.NODE_ENV !== 'production') {
        classKeys.sort();
        styleKeys.sort();
        propsKeys.sort();
        attrsKeys.sort();
    }

    let selectors = '';
    if (nodeName !== 'style' && nodeName !== 'script') {
        const { isHost, hostAttribute, shadowAttribute } = stylesheetInfo;
        if (isHost) {
            selectors = ` ${hostAttribute} ${shadowAttribute}`;
        } else {
            selectors = ` ${shadowAttribute}`;
        }
    }
    const classMapString = classKeys
        .map((c: string) => (c.trim().length > 0 && classMap[c] ? `${c}` : ''))
        .join(' ');
    const styleMapString = styleKeys
        .map((s: string) => (s.trim().length > 0 && styleMap[s] ? `${s}:${styleMap[s]}` : ''))
        .join(';');
    const classString = classMapString ? ` class="${classMapString}"` : '';
    const styleString = styleMapString ? ` style="${styleMapString}"` : '';
    const propsString = propsKeys
        .map((p: string) =>
            p.trim().length > 0 ? (props[p] ? ` ${p}="${props[p]}"` : ' ${p}') : ''
        )
        .join('');
    const attrsString = attrsKeys
        .map((a: string) => (a.trim().length > 0 ? ` ${a}="${attrs[a]}"` : ''))
        .join('');
    return `<${nodeName}${selectors}${classString}${styleString}${propsString}${attrsString}>`;
}

function serializeEndTag(nodeName: string): string {
    return `</${nodeName}>`;
}

function obtainStylesheetInfo(vnode: d.VNode): StylesheetInfo {
    const isRoot = !vnode.owner;
    const isHost = isRoot || !!vnode['ctor'];
    let vm: VM | null;
    let stylesheets: StylesheetFactory[] = [];
    let hostAttribute = '';
    let shadowAttribute = '';

    if (isHost) {
        // TODO(seckardt): Clarify if that's the fastest way to obtain the correct VM (or if it's better to use `ViewModelReflection`, if applicable)
        const childNodes = (vnode.children as d.VNodes) || [];
        vm = childNodes.length > 0 && childNodes[0] ? childNodes[0].owner : null;
    } else {
        vm = vnode.owner;
    }

    if (vm && vm.cmpTemplate) {
        ({ stylesheets = [] } = vm.cmpTemplate);
    }
    if (vm && vm.context) {
        ({ hostAttribute = '', shadowAttribute = '' } = vm.context);
    }

    return {
        isHost,
        stylesheets,
        hostAttribute,
        shadowAttribute,
    };
}

function ɵserialize(vnode: d.VNode): string {
    //const _useSyntheticShadow = useSyntheticShadow();

    function serializeChildNodes(childNodes: d.VNodes): (string | null)[] {
        return childNodes.map((_n: d.VNode | null) => (_n ? ɵserialize(_n) : null));
    }

    if (u.isText(vnode)) {
        return escape(vnode.text || '');
    }

    if (u.isComment(vnode)) {
        return '<!--' + vnode.text + '-->';
    }

    if (!u.isElement(vnode)) {
        throw new Error('Internal error: unknown node type, ' + JSON.stringify(vnode));
    }

    // Determine whether the host has stylesheets. If so, we need to mark the host and all children accordingly.
    const stylesheetInfo: StylesheetInfo = obtainStylesheetInfo(vnode);
    const nodeName = (vnode.sel || '').toLowerCase();
    if (u.isVoidElement(nodeName)) {
        return serializeStartTag(nodeName, vnode, stylesheetInfo);
    }

    const buffer: string[] = [];
    buffer.push(serializeStartTag(nodeName, vnode, stylesheetInfo));

    const { stylesheets } = stylesheetInfo;
    if (u.isStyleSheet(vnode) && stylesheets.length > 0) {
        const { hostAttribute, shadowAttribute } = stylesheetInfo;
        const hostSelector = hostAttribute ? `[${hostAttribute}]` : '';
        const shadowSelector = shadowAttribute ? `[${shadowAttribute}]` : '';
        buffer.push(
            stylesheets
                .map(factory => factory(hostSelector, shadowSelector, false).trim())
                .join('\n')
        );
    }

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
    const element = <d.VElement>vnode;
    const childNodes = element.children;
    if (childNodes.length > 0) {
        const children = serializeChildNodes(childNodes);
        buffer.push(children.join(''));
    }

    buffer.push(serializeEndTag(nodeName));

    return buffer.join('');
}

export function serializeVNode(node: d.VNode | null): string {
    return node ? ɵserialize(node) : '';
}

export function serializeVNodes(nodes: d.VNodes): string {
    return nodes.reduce((value: string, vnode: d.VNode) => {
        const s = serializeVNode(vnode);
        return value + s;
    }, '');
}
