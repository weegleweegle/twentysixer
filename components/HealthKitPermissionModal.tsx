import { Modal, Pressable, Text, View } from 'react-native';

interface Props {
  visible: boolean;
  onConnect: () => void;
  onDismiss: () => void;
}

export default function HealthKitPermissionModal({ visible, onConnect, onDismiss }: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
    >
      <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
        <View className="bg-light-bg rounded-t-3xl px-6 pt-6 pb-10">
          {/* Handle */}
          <View className="items-center mb-5">
            <View className="w-10 h-1 rounded-full bg-light-border" />
          </View>

          {/* Icon */}
          <Text className="text-5xl text-center mb-4">⌚</Text>

          {/* Title */}
          <Text className="text-light-text text-2xl font-bold text-center mb-3">
            Connect Apple Watch
          </Text>

          {/* Description */}
          <Text className="text-light-subtle text-sm text-center leading-relaxed mb-8">
            MRTHN can automatically log your runs from your Apple Watch. We only read workout
            distance — no health data ever leaves your device.
          </Text>

          {/* Connect button */}
          <Pressable
            onPress={onConnect}
            className="bg-brand-primary rounded-2xl py-4 items-center mb-3"
            style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
          >
            <Text className="text-white font-bold text-base">Connect</Text>
          </Pressable>

          {/* Not Now button */}
          <Pressable
            onPress={onDismiss}
            className="bg-light-card rounded-2xl py-4 items-center"
            style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
          >
            <Text className="text-light-subtle font-semibold text-base">Not Now</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
