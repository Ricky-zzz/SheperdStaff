import * as Haptics from 'expo-haptics';

/** Best-effort haptics — never throw on simulators / unsupported devices. */
export async function lightHaptic(): Promise<void> {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // no-op
  }
}

export async function mediumHaptic(): Promise<void> {
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } catch {
    // no-op
  }
}

export async function successHaptic(): Promise<void> {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    // no-op
  }
}

export async function errorHaptic(): Promise<void> {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  } catch {
    // no-op
  }
}
