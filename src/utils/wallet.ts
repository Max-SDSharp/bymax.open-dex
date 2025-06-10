/**
 * Formats a wallet address by displaying the first 6 characters,
 * followed by ellipsis (...), and the last 4 characters.
 *
 * @param address - The wallet address to format.
 * @returns The formatted wallet address.
 */
export function formatWalletAddress(address: string): string {
  if (address.length <= 9) {
    return address
  }
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}
