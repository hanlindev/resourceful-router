import * as express from 'express';
import * as col from 'resource-collection';

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
    handlerModule: IHandlerModule
) => void {
    return (
        resourceName: string,
        endpoint: col.ResourceEndpoint,
        handlerModule: IHandlerModule
    ) => {
        let registratorName = '';
        switch (endpoint.method) {
            case col.ActionMethod.ALL:
                registratorName = 'all';
                break;
            case col.ActionMethod.GET:
                registratorName = 'get';
                break;
            case col.ActionMethod.POST:
                registratorName = 'post';
                break;
            case col.ActionMethod.PUT:
                registratorName = 'put';
                break;
            case col.ActionMethod.DELETE:
                registratorName = 'delete';
                break;
            case col.ActionMethod.PATCH:
                registratorName = 'patch';
                break;
            case col.ActionMethod.OPTIONS:
                registratorName = 'options';
                break;
            case col.ActionMethod.HEAD:
                registratorName = 'head';
                break;
        }

        let path = `/${resourceName}${endpoint.path}`;
        if (!!handlerModule.pathPrefix && handlerModule.pathPrefix !== '') {
            path = handlerModule.pathPrefix + path;
        }
        if (!!globalPathPrefix && globalPathPrefix !== '') {
            path = globalPathPrefix + path;
        }
        if (registratorName != null) {
            let before = handlerModule.before || [];
            let after = handlerModule.after || [];
            router[registratorName](path, ...before, handlerModule[endpoint.name], ...after);
        }
    }
}

export default class ResourcefulRouterBuilder {
    build(
        resourceCollection: col.ResourceCollection<col.ResourceAction>
    ): express.Router {
        let result = express.Router();
        let registrator = routerRegistrator(
            result,
            resourceCollection.globalPathPrefix
        );

        for (let resourceName in resourceCollection.resources) {
            let resource = resourceCollection.resources[resourceName];
            for (let endpointName in resource.endpoints) {
                registrator(
                    resourceName,
                    resource.endpoints[endpointName],
                    resource.handler
                );
            }
        }

        return result;
    }
}
