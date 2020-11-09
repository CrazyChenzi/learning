import * as React from 'react'
/// <reference types="react-scripts" />

declare global {
  namespace JSX {
    interface IntrinsicElements {
      item: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}
