import { ListItemIcon, MenuItem } from "@mui/material";
import Link from "next/link";
import React from "react";
import EditIcon from "@mui/icons-material/Edit";

const EditAction = ({ href }) => {
  return (
    <MenuItem component={Link} href={href} key="edit">
      <ListItemIcon>
        <EditIcon />
      </ListItemIcon>
      Edit
    </MenuItem>
  );
};

export default EditAction;
