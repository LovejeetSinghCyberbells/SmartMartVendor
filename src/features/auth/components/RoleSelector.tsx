import React from 'react';
import { StyleSheet, View } from 'react-native';
import LocalizedText from '../../../shared/i18n/LocalizedText';
import { RadioOption } from '../../../shared/components/common';

export type UserRole = 'customer' | 'delivery';

interface Props {
  selectedRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

const ROLES: { role: UserRole; title: string; description: string }[] = [
  {
    role: 'customer',
    title: 'Customer',
    description: 'Shop for groceries',
  },
  {
    role: 'delivery',
    title: 'Delivery partner',
    description: 'Deliver customer orders',
  },
];

const RoleSelector = ({ selectedRole, onRoleChange }: Props) => (
  <View style={styles.container}>
    <LocalizedText style={styles.label}>Continue as</LocalizedText>
    <View style={styles.options}>
      {ROLES.map(({ role, title, description }) => (
        <RadioOption
          key={role}
          title={title}
          subtitle={description}
          selected={role === selectedRole}
          onSelect={() => onRoleChange(role)}
          style={styles.option}
        />
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  options: {
    flexDirection: 'row',
    gap: 10,
  },
  option: {
    flex: 1,
    minHeight: 68,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 0,
  },
});

export default RoleSelector;
