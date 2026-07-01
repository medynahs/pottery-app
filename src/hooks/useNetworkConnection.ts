import NetInfo, {
  NetInfoState,
  NetInfoStateType,
} from "@react-native-community/netinfo";
import { useEffect, useState } from "react";

interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean;
  type: NetInfoStateType | null;
}

/** NetInfo returns null when reachability is unknown — treat as online if connected. */
function normalizeInternetReachable(
  isConnected: boolean | null,
  isInternetReachable: boolean | null,
): boolean {
  if (isConnected === false) return false;
  if (isInternetReachable === null) return true;
  return isInternetReachable;
}

export function useNetworkConnection() {
  const [networkState, setNetworkState] = useState<NetworkState>({
    isConnected: true,
    isInternetReachable: true,
    type: null,
  });

  useEffect(() => {
    const applyState = (state: NetInfoState) => {
      const isConnected = state.isConnected ?? false;
      setNetworkState({
        isConnected,
        isInternetReachable: normalizeInternetReachable(isConnected, state.isInternetReachable),
        type: state.type ?? null,
      });
    };

    const unsubscribe = NetInfo.addEventListener(applyState);
    void NetInfo.fetch().then(applyState);

    return () => {
      unsubscribe();
    };
  }, []);

  const checkConnection = async () => {
    try {
      const state = await NetInfo.fetch();
      const isConnected = state.isConnected ?? false;
      const isInternetReachable = normalizeInternetReachable(isConnected, state.isInternetReachable);
      setNetworkState({
        isConnected,
        isInternetReachable,
        type: state.type ?? null,
      });
      return isConnected && isInternetReachable;
    } catch (error) {
      console.warn("Failed to check network:", error);
      return false;
    }
  };

  return { ...networkState, checkConnection };
}

export function useIsOnline() {
  const { isConnected, isInternetReachable } = useNetworkConnection();
  return isConnected && isInternetReachable;
}
