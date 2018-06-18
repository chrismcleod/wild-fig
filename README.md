# Wild Fig

Wild Fig resolves dependency trees declared using a flat specification.


### Usage
```typescript
import { Dependency, resolve } from 'wild-fig';

export const dependencies: Dependency[] = [ {
  id: 'env',
  factory: async () => process.env,
}, {
  id: 'myService',
  dependsOn: [ 'env', 'myProvider' ],
  factory: async ({ env, myProvider }) => {
    return await myService.create({
      host: env.ES_HOST,
      port: Number(env.ES_PORT),
      credentials: myProvider.getCredentials(),
    });
  },
}, {
  id: 'myProvider',
  dependsOn: [ 'env' ],
  factory: async ({ env }) => new MyProvider(env),
} ];

const resolvedDependencies = await resolve(dependencies);

console.log(dependencies.env);
console.log(dependencies.myService);
console.log(dependencies.myProvider);
```
