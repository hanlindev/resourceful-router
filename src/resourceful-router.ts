import * as express from 'express';
import * as _ from 'lodash';
import * as col from 'resource-collection';

interface IResourceActionFilter extends express.RequestHandler {
  except?: string[];
  only?: string[];
}

interface IHandlerModule extends col.ResourceModule<col.ResourceAction> {
    /**
     * Request handlers to be called before the main handler. They are called in
     * the same order as they are in the array.
     * @type {ResourceActionFilter[]}
     */
    before?: IResourceActionFilter[];
    /**
     * Similar to before handlers but they are called after the main request
     * handler.
     * @type {ResourceActionFilter[]}
     */
    after?: IResourceActionFilter[];
}

interface IRouterRegistratorFunction {
  (
    resourceName: string,
    endpoint: col.ResourceEndpoint,
    handlerModule: IHandlerModule
  ): void;
}

function routerRegistrator(
    router: express.Router,
    globalPathPrefix: string
): IRouterRegistratorFunction  {
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
            let before = filterActionFilters(
              endpoint.name,
              handlerModule.before || []
            );
            let after = filterActionFilters(
              endpoint.name,
              handlerModule.after || []
            );
            router[registratorName](
              path,
              ...before,
              handlerModule[endpoint.name],
              ...after
            );
        }
    }
}

function filterActionFilters(
  actionName: string,
  filters: IResourceActionFilter[]
): IResourceActionFilter[] {
  return filters.filter(actionFilter => {
    if (
      _.isArray(actionFilter.except) &&
      actionFilter.except.indexOf(actionName) >= 0
    ) {
      return false;
    }

    if (
      _.isArray(actionFilter.only) &&
      actionFilter.only.indexOf(actionName) === -1
    ) {
      return false;
    }

    return true;
  });
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

export interface IConditionalFilterCreator extends express.RequestHandler {
  except: (...actionNames: string[]) => IResourceActionFilter;
  only: (...actionNames: string[]) => IResourceActionFilter;
}
export function conditionalFilter(
  handler: express.RequestHandler
): IConditionalFilterCreator {
  let result = <IConditionalFilterCreator> handler;
  result.except = (...actionNames: string[]) => {
    handler['except'] = actionNames;
    return <IResourceActionFilter> handler;
  };
  result.only = (...actionNames: string[]) => {
    handler['only'] = actionNames;
    return <IResourceActionFilter> handler;
  };
  return result;
}
