import { FC } from "react";
import { IconProps, SvgSC } from "../../common/common";

const ScheduleIcon: FC<IconProps> = (props) => {
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
        d="M2 12C2 6.47715 6.47715 2 12 2C14.6522 2 17.1957 3.05357 19.0711 4.92893C20.9464 6.8043 22 9.34784 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12ZM15.98 16.53L16.51 16C16.6083 15.904 16.6638 15.7724 16.6638 15.635C16.6638 15.4976 16.6083 15.366 16.51 15.27L12.88 11.64V6.5C12.88 6.22386 12.6561 6 12.38 6H11.62C11.3439 6 11.12 6.22386 11.12 6.5V12.17C11.118 12.3056 11.1723 12.4359 11.27 12.53L15.27 16.53C15.4678 16.7218 15.7822 16.7218 15.98 16.53Z"
        fill={color || "black"}
      />
    </SvgSC>
  );
};

export default ScheduleIcon;
