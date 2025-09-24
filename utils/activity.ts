export const ACTIVITY_PREFIX = "__ACTIVITY__:";

export function isActivityContent(content: string): boolean {
  return content.startsWith(ACTIVITY_PREFIX);
}

export function stripActivityPrefix(content: string): string {
  return content.replace(ACTIVITY_PREFIX, "");
}
