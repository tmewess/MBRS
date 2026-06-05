export interface SocialNetwork {
  id: string;
  name: string;
  emoji: string;
  color: string;
}

export const SOCIAL_NETWORKS: SocialNetwork[] = [
  { id: "instagram", name: "Instagram", emoji: "📸", color: "#E1306C" },
  { id: "tiktok", name: "TikTok", emoji: "🎵", color: "#010101" },
  { id: "facebook", name: "Facebook", emoji: "📘", color: "#1877F2" },
  { id: "twitter", name: "Twitter / X", emoji: "🐦", color: "#1DA1F2" },
  { id: "youtube", name: "YouTube", emoji: "▶️", color: "#FF0000" },
  { id: "vk", name: "ВКонтакте", emoji: "💙", color: "#0077FF" },
  { id: "discord", name: "Discord", emoji: "🎮", color: "#5865F2" },
  { id: "snapchat", name: "Snapchat", emoji: "👻", color: "#FFFC00" },
  { id: "pinterest", name: "Pinterest", emoji: "📌", color: "#E60023" },
  { id: "linkedin", name: "LinkedIn", emoji: "💼", color: "#0A66C2" },
  { id: "reddit", name: "Reddit", emoji: "🤖", color: "#FF4500" },
  { id: "twitch", name: "Twitch", emoji: "🎲", color: "#9146FF" },
  { id: "spotify", name: "Spotify", emoji: "🎧", color: "#1DB954" },
  { id: "steam", name: "Steam", emoji: "🎮", color: "#1B2838" },
  { id: "roblox", name: "Roblox", emoji: "🧱", color: "#E2231A" },
  { id: "minecraft", name: "Minecraft", emoji: "⛏️", color: "#4E7F2E" },
  { id: "epic", name: "Epic Games", emoji: "🎯", color: "#313131" },
  { id: "netflix", name: "Netflix", emoji: "🎬", color: "#E50914" },
  { id: "onlyfans", name: "OnlyFans", emoji: "💎", color: "#00AFF0" },
  { id: "patreon", name: "Patreon", emoji: "🎨", color: "#FF424D" },
  { id: "clubhouse", name: "Clubhouse", emoji: "🎙️", color: "#F1EFE6" },
  { id: "threads", name: "Threads", emoji: "🧵", color: "#101010" },
  { id: "bluesky", name: "Bluesky", emoji: "🌤️", color: "#0085FF" },
  { id: "mastodon", name: "Mastodon", emoji: "🐘", color: "#6364FF" },
  { id: "ok", name: "Одноклассники", emoji: "🟠", color: "#EE8208" },
  { id: "viber", name: "Viber", emoji: "💬", color: "#7360F2" },
  { id: "whatsapp", name: "WhatsApp", emoji: "💬", color: "#25D366" },
  { id: "line", name: "LINE", emoji: "💚", color: "#00B900" },
  { id: "wechat", name: "WeChat", emoji: "💚", color: "#07C160" },
  { id: "other", name: "Другое", emoji: "🌐", color: "#888888" },
];

export function getSocialNetwork(id: string): SocialNetwork {
  return SOCIAL_NETWORKS.find(s => s.id === id) ?? { id, name: id, emoji: "🌐", color: "#888888" };
}
