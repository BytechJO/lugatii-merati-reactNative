import Svg, { Path } from "react-native-svg";

export function StudentIcon({
  kind = "users",
  color = "#652B82",
  size = 24,
}: {
  kind?: "users" | "copy" | "check" | "back" | "clock";
  color?: string;
  size?: number;
}) {
  const paths = {
    users:
      "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z",
    copy: "M9 9h12v12H9ZM5 15H3V3h12v2",
    check: "M20 6 9 17l-5-5",
    back: "M5 12h14M12 5l7 7-7 7",
    clock: "M12 8v4l3 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z",
  };
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d={paths[kind]} />
    </Svg>
  );
}
