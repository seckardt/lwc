import { serializeVNode, serializeVNodes } from '../serialize';
import { h } from './snabdom-helpers';

describe('serialize', () => {
    describe('serializeVNode', () => {
        it(`should serialize a void element`, () => {
            const node = h('hr');
            const html = serializeVNode(node);
            expect(html).toBe(`<hr>`);
        });

        it(`should serialize a <div> without attributes`, () => {
            const node = h('div');
            const html = serializeVNode(node);
            expect(html).toBe(`<div></div>`);
        });

        it(`should serialize a <div> with attributes`, () => {
            const node = h('div', { a1: 1, a2: 2 });
            const html = serializeVNode(node);
            expect(html).toBe(`<div a1="1" a2="2"></div>`);
        });

        it(`should serialize a <div> with child elements`, () => {
            const node = h('div', { class: 'parent' }, [
                h('div', { class: 'child', level: 1 }, [h('div', { class: 'child', level: 2 })]),
            ]);
            const html = serializeVNode(node);
            expect(html).toBe(
                `<div class="parent"><div class="child" level="1"><div class="child" level="2"></div></div></div>`
            );
        });
    });

    describe('serializeVNodes', () => {
        it(`should serialize void elements`, () => {
            const html = serializeVNodes([h('hr'), h('br')]);
            expect(html).toBe(`<hr><br>`);
        });

        it(`should serialize <div>s without attributes`, () => {
            const html = serializeVNodes([h('div'), h('div')]);
            expect(html).toBe(`<div></div><div></div>`);
        });

        it(`should serialize <div>s with attributes`, () => {
            const node1 = h('div', { a1: 1, a2: 2 });
            const node2 = h('div', { a1: 3, a2: 4 });
            const html = serializeVNodes([node1, node2]);
            expect(html).toBe(`<div a1="1" a2="2"></div><div a1="3" a2="4"></div>`);
        });

        it(`should serialize <div>s with child elements`, () => {
            const node1 = h('div', { class: 'parent1' }, [
                h('div', { class: 'child1', level: 1 }, [h('div', { class: 'child1', level: 2 })]),
            ]);
            const node2 = h('div', { class: 'parent2' }, [
                h('div', { class: 'child2', level: 1 }, [h('div', { class: 'child2', level: 2 })]),
            ]);
            const html = serializeVNodes([node1, node2]);
            expect(html).toBe(
                `<div class="parent1"><div class="child1" level="1"><div class="child1" level="2"></div></div></div><div class="parent2"><div class="child2" level="1"><div class="child2" level="2"></div></div></div>`
            );
        });
    });
});
