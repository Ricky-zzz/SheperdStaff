import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../lib/theme/colors';
import { ExpenseCategory } from '../../features/expenses/types';

const CATEGORIES: { label: string; value: ExpenseCategory; icon: keyof typeof Ionicons.glyphMap }[] = [
  { label: 'Feed', value: 'feed', icon: 'restaurant' },
  { label: 'Medicine', value: 'medicine', icon: 'medkit' },
  { label: 'Supplies', value: 'supplies', icon: 'cube' },
  { label: 'Maintenance', value: 'maintenance', icon: 'construct' },
  { label: 'Labor', value: 'labor', icon: 'people' },
  { label: 'Other', value: 'other', icon: 'ellipsis-horizontal' },
];

const inputClass = 'bg-white border border-border rounded-lg px-4 py-3 text-base text-neutral-800 mb-4';

export default function AddExpenseScreen() {
  const router = useRouter();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('feed');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const handleSave = () => {
    if (!description.trim() || !amount.trim()) {
      Alert.alert('Error', 'Please fill in description and amount');
      return;
    }
    Alert.alert('Success', 'Expense added (prototype only)', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <ScrollView className="flex-1 bg-background p-4" showsVerticalScrollIndicator={false}>
      <View className="mb-5">
        <Text className="text-lg font-semibold text-neutral-800 mb-4">Expense Details</Text>

        <Text className="text-sm font-medium text-neutral-600 mb-2">Description *</Text>
        <TextInput
          className={inputClass}
          placeholder="e.g., Hay bales, Dewormer, Fence repair"
          placeholderTextColor={Colors.neutral[400]}
          value={description}
          onChangeText={setDescription}
        />

        <Text className="text-sm font-medium text-neutral-600 mb-2">Amount ($) *</Text>
        <TextInput
          className={inputClass}
          placeholder="0.00"
          placeholderTextColor={Colors.neutral[400]}
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
        />

        <Text className="text-sm font-medium text-neutral-600 mb-2">Date</Text>
        <TextInput
          className={inputClass}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={Colors.neutral[400]}
          value={date}
          onChangeText={setDate}
        />
      </View>

      <View className="mb-5">
        <Text className="text-lg font-semibold text-neutral-800 mb-4">Category</Text>
        <View className="flex-row flex-wrap gap-4">
          {CATEGORIES.map((cat) => {
            const isSelected = category === cat.value;
            return (
              <TouchableOpacity
                key={cat.value}
                className={`w-[30%] items-center py-4 rounded-xl border gap-2 ${isSelected ? 'bg-primary-600 border-primary-600' : 'bg-white border-border'}`}
                onPress={() => setCategory(cat.value)}
              >
                <Ionicons name={cat.icon} size={22} color={isSelected ? Colors.white : Colors.neutral[500]} />
                <Text className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-neutral-600'}`}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View className="mb-5">
        <Text className="text-lg font-semibold text-neutral-800 mb-4">Additional Notes</Text>
        <TextInput
          className={`${inputClass} min-h-[80px] pt-3`}
          placeholder="Optional notes about this expense..."
          placeholderTextColor={Colors.neutral[400]}
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>

      <View className="flex-row gap-3 mt-4">
        <TouchableOpacity className="flex-1 py-4 rounded-lg border border-border items-center" onPress={() => router.back()}>
          <Text className="text-base font-semibold text-neutral-600">Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-[2] flex-row items-center justify-center gap-2 py-4 rounded-lg bg-primary-600" onPress={handleSave}>
          <Ionicons name="checkmark" size={20} color={Colors.white} />
          <Text className="text-base font-semibold text-white">Save Expense</Text>
        </TouchableOpacity>
      </View>

      <View className="h-8" />
    </ScrollView>
  );
}
