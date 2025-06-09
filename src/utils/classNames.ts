import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combines multiple class names and resolves Tailwind CSS conflicts.
 * This utility function merges class names conditionally and ensures proper
 * class precedence in Tailwind CSS.
 *
 * @param inputs - Class names to be combined. Can be strings, objects, or arrays.
 * @returns A single string of merged class names with resolved Tailwind conflicts.
 *
 * @example
 * // Basic usage
 * cn('base-class', 'additional-class')
 *
 * @example
 * // Conditional classes
 * cn('base-class', isActive && 'active-class')
 *
 * @example
 * // Object syntax
 * cn('base-class', { 'conditional-class': someCondition })
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
