import { LinearGradient } from 'expo-linear-gradient';
import { Camera, ImagePlus } from 'lucide-react-native';
import React from 'react';
import {
  Image,
  ImageStyle,
  StyleProp,
  Text,
  TouchableOpacity,
  View,
  ViewStyle
} from 'react-native';

export interface PolaroidPhotoPickerProps {
  photo?: string;
  onPress?: () => void;
  accent?: string;
  placeholder?: string | React.ReactNode;
  label?: string | React.ReactNode;
  width?: number;
  height?: number;
  borderRadius?: number;
  rotation?: string;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
  children?: React.ReactNode;
}

export function PolaroidPhotoPicker({
  photo,
  onPress,
  accent = '#B89B7B',
  placeholder = 'Choose your pic ✦',
  label,
  width = 220,
  height = 200,
  borderRadius = 12,
  rotation = '-6deg',
  style,
  imageStyle,
  children,
}: PolaroidPhotoPickerProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.82 : 1}
      style={[{ alignItems: 'center' }, style]}
      disabled={!onPress}
    >
      <View
        style={{
          backgroundColor: '#fff',
          borderRadius,
          padding: 8,
          paddingBottom: 24,
          shadowColor: '#000',
          shadowOpacity: 0.13,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
          elevation: 4,
          width,
          maxWidth: 320,
          marginBottom: 8,
          transform: [{ rotate: rotation }],
        }}
      >
        {photo ? (
          <View style={{ width: '100%', height }}>
            <Image
              source={{ uri: photo }}
              style={[
                { width: '100%', height, borderRadius: borderRadius - 4 },
                imageStyle,
              ]}
              resizeMode="cover"
            />
            {/* Clip overlay */}
            <Image
              source={require('../../../../assets/images/tape.png')}
              style={{
                position: 'absolute',
                top: -50,
                left: '80%',
                transform: [{ rotate: '35deg' }],
                width: 100,
                height: 100,
                zIndex: 10,
                opacity: 0.95,
              }}
            />
          </View>
        ) : (
          <LinearGradient
            colors={['#F5E7D1', '#E7C9A4']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ height, alignItems: 'center', justifyContent: 'center', borderRadius: borderRadius - 4 }}
          >
            <ImagePlus size={24} color={accent} />
            {typeof placeholder === 'string' ? (
              <Text style={{ fontSize: 13, color: accent, marginTop: 8, textAlign: 'center' }}>{placeholder}</Text>
            ) : (
              placeholder
            )}
          </LinearGradient>
        )}
        {/* Camera icon overlay for upload */}
        {onPress && (
          <View
            style={{
              position: 'absolute',
              right: 10,
              bottom: 10,
              width: 30,
              height: 30,
              borderRadius: 999,
              backgroundColor: 'rgba(71, 44, 31, 0.72)',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0.4,
            }}
          >
            <Camera size={13} color="white" />
          </View>
        )}
        {children}
        {label && (
          <View
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 4,
              alignItems: 'center',
            }}
          >
            {typeof label === 'string' ? (
              <Text style={{ fontSize: 12, color: '#7F6450', fontFamily: 'DMSans_500Medium', letterSpacing: 1 }}>{label}</Text>
            ) : (
              label
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}
