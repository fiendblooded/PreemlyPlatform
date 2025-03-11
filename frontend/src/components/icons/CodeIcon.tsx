import React from "react";
import { IconProps, SvgSC } from "../../common/common";

const CodeIcon: React.FC<IconProps> = ({
  color = "#000",
  size = 24,
  active = false,
  paddingRight = 0,
  paddingTop = 0,
}) => {
  return (
    <SvgSC
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      size={size}
      paddingRight={paddingRight}
      paddingTop={paddingTop}
    >
      <path
        d="M9.4 16.6L4.8 12L9.4 7.4L8 6L2 12L8 18L9.4 16.6ZM14.6 16.6L19.2 12L14.6 7.4L16 6L22 12L16 18L14.6 16.6Z"
        fill={active ? "#FFCC32" : color}
      />
    </SvgSC>
  );
};

export default CodeIcon;
