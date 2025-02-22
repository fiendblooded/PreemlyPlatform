import { FC } from "react";
import { IconProps, SvgSC } from "../../common/common";

const LocationSettingsIcon: FC<IconProps> = (props) => {
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
        d="M4 10C4 5.58172 7.58172 2 12 2C16.4183 2 20 5.58172 20 10C20 13.7564 18.1763 15.226 16.4762 16.596C15.3613 17.4945 14.2994 18.3502 13.84 19.78L13.33 21.32C13.187 21.7454 12.7782 22.0234 12.33 22H11.77C11.3218 22.0234 10.913 21.7454 10.77 21.32L10.26 19.78C9.78216 18.3544 8.70547 17.4996 7.57743 16.604C5.84899 15.2317 4 13.7637 4 10ZM9 10C9 11.6569 10.3431 13 12 13C12.7956 13 13.5587 12.6839 14.1213 12.1213C14.6839 11.5587 15 10.7956 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10Z"
        fill={color || "black"}
      />
    </SvgSC>
  );
};

export default LocationSettingsIcon;
