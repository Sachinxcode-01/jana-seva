import { db } from '../../database/db.js';
import { Conversation, ConversationMessage } from '../../types.js';

export class ConversationService {
  public getConversation(id: string, userId?: string): Conversation | null {
    const conv = db.getConversationById(id);
    if (!conv) return null;

    // Enforce ownership: If conversation has a userId, only matching user can access
    if (conv.userId && userId && conv.userId !== userId) {
      return null;
    }
    return conv;
  }

  public listUserConversations(userId?: string): Conversation[] {
    return db.getConversations(userId);
  }

  public createConversation(userId?: string, title?: string, language = 'kn'): Conversation {
    return db.createConversation({ userId, title, language });
  }

  public addMessage(
    conversationId: string,
    message: {
      role: 'user' | 'assistant' | 'system';
      content: string;
      speechText?: string;
      language?: string;
      suggestedSchemes?: any[];
      modelUsed?: string;
    }
  ): ConversationMessage | null {
    return db.addMessageToConversation(conversationId, message);
  }

  public deleteConversation(id: string, userId?: string): boolean {
    return db.deleteConversation(id, userId);
  }

  public clearConversation(id: string, userId?: string): boolean {
    return db.clearConversationMessages(id, userId);
  }
}

export const conversationService = new ConversationService();
