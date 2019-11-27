import { serializeVNode } from '../serialize';
import { h } from './snabdom-helpers';

describe('serialize', () => {
    describe('Basic', () => {
        it(`should serialize a sample <div></div> tag with no attributes`, done => {
            const node = h('div');
            const html = serializeVNode(node);
            expect(html).toBe(`<div></div>`);
            done();
        });
        it(`should serialize a sample <div></div> tag with an attribute`, done => {
            const node = h('div', { a1: 1, a2: 2 });
            const html = serializeVNode(node);
            expect(html).toBe(`<div a1="1" a2="2"></div>`);
            done();
        });
    });
});
