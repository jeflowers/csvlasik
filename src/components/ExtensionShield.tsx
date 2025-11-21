import React, { useEffect, ReactNode } from 'react';

interface ExtensionShieldProps {
  children: ReactNode;
}

export const ExtensionShield: React.FC<ExtensionShieldProps> = ({ children }) => {
  useEffect(() => {
    const isExtensionElement = (element: Element): boolean => {
      const tagName = element.tagName?.toUpperCase();
      const id = element.id?.toLowerCase() || '';
      const className = element.className?.toString().toLowerCase() || '';

      const extensionTags = [
        'GRAMMARLY-EXTENSION',
        'GRAMMARLY-CARD',
        'GRAMMARLY-POPUPS',
        'QUILLBOT-EXTENSION'
      ];

      if (extensionTags.includes(tagName)) {
        return true;
      }

      if (
        id.includes('grammarly') ||
        id.includes('quillbot') ||
        id.includes('chrome-extension') ||
        id.includes('moz-extension')
      ) {
        return true;
      }

      if (
        className.includes('grammarly') ||
        className.includes('quillbot') ||
        className.includes('extension-')
      ) {
        return true;
      }

      const dataExtension = element.getAttribute('data-extension');
      const dataGrammarly = element.getAttribute('data-grammarly-shadow-root');

      if (dataExtension || dataGrammarly) {
        return true;
      }

      return false;
    };

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;

            if (
              element.closest('#root') ||
              element.closest('[data-app]') ||
              element.closest('form') ||
              element.closest('input') ||
              element.closest('button')
            ) {
              return;
            }

            if (isExtensionElement(element)) {
              try {
                element.remove();
              } catch (e) {
                console.debug('[ExtensionShield] Failed to remove element:', e);
              }
            }
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: false,
    });

    const styleObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeName === 'STYLE' || node.nodeName === 'LINK') {
              const element = node as HTMLElement;
              const content = element.textContent || '';
              const href = (element as HTMLLinkElement).href || '';

              if (
                content.includes('chrome-extension://') ||
                content.includes('moz-extension://') ||
                content.includes('grammarly') ||
                href.includes('chrome-extension://') ||
                href.includes('moz-extension://')
              ) {
                try {
                  element.remove();
                } catch (e) {
                  console.debug('[ExtensionShield] Failed to remove style:', e);
                }
              }
            }
          });
        }
      });
    });

    styleObserver.observe(document.head, {
      childList: true,
    });

    return () => {
      observer.disconnect();
      styleObserver.disconnect();
    };
  }, []);

  return <>{children}</>;
};

export default ExtensionShield;
