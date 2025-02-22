import { FC } from "react";
import { IconProps, SvgSC } from "../../common/common";

const ParkingIcon: FC<IconProps> = (props) => {
  const { color, size, paddingTop } = props;

  return (
    <SvgSC
      width="24"
      height="24"
      size={size}
      paddingTop={paddingTop}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M18 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V4C20 2.89543 19.1046 2 18 2ZM16 11C16 12.6569 14.6569 14 13 14H10V16.5C10 16.7761 9.77614 17 9.5 17H8.5C8.22386 17 8 16.7761 8 16.5V7.5C8 7.22386 8.22386 7 8.5 7H13C14.6569 7 16 8.34315 16 10V11ZM10 9H13C13.5523 9 14 9.44772 14 10V11C14 11.5523 13.5523 12 13 12H10V9Z"
        fill={color || "black"}
      />
    </SvgSC>
  );
};

export default ParkingIcon;
