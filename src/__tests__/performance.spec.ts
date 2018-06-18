/**
 * @jest-environment node
 */
import { Suite } from 'benchmark';

import { resolve as levelStrategy } from '../level-strategy';
import { resolve as removalStrategy } from '../removal-strategy';

import { dependencies } from './fixtures';
const suite = new Suite('Resolve Strategies');

describe('Performance', () => {
  it('performs', (done) => {
    suite
      .add('Level Strategy', {
        defer: true,
        delay: 0,
        maxTime: 3,
        fn(deferred: any) {
          levelStrategy(dependencies).then(() => deferred.resolve());
        },
      })
      .add('Removal Strategy', {
        defer: true,
        delay: 0,
        maxTime: 3,
        fn(deferred: any) {
          removalStrategy(dependencies).then(() => deferred.resolve());
        },
      })
      .on('complete', function (this: Suite) {
        // tslint:disable-next-line:no-console
        this.forEach(b => console.log(b.name + ':', b.times.cycle * 1000, 'ms'));
        // tslint:disable-next-line:no-console
        console.log('Fastest is ' + this.filter('fastest').map('name' as any));
        done();
      })
      .run({ async: true });
    expect(true).toBe(true);
  }, 15000);
});
