export function isPlayBoardEnabled() {
  return process.env.NODE_ENV !== "production" || process.env.PLAYBOARD_ENABLED === "true";
}

