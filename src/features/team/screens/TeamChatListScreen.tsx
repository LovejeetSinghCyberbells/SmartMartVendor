import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '@react-native-vector-icons/feather';
import TouchableOpacity from '../../../shared/components/AnimatedTouchableOpacity';
import LocalizedText from '../../../shared/i18n/LocalizedText';
import {
  ScreenHeader,
  SearchBar,
  AnimatedEntranceView,
  getStaggerDelay,
  Badge,
  Avatar,
  Chip,
} from '../../../shared/components/common';
import { useStaffChat, ChatConversation } from '../context/StaffChatContext';
import { useStaffRole } from '../context/StaffRoleContext';
import { colors } from '../../../shared/theme/colors';

const TeamChatListScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { currentEmployee } = useStaffRole();
  const { conversations, openConversation } = useStaffChat();

  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'DIRECT' | 'CHANNELS'>('ALL');

  const filteredConversations = useMemo(() => {
    return conversations.filter((c) => {
      const matchesSearch =
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.subtitle.toLowerCase().includes(search.toLowerCase()) ||
        (c.lastMessage?.text || '').toLowerCase().includes(search.toLowerCase());

      if (!matchesSearch) return false;
      if (activeFilter === 'DIRECT') return c.type === 'direct';
      if (activeFilter === 'CHANNELS') return c.type === 'channel';
      return true;
    });
  }, [conversations, search, activeFilter]);

  const handleSelectConversation = (conversation: ChatConversation) => {
    openConversation(conversation.id);
    navigation.navigate('TeamChatConversation', { conversationId: conversation.id });
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      {/* Screen Header */}
      <ScreenHeader
        title="Store Floor Chat"
        onBack={() => navigation.goBack()}
        showBorder={false}
        rightElement={
          <View style={styles.headerRightRow}>
            <TouchableOpacity
              style={styles.headerActionBtn}
              scaleTo={0.88}
              onPress={() => navigation.navigate('TeamManagement')}
              accessibilityLabel="Team Roster"
            >
              <Icon name="users" size={19} color="#258B3E" />
            </TouchableOpacity>
          </View>
        }
      />

      {/* Search Input */}
      <AnimatedEntranceView delay={40} direction="down" distance={10}>
        <SearchBar
          placeholder="Search colleague or floor message..."
          value={search}
          onChangeText={setSearch}
        />
      </AnimatedEntranceView>

      {/* Filter Tabs */}
      <AnimatedEntranceView delay={80} direction="down" distance={10}>
        <View style={styles.filterRow}>
          <Chip
            label="All Messages"
            selected={activeFilter === 'ALL'}
            onPress={() => setActiveFilter('ALL')}
            size="sm"
          />
          <Chip
            label={`Direct Staff (${conversations.filter((c) => c.type === 'direct').length})`}
            selected={activeFilter === 'DIRECT'}
            onPress={() => setActiveFilter('DIRECT')}
            size="sm"
          />
          <Chip
            label="Store Channels"
            selected={activeFilter === 'CHANNELS'}
            onPress={() => setActiveFilter('CHANNELS')}
            size="sm"
          />
        </View>
      </AnimatedEntranceView>

      {/* Conversation List */}
      <FlatList
        data={filteredConversations}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => {
          const isChannel = item.type === 'channel';
          const lastMsg = item.lastMessage;
          const hasUnread = item.unreadCount > 0;

          return (
            <AnimatedEntranceView
              delay={getStaggerDelay(index, 100, 35)}
              direction="up"
              distance={16}
            >
              <TouchableOpacity
                style={[styles.chatCard, hasUnread && styles.chatCardUnread]}
                scaleTo={0.98}
                onPress={() => handleSelectConversation(item)}
              >
                {/* Avatar */}
                <Avatar
                  source={!isChannel ? (item as any).avatarUrl : undefined}
                  icon={isChannel ? 'message-square' : undefined}
                  role={!isChannel ? item.otherParticipantRole : undefined}
                  size={46}
                  showStatus={!isChannel}
                  status={item.isOnline ? 'online' : 'offline'}
                  style={styles.avatarWrap}
                />

                {/* Info Body */}
                <View style={styles.chatBody}>
                  <View style={styles.chatTopRow}>
                    <View style={styles.titleWrap}>
                      <LocalizedText style={styles.chatTitle} numberOfLines={1}>
                        {item.title}
                      </LocalizedText>
                      {isChannel && (
                        <Badge
                          label="TEAM"
                          backgroundColor="#EAF5ED"
                          textColor="#258B3E"
                          size="sm"
                          style={{ marginLeft: 6 }}
                        />
                      )}
                    </View>

                    <LocalizedText style={styles.chatTime}>
                      {lastMsg ? lastMsg.timeFormatted : ''}
                    </LocalizedText>
                  </View>

                  <LocalizedText style={styles.chatSubtitle} numberOfLines={1}>
                    {item.subtitle}
                  </LocalizedText>

                  {/* Message Preview */}
                  <View style={styles.chatPreviewRow}>
                    <LocalizedText
                      style={[
                        styles.chatPreviewText,
                        hasUnread && styles.chatPreviewTextUnread,
                      ]}
                      numberOfLines={1}
                    >
                      {lastMsg ? (
                        <>
                          {lastMsg.senderId === currentEmployee.id && (
                            <LocalizedText style={{ color: '#258B3E', fontFamily: 'Poppins-Medium' }}>
                              You:{' '}
                            </LocalizedText>
                          )}
                          {lastMsg.text}
                        </>
                      ) : (
                        'No messages yet. Tap to start chatting.'
                      )}
                    </LocalizedText>

                    {hasUnread && (
                      <View style={styles.unreadBadge}>
                        <LocalizedText style={styles.unreadBadgeText}>
                          {item.unreadCount}
                        </LocalizedText>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            </AnimatedEntranceView>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  headerRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerActionBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EAF5ED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  filterChipActive: {
    backgroundColor: '#258B3E',
  },
  filterChipText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#4b5563',
  },
  filterChipTextActive: {
    color: '#ffffff',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 30,
  },
  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  chatCardUnread: {
    borderColor: '#c6e8cf',
    backgroundColor: '#fafdfa',
  },
  avatarWrap: {
    marginRight: 12,
  },
  chatBody: {
    flex: 1,
  },
  chatTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  chatTitle: {
    fontSize: 14.5,
    fontFamily: 'Poppins-Bold',
    color: '#111827',
  },
  chatTime: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#9ca3af',
  },
  chatSubtitle: {
    fontSize: 11.5,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    marginBottom: 4,
  },
  chatPreviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatPreviewText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
    flex: 1,
    marginRight: 8,
  },
  chatPreviewTextUnread: {
    fontFamily: 'Poppins-SemiBold',
    color: '#111827',
  },
  unreadBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#258B3E',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  unreadBadgeText: {
    fontSize: 10,
    fontFamily: 'Poppins-Bold',
    color: '#ffffff',
  },
});

export default TeamChatListScreen;

