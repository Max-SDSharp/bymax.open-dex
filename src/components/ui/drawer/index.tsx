'use client'

import React, { useEffect } from 'react'

import { IoClose } from 'react-icons/io5'

import { cn } from '@/utils/classNames'

interface DrawerProps {
  isOpen: boolean
  onClose: () => void
  children?: React.ReactNode
  title?: string
}

const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  children,
  title,
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          role="button"
          tabIndex={0}
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
          onKeyDown={(e) => e.key === 'Enter' && onClose()}
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          'fixed top-0 right-0 h-full w-full md:w-[450px] bg-background border-l border-border z-50 transform transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className="h-full p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">{title}</h2>
            <button
              onClick={onClose}
              className="inline-flex items-center justify-center p-2 rounded-lg bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              aria-label="Close drawer"
            >
              <IoClose className="h-5 w-5" />
            </button>
          </div>
          <div className="flex flex-col h-full">{children}</div>
        </div>
      </div>
    </>
  )
}

export default Drawer
