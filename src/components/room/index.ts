// Room container components — chọn View theo phase, banner kết nối, form nhập tên
// Tuân thủ kiến trúc Clean Modular & SOLID

export { default as ConnectionBanner } from "./ConnectionBanner";
export type { ConnectionBannerProps } from "./ConnectionBanner";

export { default as NameForm } from "./NameForm";
export type { NameFormProps } from "./NameForm";

export * from "./RoomLoadingCard";
export * from "./RoomNavbar";
