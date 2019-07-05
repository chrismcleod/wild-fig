import r from 'ramda';
import { Dependency } from './types';

const resolveLevel = async (list: Dependency[], resolved: { [key: string]: Dependency }, level: string[], callback?: (context: any) => Promise<any>) => {
  const keyIndexMap: { [key: string]: number } = {};
  const levelPromises = [];
  for (const id of level) {
    const dep = list.find(d => d.id === id);
    if (dep) {
      const promise = dep.factory(r.filter(Boolean, resolved));
      keyIndexMap[id] = levelPromises.push(promise) - 1;
    }
  }
  const results = await Promise.all(levelPromises);
  if (callback) {
    const callbackPromises: Array<Promise<any>> = [];
    results.forEach((result) => {
      callbackPromises.push(callback(result));
    });
    await Promise.all(callbackPromises);
  }
  Object.keys(keyIndexMap).forEach(key => resolved[key] = results[keyIndexMap[key]]);
};

export const resolve = async <TOutput = any>(dependencyList: Array<Dependency<TOutput>>, callback?: (context: any) => Promise<any>) => {

  const ids = r.pluck<'id', string>('id', dependencyList);
  const missing = r.pipe(
    r.map((dep: Dependency) => dep.dependsOn || []),
    (list) => r.flatten<string>(list),
    (list) => r.reject(r.isNil, list),
    (list) => r.uniq(list),
    (list) => r.difference(list, ids)
  )(dependencyList);
  if(missing.length > 0) throw new Error(`Missing dependencies ${missing.join(', ')}`)

  const levels = [];

  let nameToDependencies = dependencyList.reduce<{ [key: string]: string[] }>((output, dependency) => {
    output[dependency.id] = dependency.dependsOn || [];
    return output;
  }, {});

  while (!r.isEmpty(nameToDependencies)) {
    const emptyDependencyIds = Object.entries(nameToDependencies).filter(([_id, dependency]) => dependency.length === 0).map(([id]) => id);
    if (emptyDependencyIds.length === 0) throw new Error('Either a depedency is undefined in the tree, or there is a circular dependency in the dependency graph.');
    levels.push(emptyDependencyIds);
    for (const id in nameToDependencies) {
      if (nameToDependencies.hasOwnProperty(id)) {
        nameToDependencies[id] = r.difference(nameToDependencies[id], emptyDependencyIds);
      }
    }
    nameToDependencies = r.omit(emptyDependencyIds, nameToDependencies);
  }

  const resolved = {} as any;
  for (const level of levels) {
    await resolveLevel(dependencyList, resolved, level, callback);
  }
  return resolved as TOutput;

};
