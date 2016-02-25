declare module 'resourceful-router' {
    import col = require('resource-collection');
    import express = require('express');

    function routerRegistrator(
        router: express.Router,
        globalPathPrefix: string
    ): (
        resourceName: string,
        endpoint: col.ResourceEndpoint,
        handlerModule: col.ResourceModule<col.ResourceAction>
    ) => void;

    function getRouter(
        resourceCollection: col.ResourceCollection<col.ResourceAction>
    ): express.Router;

    export = getRouter;
}
