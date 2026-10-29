import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useStaffRole } from './StaffRoleContext';
import { safeVibrate } from '../../../shared/utils/vibration';

export interface ChatAttachment {
  type: 'order' | 'product' | 'location';
  id?: string;
  title: string;
  subtitle?: string;
  badge?: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  senderAvatar: string;
  text: string;
  timestamp: number;
  timeFormatted: string;
  attachment?: ChatAttachment;
  status: 'sent' | 'delivered' | 'read';
}

export interface ChatConversation {
  id: string;
  type: 'channel' | 'direct';
  title: string;
  subtitle: string;
  avatarText?: string;
  avatarIcon?: string;
  participantIds: string[];
  otherParticipantId?: string;
  otherParticipantRole?: string;
  otherParticipantLocation?: string;
  isOnline?: boolean;
  lastMessage?: ChatMessage;
  unreadCount: number;
  updatedAt: number;
}

interface StaffChatContextType {
  conversations: ChatConversation[];
  activeConversation: ChatConversation | null;
  messages: ChatMessage[];
  isPartnerTyping: boolean;
  totalUnreadCount: number;
  openConversation: (conversationId: string) => void;
  openDirectChatWithStaff: (targetStaffId: string) => string;
  sendMessage: (text: string, attachment?: ChatAttachment) => void;
  markConversationAsRead: (conversationId: string) => void;
}

const formatTime = (ts: number): string => {
  const d = new Date(ts);
  let h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
};

const getDirectConvId = (id1: string, id2: string): string => {
  const sorted = [id1, id2].sort();
  return `direct_${sorted[0]}_${sorted[1]}`;
};

// Initial Store Operations Messages
const INITIAL_MESSAGES: Record<string, ChatMessage[]> = {
  'channel-store-floor': [
    {
      id: 'msg-group-1',
      conversationId: 'channel-store-floor',
      senderId: '1',
      senderName: 'Sunita Rao',
      senderRole: 'Store Manager',
      senderAvatar: 'SR',
      text: 'Good morning team! Morning grocery & dairy replenishment arriving at rear dock bay #4.',
      timestamp: Date.now() - 45 * 60 * 1000,
      timeFormatted: formatTime(Date.now() - 45 * 60 * 1000),
      status: 'read',
    },
    {
      id: 'msg-group-2',
      conversationId: 'channel-store-floor',
      senderId: '4',
      senderName: 'Vikram Patel',
      senderRole: 'Inventory',
      senderAvatar: 'VP',
      text: 'Got it Sunita ma\'am. Pallets are unloaded and shelf auditing starts now.',
      timestamp: Date.now() - 40 * 60 * 1000,
      timeFormatted: formatTime(Date.now() - 40 * 60 * 1000),
      status: 'read',
    },
    {
      id: 'msg-group-3',
      conversationId: 'channel-store-floor',
      senderId: '2',
      senderName: 'Priya Sharma',
      senderRole: 'Biller',
      senderAvatar: 'PS',
      text: 'Counter 1 register opened and scanner verified. Ready for walk-in rush!',
      timestamp: Date.now() - 30 * 60 * 1000,
      timeFormatted: formatTime(Date.now() - 30 * 60 * 1000),
      status: 'read',
    },
    {
      id: 'msg-group-4',
      conversationId: 'channel-store-floor',
      senderId: '3',
      senderName: 'Rahul Verma',
      senderRole: 'Online Orders',
      senderAvatar: 'RV',
      text: 'Blinkit order rush picking in Aisle 2. Staging bags at Dispatch Bay #4.',
      timestamp: Date.now() - 15 * 60 * 1000,
      timeFormatted: formatTime(Date.now() - 15 * 60 * 1000),
      status: 'read',
    },
  ],
};

const StaffChatContext = createContext<StaffChatContextType>({
  conversations: [],
  activeConversation: null,
  messages: [],
  isPartnerTyping: false,
  totalUnreadCount: 0,
  openConversation: () => {},
  openDirectChatWithStaff: () => '',
  sendMessage: () => {},
  markConversationAsRead: () => {},
});

export const StaffChatProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { currentEmployee, allStaff } = useStaffRole();

  const [allMessages, setAllMessages] = useState<Record<string, ChatMessage[]>>(INITIAL_MESSAGES);
  const [activeConvId, setActiveConvId] = useState<string>('channel-store-floor');
  const [isPartnerTyping, setIsPartnerTyping] = useState<boolean>(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-replies generator based on colleague's assigned role
  const generateSimulatedReply = (
    incomingText: string,
    partnerRole: string,
    partnerName: string
  ): string => {
    const textLower = incomingText.toLowerCase();

    if (partnerRole === 'MANAGER') {
      if (textLower.includes('cabin') || textLower.includes('office') || textLower.includes('come')) {
        return 'Yes, please come into Cabin #1 right away.';
      }
      if (textLower.includes('discount') || textLower.includes('price') || textLower.includes('mrp')) {
        return 'Apply store price tag discount from barcode terminal.';
      }
      if (textLower.includes('order') || textLower.includes('rush')) {
        return 'Keep dispatch bay clear and ensure rider bags are sealed properly.';
      }
      return `Thanks for the update. Keep up the high speed and accuracy on the floor.`;
    }

    if (partnerRole === 'BILLER') {
      if (textLower.includes('queue') || textLower.includes('rush') || textLower.includes('counter')) {
        return 'Queue is moving fast! Just 2 walk-in carts left at Counter 1.';
      }
      if (textLower.includes('cabin') || textLower.includes('come')) {
        return 'Finishing this customer bill now, heading to cabin in 2 minutes!';
      }
      if (textLower.includes('upi') || textLower.includes('cash')) {
        return 'Cash drawer is balanced and QR code soundbox is active.';
      }
      return 'Acknowledged from Billing Counter #1!';
    }

    if (partnerRole === 'ORDERS') {
      if (textLower.includes('blinkit') || textLower.includes('swiggy') || textLower.includes('order')) {
        return 'Order is packed and sealed with bag tag, waiting at Bay #4 for rider.';
      }
      if (textLower.includes('cabin') || textLower.includes('come')) {
        return 'Dropping the staged order at dispatch bay, on my way to cabin now!';
      }
      return 'Picking items from Aisle 2, target SLA is 3 minutes.';
    }

    if (partnerRole === 'INVENTORY') {
      if (textLower.includes('stock') || textLower.includes('shelf') || textLower.includes('audit')) {
        return 'Restocking completed for fresh produce and dairy shelf.';
      }
      if (textLower.includes('barcode') || textLower.includes('scanner')) {
        return 'All shelf barcode price tags match the system MRP.';
      }
      return 'Inventory checklist updated on the terminal!';
    }

    return 'Understood! Updating on my station now.';
  };

  // Build conversations list dynamically for current logged-in employee
  const conversations: ChatConversation[] = React.useMemo(() => {
    const list: ChatConversation[] = [];

    // 1. Store Floor Channel (pinned for everyone)
    const floorMsgs = allMessages['channel-store-floor'] || [];
    const lastFloorMsg = floorMsgs[floorMsgs.length - 1];
    list.push({
      id: 'channel-store-floor',
      type: 'channel',
      title: 'Store Floor Team (All Staff)',
      subtitle: '#floor-general • Store Operations & Rush',
      avatarIcon: 'users',
      participantIds: allStaff.map((s) => s.id),
      lastMessage: lastFloorMsg,
      unreadCount: 0,
      updatedAt: lastFloorMsg ? lastFloorMsg.timestamp : Date.now(),
    });

    // 2. Direct 1-on-1 chats with all other colleagues
    const otherStaff = allStaff.filter((s) => s.id !== currentEmployee.id);
    otherStaff.forEach((staff) => {
      const convId = getDirectConvId(currentEmployee.id, staff.id);
      const msgs = allMessages[convId] || [];
      const lastMsg = msgs[msgs.length - 1];

      // Station location label
      const station =
        staff.role === 'MANAGER'
          ? 'Manager Cabin #1'
          : staff.role === 'BILLER'
          ? 'POS Counter #1'
          : staff.role === 'ORDERS'
          ? 'Dispatch Bay #4'
          : staff.role === 'INVENTORY'
          ? 'Stockroom & Aisle 1'
          : 'Store Floor Station';

      list.push({
        id: convId,
        type: 'direct',
        title: staff.name,
        subtitle: `${staff.roleTitle} • ${station}`,
        avatarText: staff.avatarText,
        participantIds: [currentEmployee.id, staff.id],
        otherParticipantId: staff.id,
        otherParticipantRole: staff.role,
        otherParticipantLocation: station,
        isOnline: staff.status === 'Active',
        lastMessage: lastMsg,
        unreadCount: msgs.filter(
          (m) => m.senderId !== currentEmployee.id && m.status !== 'read'
        ).length,
        updatedAt: lastMsg ? lastMsg.timestamp : Date.now() - 3600000,
      });
    });

    return list.sort((a, b) => b.updatedAt - a.updatedAt);
  }, [allStaff, currentEmployee, allMessages]);

  const activeConversation =
    conversations.find((c) => c.id === activeConvId) ||
    (activeConvId.startsWith('direct_')
      ? {
          id: activeConvId,
          type: 'direct' as const,
          title: 'Store Colleague',
          subtitle: 'Direct Messaging',
          avatarText: 'SC',
          participantIds: [currentEmployee.id],
          unreadCount: 0,
          updatedAt: Date.now(),
        }
      : conversations[0] || null);

  const messages = allMessages[activeConvId] || [];

  const totalUnreadCount = conversations.reduce(
    (acc, curr) => acc + curr.unreadCount,
    0
  );

  const openConversation = (convId: string) => {
    setActiveConvId(convId);
    markConversationAsRead(convId);
  };

  const openDirectChatWithStaff = (targetStaffId: string): string => {
    const target = allStaff.find(
      (s) =>
        s.id === targetStaffId ||
        s.id === `emp-${targetStaffId}` ||
        targetStaffId === `emp-${s.id}`
    );
    const resolvedId = target ? target.id : targetStaffId;
    const convId = getDirectConvId(currentEmployee.id, resolvedId);
    setActiveConvId(convId);
    markConversationAsRead(convId);
    return convId;
  };

  const markConversationAsRead = (convId: string) => {
    setAllMessages((prev) => {
      const existing = prev[convId];
      if (!existing) return prev;
      const updated = existing.map((m) =>
        m.senderId !== currentEmployee.id ? { ...m, status: 'read' as const } : m
      );
      return { ...prev, [convId]: updated };
    });
  };

  const sendMessage = (text: string, attachment?: ChatAttachment) => {
    if (!text.trim() && !attachment) return;

    safeVibrate(20);

    const now = Date.now();
    const newMsg: ChatMessage = {
      id: `msg-${now}-${Math.random().toString(36).substr(2, 6)}`,
      conversationId: activeConvId,
      senderId: currentEmployee.id,
      senderName: currentEmployee.name,
      senderRole: currentEmployee.roleTitle,
      senderAvatar: currentEmployee.avatarText,
      text: text.trim(),
      timestamp: now,
      timeFormatted: formatTime(now),
      attachment,
      status: 'sent',
    };

    setAllMessages((prev) => ({
      ...prev,
      [activeConvId]: [...(prev[activeConvId] || []), newMsg],
    }));

    // If direct chat or group, simulate partner reading & typing back for realistic chat experience
    if (activeConversation) {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

      const isDirect = activeConversation.type === 'direct';
      const partnerId = activeConversation.otherParticipantId;
      const partner = allStaff.find((s) => s.id === partnerId) || allStaff.find((s) => s.id !== currentEmployee.id);

      if (partner) {
        // Mark message as delivered & read after 600ms
        setTimeout(() => {
          setAllMessages((prev) => {
            const list = prev[activeConvId] || [];
            return {
              ...prev,
              [activeConvId]: list.map((m) =>
                m.id === newMsg.id ? { ...m, status: 'read' as const } : m
              ),
            };
          });
        }, 600);

        // Simulate typing indicator
        setTimeout(() => {
          setIsPartnerTyping(true);
        }, 900);

        // Generate response after realistic 1.6s typing delay
        typingTimeoutRef.current = setTimeout(() => {
          setIsPartnerTyping(false);
          safeVibrate(40);

          const replyText = generateSimulatedReply(
            newMsg.text,
            partner.role,
            partner.name
          );

          const replyMsg: ChatMessage = {
            id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
            conversationId: activeConvId,
            senderId: partner.id,
            senderName: partner.name,
            senderRole: partner.roleTitle,
            senderAvatar: partner.avatarText,
            text: replyText,
            timestamp: Date.now(),
            timeFormatted: formatTime(Date.now()),
            status: 'read',
          };

          setAllMessages((prev) => ({
            ...prev,
            [activeConvId]: [...(prev[activeConvId] || []), replyMsg],
          }));
        }, 2200);
      }
    }
  };

  return (
    <StaffChatContext.Provider
      value={{
        conversations,
        activeConversation,
        messages,
        isPartnerTyping,
        totalUnreadCount,
        openConversation,
        openDirectChatWithStaff,
        sendMessage,
        markConversationAsRead,
      }}
    >
      {children}
    </StaffChatContext.Provider>
  );
};

export const useStaffChat = () => useContext(StaffChatContext);
