import { LightningElement, api } from 'lwc';

export default class Label extends LightningElement {
    @api value = 'XYZ';

    constructor() {
        super();
    }
}
