import { resolve } from '../level-strategy';

import { dependencies } from './fixtures';

describe('resolve', () => {
  it('resolves all dependencies', async () => {
    const services = await resolve(dependencies);

    expect(services.a).not.toBeFalsy();
    expect(services.a.deps).not.toBeFalsy();
    expect(services.a.deps.c).not.toBeFalsy();
    expect(services.a.deps.c.deps).not.toBeFalsy();
    expect(services.a.deps.c.deps.e).not.toBeFalsy();
    expect(services.a.deps.c.deps.f).not.toBeFalsy();

    expect(services.b).not.toBeFalsy();
    expect(services.b.deps).not.toBeFalsy();
    expect(services.b.deps.c).not.toBeFalsy();

    expect(services.c).not.toBeFalsy();
    expect(services.c.deps).not.toBeFalsy();
    expect(services.c.deps.e).not.toBeFalsy();
    expect(services.c.deps.f).not.toBeFalsy();

    expect(services.d).not.toBeFalsy();
    expect(services.d.deps).not.toBeFalsy();
    expect(services.d.deps.b).not.toBeFalsy();

    expect(services.e).not.toBeFalsy();
    expect(services.e.deps).toBeFalsy();

    expect(services.f).not.toBeFalsy();
    expect(services.f.deps).not.toBeFalsy();
    expect(services.f.deps.g).not.toBeFalsy();

    expect(services.g).not.toBeFalsy();
    expect(services.g.deps).toBeFalsy();
  });
});
