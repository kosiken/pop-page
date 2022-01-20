import React from "react";
import Button from "@mui/material/Button";
import { Theme } from "@mui/material";

import { SxProps } from "@mui/system";

import { Link } from "react-router-dom";

interface AppLinkProps  {
  sx?: SxProps<Theme>;
  to: string;
  children: string | React.ReactNode | React.ReactNode[];
  replace?: boolean | undefined;
  innerRef?: React.Ref<HTMLAnchorElement> | undefined;
  style?: React.CSSProperties;
  doNotUseButton?: boolean;
};

const AppLink: React.FC<AppLinkProps> = ({
  to,
  children,
  sx,
  style,
  doNotUseButton = false, 
  ...props
}) => {
  const applyStyles = Object.assign(
    { textDecoration: "none", color: "inherit" },
    style
  );

  return (
    <Link to={to} style={applyStyles} {...props}>
     {doNotUseButton ? children :  <Button sx={sx}>{children}</Button>}
    </Link>
  );
};

export default AppLink;