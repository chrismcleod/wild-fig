export const dependencies = [
  {
    id: 'a',
    dependsOn: [ 'c', 'e' ],
    factory: async ({ c, e }: any) => ({
      deps: { c, e },
      a: 'a service',
    }),
  },
  {
    id: 'b',
    dependsOn: [ 'c' ],
    factory: async ({ c }: any) => ({
      deps: { c },
      b: 'b service',
    }),
  },
  {
    id: 'c',
    dependsOn: [ 'e', 'f' ],
    factory: async ({ e, f }: any) => ({
      deps: { e, f },
      c: 'c service',
    }),
  },
  {
    id: 'd',
    dependsOn: [ 'b' ],
    factory: async ({ b }: any) => ({
      deps: { b },
      d: 'd service',
    }),
  },
  {
    id: 'e',
    dependsOn: [],
    factory: async () => ({
      e: 'e service',
    }),
  },
  {
    id: 'f',
    dependsOn: [ 'g' ],
    factory: async ({ g }: any) => ({
      deps: { g },
      f: 'f service',
    }),
  },
  {
    id: 'g',
    dependsOn: [],
    factory: async () => ({
      g: 'g service',
    }),
  },
];
