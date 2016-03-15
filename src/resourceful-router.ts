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

interface ResourcefulRouterBuilderConfig {
  // The global authentication middleware
  authenticator?: express.RequestHandler;
}

export default class ResourcefulRouterBuilder {
  public constructor(public config?: ResourcefulRouterBuilderConfig) {}

  build(
    resourceCollection: col.ResourceCollection<col.ResourceAction>
  ): express.Router {
    let result = this.getDefaultRouter();
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

  private getDefaultRouter(): express.Router {
    let result = express.Router();
    if (this.config && this.config.authenticator) {
      result.use(this.config.authenticator);
    }
    return result;
  }
}
