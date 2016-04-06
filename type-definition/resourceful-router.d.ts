declare module 'resourceful-router' {
  import col = require('resource-collection');
  import express = require('express');

  module __ResourcefulRouter {
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
    ): IRouterRegistratorFunction;

    class ResourcefulRouterBuilder {
      public build(
        resourceCollection: col.ResourceCollection<col.ResourceAction>
      ): express.Router;
    }

    interface IConditionalFilterCreator {
      except: (actionNames: string[]) => IResourceActionFilter;
      only: (actionNames: string[]) => IResourceActionFilter;
    }

    interface IConditionalFilterFunction {
      (handler: express.RequestHandler): IConditionalFilterCreator;
    }
  }

  export default __ResourcefulRouter.ResourcefulRouterBuilder;
  export type IResourceActionFilter = __ResourcefulRouter.IResourceActionFilter;
  export let conditionalFilter: __ResourcefulRouter.IConditionalFilterFunction;
}
