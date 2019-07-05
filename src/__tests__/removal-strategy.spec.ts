import { resolve } from '../removal-strategy';
import { dependencies, missingDependencies } from './fixtures';

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

  it('throws an error for missing dependencies', async () => {
    expect(resolve(missingDependencies)).rejects.toThrow('Missing dependencies b')
  })

  it('invokes callback with result of each resolution invocation', async () => {
    const spy = jest.fn();
    const services = await resolve(dependencies, spy);
    expect(spy).toHaveBeenCalledWith(services.a);
    expect(spy).toHaveBeenCalledWith(services.b);
    expect(spy).toHaveBeenCalledWith(services.c);
    expect(spy).toHaveBeenCalledWith(services.d);
    expect(spy).toHaveBeenCalledWith(services.e);
    expect(spy).toHaveBeenCalledWith(services.f);
    expect(spy).toHaveBeenCalledWith(services.g);
    expect(spy).toHaveBeenCalledTimes(7);
  });
});
