'use client'

import { Select, Option } from 'bymax-react-select'

import { cn } from '@/utils/classNames'

import customStyles from './styles'

interface SelectWithValidationProps {
  id: string
  value: Option | null
  options: Option[]
  isInvalid?: boolean
  isDisabled?: boolean
  isLocked?: boolean
  isMulti?: boolean
  placeholder: string
  placeholderSearch: string
  noOptionsMessage: string
  moveSelectedToTop?: boolean
  isLoading?: boolean
  loadingMessage?: string
  menuPortalTarget?: HTMLElement
  isClearable?: boolean
  errorMessage?: string
  onChange: (option: Option | Option[] | null) => void
}

export default function SelectWithValidation({
  id,
  value,
  options,
  isInvalid = false,
  isDisabled = false,
  isLocked = false,
  isMulti = false,
  placeholder,
  placeholderSearch,
  noOptionsMessage,
  moveSelectedToTop = false,
  isLoading = false,
  loadingMessage = 'Loading...',
  menuPortalTarget = undefined,
  isClearable = false,
  errorMessage = '⠀',
  onChange,
}: SelectWithValidationProps) {
  return (
    <div>
      <Select
        id={id}
        value={!Array.isArray(value) && value?.label ? value : null}
        isMulti={isMulti}
        isClearable={isClearable}
        options={options}
        isInvalid={!!isInvalid}
        isDisabled={isDisabled}
        isLocked={isLocked}
        placeholder={placeholder}
        placeholderSearch={placeholderSearch}
        noOptionsMessage={noOptionsMessage}
        moveSelectedToTop={moveSelectedToTop}
        isLoading={isLoading || options?.length <= 0}
        loadingMessage={loadingMessage}
        menuPortalTarget={menuPortalTarget}
        onChange={onChange}
        styles={customStyles as any}
      />
      <p
        className={cn(
          'text-red-500 text-[10px] text-left',
          isInvalid ? 'visible' : 'hidden',
        )}
      >
        {errorMessage}
      </p>
    </div>
  )
}
