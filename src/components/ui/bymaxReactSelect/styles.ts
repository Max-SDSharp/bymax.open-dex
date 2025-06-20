'use client'

import { CSSObject } from '@emotion/react'

interface OptionState {
  isFocused: boolean
  isSelected: boolean
  isDisabled: boolean
  selectProps: {
    isInvalid: boolean
  }
}

interface ProvidedStyle {
  [key: string]: CSSObject | undefined
}

interface CustomStyles {
  [key: string]:
    | CSSObject
    | ((
        provided: ProvidedStyle,
        state: OptionState,
      ) => CSSObject | (() => CSSObject) | undefined)
}
const customStyles: CustomStyles = {
  container: (provided: ProvidedStyle, state: OptionState) => {
    return {
      borderColor: state.isFocused
        ? state.selectProps.isInvalid
          ? 'var(--error)'
          : 'var(--border)'
        : state.selectProps.isInvalid
          ? 'var(--error)'
          : 'var(--border)',

      boxShadow: 'none',
      '&:hover': {
        borderColor: 'var(--border)',
      },
    }
  },
  control: () => ({
    backgroundColor: 'var(--background)',
    borderColor: 'var(--border)',
    '&:hover': {
      borderColor: 'var(--border)',
    },
  }),
  option: (provided: ProvidedStyle, state: OptionState) => {
    return {
      color: 'var(--foreground)',
      backgroundColor: state.isFocused
        ? 'var(--secondary)'
        : state.isSelected
          ? 'var(--border)'
          : 'var(--background)',
      ':active': {
        ...provided[':active'],
        backgroundColor: !state.isDisabled
          ? state.isSelected
            ? 'var(--foreground)'
            : 'var(--secondary)'
          : undefined,
      },
    }
  },
  singleValue: () => {
    return {
      color: 'var(--foreground)',
    }
  },
  multiValue: () => {
    return {
      backgroundColor: 'var(--secondary)',
      color: 'var(--foreground)',
    }
  },
  multiValueLabel: () => {
    return {
      color: 'var(--foreground)',
    }
  },
  clearIndicator: () => {
    return {
      color: 'var(--foreground)',
    }
  },
  dropdownIndicator: () => {
    return {
      color: 'var(--foreground)',
    }
  },
  indicatorSeparator: () => {
    return {
      display: 'none',
    }
  },
  noOptionsMessage: () => {
    return {
      color: 'var(--foreground)',
    }
  },
  menu: () => {
    return {
      backgroundColor: 'var(--background)',
      border: '1px solid var(--border)',
    }
  },
  placeholder: () => {
    return {
      color: 'var(--foreground)',
    }
  },
}

export default customStyles
