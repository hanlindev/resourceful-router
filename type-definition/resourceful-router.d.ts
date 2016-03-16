declare module 'resourceful-router' {
    import col = require('resource-collection');
    import express = require('express');

    module __ResourcefulRouter {
        interface IHandlerModule extends col.ResourceModule<col.ResourceAction> {
            /**
             * Request handlers to be called before the main handler. They are called in
             * the same order as they are in the array.
             * @type {express.RequestHandler[]}
             */
            before?: express.RequestHandler[];
            /**
             * Similar to before handlers but they are called after the main request
             * handler.
             * @type {express.RequestHandler[]}
             */
            after?: express.RequestHandler[];
        }

        function routerRegistrator(
            router: express.Router,
            globalPathPrefix: string
        ): (
            resourceName: string,
            endpoint: col.ResourceEndpoint,
            handlerModule:IHandlerModule
        ) => void;

        class ResourcefulRouterBuilder {
          public build(
            resourceCollection: col.ResourceCollection<col.ResourceAction>
          ): express.Router;
        }
    }

    export default __ResourcefulRouter.ResourcefulRouterBuilder;
}
