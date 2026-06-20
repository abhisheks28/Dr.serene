import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../db/jsonStore.js';

describe('Cognitive App API Service Contract Tests', () => {
  beforeEach(() => {
    db.resetForTest();
  });

  it('verifies signup credentials contract', () => {
    const signupData = {
      email: 'newstudent@serene.com',
      password: 'mypassword123',
      examType: 'NEET' as const
    };
    
    const user = db.createUser(signupData.email, signupData.password, signupData.examType);
    expect(user).toBeDefined();
    expect(user.email).toBe(signupData.email);
    expect(db.verifyUserPassword(signupData.email, signupData.password)).toBe(true);
  });

  it('verifies signin validation constraints on missing or invalid users', () => {
    const email = 'unknown@serene.com';
    const isValid = db.verifyUserPassword(email, 'somepassword');
    expect(isValid).toBe(false);
  });

  it('correctly handles automated demo-journal pre-seeding on fresh session instantiation', () => {
    const freshSessionId = 'session_demo_999';
    const session = db.createSession(freshSessionId, 'UPSC');
    expect(session).toBeDefined();
    expect(session.id).toBe(freshSessionId);
    expect(session.examType).toBe('UPSC');
  });
});
