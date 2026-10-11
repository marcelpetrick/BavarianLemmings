// SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
// SPDX-License-Identifier: GPL-3.0-or-later

import { describe, expect, it } from 'vitest';
import { constant, constantRegistry } from '../../src/sim/constant';

describe('constant()', () => {
  it('returns the value and records its provenance', () => {
    const value = constant('TEST_A', 7, { unit: 'px', status: 'unverified', source: 'test' });
    expect(value).toBe(7);
    expect(constantRegistry.get('TEST_A')).toEqual({ value: 7, unit: 'px', status: 'unverified', source: 'test' });
  });

  it('rejects a duplicate name', () => {
    constant('TEST_B', 1, { unit: 'px', status: 'design', source: 'test' });
    expect(() => constant('TEST_B', 2, { unit: 'px', status: 'design', source: 'test' })).toThrow(/twice/);
  });

  it('rejects a non-finite value', () => {
    expect(() => constant('TEST_C', Number.NaN, { unit: 'px', status: 'design', source: 'test' })).toThrow(/finite/);
  });
});
