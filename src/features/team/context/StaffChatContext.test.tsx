import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { StaffRoleProvider } from './StaffRoleContext';
import { StaffChatProvider, useStaffChat } from './StaffChatContext';

describe('StaffChatContext - In-Store Floor Chat and Direct Messaging', () => {
  let chatRef: ReturnType<typeof useStaffChat>;
  let renderer: ReactTestRenderer.ReactTestRenderer | null = null;

  const TestConsumer = () => {
    chatRef = useStaffChat();
    return null;
  };

  const renderWithProviders = () => {
    act(() => {
      renderer = ReactTestRenderer.create(
        <StaffRoleProvider>
          <StaffChatProvider>
            <TestConsumer />
          </StaffChatProvider>
        </StaffRoleProvider>
      );
    });
  };

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    if (renderer) {
      act(() => {
        renderer?.unmount();
      });
      renderer = null;
    }
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  it('initializes with default group channel and direct chats', () => {
    renderWithProviders();
    expect(chatRef.conversations.length).toBeGreaterThan(0);
    expect(chatRef.activeConversation).not.toBeNull();
    expect(chatRef.activeConversation?.id).toBe('channel-store-floor');
  });

  it('allows opening direct chat with a specific staff member', () => {
    renderWithProviders();
    let convId = '';
    act(() => {
      convId = chatRef.openDirectChatWithStaff('2');
    });
    expect(convId).toContain('direct_');
    expect(chatRef.activeConversation?.id).toBe(convId);
  });

  it('sends message and triggers simulated colleague reply with typing indicator', () => {
    renderWithProviders();
    act(() => {
      chatRef.openDirectChatWithStaff('2');
    });

    const initialCount = chatRef.messages.length;

    act(() => {
      chatRef.sendMessage('Can you come to cabin?');
    });

    expect(chatRef.messages.length).toBe(initialCount + 1);
    expect(chatRef.messages[chatRef.messages.length - 1].text).toBe(
      'Can you come to cabin?'
    );

    // Fast-forward for typing simulation
    act(() => {
      jest.advanceTimersByTime(3000);
    });

    // Colleague should have replied
    expect(chatRef.messages.length).toBe(initialCount + 2);
  });
});

