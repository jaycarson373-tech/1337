export function titleFromPrompt(prompt: string) {
  const compact = prompt.replace(/\s+/g, " ").trim();

  if (!compact) {
    return "New chat";
  }

  return compact.length > 48 ? `${compact.slice(0, 45)}...` : compact;
}
