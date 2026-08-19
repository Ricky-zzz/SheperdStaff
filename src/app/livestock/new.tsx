import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../lib/theme/colors';
import { LivestockCategory, LivestockType, LivestockStatus } from '../../features/livestock/types';

const CATEGORIES: { label: string; value: LivestockCategory }[] = [
  { label: 'Cattle', value: 'cattle' },
  { label: 'Pig', value: 'pig' },
  { label: 'Chicken', value: 'chicken' },
  { label: 'Goat', value: 'goat' },
  { label: 'Sheep', value: 'sheep' },
  { label: 'Duck', value: 'duck' },
  { label: 'Other', value: 'other' },
];

const STATUSES: { label: string; value: LivestockStatus }[] = [
  { label: 'Active', value: 'active' },
  { label: 'Growing', value: 'growing' },
  { label: 'Breeding', value: 'breeding' },
  { label: 'For Sale', value: 'for_sale' },
];

const inputClass = 'bg-white border border-border rounded-lg px-4 py-3 text-base text-neutral-800 mb-4';

export default function AddLivestockScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [type, setType] = useState<LivestockType>('individual');
  const [category, setCategory] = useState<LivestockCategory>('cattle');
  const [breed, setBreed] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [sex, setSex] = useState<'male' | 'female' | 'mixed'>('female');
  const [location, setLocation] = useState('');
  const [purpose, setPurpose] = useState('');
  const [status, setStatus] = useState<LivestockStatus>('active');
  const [notes, setNotes] = useState('');

  const handleSave = () => {
    Alert.alert('Success', 'Livestock record added (prototype only)', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <ScrollView className="flex-1 bg-background p-4" showsVerticalScrollIndicator={false}>
      <View className="mb-5">
        <Text className="text-lg font-semibold text-neutral-800 mb-4">Basic Information</Text>

        <Text className="text-sm font-medium text-neutral-600 mb-2">Name *</Text>
        <TextInput
          className={inputClass}
          placeholder="e.g., Bessie or Chicken Batch 01"
          placeholderTextColor={Colors.neutral[400]}
          value={name}
          onChangeText={setName}
        />

        <Text className="text-sm font-medium text-neutral-600 mb-2">Type</Text>
        <View className="flex-row gap-3 mb-4">
          <TouchableOpacity
            className={`flex-1 flex-row items-center justify-center gap-2 py-3 rounded-lg border ${type === 'individual' ? 'bg-primary-600 border-primary-600' : 'bg-white border-border'}`}
            onPress={() => setType('individual')}
          >
            <Ionicons name="person" size={18} color={type === 'individual' ? Colors.white : Colors.neutral[500]} />
            <Text className={`text-base font-medium ${type === 'individual' ? 'text-white' : 'text-neutral-500'}`}>
              Individual
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 flex-row items-center justify-center gap-2 py-3 rounded-lg border ${type === 'group' ? 'bg-primary-600 border-primary-600' : 'bg-white border-border'}`}
            onPress={() => setType('group')}
          >
            <Ionicons name="people" size={18} color={type === 'group' ? Colors.white : Colors.neutral[500]} />
            <Text className={`text-base font-medium ${type === 'group' ? 'text-white' : 'text-neutral-500'}`}>
              Group/Batch
            </Text>
          </TouchableOpacity>
        </View>

        <Text className="text-sm font-medium text-neutral-600 mb-2">Category *</Text>
        <View className="flex-row flex-wrap gap-2 mb-4">
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.value}
              className={`px-3 py-2 rounded-full border ${category === cat.value ? 'bg-primary-600 border-primary-600' : 'bg-white border-border'}`}
              onPress={() => setCategory(cat.value)}
            >
              <Text className={`text-sm font-medium ${category === cat.value ? 'text-white' : 'text-neutral-600'}`}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text className="text-sm font-medium text-neutral-600 mb-2">Breed</Text>
        <TextInput
          className={inputClass}
          placeholder="e.g., Holstein, Rhode Island Red"
          placeholderTextColor={Colors.neutral[400]}
          value={breed}
          onChangeText={setBreed}
        />

        {type === 'group' && (
          <>
            <Text className="text-sm font-medium text-neutral-600 mb-2">Quantity *</Text>
            <TextInput
              className={inputClass}
              placeholder="Number of animals"
              placeholderTextColor={Colors.neutral[400]}
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
            />
          </>
        )}

        <Text className="text-sm font-medium text-neutral-600 mb-2">Sex</Text>
        <View className="flex-row flex-wrap gap-2 mb-4">
          {(['male', 'female', 'mixed'] as const).map((s) => (
            <TouchableOpacity
              key={s}
              className={`px-3 py-2 rounded-full border ${sex === s ? 'bg-primary-600 border-primary-600' : 'bg-white border-border'}`}
              onPress={() => setSex(s)}
            >
              <Text className={`text-sm font-medium ${sex === s ? 'text-white' : 'text-neutral-600'}`}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View className="mb-5">
        <Text className="text-lg font-semibold text-neutral-800 mb-4">Location & Purpose</Text>

        <Text className="text-sm font-medium text-neutral-600 mb-2">Location *</Text>
        <TextInput
          className={inputClass}
          placeholder="e.g., Main Cattle Pasture, Chicken Coop"
          placeholderTextColor={Colors.neutral[400]}
          value={location}
          onChangeText={setLocation}
        />

        <Text className="text-sm font-medium text-neutral-600 mb-2">Purpose</Text>
        <TextInput
          className={inputClass}
          placeholder="e.g., Dairy, Meat, Breeding, Egg production"
          placeholderTextColor={Colors.neutral[400]}
          value={purpose}
          onChangeText={setPurpose}
        />

        <Text className="text-sm font-medium text-neutral-600 mb-2">Status</Text>
        <View className="flex-row flex-wrap gap-2 mb-4">
          {STATUSES.map((s) => (
            <TouchableOpacity
              key={s.value}
              className={`px-3 py-2 rounded-full border ${status === s.value ? 'bg-primary-600 border-primary-600' : 'bg-white border-border'}`}
              onPress={() => setStatus(s.value)}
            >
              <Text className={`text-sm font-medium ${status === s.value ? 'text-white' : 'text-neutral-600'}`}>
                {s.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View className="mb-5">
        <Text className="text-lg font-semibold text-neutral-800 mb-4">Additional Notes</Text>
        <TextInput
          className={`${inputClass} min-h-[100px] pt-3`}
          placeholder="Any additional information..."
          placeholderTextColor={Colors.neutral[400]}
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      <View className="flex-row gap-3 mt-4">
        <TouchableOpacity className="flex-1 py-4 rounded-lg border border-border items-center" onPress={() => router.back()}>
          <Text className="text-base font-semibold text-neutral-600">Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-[2] flex-row items-center justify-center gap-2 py-4 rounded-lg bg-primary-600" onPress={handleSave}>
          <Ionicons name="checkmark" size={20} color={Colors.white} />
          <Text className="text-base font-semibold text-white">Save Record</Text>
        </TouchableOpacity>
      </View>

      <View className="h-8" />
    </ScrollView>
  );
}
