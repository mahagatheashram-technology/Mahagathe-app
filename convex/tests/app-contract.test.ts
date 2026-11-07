import assert from 'node:assert/strict';
import { test } from 'node:test';
import { canUsePersonalFeatures } from '../../src/data/session';
import { phoneWithCountryCode } from '../../src/data/phone';
import { clearMockUserData, getState, setState } from '../../src/data/mockStore';
import type { Profile } from '../../src/data/types';

const profile: Profile = { id: 'me', displayName: '[Name]', phoneMasked: '', ageBand: '13-17', roles: [], language: 'en', reminderTime: null, guardianConsent: 'pending', enrolled: false };
void test('authentication never bypasses setup or guardian consent', () => {
  assert.equal(canUsePersonalFeatures('signedIn', { ...profile, ageBand: null }), false);
  assert.equal(canUsePersonalFeatures('signedIn', profile), false);
  assert.equal(canUsePersonalFeatures('signedIn', { ...profile, guardianConsent: 'granted' }), true);
  assert.equal(canUsePersonalFeatures('guest', { ...profile, guardianConsent: 'granted' }), false);
});
void test('sign-out clears account activity before another mock account signs in', () => {
  setState(() => ({ profile, session: 'signedIn', pendingPhone: '+919876543210', savedVakyamIds: ['v1'], registeredEventIds: ['event'], readingPositions: { e: 0.8 }, lastEpisodeId: 'e', donations: [{ id: 'd', amount: 101, purposeName: 'Seva', status: 'pending' }] }));
  const count = getState().groupTodayCount;
  clearMockUserData();
  const state = getState();
  assert.equal(state.profile, null);
  assert.equal(state.pendingPhone, null);
  assert.equal(state.mandala, null);
  assert.deepEqual(state.readingPositions, {});
  assert.deepEqual(state.registeredEventIds, []);
  assert.deepEqual(state.savedVakyamIds, []);
  assert.deepEqual(state.donations, []);
  assert.equal(state.groupTodayCount, count);
});
void test('phone normalization accepts Indian local or explicit E.164 and rejects masked values', () => {
  assert.equal(phoneWithCountryCode('98765 43210'), '+919876543210');
  assert.equal(phoneWithCountryCode('+1 (202) 555-0123'), '+12025550123');
  assert.throws(() => phoneWithCountryCode('+91 ••••• ••210'));
});
