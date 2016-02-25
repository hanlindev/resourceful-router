import * as express from 'express';
import * as col from 'resource-collection';


function routerRegistrator(
    router: express.Router,
    globalPathPrefix: string
): (
    resourceName: string,
    endpoint: col.ResourceEndpoint,
    handlerModule: col.ResourceModule<col.ResourceAction>
) => void {
    return (
        resourceName: string,
        endpoint: col.ResourceEndpoint,
        handlerModule: col.ResourceModule<col.ResourceAction>
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
            router[registratorName](path, handlerModule[endpoint.name]);
        }
    }
}

export function getResourcefulRouter(
    resourceCollection: col.ResourceCollection<col.ResourceAction>
): express.Router {
    let result = express.Router();
    let registrator = routerRegistrator(result, resourceCollection.globalPathPrefix);

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
