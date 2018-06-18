export interface Dependency<TOutput = any> {
  id: string;
  factory: (resolved: TOutput) => Promise<any>;
  dependsOn?: string[];
}
