import { FC } from "react";
import { IconProps, SvgSC } from "../../common/common";

const WelcomeScreenSettingsIcon: FC<IconProps> = (props) => {
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
        d="M1 3H23C23.5523 3 24 3.44772 24 4V18C24 18.5523 23.5523 19 23 19H17V20.5C17 20.7761 16.7761 21 16.5 21H7.5C7.22386 21 7 20.7761 7 20.5V19H1C0.447715 19 0 18.5523 0 18V4C0 3.44772 0.447715 3 1 3ZM2 17H22V5H2V17Z"
        fill={color || "black"}
      />
    </SvgSC>
  );
};

export default WelcomeScreenSettingsIcon;
