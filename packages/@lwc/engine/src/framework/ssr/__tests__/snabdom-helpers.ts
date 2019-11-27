/**
 * Add a few snabdom helpers used by the tests.
 */

import { Attrs, VElement, VNodes, VNodeData, Hooks } from '../../../3rdparty/snabbdom/types';
import { VM } from '../../vm';

const FakeHook: Hooks = {
    create: () => {
        throw new Error();
    },
    insert: () => {
        throw new Error();
    },
    move: () => {
        throw new Error();
    },
    update: () => {
        throw new Error();
    },
    remove: () => {
        throw new Error();
    },
};

let key = 1;
export function h(sel: string, attrs?: Attrs, children?: VNodes) {
    const data: VNodeData = {
        attrs,
    };
    const vnode: VElement = {
        sel,
        data,
        children: children || [],
        text: undefined,
        elm: undefined,
        key: key++,
        hook: FakeHook,
        owner: (null as any) as VM,
    };
    return vnode;
}
