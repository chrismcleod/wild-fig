import { difference, filter, isEmpty, omit } from 'ramda';

import { Dependency } from './types';

const resolveLevel = async (list: Dependency[], resolved: { [ key: string ]: Dependency }, level: string[]) => {
  const keyIndexMap: { [ key: string ]: number } = {};
  const levelPromises = [];
  for (const id of level) {
    const dep = list.find(d => d.id === id);
    if (dep) {
      const promise = dep.factory(filter(Boolean, resolved));
      keyIndexMap[ id ] = levelPromises.push(promise) - 1;
    }
  }
  const results = await Promise.all(levelPromises);
  Object.keys(keyIndexMap).forEach(key => resolved[ key ] = results[ keyIndexMap[ key ] ]);
};

export const resolve = async <TOutput = any>(dependencyList: Array<Dependency<TOutput>>) => {

  const levels = [];

  let nameToDependencies = dependencyList.reduce<{ [ key: string ]: string[] }>((output, dependency) => {
    output[ dependency.id ] = dependency.dependsOn || [];
    return output;
  }, {});

  while (!isEmpty(nameToDependencies)) {
    const emptyDependencyIds = Object.entries(nameToDependencies).filter(([ _id, dependency ]) => dependency.length === 0).map(([ id ]) => id);
    if (emptyDependencyIds.length === 0) throw new Error('There seems to be a circular dependency in the dependency graph.');
    levels.push(emptyDependencyIds);
    for (const id in nameToDependencies) {
      if (nameToDependencies.hasOwnProperty(id)) {
        nameToDependencies[ id ] = difference(nameToDependencies[ id ], emptyDependencyIds);
      }
    }
    nameToDependencies = omit(emptyDependencyIds, nameToDependencies);
  }

  const resolved = {} as any;
  for (const level of levels) {
    await resolveLevel(dependencyList, resolved, level);
  }
  return resolved as TOutput;

};