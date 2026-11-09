import { forwardRef } from "react";
import {
  ScrollView as NativeScrollView,
  type ScrollViewProps,
} from "react-native";

type Props = Omit<
  ScrollViewProps,
  | "horizontal"
  | "alwaysBounceHorizontal"
  | "showsHorizontalScrollIndicator"
  | "directionalLockEnabled"
>;
export type VerticalScrollViewRef = NativeScrollView;

// App screens scroll vertically only; children must adapt to the available width.
export const VerticalScrollView = forwardRef<NativeScrollView, Props>(
  function VerticalScrollView({ style, contentContainerStyle, ...props }, ref) {
    return (
      <NativeScrollView
        {...props}
        ref={ref}
        horizontal={false}
        alwaysBounceHorizontal={false}
        showsHorizontalScrollIndicator={false}
        directionalLockEnabled
        style={[style, { width: "100%", maxWidth: "100%" }]}
        contentContainerStyle={[
          { width: "100%", minWidth: 0 },
          contentContainerStyle,
        ]}
      />
    );
  },
);
