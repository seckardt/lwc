import { hasOwnProperty } from '@lwc/shared';

const useSyntheticShadow = () => hasOwnProperty.call(Element.prototype, '$shadowToken$');

export { useSyntheticShadow };
