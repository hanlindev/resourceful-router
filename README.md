Resourceful Router
=========
A powerful yet minimalistic routing middleware for Express that consumes [`reacource-collection`](https://github.com/hanlindev/resource-collection). Enjoy RESTful paths without compromising the micro-ness of Express.

## Installation

  `npm install resourceful-router`
  
## Usage (examples are written in Typescript)

This library should be used in conjunction with the [`reacource-collection`](https://github.com/hanlindev/resource-collection) library.

Given the following controller:

```typescript
// File: '/controllers/user.ts'
import {Request, Response, NextFunction} from 'express';
import {ActionMethod, ResourceEndpoint} from 'resource-collection';
import {loadAndAuthorizeResource} from 'resourceful-cancan-sequelize';

export const before = [
  loadAndAuthorizeResource('user').except('index'),
]

export const extraActions: Array<ResourceEndpoint> = [
  {
    method: ActionMethod.POST,
    path: '/poke/:id',
    name: 'poke'
  },
}

function index(req: Request, res: Response, next: NextFunction) {
  // Get user index ...
}

function show(req: Request, res: Response, next: NextFunction) {
  // Get the user with ID
}

function poke(req: Request, res: Response, next: NextFunction) {
  // Poke the user with ID
}

export {
  index,
  show,
}
```

and the following resource collection:

```typescript
// File: '/startup/config-resources.ts'
import * as user from '../controllers/user';
import ResourcefulRouterBuilder from 'resourceful-router';

const collection = new ResourceCollection<ResourceAction>('/api');
collection.resource('user', user, user.extraActions);

export {
  collection,
}
```

You can creates an Express routing middleware by

```typescript
// File '/startup/setup.ts'
import * as express from 'express';
import {collection} from './config-resources';

function setup(): express.Express {
  const app = express();
  // ... register other middlewares
  
  const routerBuilder = new ResourcefulRouterBuilder();
  const router = routerBuilder.build(collection);
  app.use(router);
  return app;
}

export {
  setup,
}
```

The router will container the following routes:
* `index`: GET /api/user/
* `show`:  GET /api/user/:id
* `poke`:  POST /api/user/poke/:id

# Documentation
For detailed documentation, please refer to the 
[`/type-definition/resourceful-router.d.ts`](https://github.com/hanlindev/resourceful-router/blob/master/type-definition/resourceful-router.d.ts) file.

**path prefix**

The argument given to the resource collection's constructor will be used as the path prefix.

**`before` filters**

Notice that in the `/controllers/user.ts` file, there is an exported constant `before`. It must be an array of Express 
middleware functions. In the example, the `loadAndAuthorizeResource` middleware from the [`resourceful-cancan-sequelize`](https://github.com/hanlindev/resourceful-cancan-sequelize) library is
used for loading the model data from the user model by connecting to the `Sequelize` ORM that interfaces with the database. Any Express middleware can be used here.

`after` filters are also supported and are defined and exported in a similar way.

**Not all RESTful paths are generated**

Only those with their handler function defined in the controller are generated. For example, in the above example, `index` and `show` are created.
If fully implemented, the path to function mapping looks like this:

* `index`:   GET     /api/user/
* `show`:    GET     /api/user/:id
* `create`:  POST    /api/user/
* `update`:  PUT     /api/user/:id
* `destroy`: DELETE  /api/user/:id

**extraActions**

There are times where the REST endpoints are not enough to describe the meaning of an action, you can create custom actions with any path. Refer to the example for the syntax.
