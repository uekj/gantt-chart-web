import { colors, semanticColors } from './colors';
import { typography, textStyles } from './typography';
import { spacing, semanticSpacing } from './spacing';

// Component style variants
export const componentStyles = {
  button: {
    base: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '0.375rem', // 6px
      fontWeight: textStyles.button.fontWeight,
      fontSize: textStyles.button.fontSize,
      lineHeight: textStyles.button.lineHeight,
      transition: 'all 0.2s ease-in-out',
      cursor: 'pointer',
      border: 'none',
      outline: 'none',
      textDecoration: 'none',
    },
    
    variants: {
      primary: {
        backgroundColor: colors.primary[600],
        color: colors.gray[50],
        '&:hover': {
          backgroundColor: colors.primary[700],
        },
        '&:focus': {
          boxShadow: `0 0 0 3px ${colors.primary[200]}`,
        },
        '&:disabled': {
          backgroundColor: colors.gray[300],
          color: colors.gray[500],
          cursor: 'not-allowed',
        },
      },
      
      secondary: {
        backgroundColor: colors.gray[100],
        color: colors.gray[900],
        border: `1px solid ${colors.gray[300]}`,
        '&:hover': {
          backgroundColor: colors.gray[200],
        },
        '&:focus': {
          boxShadow: `0 0 0 3px ${colors.gray[200]}`,
        },
      },
      
      outline: {
        backgroundColor: 'transparent',
        color: colors.primary[600],
        border: `1px solid ${colors.primary[600]}`,
        '&:hover': {
          backgroundColor: colors.primary[50],
        },
        '&:focus': {
          boxShadow: `0 0 0 3px ${colors.primary[200]}`,
        },
      },
      
      ghost: {
        backgroundColor: 'transparent',
        color: colors.gray[700],
        '&:hover': {
          backgroundColor: colors.gray[100],
        },
        '&:focus': {
          boxShadow: `0 0 0 3px ${colors.gray[200]}`,
        },
      },
    },
    
    sizes: {
      sm: {
        padding: `${spacing[1.5]} ${spacing[3]}`,
        fontSize: typography.fontSize.sm,
      },
      md: {
        padding: `${spacing[2]} ${spacing[4]}`,
        fontSize: typography.fontSize.sm,
      },
      lg: {
        padding: `${spacing[2.5]} ${spacing[6]}`,
        fontSize: typography.fontSize.base,
      },
    },
  },
  
  card: {
    base: {
      backgroundColor: colors.gray[50],
      border: `1px solid ${semanticColors.border.light}`,
      borderRadius: '0.5rem', // 8px
      padding: semanticSpacing.component.lg,
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    },
    
    variants: {
      elevated: {
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
      outlined: {
        boxShadow: 'none',
        border: `1px solid ${semanticColors.border.medium}`,
      },
    },
  },
  
  input: {
    base: {
      display: 'block',
      width: '100%',
      padding: `${spacing[2]} ${spacing[3]}`,
      fontSize: textStyles.body.fontSize,
      lineHeight: textStyles.body.lineHeight,
      color: semanticColors.text.primary,
      backgroundColor: colors.gray[50],
      border: `1px solid ${semanticColors.border.medium}`,
      borderRadius: '0.375rem', // 6px
      transition: 'border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
      '&:focus': {
        outline: 'none',
        borderColor: colors.primary[500],
        boxShadow: `0 0 0 3px ${colors.primary[200]}`,
      },
      '&:disabled': {
        backgroundColor: colors.gray[100],
        color: colors.gray[500],
        cursor: 'not-allowed',
      },
    },
    
    variants: {
      error: {
        borderColor: colors.error[500],
        '&:focus': {
          borderColor: colors.error[500],
          boxShadow: `0 0 0 3px ${colors.error[200]}`,
        },
      },
    },
  },
  
  modal: {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
    },
    
    content: {
      backgroundColor: colors.gray[50],
      borderRadius: '0.5rem', // 8px
      padding: semanticSpacing.layout.md,
      maxWidth: '90vw',
      maxHeight: '90vh',
      overflow: 'auto',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    },
  },
} as const;

// Utility classes for common patterns
export const utilities = {
  layout: {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: `0 ${semanticSpacing.container.padding}`,
    },
    
    flexCenter: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    
    flexBetween: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    
    grid: {
      display: 'grid',
      gap: semanticSpacing.component.lg,
    },
  },
  
  text: {
    truncate: {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    
    noSelect: {
      userSelect: 'none',
    },
  },
  
  animation: {
    fadeIn: {
      animation: 'fadeIn 0.3s ease-in-out',
    },
    
    slideIn: {
      animation: 'slideInFromRight 0.3s ease-in-out',
    },
  },
} as const;