import { LightningElement, api } from 'lwc';

export default class Styled extends LightningElement {
    @api value = 'XYZ';

    constructor() {
        super();
    }
}
