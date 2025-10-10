'use client';

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ConversationSummaryBufferMemory } from "langchain/memory";
import { ConversationChain } from "langchain/chains";
import { PromptTemplate } from "@langchain/core/prompts";

const SYSTEM_PROMPT = `You are a helpful Serbian language tutor. Your role is to help users learn Serbian through conversation, explanations, and practice.

Guidelines:
- Always be encouraging and patient
- Provide clear explanations of Serbian grammar, vocabulary, and pronunciation
- Use both Cyrillic and Latin scripts when helpful
- Give practical examples and usage tips
- Correct mistakes gently and explain why
- Suggest practice exercises when appropriate
- Keep responses conversational and engaging
- If asked about non-Serbian topics, gently redirect to Serbian learning

Current conversation:
{history}
Human: {input}
Assistant:`;

class SerbianChatbot {
  private chain: ConversationChain | null = null;
  private memory: ConversationSummaryBufferMemory | null = null;

  async initialize() {
    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not found in environment variables');
    }

    const model = new ChatGoogleGenerativeAI({
      apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
      modelName: "gemini-pro",
      temperature: 0.7,
    });

    this.memory = new ConversationSummaryBufferMemory({
      llm: model,
      maxTokenLimit: 2000,
      returnMessages: true,
    });

    const prompt = PromptTemplate.fromTemplate(SYSTEM_PROMPT);

    this.chain = new ConversationChain({
      llm: model,
      memory: this.memory,
      prompt: prompt,
    });
  }

  async chat(message: string): Promise<string> {
    if (!this.chain) {
      await this.initialize();
    }

    try {
      const response = await this.chain!.call({ input: message });
      return response.response;
    } catch (error) {
      console.error('Chat error:', error);
      throw new Error('Failed to get response from chatbot');
    }
  }

  clearMemory() {
    if (this.memory) {
      this.memory.clear();
    }
  }
}

export const serbianChatbot = new SerbianChatbot();