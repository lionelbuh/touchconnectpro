export const colors = {
  bg: "#FAF9F7",
  bgAlt: "#F3F3F3",
  teal: "#0D566C",
  coral: "#FF6B5C",
  yellow: "#F5C542",
  indigo: "#4B3F72",
  text: "#4A4A4A",
  textLight: "#8A8A8A",
  textMuted: "#C0C0C0",
  white: "#FFFFFF",
  border: "#E8E8E8",
  borderLight: "#F3F3F3",
  cardShadow: "0 2px 12px rgba(224,224,224,0.6)",
  cardShadowHover: "0 4px 24px rgba(224,224,224,0.5)",
};

export const sidebarActiveClass = "bg-[#FF6B5C]/10 text-[#FF6B5C] font-semibold";
export const sidebarInactiveClass = "text-[#4A4A4A] hover:bg-[#F3F3F3] hover:text-[#0D566C]";

export const tabActiveClass = "bg-[#FF6B5C]/10 text-[#FF6B5C] border border-[#FF6B5C]/30";
export const tabInactiveClass = "text-[#8A8A8A] hover:text-[#0D566C] hover:bg-[#F3F3F3]";
export const tabLockedClass = "text-[#C0C0C0] cursor-not-allowed";

export const cardStyle: React.CSSProperties = {
  backgroundColor: colors.white,
  borderColor: colors.border,
  boxShadow: colors.cardShadow,
  borderRadius: "16px",
};

export const inputClass = "h-11 rounded-xl bg-white border-[#E8E8E8] text-[#4A4A4A] placeholder:text-[#C0C0C0] focus:border-[#FF6B5C] focus:ring-[#FF6B5C]/20";

export const primaryBtnStyle: React.CSSProperties = {
  backgroundColor: colors.coral,
  color: colors.white,
  border: "none",
  borderRadius: "9999px",
};

export const outlineBtnClass = "border-[#E8E8E8] text-[#4A4A4A] hover:bg-[#F3F3F3] hover:text-[#0D566C] rounded-xl";

export const badgeStyles = {
  active: { backgroundColor: "rgba(13,86,108,0.1)", color: colors.teal, borderColor: "rgba(13,86,108,0.3)" },
  success: { backgroundColor: "rgba(34,197,94,0.1)", color: "#16a34a", borderColor: "rgba(34,197,94,0.3)" },
  warning: { backgroundColor: "rgba(245,197,66,0.1)", color: "#b45309", borderColor: "rgba(245,197,66,0.3)" },
  danger: { backgroundColor: "rgba(255,107,92,0.1)", color: colors.coral, borderColor: "rgba(255,107,92,0.3)" },
  info: { backgroundColor: "rgba(75,63,114,0.1)", color: colors.indigo, borderColor: "rgba(75,63,114,0.3)" },
};
