import {
  Camera,
  useCameraPermissions,
} from "expo-camera";
import * as Location from "expo-location";
import * as MediaLibrary from "expo-media-library";
import * as Notifications from "expo-notifications";
import { AlertCircle, Bell, Camera as CameraIcon, Image, MapPin } from "lucide-react-native";
import * as React from "react";
import { Linking, Platform } from "react-native";
import { Button } from "./button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./dialog";
import { iconWithClassName } from "./lib/icons/icon-with-classname";
import { Text } from "./text";

const AlertCircleIcon = iconWithClassName(AlertCircle);
const CameraIconStyled = iconWithClassName(CameraIcon);
const MapPinIcon = iconWithClassName(MapPin);
const ImageIcon = iconWithClassName(Image);
const BellIcon = iconWithClassName(Bell);

export type PermissionType = 
  | "camera"
  | "location" 
  | "locationForeground"
  | "mediaLibrary"
  | "notifications";

interface PermissionInfo {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const permissionInfoMap: Record<PermissionType, PermissionInfo> = {
  camera: {
    title: "Camera Access",
    description: "Allow the app to take photos and record videos",
    icon: <CameraIconStyled className="h-12 w-12 text-primary" />,
  },
  location: {
    title: "Location Access",
    description: "Allow the app to access your location",
    icon: <MapPinIcon className="h-12 w-12 text-primary" />,
  },
  locationForeground: {
    title: "Location Access",
    description: "Allow the app to access your location while using the app",
    icon: <MapPinIcon className="h-12 w-12 text-primary" />,
  },
  mediaLibrary: {
    title: "Photo Library Access",
    description: "Allow the app to access your photos and videos",
    icon: <ImageIcon className="h-12 w-12 text-primary" />,
  },
  notifications: {
    title: "Notification Access",
    description: "Allow the app to send you notifications",
    icon: <BellIcon className="h-12 w-12 text-primary" />,
  },
};

async function getPermissionStatusByType(permission: PermissionType) {
  if (permission === "camera") {
    return Camera.getCameraPermissionsAsync();
  }
  if (permission === "location") {
    return Location.getBackgroundPermissionsAsync();
  }
  if (permission === "locationForeground") {
    return Location.getForegroundPermissionsAsync();
  }
  if (permission === "mediaLibrary") {
    return MediaLibrary.getPermissionsAsync();
  }
  return Notifications.getPermissionsAsync();
}

async function requestPermissionByType(permission: PermissionType) {
  if (permission === "camera") {
    return Camera.requestCameraPermissionsAsync();
  }
  if (permission === "location") {
    return Location.requestBackgroundPermissionsAsync();
  }
  if (permission === "locationForeground") {
    return Location.requestForegroundPermissionsAsync();
  }
  if (permission === "mediaLibrary") {
    return MediaLibrary.requestPermissionsAsync();
  }
  return Notifications.requestPermissionsAsync();
}

interface PermissionRequesterProps {
  permission: PermissionType;
  children: (props: {
    status: "undetermined" | "granted" | "denied";
    requestPermission: () => Promise<void>;
  }) => React.ReactNode;
  onPermissionGranted?: () => void;
  onPermissionDenied?: () => void;
}

export function PermissionRequester({
  permission,
  children,
  onPermissionGranted,
  onPermissionDenied,
}: PermissionRequesterProps) {
  const [status, setStatus] = React.useState<"undetermined" | "granted" | "denied">("undetermined");
  const [showDialog, setShowDialog] = React.useState(false);
  const permissionInfo = permissionInfoMap[permission];

  const checkPermission = React.useCallback(async () => {
    try {
      const permissionStatus = await getPermissionStatusByType(permission);
      setStatus(permissionStatus.status as "undetermined" | "granted" | "denied");
    } catch (error) {
      console.error("Error checking permission:", error);
    }
  }, [permission]);

  React.useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  const requestPermission = async () => {
    // On iOS, if denied, we need to open settings
    // On Android, we can try requesting again unless user selected "Don't ask again"
    if (status === "denied" && Platform.OS === "ios") {
      setShowDialog(true);
      return;
    }

    try {
      const permissionResult = await requestPermissionByType(permission);
      const newStatus = permissionResult.status as "undetermined" | "granted" | "denied";
      setStatus(newStatus);

      if (newStatus === "granted") {
        onPermissionGranted?.();
      } else if (newStatus === "denied") {
        onPermissionDenied?.();
      }
    } catch (error) {
      console.error("Error requesting permission:", error);
    }
  };

  const openSettings = () => {
    Linking.openSettings();
    setShowDialog(false);
  };

  return (
    <>
      {children({ status, requestPermission })}
      
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex-row items-center justify-center mb-4">
              <AlertCircleIcon className="h-8 w-8 text-destructive" />
            </DialogTitle>
            <DialogTitle>
              <Text variant="h4" className="text-center">Permission Required</Text>
            </DialogTitle>
            <DialogDescription>
              <Text variant="muted" className="text-center">
                {permissionInfo.title} has been denied. Please enable it in your device settings to continue.
              </Text>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row gap-2">
            <Button
              variant="outline"
              onPress={() => setShowDialog(false)}
              className="flex-1"
            >
              <Text>Cancel</Text>
            </Button>
            <Button onPress={openSettings} className="flex-1">
              <Text>Open Settings</Text>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Convenience hook for permissions
export function usePermission(permission: PermissionType) {
  const [status, setStatus] = React.useState<"undetermined" | "granted" | "denied">("undetermined");

  const checkPermission = React.useCallback(async () => {
    try {
      const permissionStatus = await getPermissionStatusByType(permission);
      setStatus(permissionStatus.status as "undetermined" | "granted" | "denied");
    } catch (error) {
      console.error("Error checking permission:", error);
    }
  }, [permission]);

  React.useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  const request = async () => {
    try {
      const permissionResult = await requestPermissionByType(permission);
      const newStatus = permissionResult.status as "undetermined" | "granted" | "denied";
      setStatus(newStatus);
      return newStatus === "granted";
    } catch (error) {
      console.error("Error requesting permission:", error);
      return false;
    }
  };

  return { status, request, check: checkPermission };
}

// For camera permissions, export a separate hook that uses expo-camera's hook
export { useCameraPermissions };

