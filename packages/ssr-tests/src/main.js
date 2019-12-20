import { renderToString } from './node/node-ssr';

import HelloWorld from './ssr/helloworld/helloworld';
import HelloWorldContainer from './ssr/helloworldcontainer/helloworldcontainer';
import LabelContainer from './ssr/labelcontainer/labelcontainer';
import StyledContainer from './ssr/styledcontainer/styledcontainer';

export default {
    HelloWorld: () => {
        return renderToString('ssr-helloworld', { is: HelloWorld });
    },
    HelloWorldContainer: () => {
        return renderToString('ssr-helloworldcontainer', { is: HelloWorldContainer });
    },
    LabelContainer: () => {
        return renderToString('ssr-labelcontainer', { is: LabelContainer });
    },
    StyledContainer: () => {
        return renderToString('ssr-styledcontainer', { is: StyledContainer });
    },
};
