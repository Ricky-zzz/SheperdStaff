import React, { useState, useCallback } from 'react';
import { View, Text, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../components/ui/Screen';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { SectionHeader } from '../components/ui/SectionHeader';
import { EmptyState } from '../components/ui/EmptyState';
import { useTheme } from '../lib/theme/ThemeContext';
import { useAuth } from '../lib/auth/AuthContext';
import { formatBytes, formatDateTime } from '../lib/utils/format';
import { toUserMessage } from '../lib/utils/errors';
import {
  createBackup,
  emailBackup,
  exportDataJson,
  isEmailAvailable,
  listBackupEntries,
  pickBackupFile,
  shareBackup,
  shareExport,
} from '../features/backup/services/backupService';
import type { BackupEntry, RestoreSummary } from '../features/backup/types';

/** Two-step confirmation: `Alert.prompt` is iOS-only, so ask twice instead. */
function confirmErase(onErase: () => void) {
  Alert.alert(
    'Erase everything?',
    'This deletes every farm record, your profile, your password and your recovery code on this device. It cannot be undone.',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Continue',
        style: 'destructive',
        onPress: () =>
          Alert.alert('Last chance', 'Really erase all data? A backup is the only way to get it back.', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Erase everything', style: 'destructive', onPress: onErase },
          ]),
      },
    ]
  );
}

function restoreSummaryText(s: RestoreSummary): string {
  const parts = [
    `${s.livestock} livestock record${s.livestock === 1 ? '' : 's'}`,
    `${s.expenses} expense${s.expenses === 1 ? '' : 's'}`,
    `${s.income} income entr${s.income === 1 ? 'y' : 'ies'}`,
    `${s.inventoryItems} feed item${s.inventoryItems === 1 ? '' : 's'}`,
  ];
  return `${parts.join(', ')} restored. Your current data was replaced. Unlock with the password from that backup.`;
}

export default function BackupScreen() {
  const { colors } = useTheme();
  const { profile, restoreFromBackup, eraseAllData } = useAuth();
  const [backups, setBackups] = useState<BackupEntry[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [lastBackup, setLastBackup] = useState<BackupEntry | null>(null);

  useFocusEffect(
    useCallback(() => {
      setBackups(listBackupEntries());
    }, [])
  );

  const refreshList = useCallback(() => {
    const entries = listBackupEntries();
    setBackups(entries);
    setLastBackup(entries[0] ?? null);
  }, []);

  const run = async (label: string, task: () => Promise<void>) => {
    if (busy) return;
    setBusy(label);
    try {
      await task();
    } catch (err) {
      Alert.alert('Could not complete', toUserMessage(err));
    } finally {
      setBusy(null);
      refreshList();
    }
  };

  const handleBackupNow = () =>
    run('backup', async () => {
      const entry = await createBackup();
      refreshList();
      const shared = await shareBackup(entry);
      if (!shared) {
        Alert.alert(
          'Backup saved',
          `${entry.name} (${formatBytes(entry.size)}) was saved on this device, but the share sheet is unavailable.`
        );
      }
    });

  const handleEmailBackup = () =>
    run('email', async () => {
      const available = await isEmailAvailable();
      if (!available) {
        Alert.alert(
          'No email app',
          'No email app is configured on this device. Use “Back up now” to save the file, then share it another way.'
        );
        return;
      }
      const entry = await createBackup();
      refreshList();
      await emailBackup(entry, profile?.email);
    });

  const doRestore = (uri: string, label: string) =>
    run(label, async () => {
      const summary = await restoreFromBackup(uri);
      Alert.alert('Backup restored', restoreSummaryText(summary));
    });

  const handleRestoreFromPicker = async () => {
    if (busy) return;
    const uri = await pickBackupFile().catch((err) => {
      Alert.alert('Could not open the file picker', toUserMessage(err));
      return null;
    });
    if (!uri) return;
    Alert.alert(
      'Restore this backup?',
      'Everything currently in the app (records, profile, password and recovery code) will be replaced by the backup. A safety copy of your current data will be saved first.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Restore', style: 'destructive', onPress: () => doRestore(uri, 'restore') },
      ]
    );
  };

  const handleRestoreEntry = (entry: BackupEntry) =>
    Alert.alert(
      `Restore ${entry.name}?`,
      `This replaces everything currently in the app with the copy from ${formatDateTime(entry.createdAt)}. A safety copy of your current data is saved first.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Restore', style: 'destructive', onPress: () => doRestore(entry.uri, 'restore') },
      ]
    );

  const handleExport = () =>
    run('export', async () => {
      const result = await exportDataJson();
      const shared = await shareExport(result);
      if (!shared) {
        Alert.alert('Export saved', `${result.name} (${result.records} records) could not be shared from this device.`);
      }
    });

  const handleErase = () => confirmErase(() => run('erase', () => eraseAllData()));

  const busyButton = (key: string) => busy === key;

  return (
    <Screen>
      <Card className="mb-4 border border-border">
        <View className="flex-row items-start gap-3">
          <Ionicons name="cloud-upload-outline" size={22} color={colors.primary[600]} style={{ marginTop: 2 }} />
          <View className="flex-1">
            <Text className="text-base font-semibold text-neutral-800">Back up your farm data</Text>
            <Text className="text-sm text-neutral-500 mt-1">
              A backup is one file holding everything: records, inventory, settings, your password and
              recovery code. Save it to email, drive or another device so you can restore after a reinstall.
            </Text>
          </View>
        </View>
        <View className="mt-4 pt-3 border-t border-neutral-100">
          <Text className="text-xs text-neutral-500">
            {lastBackup
              ? `Last backup: ${formatDateTime(lastBackup.createdAt)} · ${formatBytes(lastBackup.size)}`
              : 'No backup has been created on this device yet.'}
          </Text>
        </View>
      </Card>

      <View className="gap-2 mb-2">
        <Button
          title={busyButton('backup') ? 'Backing up…' : 'Back up now'}
          variant="primary"
          size="lg"
          icon="cloud-upload-outline"
          loading={busyButton('backup')}
          disabled={!!busy && !busyButton('backup')}
          onPress={handleBackupNow}
        />
        <Button
          title={busyButton('email') ? 'Preparing email…' : 'Email backup'}
          variant="secondary"
          size="lg"
          icon="mail-outline"
          loading={busyButton('email')}
          disabled={!!busy && !busyButton('email')}
          onPress={handleEmailBackup}
        />
        <Button
          title="Restore from file"
          variant="outline"
          size="lg"
          icon="download-outline"
          disabled={!!busy}
          onPress={handleRestoreFromPicker}
        />
        <Button
          title={busyButton('export') ? 'Exporting…' : 'Export data (JSON)'}
          variant="neutral"
          size="lg"
          icon="document-text-outline"
          loading={busyButton('export')}
          disabled={!!busy && !busyButton('export')}
          onPress={handleExport}
        />
      </View>

      <Text className="text-xs text-neutral-500 mb-4 flex-row flex-wrap">
        Exports a readable copy for spreadsheets and sharing. It cannot be used to restore. Restoring always
        uses a backup file.
      </Text>

      <SectionHeader title="Backups on this device" />
      {busy === 'restore' ? (
        <View className="py-6 items-center">
          <ActivityIndicator color={colors.primary[600]} />
          <Text className="text-sm text-neutral-500 mt-2">Restoring…</Text>
        </View>
      ) : backups.length === 0 ? (
        <EmptyState
          icon="save-outline"
          title="No local backups yet"
          subtitle="Create one with “Back up now”. A copy is also saved here automatically before every restore."
        />
      ) : (
        <Card className="p-0 mb-5">
          {backups.map((entry, index) => (
            <TouchableOpacity
              key={entry.uri}
              className={`flex-row items-center p-4 ${index < backups.length - 1 ? 'border-b border-neutral-100' : ''}`}
              activeOpacity={0.7}
              onPress={() => handleRestoreEntry(entry)}
              accessibilityRole="button"
              accessibilityLabel={`Restore backup from ${formatDateTime(entry.createdAt)}`}
            >
              <View
                className="w-9 h-9 rounded-lg items-center justify-center mr-3"
                style={{ backgroundColor: colors.primary[100] }}
              >
                <Ionicons name="document-outline" size={18} color={colors.primary[600]} />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-medium text-neutral-800" numberOfLines={1}>
                  {formatDateTime(entry.createdAt)}
                </Text>
                <Text className="text-xs text-neutral-500 mt-0.5">
                  {formatBytes(entry.size)} · tap to restore
                </Text>
              </View>
              <Ionicons name="chevron-forward-outline" size={18} color={colors.neutral[500]} />
            </TouchableOpacity>
          ))}
        </Card>
      )}

      <SectionHeader title="Danger zone" />
      <Card className="border border-error mb-4">
        <Text className="text-sm font-medium text-neutral-700 mb-1">Erase everything on this device</Text>
        <Text className="text-xs text-neutral-500 mb-3">
          Deletes every record, your profile, your password and your recovery code. You will be returned to
          onboarding. Back up first if you may want this data back.
        </Text>
        <Button
          title={busyButton('erase') ? 'Erasing…' : 'Erase all data'}
          variant="neutral"
          size="md"
          icon="trash-outline"
          loading={busyButton('erase')}
          disabled={!!busy && !busyButton('erase')}
          onPress={handleErase}
        />
      </Card>
    </Screen>
  );
}
