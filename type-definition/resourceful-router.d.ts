declare module 'resourceful-router' {
    import col = require('resource-collection');
    import express = require('express');

    module __ResourcefulRouter {
        function routerRegistrator(
            router: express.Router,
            globalPathPrefix: string
        ): (
            resourceName: string,
            endpoint: col.ResourceEndpoint,
            handlerModule: col.ResourceModule<col.ResourceAction>
        ) => void;

        function getResourcefulRouter(
            resourceCollection: col.ResourceCollection<col.ResourceAction>
        ): express.Router;
    }

    export = __ResourcefulRouter;
}
