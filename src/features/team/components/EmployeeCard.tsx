import React from 'react';
import { View, StyleSheet } from 'react-native';
import TouchableOpacity from '../../../shared/components/AnimatedTouchableOpacity';
import Icon from '@react-native-vector-icons/feather';
import LocalizedText from '../../../shared/i18n/LocalizedText';
import { Avatar } from '../../../shared/components/common';
import RoleBadge, { TeamRole } from './RoleBadge';

interface Employee {
  id: string;
  name: string;
  role: TeamRole;
  customLabel?: string;
  phone: string;
  status: 'Active' | 'Offline' | 'On Leave';
  tasksToday?: number;
  permissionLabel?: string;
  avatarUrl?: string;
  permissions?: any;
}

interface Props {
  employee: Employee;
  onPress: () => void;
  onQuickChat?: () => void;
  onQuickSummon?: () => void;
  onQuickNotify?: () => void;
}

const EmployeeCard: React.FC<Props> = ({
  employee,
  onPress,
  onQuickChat,
  onQuickSummon,
  onQuickNotify,
}) => {
  const isOnline = employee.status === 'Active';

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={onPress}>
      <Avatar
        source={employee.avatarUrl}
        role={employee.role}
        permissions={employee.permissions}
        size={48}
        showStatus
        status={isOnline ? 'online' : 'offline'}
        style={styles.avatar}
      />

      <View style={styles.content}>
        <View style={styles.topRow}>
          <LocalizedText style={styles.name}>{employee.name}</LocalizedText>
          <RoleBadge role={employee.role} customLabel={employee.customLabel} />
        </View>

        <LocalizedText style={styles.phone}>{employee.phone}</LocalizedText>

        <View style={styles.bottomRow}>
          <LocalizedText
            style={[
              styles.statusText,
              { color: isOnline ? '#059669' : '#6b7280' },
            ]}
          >
            {employee.status}
          </LocalizedText>
          {employee.tasksToday !== undefined && (
            <LocalizedText style={styles.tasks}>
              {employee.tasksToday} tasks today
            </LocalizedText>
          )}
        </View>
      </View>

      <View style={styles.actionsRight}>
        {onQuickChat && (
          <TouchableOpacity
            style={styles.quickChatBtn}
            scaleTo={0.88}
            onPress={onQuickChat}
            accessibilityLabel="Chat with employee"
          >
            <Icon name="message-circle" size={13} color="#2563eb" />
          </TouchableOpacity>
        )}
        {onQuickNotify && (
          <TouchableOpacity
            style={styles.quickNotifyBtn}
            scaleTo={0.88}
            onPress={onQuickNotify}
            accessibilityLabel="Notify employee"
          >
            <Icon name="send" size={12} color="#258B3E" />
          </TouchableOpacity>
        )}
        {onQuickSummon && (
          <TouchableOpacity
            style={styles.quickSummonBtn}
            scaleTo={0.88}
            onPress={onQuickSummon}
            accessibilityLabel="Ring employee"
          >
            <Icon name="bell" size={14} color="#dc2626" />
          </TouchableOpacity>
        )}
        <Icon name="chevron-right" size={18} color="#9ca3af" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  avatar: {
    marginRight: 14,
  },
  content: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  name: {
    fontSize: 15,
    fontFamily: 'Poppins-SemiBold',
    color: '#1a1a1a',
  },
  phone: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 12,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
  },
  tasks: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6b7280',
  },
  actionsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  quickChatBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickNotifyBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#EAF5ED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickSummonBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default EmployeeCard;