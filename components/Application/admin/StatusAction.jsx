"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ListItemIcon, MenuItem } from "@mui/material";
import ChangeCircleIcon from "@mui/icons-material/ChangeCircle";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { showToast } from "@/lib/showtoast";
import { Button } from "@/components/ui/button";

const StatusAction = ({ row, queryKey }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const currentStatus = row.original.status;

  const handleStatusChange = async (newStatus) => {
    if (newStatus === currentStatus) {
        setOpen(false);
        return;
    }
    
    setLoading(true);
    try {
      const { data } = await axios.post("/api/orders/admin/update-status", {
        id: row.original.id,
        status: newStatus,
      });

      if (data.success) {
        showToast("success", data.message);
        queryClient.invalidateQueries({ queryKey: [queryKey] });
        setOpen(false);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      showToast("error", error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const statuses = [
    { label: "Pending", value: "PENDING", color: "bg-yellow-500" },
    { label: "Processing", value: "PROCESSING", color: "bg-blue-500" },
    { label: "Shipped", value: "SHIPPED", color: "bg-purple-500" },
    { label: "Delivered", value: "DELIVERED", color: "bg-green-500" },
    { label: "Cancelled", value: "CANCELLED", color: "bg-red-500" },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <MenuItem>
          <ListItemIcon>
            <ChangeCircleIcon fontSize="small" />
          </ListItemIcon>
          Update Status
        </MenuItem>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Update Order Status</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-2 py-4">
          <p className="text-sm text-gray-500 mb-2">Current Status: <span className="font-bold text-black dark:text-white">{currentStatus}</span></p>
          {statuses.map((status) => (
            <Button
              key={status.value}
              variant={currentStatus === status.value ? "default" : "outline"}
              onClick={() => handleStatusChange(status.value)}
              disabled={loading}
              className="justify-start gap-3 h-12"
            >
              <div className={`w-3 h-3 rounded-full ${status.color}`} />
              {status.label}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StatusAction;
