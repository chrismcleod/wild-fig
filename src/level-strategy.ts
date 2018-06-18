import { compose, filter, isEmpty, not, reverse } from 'ramda';

import { Dependency } from './types';

const moveDownToLevel = (list: string[][], id: string, level: number) => {

  let i;
  let k;
  list[ level ] = list[ level ] || [];
  let doInsert = true;

  loop1:
  for (i = 0; i < list.length; i += 1) {
    for (k = 0; k < list[ i ].length; k += 1) {
      if (list[ i ][ k ] === id) {
        if (level > i) {
          list[ i ].splice(k, 1);
          break loop1;
        } else {
          doInsert = false;
          break loop1;
        }
      }
    }
  }

  if (doInsert) list[ level ].push(id);
};

const resolveDependencyOrder = (output: string[][], list: Dependency[], dependency: Dependency | string, level: number) => {
  if (!dependency) return;
  if (typeof dependency === 'string') {
    moveDownToLevel(output, dependency, level);
    const dep = list.find(d => d.id === dependency);
    if (dep) {
      if (Array.isArray(dep.dependsOn) && dep.dependsOn.length > 0) {
        for (const dependsOn of dep.dependsOn) {
          resolveDependencyOrder(output, list, dependsOn, level + 1);
        }
      }
    }
  } else {
    moveDownToLevel(output, dependency.id, level);
    if (Array.isArray(dependency.dependsOn) && dependency.dependsOn.length > 0) {
      for (const dependsOn of dependency.dependsOn) {
        resolveDependencyOrder(output, list, dependsOn, level + 1);
      }
    }
  }
};

export const resolve = async <TOutput extends { [ key: string ]: any } = any>(dependencyList: Dependency[]) => {

  const allPromises: Array<Promise<any>> = [];
  const orderedList: string[][] = [];

  for (const dependency of dependencyList) {
    resolveDependencyOrder(orderedList, dependencyList, dependency, 0);
  }

  const dependencies: TOutput = {} as any as TOutput;
  const resolveLevel = async (level: string[]) => {
    const keyIndexMap: { [ key: string ]: number } = {};
    const promises = [];
    for (const id of level) {
      const dep = dependencyList.find(d => d.id === id);
      if (dep) {
        const promise = dep.factory(filter(Boolean, dependencies));
        allPromises.push(promise);
        keyIndexMap[ id ] = promises.push(promise) - 1;
      }
    }
    const results = await Promise.all(promises);
    Object.keys(keyIndexMap).forEach(key => dependencies[ key ] = results[ keyIndexMap[ key ] ]);
  };
  const levelOrderedDependencies = reverse(filter(compose(not, isEmpty))(orderedList));
  for (const level of levelOrderedDependencies) {
    await resolveLevel(level);
  }
  await allPromises;
  return dependencies;
};
