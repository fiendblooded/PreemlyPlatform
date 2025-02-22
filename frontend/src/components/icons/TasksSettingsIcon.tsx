import { FC } from "react";
import { IconProps, SvgSC } from "../../common/common";

const TasksSettingsIcon: FC<IconProps> = (props) => {
  const { color, size, paddingTop } = props;

  return (
    <SvgSC
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      size={size}
      paddingTop={paddingTop}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M16 2H4C2.89543 2 2 2.89543 2 4V20C2 21.1046 2.89543 22 4 22H16C17.1046 22 18 21.1046 18 20V4C18 2.89543 17.1046 2 16 2ZM10 11.5C10.0021 11.686 9.90086 11.8578 9.73708 11.946C9.5733 12.0342 9.3741 12.0242 9.22 11.92L7.28 10.62C7.10927 10.5109 6.89073 10.5109 6.72 10.62L4.78 11.92C4.6259 12.0242 4.4267 12.0342 4.26292 11.946C4.09914 11.8578 3.99785 11.686 4 11.5V4.5C4 4.22386 4.22386 4 4.5 4H9.5C9.77614 4 10 4.22386 10 4.5V11.5ZM20 4H21C21.5523 4 22 4.44772 22 5V19C22 19.5523 21.5523 20 21 20H20V4Z"
        fill={color || "black"}
      />
    </SvgSC>
  );
};

export default TasksSettingsIcon;
