/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { 
  AnonymousSession, 
  JournalEntry, 
  StressAnalysis, 
  BurnoutPrediction, 
  WellnessPlan, 
  ChatSession, 
  ChatMessage,
  ExamType,
  User
} from '../types.js';

interface DatabaseSchema {
  users: Record<string, User>;
  sessions: Record<string, AnonymousSession>;
  journals: JournalEntry[];
  stressAnalyses: StressAnalysis[];
  burnoutPredictions: BurnoutPrediction[];
  wellnessPlans: WellnessPlan[];
  chats: Record<string, ChatMessage[]>;
}

const DB_FILE = path.join(process.cwd(), 'data', 'database.json');

class JSONStore {
  private data: DatabaseSchema = {
    users: {},
    sessions: {},
    journals: [],
    stressAnalyses: [],
    burnoutPredictions: [],
    wellnessPlans: [],
    chats: {}
  };

  constructor() {
    this.load();
  }

  private load() {
    try {
      const dir = path.dirname(DB_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(fileContent);
        
        // Safety initialization migration
        if (!this.data.users) this.data.users = {};
        if (!this.data.sessions) this.data.sessions = {};
        if (!this.data.journals) this.data.journals = [];
        if (!this.data.stressAnalyses) this.data.stressAnalyses = [];
        if (!this.data.burnoutPredictions) this.data.burnoutPredictions = [];
        if (!this.data.wellnessPlans) this.data.wellnessPlans = [];
        if (!this.data.chats) this.data.chats = {};
      } else {
        this.save();
      }

      this.seedDefaultUser();

    } catch (err) {
      console.error('Error loading JSON DB, using default schema:', err);
    }
  }

  private hashPassword(password: string, salt: string): string {
    return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  }

  private generateSalt(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  // Pre-seed default login credentials
  private seedDefaultUser() {
    const defaultEmail = 'student@serene.com';
    if (!this.data.users[defaultEmail]) {
      const salt = this.generateSalt();
      this.data.users[defaultEmail] = {
        email: defaultEmail,
        password: this.hashPassword('password123', salt),
        salt,
        examType: 'JEE',
        createdAt: new Date().toISOString()
      };
      this.save();
    }
  }

  private save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving JSON DB:', err);
    }
  }

  // Users
  public createUser(email: string, password?: string, examType?: ExamType): User {
    const salt = this.generateSalt();
    const user: User = {
      email,
      password: password ? this.hashPassword(password, salt) : undefined,
      salt,
      examType: examType || 'JEE',
      createdAt: new Date().toISOString()
    };
    this.data.users[email] = user;
    this.save();
    return user;
  }

  public verifyUserPassword(email: string, passwordAttempt: string): boolean {
    const user = this.getUser(email);
    if (!user) return false;
    
    // Support potential legacy unhashed profiles seamlessly
    if (!user.salt) {
      const isPlaintextMatch = user.password === passwordAttempt;
      if (isPlaintextMatch) {
         const upgradedSalt = this.generateSalt();
         user.salt = upgradedSalt;
         user.password = this.hashPassword(passwordAttempt, upgradedSalt);
         this.save();
      }
      return isPlaintextMatch;
    }

    const attemptHash = this.hashPassword(passwordAttempt, user.salt);
    return user.password === attemptHash;
  }

  public getUser(email: string): User | undefined {
    return this.data.users[email];
  }

  // Sessions
  public createSession(id: string, examType: ExamType): AnonymousSession {
    const session: AnonymousSession = {
      id,
      examType,
      createdAt: new Date().toISOString()
    };
    this.data.sessions[id] = session;
    this.save();
    return session;
  }

  public getSession(id: string): AnonymousSession | undefined {
    return this.data.sessions[id];
  }

  // Journals
  public saveJournal(entry: JournalEntry): JournalEntry {
    this.data.journals.push(entry);
    this.save();
    return entry;
  }

  public getJournals(sessionId: string): JournalEntry[] {
    return this.data.journals
      .filter(j => j.sessionId === sessionId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  // Stress analysis
  public saveStressAnalysis(analysis: StressAnalysis): StressAnalysis {
    this.data.stressAnalyses.push(analysis);
    this.save();
    return analysis;
  }

  public getStressAnalyses(sessionId: string): StressAnalysis[] {
    return this.data.stressAnalyses
      .filter(sa => sa.sessionId === sessionId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  // Burnout Predictions
  public saveBurnoutPrediction(prediction: BurnoutPrediction): BurnoutPrediction {
    this.data.burnoutPredictions.push(prediction);
    this.save();
    return prediction;
  }

  public getLatestBurnoutPrediction(sessionId: string): BurnoutPrediction | undefined {
    const preds = this.data.burnoutPredictions
      .filter(bp => bp.sessionId === sessionId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return preds[0];
  }

  // Wellness Plans
  public saveWellnessPlan(plan: WellnessPlan): WellnessPlan {
    this.data.wellnessPlans.push(plan);
    this.save();
    return plan;
  }

  public getLatestWellnessPlan(sessionId: string): WellnessPlan | undefined {
    const plans = this.data.wellnessPlans
      .filter(wp => wp.sessionId === sessionId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return plans[0];
  }

  // Chats
  public getOrCreateChat(sessionId: string): ChatMessage[] {
    if (!this.data.chats[sessionId]) {
      this.data.chats[sessionId] = [];
      this.save();
    }
    return this.data.chats[sessionId];
  }

  public addChatMessage(sessionId: string, message: ChatMessage): ChatMessage {
    const chat = this.getOrCreateChat(sessionId);
    chat.push(message);
    this.save();
    return message;
  }

  public clearChat(sessionId: string) {
    this.data.chats[sessionId] = [];
    this.save();
  }

  public resetForTest() {
    this.data = {
      users: {},
      sessions: {},
      journals: [],
      stressAnalyses: [],
      burnoutPredictions: [],
      wellnessPlans: [],
      chats: {}
    };
    this.save();
  }
}

export const db = new JSONStore();
