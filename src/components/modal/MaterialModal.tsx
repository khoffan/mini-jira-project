"use client";

import React from "react";
import { Modal } from "antd";
import { useIsMobile } from "@/hooks/use-mobile";

interface MaterialModalProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  footer?: React.ReactNode;
  children?: React.ReactNode;
  width?: number | string;
}

export default function MaterialModal({
  open,
  onClose,
  title,
  footer,
  children,
  width = 600,
}: MaterialModalProps) {
  const isMobile = useIsMobile();

  return (
    <Modal
      open={open}
      onCancel={onClose}
      centered={!isMobile}
      width={isMobile ? "100%" : width}
      style={isMobile ? { top: 0 } : undefined}
      styles={
        isMobile
          ? { body: { padding: 16, height: "100vh", overflowY: "auto" } }
          : { body: { padding: 24 } }
      }
      footer={footer}
      title={title}
      destroyOnHidden
    >
      {children}
    </Modal>
  );
}
