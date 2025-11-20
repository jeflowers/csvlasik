import React, { useEffect, ReactNode } from 'react';

interface ExtensionShieldProps {
  children: ReactNode;
}

export const ExtensionShield: React.FC<ExtensionShieldProps> = ({ children }) => {
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;

            // Detect and remove extension-injected elements
            if (
              element.id?.includes('extension') ||
              element.className?.toString().includes('extension') ||
              element.getAttribute('data-extension') ||
              element.tagName === 'GRAMMARLY-EXTENSION' ||
              element.tagName === 'QUILLBOT-EXTENSION'
            ) {
              element.remove();
            }
          }
        });
      });
    });

    // Monitor document body for extension injections
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Prevent extension-injected styles from affecting layout
    const styleObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeName === 'STYLE' || node.nodeName === 'LINK') {
              const element = node as HTMLElement;
              const content = element.textContent || '';

              // Remove extension styles
              if (
                content.includes('chrome-extension://') ||
                content.includes('moz-extension://') ||
                (element as HTMLLinkElement).href?.includes('extension')
              ) {
                element.remove();
              }
            }
          });
        }
      });
    });

    styleObserver.observe(document.head, {
      childList: true,
    });

    // Protect React event handlers
    const originalAddEventListener = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function(
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions
    ) {
      if (typeof listener === 'function') {
        const wrappedListener = function(this: any, event: Event) {
          try {
            return (listener as EventListener).call(this, event);
          } catch (error: any) {
            // Suppress extension errors
            if (
              error?.stack?.includes('chrome-extension://') ||
              error?.stack?.includes('moz-extension://')
            ) {
              return;
            }
            throw error;
          }
        };
        return originalAddEventListener.call(this, type, wrappedListener, options);
      }
      return originalAddEventListener.call(this, type, listener, options);
    };

    return () => {
      observer.disconnect();
      styleObserver.disconnect();
      EventTarget.prototype.addEventListener = originalAddEventListener;
    };
  }, []);

  return <>{children}</>;
};

export default ExtensionShield;
