import r from 'ramda';
import { Dependency } from './types';

const resolveLevel = async (list: Dependency[], resolved: { [key: string]: Dependency }, level: string[], callback?: (context: any) => Promise<any>) => {
  const keyIndexMap: { [key: string]: number } = {};
  const levelPromises: Promise<any>[] = [];
  const listMap = list.reduce((acc, dep) => {
    acc[dep.id] = dep
    return acc
  }, {} as r.Dictionary<Dependency>)
  level.forEach((id) => {
    const dep = listMap[id]
    const factory = r.defaultTo(async (..._args: any[]) => r.T, dep.factory)
    const promise = factory(r.filter(Boolean, resolved));
    keyIndexMap[id] = levelPromises.push(promise) - 1;
  })
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
    r.map((dep: Dependency) => r.defaultTo([], dep.dependsOn)),
    (list) => r.flatten<string>(list),
    (list) => r.reject(r.isNil, list),
    (list) => r.uniq(list),
    (list) => r.difference(list, ids)
  )(dependencyList);
  if(missing.length > 0) throw new Error(`Missing dependencies ${missing.join(', ')}`)

  const levels = [];

  let nameToDependencies = dependencyList.reduce<{ [key: string]: string[] }>((output, dependency) => {
    output[dependency.id] = r.defaultTo([], dependency.dependsOn);
    return output;
  }, {});

  while (!r.isEmpty(nameToDependencies)) {
    const emptyDependencyIds = Object.entries(nameToDependencies).filter(([_id, dependency]) => dependency.length === 0).map(([id]) => id);
    if (emptyDependencyIds.length === 0) throw new Error('There is a cyclic dependency in the dependency graph.');
    levels.push(emptyDependencyIds);
    r.keys(nameToDependencies).forEach((id) => {
      nameToDependencies[id] = r.difference(nameToDependencies[id], emptyDependencyIds);
    })
    nameToDependencies = r.omit(emptyDependencyIds, nameToDependencies);
  }

  const resolved = {} as any;
  for (const level of levels) {
    await resolveLevel(dependencyList, resolved, level, callback);
  }
  return resolved as TOutput;

};
